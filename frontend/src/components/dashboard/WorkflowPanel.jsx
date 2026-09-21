const steps = [
  {
    title: "Detect",
    description: "Random Forest predicts normal or attack traffic.",
  },
  {
    title: "Categorize",
    description:
      "Flagged attacks receive a predicted known attack category.",
  },
  {
    title: "Check for anomalies",
    description:
      "Isolation Forest provides an independent warning.",
  },
];

export default function WorkflowPanel() {
  return (
    <aside className="panel workflow-panel">
      <p className="eyebrow">BEHIND THE ANALYSIS</p>
      <h2>Three complementary signals.</h2>

      {steps.map((step, index) => (
        <div className="workflow-step" key={step.title}>
          <span className="step-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </div>
      ))}

      <div className="workflow-note">
        An anomaly warning does not override the binary prediction.
      </div>
    </aside>
  );
}