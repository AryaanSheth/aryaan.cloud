import "./index.css";

export function App() {
  return (
    <div className="page">
      <aside className="toc" aria-label="Table of contents">
        <p className="toc__brand">Aryaan Sheth</p>
        <span className="toc__role">Cloud &amp; Backend Developer · Waterloo</span>
        <nav>
          <ul className="toc__list">
            <li><a href="#index"><span className="num">00</span><span>Index</span></a></li>
            <li><a href="#now"><span className="num">01</span><span>Now</span></a></li>
            <li><a href="#experience"><span className="num">02</span><span>Experience</span></a></li>
            <li><a href="#projects"><span className="num">03</span><span>Projects</span></a></li>
            <li><a href="#reach"><span className="num">04</span><span>Reach</span></a></li>
          </ul>
        </nav>
        <div className="toc__meta">
          <span>Waterloo · UTC−5</span>
          <span>v. 26.05</span>
          <span>set in Inter Tight</span>
        </div>
      </aside>

      <article className="main">
        <section className="section" id="index">
          <p className="section__num">00 · Index</p>
          <h1 className="section__head section__head--lede">A small, scannable index of who I am and what I do.</h1>
          <div className="section__body">
            <p>
              I'm <strong>Aryaan Sheth</strong>, a Cloud &amp; Backend Developer building
              scalable systems and developer tooling. Currently finishing my degree at Waterloo
              while on a cloud engineering co-op at Sun Life.
            </p>
            <p>
              I work closest to the infrastructure layer — AWS, distributed systems, developer
              tooling. My open source work leans pragmatic: libraries that solve real friction,
              written in whatever language fits the problem.
            </p>
            <p>Five sections. Read what's relevant.</p>
          </div>
        </section>

        <section className="section" id="now">
          <p className="section__num">01 · Now</p>
          <h2 className="section__head">Cloud engineering at Sun Life, wrapping up my degree.</h2>
          <div className="section__body">
            <p>
              My second term at Sun Life as a Cloud Engineer &amp; DevOps engineer. Day-to-day is
              AWS observability and <strong>Ansible automation</strong> — making cloud
              infrastructure easier to manage at scale across the enterprise.
            </p>
            <p>
              Outside of work I'm actively maintaining <strong>PromptLint</strong>, a static
              analysis tool for LLM prompts. The core idea: treat your prompt library the same
              way you treat your code — lint it, catch issues before they reach production,
              reduce unnecessary token spend.
            </p>
            <p>
              Open to full-time backend or cloud engineering roles starting late 2025.
              If something looks interesting, reach out.
            </p>
          </div>
        </section>

        <section className="section" id="experience">
          <p className="section__num">02 · Experience</p>
          <h2 className="section__head">Where I've worked, in tabular form.</h2>
          <div className="section__body">
            <table className="years" aria-label="Work history">
              <thead>
                <tr><th>Dates</th><th>Company</th><th>What</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025 (2 terms)</td>
                  <td>Sun Life</td>
                  <td>Cloud Engineer &amp; DevOps · AWS monitoring, Ansible automation for enterprise infrastructure</td>
                </tr>
                <tr>
                  <td>2024</td>
                  <td>Sensor Technology</td>
                  <td>Software Engineer Intern · embedded software for industrial IoT devices</td>
                </tr>
                <tr>
                  <td>2023</td>
                  <td>ISED Canada</td>
                  <td>Software Engineer Intern · AWS database migration, backend for federal systems</td>
                </tr>
                <tr>
                  <td>2022</td>
                  <td>CollegeSouk</td>
                  <td>Software Engineer · full stack development for a student marketplace</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section" id="projects">
          <p className="section__num">03 · Projects</p>
          <h2 className="section__head">Libraries and tools built to scratch real itches.</h2>
          <div className="section__body">
            <ul className="projects">
              <li>
                <div className="proj__head">
                  <a href="https://promptlint.dev" target="_blank" rel="noopener noreferrer">PromptLint</a>
                  <span className="proj__stat">400+ downloads</span>
                </div>
                <span className="proj__sub">ESLint for LLM prompts — static analysis to reduce costs and improve reliability across your prompt library.</span>
                <span className="proj__meta">TypeScript · Python · CI/CD · LLM</span>
                <div className="proj__links">
                  <a href="https://promptlint.dev" target="_blank" rel="noopener noreferrer">↗ Live</a>
                  <a href="https://github.com/AryaanSheth/promptlint" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
              </li>
              <li>
                <div className="proj__head">
                  <a href="https://hex.pm/packages/gloq" target="_blank" rel="noopener noreferrer">gloq</a>
                  <span className="proj__stat">600+ downloads</span>
                </div>
                <span className="proj__sub">A Gleam wrapper for the GroqCloud LLM API, bringing type-safe LLM calls to the BEAM ecosystem.</span>
                <span className="proj__meta">Gleam · Erlang VM · LLM</span>
                <div className="proj__links">
                  <a href="https://hex.pm/packages/gloq" target="_blank" rel="noopener noreferrer">↗ hex.pm</a>
                  <a href="https://github.com/AryaanSheth/gloq" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
              </li>
              <li>
                <div className="proj__head">
                  <a href="https://pkg.go.dev/github.com/AryaanSheth/gopsd" target="_blank" rel="noopener noreferrer">gopsd</a>
                </div>
                <span className="proj__sub">A blazingly fast GPSD client for Go — low-latency GPS data streaming with a clean idiomatic API.</span>
                <span className="proj__meta">Go · GPSD · systemd</span>
                <div className="proj__links">
                  <a href="https://pkg.go.dev/github.com/AryaanSheth/gopsd" target="_blank" rel="noopener noreferrer">↗ pkg.go.dev</a>
                  <a href="https://github.com/AryaanSheth/gopsd" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
              </li>
              <li>
                <div className="proj__head">
                  <a href="https://github.com/AryaanSheth/hft-arbitrage-bot" target="_blank" rel="noopener noreferrer">HFT Arbitrage Bot</a>
                </div>
                <span className="proj__sub">Cross-exchange crypto arbitrage bot for high-frequency trading with real-time order book analysis.</span>
                <span className="proj__meta">Go · Real-Time · Crypto</span>
                <div className="proj__links">
                  <a href="https://github.com/AryaanSheth/hft-arbitrage-bot" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="section" id="reach">
          <p className="section__num">04 · Reach</p>
          <h2 className="section__head">Best reached by email or LinkedIn.</h2>
          <div className="section__body">
            <div className="contact">
              <div className="contact__row">
                <span className="contact__label">Email</span>
                <span className="contact__value"><a href="mailto:avsheth03@gmail.com">avsheth03@gmail.com</a></span>
              </div>
              <div className="contact__row">
                <span className="contact__label">GitHub</span>
                <span className="contact__value"><a href="https://github.com/AryaanSheth" target="_blank" rel="noopener noreferrer">@AryaanSheth</a></span>
              </div>
              <div className="contact__row">
                <span className="contact__label">LinkedIn</span>
                <span className="contact__value"><a href="https://www.linkedin.com/in/aryaansheth/" target="_blank" rel="noopener noreferrer">/in/aryaansheth</a></span>
              </div>
              <div className="contact__row">
                <span className="contact__label">Calendly</span>
                <span className="contact__value"><a href="https://calendly.com/avsheth03/30min" target="_blank" rel="noopener noreferrer">30min call</a></span>
              </div>
              <div className="contact__row">
                <span className="contact__label">Twitter</span>
                <span className="contact__value"><a href="https://x.com/aryaan_sheth" target="_blank" rel="noopener noreferrer">@aryaan_sheth</a></span>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}

export default App;
