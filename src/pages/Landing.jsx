import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { 
  ShieldIcon, MoneyIcon, GlobeIcon, PubSubIcon, DatabaseIcon, IngestionIcon, 
  RocketIcon, AnalyticsIcon, LinkIcon, BrainIcon, KeyIcon, UserIcon, PhoneIcon,
  AlertIcon, CheckIcon, PlayIcon, EmptyIcon, SettingsIcon
} from '../components/Icons';

// ── Impact Stats ──────────────────────────────────────────────────────────────
const STATS = [
  { value: '₹10,319 Cr', label: 'Lost to cyber fraud in India', sub: 'FY 2023-24, MHA Data', icon: 'money', color: '#ef4444' },
  { value: '13.4 Lakh',  label: 'UPI fraud cases in one year', sub: '85% YoY growth', icon: 'phone', color: '#f59e0b' },
  { value: '3.4 Billion',label: 'Phishing emails sent daily', sub: 'Globally, 2024', icon: 'link', color: '#a855f7' },
  { value: '1930',       label: 'National Cybercrime Helpline', sub: 'Report fraud instantly', icon: 'shield', color: '#22d3ee' },
];

// ── How It Works Steps ────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { step: '01', icon: 'ingest', title: 'Paste Suspicious Content', desc: 'Drop any SMS, email, UPI request, or URL into the ingestion vector. No signup, no friction.' },
  { step: '02', icon: 'rocket', title: 'Deploy the Swarm', desc: 'Three specialized AI agents are dispatched in parallel — each hunting a different attack surface simultaneously.' },
  { step: '03', icon: 'analysis', title: 'Parallel Analysis', desc: 'Link & Domain Investigator, Psychological Urgency Cop, and Financial Pattern Auditor each run independent scans.' },
  { step: '04', icon: 'shield', title: 'Instant Verdict', desc: 'A composite risk score (0–100) is computed with verdict, threat indicators, and recommended response actions.' },
];

// ── Agents ────────────────────────────────────────────────────────────────────
const AGENTS = [
  { icon: 'link', name: 'Link & Domain Investigator', color: '#22d3ee', desc: 'Detects lookalike domains, suspicious redirects, and credential harvesting URLs hidden in messages.', tags: ['Domain Spoofing', 'URL Entropy', 'SSL Mismatch'] },
  { icon: 'brain', name: 'Psychological Urgency Cop',  color: '#a855f7', desc: 'Analyses panic-inducing language, false authority claims, and manufactured time pressure tactics.', tags: ['Urgency Language', 'Authority Spoof', 'Fear Tactics'] },
  { icon: 'money', name: 'Financial Pattern Auditor',  color: '#f59e0b', desc: 'Identifies irregular UPI payment prompts, lottery fund hooks, fake prize claims, and tax evasion lures.', tags: ['UPI Fraud', 'Lottery Scam', 'Advance Fee'] },
];

