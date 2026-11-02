import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiCode, FiMessageSquare, FiPlay, FiVideo } from "react-icons/fi";
import Footer from "../component/Footer";
import Navbar from "../component/Navbar";
import "./Landing.css";

const Landing = () => (
  <div className="landing-page">
    <Navbar />
    <main>
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> Built for focused engineering teams</div>
          <h1>Code together.<br /><span>Ship with confidence.</span></h1>
          <p className="hero-lead">A collaborative workspace that brings live coding, video, chat, and instant execution into one secure room—without breaking your flow.</p>
          <div className="hero-actions">
            <Link to="/join" className="button button-primary">Start collaborating <FiArrowRight /></Link>
            <Link to="/about" className="button button-secondary">See how it works</Link>
          </div>
          <div className="hero-proof">
            <span><FiCheck /> Real-time editing</span><span><FiCheck /> Up to 4 collaborators</span><span><FiCheck /> No setup</span>
          </div>
        </div>
        <div className="workspace-preview" aria-label="SquadScript collaborative editor preview">
          <div className="preview-topbar"><div className="window-dots"><i /><i /><i /></div><span>product-launch.js</span><div className="live-pill"><span /> 3 live</div></div>
          <div className="preview-body">
            <aside className="file-rail"><b>SS</b><FiCode /><FiMessageSquare /><FiVideo /></aside>
            <div className="code-panel">
              <div className="code-tabs"><span className="active">index.js</span><span>api.js</span></div>
              <pre><code><span className="line">01</span> <em>const</em> squad = <strong>await</strong> createRoom({'{'}{`\n`}<span className="line">02</span>   members: <i>4</i>,{`\n`}<span className="line">03</span>   mode: <u>'collaborative'</u>{`\n`}<span className="line">04</span> {'}'}){`\n`}{`\n`}<span className="line">06</span> squad.<strong>ship</strong>()</code></pre>
              <div className="terminal"><div><span>✓</span> Build completed in 1.24s</div><small>Ready for collaboration</small></div>
            </div>
            <aside className="team-panel"><div className="team-title"><span>TEAM</span><span>3 / 4</span></div><div className="person"><b>AT</b><p>Ayush<small>Editing index.js</small></p><i /></div><div className="person"><b>MT</b><p>Mohak<small>Reviewing</small></p><i /></div><div className="person muted"><b>YO</b><p>You<small>Connected</small></p><i /></div><button><FiPlay /> Run code</button></aside>
          </div>
        </div>
      </section>
      <section className="metrics-strip" aria-label="Product highlights"><div><strong>4</strong><span>people in one room</span></div><div><strong>&lt;100ms</strong><span>live collaboration</span></div><div><strong>15+</strong><span>languages supported</span></div><div><strong>1</strong><span>unified workspace</span></div></section>
      <section className="feature-section"><div className="section-heading"><div className="eyebrow">Everything in one place</div><h2>Less context switching.<br />More momentum.</h2><p>SquadScript keeps every part of a productive coding session close at hand.</p></div><div className="feature-grid"><article><FiCode /><h3>Live code editor</h3><p>Write and review code together with synchronized changes and language-aware editing.</p></article><article><FiVideo /><h3>Built-in conversation</h3><p>Move from idea to implementation with video and chat in the same workspace.</p></article><article><FiPlay /><h3>Run instantly</h3><p>Compile and test across popular languages without leaving the collaboration room.</p></article></div></section>
    </main>
    <Footer />
  </div>
);

export default Landing;
