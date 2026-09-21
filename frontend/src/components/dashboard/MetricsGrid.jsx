export default function MetricsGrid({ results }) {
  const attacks =
    results?.filter((row) => row.binary_prediction === "Attack").length ?? 0;

  const warnings =
    results?.filter((row) => row.anomaly_warning).length ?? 0;

  const metrics = [
    ["Records analyzed", results ? results.length : "—", "Latest batch"],
    ["Flagged as attack", results ? attacks : "—", "Binary classifier"],
    [
      "Predicted normal",
      results ? results.length - attacks : "—",
      "Binary classifier",
    ],
    ["Anomaly warnings", results ? warnings : "—", "Independent signal"],
  ];

  return (
    <section className="metrics" aria-label="Latest batch summary">
      {metrics.map(([label, value, note], index) => (
        <article className={`metric metric-${index}`} key={label}>
          <span className="metric-label">{label}</span>
          <strong>{value}</strong>
          <small>{note}</small>
        </article>
      ))}
    </section>
  );
}