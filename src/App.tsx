import { useEffect, useState } from "react";
import { marked } from "marked";
import "./index.css";
import { posts } from "./blogs-data";

type View = { kind: "portfolio" } | { kind: "post"; slug: string };

function hashToView(hash: string): View {
  const m = hash.match(/^#blog\/(.+)$/);
  if (m) return { kind: "post", slug: m[1] };
  return { kind: "portfolio" };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function App() {
  const [view, setView] = useState<View>(() => hashToView(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      setView(hashToView(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const onPost = view.kind === "post";
  const currentPost = onPost ? posts.find(p => p.slug === view.slug) : null;

  return (
    <div className="page">
      <aside className="toc" aria-label="Table of contents">
        <p className="toc__brand">Aryaan Sheth</p>
        <span className="toc__role">AI &amp; Backend Engineer · Toronto</span>
        <nav>
          <ul className="toc__list">
            <li><a href="#index"><span className="num">00</span><span>Index</span></a></li>
            <li><a href="#now"><span className="num">01</span><span>Now</span></a></li>
            <li><a href="#experience"><span className="num">02</span><span>Experience</span></a></li>
            <li><a href="#projects"><span className="num">03</span><span>Projects</span></a></li>
            <li><a href="#blog" className={onPost ? "toc__link--active" : ""}><span className="num">04</span><span>Blog</span></a></li>
            <li><a href="#reach"><span className="num">05</span><span>Reach</span></a></li>
          </ul>
        </nav>
        <div className="toc__meta">
          <span>Toronto · UTC−5</span>
          <span>v. 26.05</span>
          <span>set in Inter Tight</span>
        </div>
      </aside>

      <article className="main">
        {!onPost && (
          <>
            <section className="section" id="index">
              <p className="section__num">00 · Index</p>
              <h1 className="section__head section__head--lede">A quick index of who I am and what I build.</h1>
              <div className="section__body">
                <p>
                  I'm <strong>Aryaan Sheth</strong>, a CS student at McMaster building things in
                  the AI and backend space. Right now I'm at Friedmann AI working on LLM security
                  and performance while finishing up my degree.
                </p>
                <p>
                  I work across AI pipelines, cloud infrastructure, and developer tooling.
                  I ship open source libraries when I hit friction that doesn't have a good solution yet.
                </p>
                <p>Six sections. Read what's relevant.</p>
              </div>
            </section>

            <section className="section" id="now">
              <p className="section__num">01 · Now</p>
              <h2 className="section__head">Building at Friedmann AI while finishing my degree.</h2>
              <div className="section__body">
                <p>
                  I'm a <strong>Software Engineering Intern at FriedmannAI</strong> in Oakville
                  working on LLM security and performance. So far I've shipped a hardened system
                  prompt that basically stopped jailbreaks, an LLM pipeline to catch financial
                  profile discrepancies, an <strong>evals system</strong> to track model performance
                  over time, and an image templating engine for consistent LLM-generated client outputs.
                </p>
                <p>
                  On the side I'm maintaining <strong>PromptLint</strong>, a static analysis tool
                  for LLM prompts. The idea is simple: treat your prompts like code, lint them, and
                  catch issues before they hit production.
                </p>
                <p>
                  Open to full-time AI or backend roles starting 2027. If something looks interesting,
                  let's talk.
                </p>
              </div>
            </section>

            <section className="section" id="experience">
              <p className="section__num">02 · Experience</p>
              <h2 className="section__head">Every place I've worked, in order.</h2>
              <div className="section__body">
                <table className="years" aria-label="Work history">
                  <thead>
                    <tr><th>Dates</th><th>Company</th><th>What</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2026&ndash;Present</td>
                      <td>FriedmannAI</td>
                      <td>Software Engineer Intern · LLM security and performance: jailbreak mitigation, financial discrepancy detection, evals pipeline, image templating engine</td>
                    </tr>
                    <tr>
                      <td>2025 May&ndash;Aug</td>
                      <td>Sun Life Financial</td>
                      <td>DevOps Engineer Intern · OPA/Rego policy pipeline for IaC security, self-healing multi-AZ CloudFormation playbooks</td>
                    </tr>
                    <tr>
                      <td>2025 Jan&ndash;Apr</td>
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
              <h2 className="section__head">Things I've built and shipped.</h2>
              <div className="section__body">
                <ul className="projects">
                  <li>
                    <div className="proj__head">
                      <a href="https://promptlint.dev" target="_blank" rel="noopener noreferrer">PromptLint</a>
                      <span className="proj__stat">2500+ downloads</span>
                    </div>
                    <span className="proj__sub">ESLint for LLM prompts. Static analysis that reduces costs and improves reliability across your prompt library.</span>
                    <span className="proj__meta">TypeScript · Python · CI/CD · LLM</span>
                    <div className="proj__links">
                      <a href="https://promptlint.dev" target="_blank" rel="noopener noreferrer">↗ Live</a>
                      <a href="https://github.com/AryaanSheth/promptlint" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                  </li>
                  <li>
                    <div className="proj__head">
                      <a href="https://github.com/AryaanSheth/flowy" target="_blank" rel="noopener noreferrer">Flowy</a>
                    </div>
                    <span className="proj__sub">Hold a hotkey. Speak. Release. Local push-to-talk dictation powered by Apple Neural — no cloud, no account, no warm-up. Under 2 MB, zero CPU when idle.</span>
                    <span className="proj__meta">Swift · macOS · Local-First · Apple Silicon</span>
                    <div className="proj__links">
                      <a href="https://github.com/AryaanSheth/flowy" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                  </li>
                  <li>
                    <div className="proj__head">
                      <a href="https://hex.pm/packages/gloq" target="_blank" rel="noopener noreferrer">gloq</a>
                      <span className="proj__stat">700+ downloads</span>
                    </div>
                    <span className="proj__sub">Gleam wrapper for the GroqCloud LLM API. Type-safe LLM calls on the BEAM ecosystem.</span>
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
                    <span className="proj__sub">Fast GPSD client for Go. Low-latency GPS data streaming with a clean idiomatic API.</span>
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
                    <span className="proj__sub">Cross-exchange crypto arbitrage bot with real-time order book analysis.</span>
                    <span className="proj__meta">Go · Real-Time · Crypto</span>
                    <div className="proj__links">
                      <a href="https://github.com/AryaanSheth/hft-arbitrage-bot" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <section className="section" id="blog">
              <p className="section__num">04 · Blog</p>
              <h2 className="section__head">Writing on things I build and learn.</h2>
              <div className="section__body">
                {posts.length === 0 ? (
                  <p>No posts yet.</p>
                ) : (
                  <ul className="blog-cards">
                    {posts.map(post => (
                      <li key={post.slug}>
                        <a className="blog-card" href={`#blog/${post.slug}`}>
                          <span className="blog-card__date">{formatDate(post.date)}</span>
                          <span className="blog-card__title">{post.title}</span>
                          <span className="blog-card__tags">
                            {post.tags.map(t => (
                              <span key={t} className="blog-card__tag">{t}</span>
                            ))}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="section" id="reach">
              <p className="section__num">05 · Reach</p>
              <h2 className="section__head">Email works best, or LinkedIn if you prefer.</h2>
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
          </>
        )}

        {onPost && (
          <section className="section">
            <a className="blog-back" href="#blog">← All posts</a>
            {currentPost ? (
              <>
                <p className="section__num">04 · Blog</p>
                <h1 className="section__head">{currentPost.title}</h1>
                <div className="blog-post__meta">
                  <span className="blog-post__date">{formatLongDate(currentPost.date)}</span>
                  <span className="blog-card__tags">
                    {currentPost.tags.map(t => (
                      <span key={t} className="blog-card__tag">{t}</span>
                    ))}
                  </span>
                </div>
                <div
                  className="blog-post__body"
                  dangerouslySetInnerHTML={{ __html: marked.parse(currentPost.content) as string }}
                />
              </>
            ) : (
              <>
                <p className="section__num">04 · Blog</p>
                <p>Post not found.</p>
              </>
            )}
          </section>
        )}
      </article>
    </div>
  );
}

export default App;
