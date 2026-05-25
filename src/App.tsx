import "./index.css";

export function App() {
  return (
    <div className="page">
      <aside className="toc" aria-label="Table of contents">
        <p className="toc__brand">Aryaan Sheth</p>
        <span className="toc__role">AI &amp; Backend Engineer · Waterloo</span>
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
              I'm <strong>Aryaan Sheth</strong>, an AI &amp; Backend Engineer building
              reliable systems at the intersection of LLM infrastructure and cloud engineering.
              Currently finishing my degree at McMaster while working at Friedmann AI.
            </p>
            <p>
              My work spans AI pipelines, cloud infrastructure, and developer tooling — from
              LLM security and performance to AWS at enterprise scale. My open source work leans
              pragmatic: libraries that solve real friction, written in whatever language fits the problem.
            </p>
            <p>Five sections. Read what's relevant.</p>
          </div>
        </section>

        <section className="section" id="now">
          <p className="section__num">01 · Now</p>
          <h2 className="section__head">AI engineering at Friedmann AI, wrapping up my degree.</h2>
          <div className="section__body">
            <p>
              Currently a <strong>Software Engineering Intern at FriedmannAI</strong> in Oakville,
              focused on LLM security and performance for their flagship product. Day-to-day involves
              building AI pipelines with per-user caching, race-condition-safe job deduplication,
              and hardened LLM output parsing with allowlist validation.
            </p>
            <p>
              Outside of work I'm actively maintaining <strong>PromptLint</strong>, a static
              analysis tool for LLM prompts. The core idea: treat your prompt library the same
              way you treat your code — lint it, catch issues before they reach production,
              reduce unnecessary token spend.
            </p>
            <p>
              Open to full-time AI or backend engineering roles starting 2027.
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
                  <td>2026 – Present</td>
                  <td>FriedmannAI</td>
                  <td>Software Engineer Intern · LLM security &amp; performance — AI pipelines with per-user caching, job deduplication, and hardened output parsing</td>
                </tr>
                <tr>
                  <td>2025 (May – Aug)</td>
                  <td>Sun Life Financial</td>
                  <td>DevOps Engineer Intern · OPA/Rego policy pipeline for IaC security, self-healing multi-AZ CloudFormation playbooks</td>
                </tr>
                <tr>
                  <td>2025 (Jan – Apr)</td>
                  <td>Sun Life Financial</td>
                  <td>Cloud Engineer Intern · event-driven AWS monitoring pipeline for 50+ services, cost automation dashboards</td>
                </tr>
                <tr>
                  <td>2024</td>
                  <td>Sensor Technology</td>
                  <td>Software Engineer Intern · safety-critical C# TCP/IP layer, Go REST API for industrial IoT hardware</td>
                </tr>
                <tr>
                  <td>2023</td>
                  <td>ISED Canada</td>
                  <td>Software Engineer Intern · zero-downtime AWS RDS migration, backend for federal bilingual systems</td>
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
