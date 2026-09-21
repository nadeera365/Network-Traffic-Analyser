const ERROR_MESSAGES = {
  408: "Request timed out. Try again.",
  413: "Request exceeds the server size limit.",
  422: "Check all 41 fields: values must match the input schema.",
  500: "Prediction failed on the server. Try again shortly.",
  503: "The prediction service is busy. Try again shortly.",
};

export async function predictTraffic(payload, signal) {
  const response = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      ERROR_MESSAGES[response.status] ??
        "The API request failed. Check that the backend is running.",
    );
  }

  const data = await response.json();

  if (
    !Array.isArray(data.predictions) ||
    data.predictions.length !== payload.records.length
  ) {
    throw new Error("The server returned an unexpected response.");
  }

  return data.predictions;
}