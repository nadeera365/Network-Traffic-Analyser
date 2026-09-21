export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <a href="#analysis" className="brand">
            <span className="brand-icon" aria-hidden="true">N</span>
            <span>
              Network Traffic<span className="brand-ai"> Analyser</span>
            </span>
          </a>

          <p>
            Network traffic insights powered by machine learning.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#analysis">Analyze</a>
          <a href="#results">Results</a>
          <a href="#model-notes">Model limitations</a>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Network Traffic Analyser · Nadeera Shasika
        </span>
        <span>Project prototype · Predictions require review</span>
      </div>
    </footer>
  );
}