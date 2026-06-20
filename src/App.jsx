import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import './App.css';

// ── SDK Init ─────────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

// ── Sample Payloads ───────────────────────────────────────────────────────────
const SAMPLE_PAYLOADS = {
  upi: {
    label: '💸 Fake UPI SMS',
    text: 'URGENT: Your SBI account has been blocked due to missing KYC. Click here to verify your identity and receive your ₹5,000 INR cash bonus instantly: https://sbi-verification-secure-portal.net/login. Pay via UPI to unblock immediately. Ref#8841221.',
  },
  phishing: {
    label: '🎣 Phishing Email',
    text: 'Dear Employee, Netflix security detected an unauthorized login from Moscow. Please reset your password within 24 hours by entering your credit card details at http://netflix-billing-update.com or your streaming access will be permanently terminated. — Netflix Security Team',
  },
  lottery: {
    label: '🎰 Lottery Scam',
    text: 'Congratulations! You have been selected as the WINNER of ₹45 Lakh in the Google India Lucky Draw 2024. To claim your prize immediately, send ₹499 processing fee to UPI ID: claim-prize@ybl and provide your Aadhaar number to our agent at +91-98XXXXXXXX. Offer expires in 2 hours.',
  },
  safe: {
    label: '✅ Legitimate Text',
    text: "Hey! Just reminding you that our dinner reservation is tonight at 7:30 PM. The place is called The Green Bistro — here's the location: https://maps.google.com/xyz. Looking forward to catching up!",
  },
};

// ── Agent Definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: 'link',
    name: 'Link & Domain Investigator',
    icon: '🔗',
    description: 'Scans URLs, lookalikes & credential harvesting risks',
    color: '#22d3ee',
  },
  {
    id: 'psych',
    name: 'Psychological Urgency Cop',
    icon: '🧠',
    description: 'Analyzes tone, panic phrases & authority impersonation',
    color: '#a855f7',
  },
  {
    id: 'finance',
    name: 'Financial Pattern Auditor',
    icon: '💰',
    description: 'Detects irregular UPI prompts, lottery hooks & tax scams',
    color: '#f59e0b',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusColor = (status) => {
  if (!status) return '#475569';
  const s = status.toUpperCase();
  if (s === 'SAFE')      return '#22c55e';
  if (s === 'SUSPICIOUS') return '#f59e0b';
  if (s === 'MALICIOUS')  return '#ef4444';
  return '#94a3b8';
};

const getStatusGlow = (status) => {
  if (!status) return 'transparent';
  const s = status.toUpperCase();
  if (s === 'SAFE')      return 'rgba(34,197,94,0.12)';
  if (s === 'SUSPICIOUS') return 'rgba(245,158,11,0.12)';
  if (s === 'MALICIOUS')  return 'rgba(239,68,68,0.12)';
  return 'transparent';
};

const getRiskColor = (score) => {
  if (score >= 70) return '#ef4444';
  if (score >= 40) return '#f59e0b';
  return '#22c55e';
};

const getRiskLabel = (score) => {
  if (score >= 70) return 'CRITICAL THREAT';
  if (score >= 40) return 'SUSPICIOUS';
  return 'SAFE';
};

// ── RiskGauge Component ───────────────────────────────────────────────────────
function RiskGauge({ score }) {
  const color = getRiskColor(score);
  const isCritical = score >= 70;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="gauge-wrapper">
      <svg width="180" height="180" viewBox="0 0 180 180" className="gauge-svg">
        {/* Glow filter */}
        <defs>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke="#1a2540"
          strokeWidth="12"
        />

        {/* Progress arc */}
        <circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke={`url(#gauge-gradient)`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 90 90)"
          filter="url(#glow-filter)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', strokeDashoffset: dashOffset }}
        />

        {/* Center score */}
        <text x="90" y="82" textAnchor="middle" fill={color} fontSize="32" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          {score}
        </text>
        <text x="90" y="100" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Space Grotesk, sans-serif" letterSpacing="2">
          / 100
        </text>
        <text x="90" y="118" textAnchor="middle" fill={color} fontSize="9" fontFamily="Space Grotesk, sans-serif" letterSpacing="3" fontWeight="600">
          RISK SCORE
        </text>
      </svg>

      {isCritical && <div className="gauge-pulse-ring" style={{ borderColor: color }} />}
    </div>
  );
}

