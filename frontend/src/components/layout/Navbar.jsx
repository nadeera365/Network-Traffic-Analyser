import { useEffect, useState } from "react";

const links = [
  { id: "analysis", label: "Analyze" },
  { id: "results", label: "Results" },
  { id: "model-notes", label: "About the model" },
];

export default function Navbar() {
  const [active, setActive] = useState("analysis");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let frame = 0;

    function updateActiveSection() {
      frame = 0;
      let current = "analysis";

      for (const { id } of links) {
        const section = document.getElementById(id);

        if (section && section.getBoundingClientRect().top <= 150) {
          current = id;
        }
      }

      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;

      if (atBottom && window.scrollY > 0) {
        current = "model-notes";
      }

      setActive(current);
    }

    function scheduleUpdate() {
      if (!frame) {
        frame = window.requestAnimationFrame(updateActiveSection);
      }
    }

    updateActiveSection();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    // Recheck when predictions change the page height.
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("menu-toggle")?.focus();
      }
    }

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  function navigate(id) {
    setActive(id);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="navbar">
        <a
          className="brand"
          href="#analysis"
          aria-label="Network Traffic Analyser home"
          onClick={() => navigate("analysis")}
        >
          <span className="brand-icon" aria-hidden="true">N</span>
          <span>Network Traffic<span className="brand-ai"> Analyser</span></span>
        </a>

        <button
          id="menu-toggle"
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="main-navigation"
          className={`navbar-links ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`navbar-link ${active === id ? "is-active" : ""}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => navigate(id)}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}