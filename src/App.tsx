import { useEffect, useRef, useState } from "react";
import "./index.css";
import ASCIIText from "./components/ASCIIText";
import ArcadeOverlay from "./components/ArcadeOverlay";
import EasterEggs from "./components/EasterEggs";

const experiences = [
  {
    company: "Sun Life",
    role: "Cloud Engineer & DevOps Engineer",
    dates: "01/2025 - 08/2025",
    note: "2 terms",
    desc: "AWS cloud monitoring & Ansible Automation for cloud infrastructure management",
  },
  {
    company: "Sensor Technology",
    role: "Software Engineer Intern",
    dates: "05/2024 - 12/2024",
    note: "",
    desc: "Embedded software development for IoT devices",
  },
  {
    company: "ISED Canada",
    role: "Software Engineer Intern",
    dates: "05/2023 - 12/2023",
    note: "",
    desc: "AWS Database Migration & Backend Development",
  },
  {
    company: "CollegeSouk",
    role: "Software Engineer",
    dates: "05/2022 - 12/2022",
    note: "",
    desc: "Full Stack Development",
  },
];

const projects = [
  {
    name: "PromptLint",
    isNew: true,
    description: "ESLint for LLM prompts -- reduce costs and improve reliability",
    tech: ["Typescript", "Python", "CI/CD", "LLM"],
    live: "https://promptlint.dev",
    github: "https://github.com/AryaanSheth/promptlint",
    downloads: { count: "400+", label: "" },
  },
  {
    name: "gloq",
    isNew: true,
    description: "Gleam wrapper for interfacing with GroqCloud LLM API ",
    tech: ["Gleam", "LLM", "Erlang VM"],
    live: "https://hex.pm/packages/gloq",
    github: "https://github.com/AryaanSheth/gloq",
    downloads: { count: "600+", label: "" },
  },
  {
    name: "gopsd",
    description: "Blazingly Fast GPSD Client For Go",
    tech: ["Go", "GPSD", "systemd"],
    live: "https://pkg.go.dev/github.com/AryaanSheth/gopsd",
    github: "https://github.com/AryaanSheth/gopsd",
  },
  {
    name: "hft arbitrage bot",
    description: "Basic HFT Cross-Exchange Arbitrage Bot For Crypto ",
    tech: ["Golang", "Real-Time", "Crypto"],
    live: null,
    github: "https://github.com/AryaanSheth/hft-arbitrage-bot",
  },
];

const SLIDE_COUNT = 4;

function SlideDots({ active, containerRef }: { active: number; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const scrollTo = (i: number) => {
    const el = containerRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <nav className="slide-nav" aria-label="Slide navigation">
      {Array.from({ length: SLIDE_COUNT }, (_, i) => (
        <button
          key={i}
          className={`slide-dot${active === i ? " active" : ""}`}
          onClick={() => scrollTo(i)}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </nav>
  );
}

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Track active slide via scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setActiveSlide(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const cur = Math.round(el.scrollTop / el.clientHeight);
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const next = Math.min(cur + 1, SLIDE_COUNT - 1);
        (el.children[next] as HTMLElement)?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prev = Math.max(cur - 1, 0);
        (el.children[prev] as HTMLElement)?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goNext = () => {
    const el = containerRef.current;
    if (!el) return;
    const cur = Math.round(el.scrollTop / el.clientHeight);
    const next = Math.min(cur + 1, SLIDE_COUNT - 1);
    (el.children[next] as HTMLElement)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <ArcadeOverlay />
      <EasterEggs />
      <SlideDots active={activeSlide} containerRef={containerRef} />

      <div className="slides-container" ref={containerRef}>
        {/* ── Slide 1: Hero ── */}
        <div className="slide" style={{ position: "relative", width: "100vw", height: "100vh" }}>
          <ASCIIText text="Hey" enableWaves asciiFontSize={8} />
          <button className="scroll-indicator" onClick={goNext} aria-label="Next slide">
            <span className="scroll-arrow">↓</span>
          </button>
        </div>

        {/* ── Slide 2: About ── */}
        <div className="slide content-section">
          <div className="content-inner">
            <p className="section-label">~/about_me</p>
            <h1 className="about-name">I'm Aryaan.</h1>
            <p className="about-bio">
              Cloud & Backend Developer developing scalable and efficient systems and dev tools. 
            </p>
            <div className="about-links">
              <a href="https://github.com/AryaanSheth"    target="_blank" rel="noopener noreferrer" className="about-link">GitHub</a>
              <a href="https://www.linkedin.com/in/aryaansheth/" target="_blank" rel="noopener noreferrer" className="about-link">LinkedIn</a>
              <a href="https://calendly.com/avsheth03/30min" target="_blank" rel="noopener noreferrer" className="about-link">Calendly</a>
              <a href="https://x.com/aryaan_sheth"  target="_blank" rel="noopener noreferrer" className="about-link">Twitter</a>
            </div>
          </div>
        </div>

        {/* ── Slide 3: Experience ── */}
        <div className="slide content-section">
          <div className="content-inner">
            <p className="section-label">~/experience</p>
            <div className="exp-list">
              {experiences.map((exp, i) => (
                <div key={i} className="exp-item">
                  <div className="exp-header">
                    <span className="exp-company">{exp.company}</span>
                    <span className="exp-dates">
                      {exp.note && <span className="exp-note">{exp.note} · </span>}
                      {exp.dates}
                    </span>
                  </div>
                  <p className="exp-role">{exp.role}</p>
                  <p className="exp-desc">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Slide 4: Projects ── */}
        <div className="slide content-section">
          <div className="content-inner content-inner--wide">
            <p className="section-label">~/projects</p>
            <div className="projects-grid">
              {projects.map((proj, i) => (
                <div key={i} className="project-card">
                  <div className="project-card-body">
                    <h3 className="project-name">
                      {proj.name}
                      {"isNew" in proj && proj.isNew && (
                        <span className="new-badge">NEW!</span>
                      )}
                    </h3>
                    <p className="project-desc">{proj.description}</p>
                    <div className="project-tech">
                      {proj.tech.map((t) => (
                        <span key={t} className="project-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="project-footer">
                    <div className="project-links">
                      {proj.live && (
                        <a href={proj.live} target="_blank" rel="noopener noreferrer" className="project-link">↗ Live</a>
                      )}
                      <a href={proj.github} target="_blank" rel="noopener noreferrer" className="project-link">GitHub</a>
                    </div>
                    {"downloads" in proj && proj.downloads && (
                      <span className="project-downloads">
                        ↓ {proj.downloads.count}
                        {proj.downloads.label && (
                          <span className="project-downloads-label"> · {proj.downloads.label}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