// ── AgentCard Component ───────────────────────────────────────────────────────
function AgentCard({ agent, agentDef, animDelay = 0 }) {
  const statusColor = getStatusColor(agent?.status);
  const statusGlow  = getStatusGlow(agent?.status);

  return (
    <div
      className="agent-result-card animate-slide-up"
      style={{
        animationDelay: `${animDelay}ms`,
        borderLeft: `3px solid ${statusColor}`,
        background: `linear-gradient(135deg, ${statusGlow} 0%, transparent 60%), var(--bg-card)`,
      }}
    >
      <div className="agent-result-header">
        <div className="agent-result-identity">
          <span className="agent-icon" style={{ color: agentDef?.color }}>{agentDef?.icon}</span>
          <div>
            <div className="agent-result-name">{agent?.name || agentDef?.name}</div>
            <div className="agent-result-desc">{agentDef?.description}</div>
          </div>
        </div>
        <div className="status-badge" style={{ color: statusColor, backgroundColor: `${statusColor}18`, borderColor: `${statusColor}40` }}>
          {agent?.status || 'PENDING'}
        </div>
      </div>
      <p className="agent-finding">{agent?.finding || 'Awaiting analysis...'}</p>
    </div>
  );
}

// ── AgentPipelineRow ──────────────────────────────────────────────────────────
function AgentPipelineRow({ agentDef, state }) {
  // state: 'idle' | 'active' | 'done'
  const isActive = state === 'active';
  const isDone   = state === 'done';

  return (
    <div className={`pipeline-row ${state}`}>
      <div className="pipeline-indicator">
        {isDone  && <span className="pipeline-check">✓</span>}
        {isActive && <div className="pipeline-spinner" />}
        {!isActive && !isDone && <span className="pipeline-dot" />}
      </div>
      <div className="pipeline-info">
        <span className="pipeline-icon" style={{ color: agentDef.color }}>{agentDef.icon}</span>
        <span className="pipeline-name" style={{ color: isActive ? agentDef.color : isDone ? '#94a3b8' : '#2d4070' }}>
          {agentDef.name}
        </span>
      </div>
      <div className={`pipeline-status-tag ${state}`}>
        {isDone ? 'COMPLETE' : isActive ? 'SCANNING...' : 'STANDBY'}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [inputContent, setInputContent]     = useState('');
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [activeAgentIdx, setActiveAgentIdx] = useState(-1);
  const [swarmPayload, setSwarmPayload]     = useState(null);
  const [errorMsg, setErrorMsg]             = useState('');
  const [showRawJSON, setShowRawJSON]       = useState(false);
  const [charCount, setCharCount]           = useState(0);
  const dashboardRef = useRef(null);
  const intervalRef  = useRef(null);

  const handleTextChange = useCallback((e) => {
    setInputContent(e.target.value);
    setCharCount(e.target.value.length);
    if (errorMsg) setErrorMsg('');
  }, [errorMsg]);

  const loadPreset = (key) => {
    const payload = SAMPLE_PAYLOADS[key];
    setInputContent(payload.text);
    setCharCount(payload.text.length);
    setErrorMsg('');
  };

  const getAgentState = (idx) => {
    if (!isAnalyzing) return 'idle';
    if (idx < activeAgentIdx) return 'done';
    if (idx === activeAgentIdx) return 'active';
    return 'idle';
  };

  const executeSwarmAnalysis = async () => {
    if (!inputContent.trim()) {
      setErrorMsg('⚠ Insert a message or log before deploying the swarm.');
      return;
    }
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setErrorMsg('⚠ VITE_GEMINI_API_KEY is not configured. Add it to your .env file.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setSwarmPayload(null);
    setShowRawJSON(false);
    setActiveAgentIdx(0);

    // Animate through agents sequentially
    let currentIdx = 0;
    intervalRef.current = setInterval(() => {
      currentIdx++;
      if (currentIdx > 2) {
        clearInterval(intervalRef.current);
      } else {
        setActiveAgentIdx(currentIdx);
      }
    }, 1400);

    const systemPrompt = `You are an advanced multi-agent cybersecurity array called Scam Swarm. 
Analyze the following text payload for potential fraud, phishing, UPI scams, social engineering, or cyber threats.

Text to analyze:
"""
${inputContent}
"""

You MUST respond with a STRICT, SINGLE JSON object. No markdown, no backticks, no prose — raw JSON only.
The JSON MUST exactly match this structure:
{
  "overallRiskScore": <integer 0-100>,
  "verdict": <"SAFE" | "SUSPICIOUS" | "CRITICAL THREAT">,
  "scamCategory": <string category name>,
  "executiveSummary": <detailed 2-3 sentence analysis paragraph>,
  "agents": [
    { "name": "Link & Domain Investigator", "status": <"SAFE" | "SUSPICIOUS" | "MALICIOUS">, "finding": <specific finding string> },
    { "name": "Psychological Urgency Cop",  "status": <"SAFE" | "SUSPICIOUS" | "MALICIOUS">, "finding": <specific finding string> },
    { "name": "Financial Pattern Auditor",  "status": <"SAFE" | "SUSPICIOUS" | "MALICIOUS">, "finding": <specific finding string> }
  ]
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: systemPrompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text);
      clearInterval(intervalRef.current);
      setActiveAgentIdx(3); // all done
      await new Promise(r => setTimeout(r, 600)); // brief pause before reveal
      setSwarmPayload(parsed);

      // Scroll to dashboard
      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      console.error('Swarm core disruption:', err);
      clearInterval(intervalRef.current);
      setErrorMsg('❌ Failed to process telemetry from Gemini API. Verify your API key and network connection.');
    } finally {
      setIsAnalyzing(false);
      setActiveAgentIdx(-1);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const verdictColor  = swarmPayload ? getRiskColor(swarmPayload.overallRiskScore) : '#94a3b8';
  const isCritical    = swarmPayload?.overallRiskScore >= 70;
  const isSafe        = swarmPayload?.overallRiskScore < 40;

  return (
    <div className="app-root">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon-wrap">
              <span className="brand-icon">🛡️</span>
            </div>
            <div>
              <h1 className="brand-title">SCAM SWARM</h1>
              <p className="brand-subtitle">Multi-Agent Decentralized Fraud Analytics Console</p>
            </div>
          </div>
          <div className="header-meta">
            <div className="status-pill online">
              <span className="status-dot" />
              SYSTEM ONLINE
            </div>
            <div className="powered-tag">
              <span className="gemini-icon">✦</span>
              Gemini-Powered
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <main className="app-main">

        {/* ─── LEFT PANEL: INGESTION ─── */}
        <section className="panel ingestion-panel">
          <div className="panel-header">
            <span className="panel-icon">📡</span>
            <h2 className="panel-title">Ingestion Vector</h2>
            <div className="panel-badge">INPUT CONTROL</div>
          </div>

          <p className="input-label">
            Paste suspicious text, transactional notifications, SMS, or communication logs:
          </p>

          <div className="textarea-wrapper">
            <textarea
              id="scam-input"
              className="scam-textarea"
              value={inputContent}
              onChange={handleTextChange}
              placeholder="// Awaiting payload telemetry input...
// Paste suspicious content here"
              disabled={isAnalyzing}
            />
            <div className="textarea-footer">
              <span className="char-count">{charCount} chars</span>
              {inputContent && (
                <button className="clear-btn" onClick={() => { setInputContent(''); setCharCount(0); }}>
                  Clear ✕
                </button>
              )}
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="preset-section">
            <span className="preset-label">⚡ Quick Load Threat Payloads:</span>
            <div className="preset-grid">
              {Object.entries(SAMPLE_PAYLOADS).map(([key, val]) => (
                <button
                  key={key}
                  className="preset-btn"
                  onClick={() => loadPreset(key)}
                  disabled={isAnalyzing}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="error-bar animate-flicker">
              {errorMsg}
            </div>
          )}

          {/* Deploy Button */}
          <button
            id="deploy-swarm-btn"
            className={`deploy-btn ${isAnalyzing ? 'deploying' : ''}`}
            onClick={executeSwarmAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="btn-spinner" />
                SWARM DEPLOYED &amp; SCANNING...
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                DEPLOY INTEL SWARM
              </>
            )}
          </button>

          {/* Live Pipeline Console */}
          {isAnalyzing && (
            <div className="pipeline-console animate-flicker">
              <div className="pipeline-header">
                <span className="pipeline-title-icon">🤖</span>
                <span className="pipeline-title">ACTIVE AGENT WORKFORCE</span>
                <span className="pipeline-blink">●</span>
              </div>
              {AGENTS.map((agent, idx) => (
                <AgentPipelineRow
                  key={agent.id}
                  agentDef={agent}
                  state={
                    activeAgentIdx > idx ? 'done' :
                    activeAgentIdx === idx ? 'active' :
                    'idle'
                  }
                />
              ))}
              <div className="pipeline-progress-bar">
                <div
                  className="pipeline-progress-fill"
                  style={{ width: `${Math.max(5, (activeAgentIdx + 1) * 33.3)}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* ─── RIGHT PANEL: ANALYTICS DASHBOARD ─── */}
        <section className="panel analytics-panel" ref={dashboardRef}>
          <div className="panel-header">
            <span className="panel-icon">📊</span>
            <h2 className="panel-title">Analytics Dashboard</h2>
            <div className="panel-badge">THREAT INTEL</div>
          </div>

          {/* Empty / Idle State */}
          {!swarmPayload && !isAnalyzing && (
            <div className="empty-state animate-flicker">
              <div className="empty-icon">⬡</div>
              <p className="empty-title">System Operational</p>
              <p className="empty-sub">Awaiting payload telemetry data ingestion from Ingestion Vector.</p>
              <div className="empty-hint">Load a preset or paste a suspicious message → Deploy the swarm</div>
            </div>
          )}

          {/* Analyzing Skeleton */}
          {isAnalyzing && !swarmPayload && (
            <div className="analyzing-state">
              <div className="analyzing-spinner">
                <div className="spin-outer" />
                <div className="spin-inner" />
                <span className="spin-icon">✦</span>
              </div>
              <p className="analyzing-title">Gemini API Processing</p>
              <p className="analyzing-sub">Routing schema vectors through multi-agent analysis pipeline...</p>
              <div className="skeleton-lines">
                <div className="skel-line long shimmer" />
                <div className="skel-line medium shimmer" />
                <div className="skel-line short shimmer" />
              </div>
            </div>
          )}

          {/* RESULTS */}
          {swarmPayload && (
            <div className="results-container animate-flicker">

              {/* ── Verdict + Gauge ── */}
              <div
                className={`verdict-block ${isCritical ? 'critical' : isSafe ? 'safe' : 'suspicious'}`}
                style={{
                  borderColor: verdictColor,
                  boxShadow: isCritical ? `0 0 30px rgba(239,68,68,0.15)` : isSafe ? `0 0 30px rgba(34,197,94,0.12)` : `0 0 30px rgba(245,158,11,0.12)`,
                }}
              >
                <div className="verdict-layout">
                  <div className="verdict-left">
                    <div className="verdict-label">THREAT VERDICT</div>
                    <div
                      className="verdict-value"
                      style={{ color: verdictColor }}
                    >
                      {swarmPayload.verdict}
                    </div>
                    <div className="verdict-category">
                      <span className="category-chip" style={{ borderColor: `${verdictColor}40`, color: verdictColor }}>
                        {swarmPayload.scamCategory}
                      </span>
                    </div>
                  </div>
                  <div className="verdict-right">
                    <RiskGauge score={swarmPayload.overallRiskScore} />
                  </div>
                </div>
              </div>

              {/* ── Executive Summary ── */}
              <div className="summary-block animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="block-header">
                  <span className="block-icon">📋</span>
                  <span className="block-label">EXECUTIVE COGNITIVE SUMMARY</span>
                </div>
                <p className="summary-text">{swarmPayload.executiveSummary}</p>
              </div>

              {/* ── Agent Telemetry Cards ── */}
              <div className="agents-section">
                <div className="section-heading">
                  <span>🤖</span>
                  <span>GRANULAR AGENT TELEMETRY LOG</span>
                </div>
                {swarmPayload.agents.map((agent, i) => (
                  <AgentCard
                    key={i}
                    agent={agent}
                    agentDef={AGENTS[i]}
                    animDelay={i * 120}
                  />
                ))}
              </div>

              {/* ── Raw JSON Inspector ── */}
              <div className="json-inspector">
                <button
                  className="json-toggle-btn"
                  onClick={() => setShowRawJSON(v => !v)}
                  aria-expanded={showRawJSON}
                >
                  <span className="json-toggle-icon">{showRawJSON ? '▼' : '▶'}</span>
                  <span>🔎 Inspect Live Gemini API Structured JSON Response</span>
                  <span className="json-badge">schema</span>
                </button>
                {showRawJSON && (
                  <div className="json-panel animate-flicker">
                    <div className="json-toolbar">
                      <span className="json-dot red" />
                      <span className="json-dot amber" />
                      <span className="json-dot green" />
                      <span className="json-filename">gemini_response.json</span>
                    </div>
                    <pre className="json-pre">{JSON.stringify(swarmPayload, null, 2)}</pre>
                  </div>
                )}
              </div>

            </div>
          )}
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="app-footer">
        <span>SCAM SWARM v1.0</span>
        <span className="footer-sep">//</span>
        <span>Multi-Agent Fraud Detection</span>
        <span className="footer-sep">//</span>
        <span>Powered by <strong style={{ color: '#22d3ee' }}>Gemini 1.5 Flash</strong></span>
        <span className="footer-sep">//</span>
        <span>Firebase Hosting Ready</span>
      </footer>
    </div>
  );
}
