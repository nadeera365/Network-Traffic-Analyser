export default function ModelNotes() {
  return (
    <section className="model-notes" id="model-notes">
      <span className="note-icon" aria-hidden="true">i</span>
      <div>
        <h3>Signals for review, not a verdict.</h3>
        <p>
          This prototype does not monitor live traffic or block connections.
          On the official test set, the binary model detected 98.79% of
          attacks and flagged 27.65% of normal records as attacks.
          Scores are model outputs, not guaranteed correctness.
        </p>
      </div>
    </section>
  );
}