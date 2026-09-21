function percent(value) {
  return Number.isFinite(value)
    ? `${(value * 100).toFixed(1)}%`
    : "—";
}

export default function ResultsPanel({ results, busy, completedAt }) {
  function downloadResults() {
    if (!results) return;

    const blob = new Blob(
      [
        JSON.stringify(
          { count: results.length, predictions: results },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "netguard-results.json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section
      className="panel results-panel"
      id="results"
      aria-busy={busy}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">02 / RESULTS</p>
          <h2>Batch predictions</h2>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={downloadResults}
          disabled={!results || busy}
        >
          Export JSON ↓
        </button>
      </div>

      <p className="results-caption" role="status">
        {results
          ? `${results.length} records analyzed at ${completedAt}`
          : "Results will appear after you run an analysis."}
      </p>

      {!results ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">◈</div>
          <h3>
            {busy
              ? "Reading the signals…"
              : "Your next insight starts here."}
          </h3>
          <p>
            {busy
              ? "The models are processing your batch."
              : "Add traffic records above to begin."}
          </p>
        </div>
      ) : (
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Prediction results table"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Prediction</th>
                <th scope="col">Attack score</th>
                <th scope="col">Category</th>
                <th scope="col">Category score</th>
                <th scope="col">Anomaly score</th>
                <th scope="col">Anomaly warning</th>
              </tr>
            </thead>

            <tbody>
              {results.map((row, index) => (
                <tr key={index}>
                  <td className="record-id">
                    #{String(index + 1).padStart(3, "0")}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        row.binary_prediction === "Attack"
                          ? "badge-attack"
                          : "badge-normal"
                      }`}
                    >
                      {row.binary_prediction}
                    </span>
                  </td>
                  <td>{percent(row.attack_score)}</td>
                  <td>{row.predicted_category ?? "—"}</td>
                  <td>{percent(row.category_score)}</td>
                  <td>
                    {Number.isFinite(row.anomaly_score)
                      ? row.anomaly_score.toFixed(4)
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={
                        row.anomaly_warning ? "warning-text" : "muted"
                      }
                    >
                      {row.anomaly_warning ? "Review" : "Not flagged"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}