import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MetricsGrid from "./components/dashboard/MetricsGrid";
import TrafficInput from "./components/dashboard/TrafficInput";
import ResultsPanel from "./components/dashboard/ResultsPanel";
import ModelNotes from "./components/dashboard/ModelNotes";
import { usePrediction } from "./hooks/usePrediction.js";

import "./App.css";

export default function App() {
  const {
    input,
    setInput,
    results,
    busy,
    error,
    completedAt,
    analyze,
    clearAnalysis,
  } = usePrediction();

  return (
    <>
      <Navbar />

      <main className="single-page">
        <section id="analysis" className="analysis-section">
          <div className="page-heading">
            <p className="eyebrow">Network Traffic Analyser </p>
            <h1>
              Traffic in.
              <br />
              <span>Insight out.</span>
            </h1>
            <p className="subtitle">
              Analyze network flow records. Review attack predictions
              and unusual patterns in one place.
            </p>
          </div>

          <TrafficInput
            input={input}
            onInputChange={setInput}
            busy={busy}
            error={error}
            onAnalyze={analyze}
            onClear={clearAnalysis}
          />
        </section>

        <div className="results-section">
          {results && <MetricsGrid results={results} />}

          <ResultsPanel
            results={results}
            busy={busy}
            completedAt={completedAt}
          />
        </div>

        <ModelNotes />
      </main>

      <Footer />
    </>
  );
}