// ── GCP Architecture ──────────────────────────────────────────────────────────
const GCP_STACK = [
  { icon: 'globe', name: 'Firebase Hosting', desc: 'Static SPA delivery with global CDN', color: '#f59e0b' },
  { icon: 'settings', name: 'Cloud Functions', desc: 'Serverless orchestrator + 3 agent workers', color: '#22d3ee' },
  { icon: 'pubsub', name: 'Cloud Pub/Sub', desc: 'Fan-out message broker for parallel agents', color: '#a855f7' },
  { icon: 'database', name: 'Firestore',       desc: 'Audit trail, scan history & result store', color: '#22c55e' },
  { icon: 'analytics', name: 'Cloud Logging',   desc: 'End-to-end observability across all hops', color: '#60a5fa' },
  { icon: 'key', name: 'Secret Manager',  desc: 'Secure API key storage for AI endpoints', color: '#fb7185' },
];

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start]);
  return count;
}

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
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lnd-root">
      {/* Grid background */}
      <div className="lnd-grid-bg" />
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
            <a href="#how-it-works" className="lnd-nav-link">How It Works</a>
            <a href="#agents" className="lnd-nav-link">Agents</a>
            <a href="#architecture" className="lnd-nav-link">Architecture</a>
            <button className="lnd-nav-cta" onClick={() => navigate('/analyze')}>
              Launch Tool →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lnd-hero">
        <div className="lnd-hero-inner">
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
            <a href="#how-it-works" className="lnd-cta-secondary">
              See How It Works ↓
            </a>
          </div>

          {/* Terminal preview */}
          <div className="lnd-terminal">
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
          <p className="lnd-section-sub">India lost over ₹10,319 crore to cyber fraud in FY 2023-24. Scam Swarm was built to fight back.</p>
          <div className="lnd-stats-grid">
            {STATS.map((s, i) => <StatCard key={i} stat={s} visible={statsVisible} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lnd-how-section" id="how-it-works">
        <div className="lnd-section-inner">
          <div className="lnd-section-tag">THE SOLUTION</div>
          <h2 className="lnd-section-title">How Scam Swarm <span className="lnd-accent">Works</span></h2>
          <div className="lnd-steps-grid">
            {HOW_IT_WORKS.map((step, i) => {
              const StepIcon = {
                ingest: IngestionIcon,
                rocket: RocketIcon,
                analysis: AnalyticsIcon,
                shield: ShieldIcon
              }[step.icon];
              return (
                <div key={i} className="lnd-step-card" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="lnd-step-number">{step.step}</div>
                  <div className="lnd-step-icon" style={{ color: 'var(--cyan)', display: 'flex', alignItems: 'center' }}>
                    {StepIcon && <StepIcon size={32} />}
                  </div>
                  <h3 className="lnd-step-title">{step.title}</h3>
                  <p className="lnd-step-desc">{step.desc}</p>
                  {i < HOW_IT_WORKS.length - 1 && <div className="lnd-step-arrow">→</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section className="lnd-agents-section" id="agents">
        <div className="lnd-section-inner">
          <div className="lnd-section-tag">THE AGENTS</div>
          <h2 className="lnd-section-title">Three Specialists. <span className="lnd-accent">One Verdict.</span></h2>
          <p className="lnd-section-sub">Each agent runs independently via a Pub/Sub fan-out — true parallel execution with no single point of failure.</p>
          <div className="lnd-agents-grid">
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

      {/* ── GCP ARCHITECTURE ── */}
      <section className="lnd-arch-section" id="architecture">
        <div className="lnd-section-inner">
          <div className="lnd-section-tag">PRODUCTION ARCHITECTURE</div>
          <h2 className="lnd-section-title">Built on <span className="lnd-accent">Google Cloud</span></h2>
          <p className="lnd-section-sub">Scam Swarm is architected for production scale using GCP-native services — every component decoupled, observable, and auto-scaling.</p>

          {/* Architecture flow diagram */}
          <div className="lnd-arch-diagram">
            <div className="lnd-arch-flow">
              <div className="lnd-arch-node input-node">
                <UserIcon size={22} color="var(--text-secondary)" />
                <span>User Input</span>
              </div>
              <div className="lnd-arch-connector"><div className="lnd-conn-line animated-line" /><span className="lnd-conn-label">HTTPS</span></div>
              <div className="lnd-arch-node" style={{ borderColor: '#f59e0b50' }}>
                <GlobeIcon size={22} color="#f59e0b" />
                <span>Firebase Hosting</span><span className="lnd-arch-sub">React SPA</span>
              </div>
              <div className="lnd-arch-connector"><div className="lnd-conn-line animated-line" /><span className="lnd-conn-label">REST</span></div>
              <div className="lnd-arch-node highlight-node">
                <SettingsIcon size={22} color="#22d3ee" />
                <span>Cloud Functions</span><span className="lnd-arch-sub">Orchestrator</span>
              </div>
            </div>

            <div className="lnd-arch-pubsub-row">
              <div className="lnd-pubsub-line" />
              <div className="lnd-arch-node pubsub-center">
                <PubSubIcon size={22} color="#a855f7" />
                <span>Cloud Pub/Sub</span><span className="lnd-arch-sub">Fan-Out → 3 Topics</span>
              </div>
              <div className="lnd-pubsub-line" />
            </div>

            <div className="lnd-arch-agents-row">
              {AGENTS.map((a, i) => {
                const AgentIcon = {
                  link: LinkIcon,
                  brain: BrainIcon,
                  money: MoneyIcon
                }[a.icon];
                return (
                  <div key={i} className="lnd-arch-node agent-node" style={{ borderColor: `${a.color}40`, background: `${a.color}08` }}>
                    {AgentIcon && <AgentIcon size={22} color={a.color} />}
                    <span style={{ color: a.color }}>CF: {a.name.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="lnd-arch-sub">Agent Worker</span>
                  </div>
                );
              })}
            </div>

            <div className="lnd-arch-pubsub-row">
              <div className="lnd-pubsub-line" />
              <div className="lnd-arch-node firestore-node">
                <DatabaseIcon size={22} color="#22c55e" />
                <span>Firestore</span><span className="lnd-arch-sub">Results + Audit Log</span>
              </div>
              <div className="lnd-pubsub-line" />
            </div>
          </div>

          {/* GCP Stack Cards */}
          <div className="lnd-gcp-stack">
            {GCP_STACK.map((item, i) => {
              const ChipIcon = {
                globe: GlobeIcon,
                settings: SettingsIcon,
                pubsub: PubSubIcon,
                database: DatabaseIcon,
                analytics: AnalyticsIcon,
                key: KeyIcon
              }[item.icon];
              return (
                <div key={i} className="lnd-gcp-chip" style={{ '--chip-color': item.color }}>
                  <span className="lnd-gcp-chip-icon" style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                    {ChipIcon && <ChipIcon size={24} />}
                  </span>
                  <div>
                    <div className="lnd-gcp-chip-name" style={{ color: item.color }}>{item.name}</div>
                    <div className="lnd-gcp-chip-desc">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lnd-final-cta">
        <div className="lnd-section-inner">
          <div className="lnd-cta-glow" />
          <h2 className="lnd-cta-title">Ready to deploy the swarm?</h2>
          <p className="lnd-cta-sub">Paste any suspicious message and get a full threat report in seconds. Free. Instant. No login required.</p>
          <button className="lnd-cta-primary large" onClick={() => navigate('/analyze')} style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto 40px' }}>
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
            <span>Multi-Agent Fraud Detection</span>
            <span className="lnd-sep">//</span>
            <span>GCP · Firebase · Cloud Functions · Pub/Sub</span>
            <span className="lnd-sep">//</span>
            <span>Powered by LLaMA 3.3 · Groq</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
