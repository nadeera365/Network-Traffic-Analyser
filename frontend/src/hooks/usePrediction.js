import { useEffect, useRef, useState } from "react";
import { predictTraffic } from "../services/predictionApi";

const MAX_BYTES = 1024 * 1024;

function parseInput(input) {
  if (new TextEncoder().encode(input).length > MAX_BYTES) {
    throw new Error("Input is too large. Maximum size is 1 MiB.");
  }

  let payload;

  try {
    payload = JSON.parse(input);
  } catch {
    throw new Error("Enter valid JSON before running analysis.");
  }

  if (
    !payload ||
    !Array.isArray(payload.records) ||
    payload.records.length < 1 ||
    payload.records.length > 100
  ) {
    throw new Error(
      'Use {"records": [...]} with between 1 and 100 records.',
    );
  }

  return payload;
}

export function usePrediction() {
  const [input, setInputState] = useState("");
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [completedAt, setCompletedAt] = useState("");

  const activeRequest = useRef(null);

  useEffect(() => {
    return () => {
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, []);

  async function analyze(event) {
    event.preventDefault();

    if (activeRequest.current) return;

    setError("");
    setResults(null);
    setCompletedAt("");

    let payload;

    try {
      payload = parseInput(input);
    } catch (problem) {
      setError(problem.message);
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setBusy(true);

    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const predictions = await predictTraffic(
        payload,
        controller.signal,
      );

      if (activeRequest.current !== controller) return;

      setResults(predictions);
      setCompletedAt(new Date().toLocaleTimeString());
    } catch (problem) {
      if (activeRequest.current !== controller) return;

      setError(
        problem.name === "AbortError"
          ? "Analysis timed out. The server may still be processing."
          : problem instanceof TypeError
            ? "Cannot reach the API. Check the backend connection."
            : problem.message,
      );
    } finally {
      clearTimeout(timeout);

      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setBusy(false);
      }
    }
  }

  function setInput(value) {
    if (activeRequest.current) return;
    setInputState(value);
    setResults(null);
    setError("");
    setCompletedAt("");
  }

  function clearAnalysis() {
    if (activeRequest.current) return;

    setInput("");
    setResults(null);
    setError("");
    setCompletedAt("");
  }

  return {
    input,
    setInput,
    results,
    busy,
    error,
    completedAt,
    analyze,
    clearAnalysis,
  };
}