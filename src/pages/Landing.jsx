import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { 
  ShieldIcon, MoneyIcon, GlobeIcon, PubSubIcon, DatabaseIcon, 
  RocketIcon, LinkIcon, BrainIcon, UserIcon, PhoneIcon,
  AlertIcon, CheckIcon, PlayIcon, SettingsIcon
} from '../components/Icons';

// ── Impact Stats ──────────────────────────────────────────────────────────────
const STATS = [
  { value: '₹10,319 Cr', label: 'Lost to cyber fraud in India', sub: 'FY 2023-24, MHA Data', icon: 'money', color: '#ef4444' },
  { value: '13.4 Lakh',  label: 'UPI fraud cases in one year', sub: '85% YoY growth', icon: 'phone', color: '#f59e0b' },
  { value: '3.4 Billion',label: 'Phishing emails sent daily', sub: 'Globally, 2024', icon: 'link', color: '#a855f7' },
  { value: '1930',       label: 'National Cybercrime Helpline', sub: 'Report fraud instantly', icon: 'shield', color: '#22d3ee' },
];

// ── Agents ────────────────────────────────────────────────────────────────────
const AGENTS = [
  { icon: 'link', name: 'Link & Domain Investigator', color: '#22d3ee', desc: 'Detects lookalike domains, suspicious redirects, and credential harvesting URLs hidden in messages.', tags: ['Domain Spoofing', 'URL Entropy', 'SSL Mismatch'] },
  { icon: 'brain', name: 'Psychological Urgency Cop',  color: '#a855f7', desc: 'Analyses panic-inducing language, false authority claims, and manufactured time pressure tactics.', tags: ['Urgency Language', 'Authority Spoof', 'Fear Tactics'] },
  { icon: 'money', name: 'Financial Pattern Auditor',  color: '#f59e0b', desc: 'Identifies irregular UPI payment prompts, lottery fund hooks, fake prize claims, and tax evasion lures.', tags: ['UPI Fraud', 'Lottery Scam', 'Advance Fee'] },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ stat, visible }) {
  const IconComponent = {
    money: MoneyIcon,
    phone: PhoneIcon,
    link: LinkIcon,
    shield: ShieldIcon
  }[stat.icon];

  return (
    <div className="lnd-stat-card" style={{ '--accent': stat.color }}>
      <span className="lnd-stat-icon" style={{ color: stat.color }}>
        {IconComponent && <IconComponent size={28} />}
      </span>

      <div className="lnd-stat-value" style={{ color: stat.color }}>{stat.value}</div>
      <div className="lnd-stat-label">{stat.label}</div>
      <div className="lnd-stat-sub">{stat.sub}</div>
    </div>
  );
}

// ── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    // 1. Stats observer
    const statsObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    if (statsRef.current) statsObserver.observe(statsRef.current);

    // 2. Scroll Reveal observer
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => revealObserver.observe(el));

    return () => {
      statsObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div className="lnd-root">
      {/* Grid and Glow spots background */}
      <div className="lnd-grid-bg" />
      <div className="lnd-glow-spot-1" />
      <div className="lnd-glow-spot-2" />
      <div className="lnd-glow-spot-3" />
      <div className="scanline-overlay" />

      {/* ── NAV ── */}
      <nav className="lnd-nav">
        <div className="lnd-nav-inner">
          <div className="lnd-nav-brand">
            <span className="lnd-nav-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <ShieldIcon size={24} color="var(--cyan)" />
            </span>
            <span className="lnd-nav-title">SCAM SWARM</span>
          </div>
          <div className="lnd-nav-links">
            <a href="#stats" className="lnd-nav-link">The Crisis</a>
            <a href="#agents" className="lnd-nav-link">AI Agents</a>
            <a href="#architecture" className="lnd-nav-link">GCP Stack</a>
            <button className="lnd-nav-cta" onClick={() => navigate('/analyze')}>
              Launch Tool →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lnd-hero">
        <div className="lnd-hero-inner">
          <div className="lnd-hero-content scroll-reveal">
            <div className="lnd-hero-badge">
              <span className="lnd-badge-dot" />
              Multi-Agent AI · GCP Native · Real-Time Detection
            </div>

            <h1 className="lnd-hero-title">
              <span className="lnd-title-line">Fight Fraud</span>
              <span className="lnd-title-line accent">With a Swarm.</span>
            </h1>

            <p className="lnd-hero-sub">
              Scam Swarm deploys three specialized AI agents in parallel to dissect suspicious messages,
              phishing emails, and UPI fraud attempts — delivering a composite threat verdict in under 2 seconds.
            </p>

            <div className="lnd-hero-cta-row">
              <button className="lnd-cta-primary" onClick={() => navigate('/analyze')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RocketIcon size={20} /> Deploy the Swarm
              </button>
              <button className="lnd-cta-secondary" onClick={() => statsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                See Live Stats ↓
              </button>
            </div>
          </div>

          {/* Terminal preview (placed beside hero content) */}
          <div className="lnd-terminal scroll-reveal">
            <div className="lnd-terminal-bar">
              <span className="lnd-dot red" /><span className="lnd-dot amber" /><span className="lnd-dot green" />
              <span className="lnd-terminal-title">scam-swarm · live analysis</span>
            </div>
            <div className="lnd-terminal-body">
              <div className="lnd-terminal-line"><span className="lnd-t-dim">$</span> <span className="lnd-t-cmd">deploy --swarm --input</span> <span className="lnd-t-str">"URGENT: Verify your SBI KYC..."</span></div>
              <div className="lnd-terminal-line lnd-t-delay-1"><PlayIcon size={12} color="var(--cyan)" /> <span className="lnd-t-muted">Agent 01 · Link &amp; Domain Investigator</span> <span className="lnd-t-scanning">SCANNING...</span></div>
              <div className="lnd-terminal-line lnd-t-delay-2"><PlayIcon size={12} color="var(--cyan)" /> <span className="lnd-t-muted">Agent 02 · Psychological Urgency Cop</span> <span className="lnd-t-scanning">SCANNING...</span></div>
              <div className="lnd-terminal-line lnd-t-delay-3"><PlayIcon size={12} color="var(--cyan)" /> <span className="lnd-t-muted">Agent 03 · Financial Pattern Auditor</span> <span className="lnd-t-scanning">SCANNING...</span></div>
              <div className="lnd-terminal-line lnd-t-delay-4"><AlertIcon size={14} color="var(--red)" /> <span className="lnd-t-verdict">CRITICAL THREAT</span> <span className="lnd-t-dim">· Risk Score:</span> <span className="lnd-t-red">94/100</span></div>
              <div className="lnd-terminal-line lnd-t-delay-5"><CheckIcon size={14} color="var(--green)" /> <span className="lnd-t-dim">Analysis complete in</span> <span className="lnd-t-cyan">1.24s</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="lnd-stats-section" ref={statsRef} id="stats">
        <div className="lnd-section-inner">
          <div className="lnd-section-tag">THE PROBLEM</div>
          <h2 className="lnd-section-title">Digital Fraud Is a <span className="lnd-accent">National Crisis</span></h2>
          <div className="lnd-stats-grid scroll-reveal">
            {STATS.map((s, i) => <StatCard key={i} stat={s} visible={statsVisible} />)}
          </div>
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section className="lnd-agents-section" id="agents">
        <div className="lnd-section-inner">
          <div className="lnd-section-tag">THE AGENTS</div>
          <h2 className="lnd-section-title">Three Specialists. <span className="lnd-accent">One Verdict.</span></h2>
          <p className="lnd-section-sub">Each agent runs independently via a Pub/Sub fan-out — true parallel execution with no single point of failure.</p>
          <div className="lnd-agents-grid scroll-reveal">
            {AGENTS.map((agent, i) => {
              const AgentIcon = {
                link: LinkIcon,
                brain: BrainIcon,
                money: MoneyIcon
              }[agent.icon];
              return (
                <div key={i} className="lnd-agent-card" style={{ '--agent-color': agent.color }}>
                  <div className="lnd-agent-glow" />
                  <div className="lnd-agent-header">
                    <span className="lnd-agent-icon" style={{ color: agent.color, display: 'flex', alignItems: 'center' }}>
                      {AgentIcon && <AgentIcon size={32} />}
                    </span>
                    <h3 className="lnd-agent-name" style={{ color: agent.color }}>{agent.name}</h3>
                  </div>
                  <p className="lnd-agent-desc">{agent.desc}</p>
                  <div className="lnd-agent-tags">
                    {agent.tags.map((t, j) => (
                      <span key={j} className="lnd-tag" style={{ borderColor: `${agent.color}40`, color: agent.color, background: `${agent.color}10` }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lnd-final-cta scroll-reveal">
        <div className="lnd-section-inner">
          <div className="lnd-cta-glow" />
          <h2 className="lnd-cta-title">Ready to deploy the swarm?</h2>
          <p className="lnd-cta-sub" style={{ marginBottom: '28px' }}>Paste any suspicious message and get a full threat report in seconds. Free. Instant.</p>
          <button className="lnd-cta-primary large" onClick={() => navigate('/analyze')} style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto 30px' }}>
            <RocketIcon size={24} /> Launch Scam Swarm →
          </button>
          <div className="lnd-helpline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <AlertIcon size={18} color="var(--red)" />
            <span>Cybercrime Helpline India: <strong style={{ color: '#ef4444' }}>1930</strong> · Report at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee' }}>cybercrime.gov.in</a></span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lnd-footer">
        <div className="lnd-footer-inner">
          <div className="lnd-footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldIcon size={20} color="var(--cyan)" />
            <span className="lnd-nav-title" style={{ fontSize: '14px' }}>SCAM SWARM</span>
          </div>
          <div className="lnd-footer-links">
            <span>Made with ❤️ for Gemini.exe 2.0</span>
            <span className="lnd-sep">//</span>
            <span>React · Google Gemini API · Firebase Hosting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
