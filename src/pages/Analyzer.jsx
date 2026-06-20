import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import '../App.css';
import { 
  ShieldIcon, IngestionIcon, AnalyticsIcon, RobotIcon, SettingsIcon, 
  LightningIcon, RocketIcon, LinkIcon, BrainIcon, MoneyIcon, 
  AlertIcon, PhoneIcon, BankIcon, LockIcon, CheckIcon, EyeIcon, 
  ResetIcon, ClipboardIcon, EmptyIcon, SearchIcon, PlayIcon, CloseIcon, PhoneCallIcon
} from '../components/Icons';

// ── API Adapter — dual engine support (Gemini + Groq) ─────────────────────────
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true }) : null;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

async function callAI(prompt, engine = 'gemini') {
  if (engine === 'gemini') {
    if (!ai) throw new Error('Gemini API key is not configured.');
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    const text = response.text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Failed to extract JSON schema from Gemini response.');
    }
    return JSON.parse(text.slice(jsonStart, jsonEnd));
  } else {
    if (!groq) throw new Error('Groq API key is not configured.');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    return JSON.parse(completion.choices[0].message.content);
  }
}

// ── Icon Mapping for Actions ──────────────────────────────────────────────────
export const IconMap = {
  block: (props) => <CloseIcon {...props} color="var(--red)" />,
  phone: (props) => <PhoneCallIcon {...props} />,
  bank: (props) => <BankIcon {...props} />,
  lock: (props) => <LockIcon {...props} />,
  clipboard: (props) => <ClipboardIcon {...props} />,
  alert: (props) => <AlertIcon {...props} color="var(--amber)" />,
  search: (props) => <SearchIcon {...props} />,
  check: (props) => <CheckIcon {...props} color="var(--green)" />,
  eye: (props) => <EyeIcon {...props} />,
  shield: (props) => <ShieldIcon {...props} color="var(--cyan)" />
};

// ── Sample Payloads ───────────────────────────────────────────────────────────
const SAMPLE_PAYLOADS = {
  upi:      { label: 'Fake UPI SMS',    text: 'URGENT: Your SBI account has been blocked due to missing KYC. Click here to verify your identity and receive your ₹5,000 INR cash bonus instantly: https://sbi-verification-secure-portal.net/login. Pay via UPI to unblock immediately. Ref#8841221.' },
  phishing: { label: 'Phishing Email',  text: 'Dear Employee, Netflix security detected an unauthorized login from Moscow. Please reset your password within 24 hours by entering your credit card details at http://netflix-billing-update.com or your streaming access will be permanently terminated. — Netflix Security Team' },
  lottery:  { label: 'Lottery Scam',    text: 'Congratulations! You have been selected as the WINNER of ₹45 Lakh in the Google India Lucky Draw 2024. To claim your prize immediately, send ₹499 processing fee to UPI ID: claim-prize@ybl and provide your Aadhaar number to our agent at +91-98XXXXXXXX. Offer expires in 2 hours.' },
  safe:     { label: 'Legitimate Text', text: "Hey! Just reminding you that our dinner reservation is tonight at 7:30 PM. The place is called The Green Bistro — here's the location: https://maps.google.com/xyz. Looking forward to catching up!" },
};

// ── Agents ────────────────────────────────────────────────────────────────────
const AGENTS = [
  { id: 'link',    name: 'Link & Domain Investigator', icon: 'link', description: 'Scans URLs, lookalikes & credential harvesting risks', color: '#22d3ee' },
  { id: 'psych',   name: 'Psychological Urgency Cop',  icon: 'brain', description: 'Analyzes tone, panic phrases & authority impersonation', color: '#a855f7' },
  { id: 'finance', name: 'Financial Pattern Auditor',  icon: 'money', description: 'Detects irregular UPI prompts, lottery hooks & tax scams', color: '#f59e0b' },
];

// ── Recommended Actions ───────────────────────────────────────────────────────
const ACTIONS_BY_VERDICT = {
  'CRITICAL THREAT': [
    { icon: 'block', text: 'Do NOT click any links or attachments' },
    { icon: 'phone', text: 'Call National Cybercrime Helpline: 1930' },
    { icon: 'bank',  text: 'Alert your bank immediately if financial info was shared' },
    { icon: 'lock',  text: 'Block sender and report as spam' },
    { icon: 'clipboard', text: 'File report at cybercrime.gov.in' },
  ],
  'SUSPICIOUS': [
    { icon: 'alert', text: 'Do not share OTPs, passwords, or personal data' },
    { icon: 'search', text: 'Verify sender identity through official channels' },
    { icon: 'phone', text: 'Call the organization directly using their official number' },
    { icon: 'block', text: 'Avoid clicking links until verified' },
  ],
  'SAFE': [
    { icon: 'check', text: 'No immediate threats detected in this message' },
    { icon: 'eye',   text: 'Always stay vigilant — scammers evolve tactics' },
    { icon: 'shield', text: 'Keep Scam Swarm handy for future verification' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusColor = (s) => {
  if (!s) return '#475569';
  const u = s.toUpperCase();
  if (u === 'SAFE')       return '#22c55e';
  if (u === 'SUSPICIOUS') return '#f59e0b';
  if (u === 'MALICIOUS')  return '#ef4444';
  return '#94a3b8';
};
const getStatusGlow = (s) => {
  if (!s) return 'transparent';
  const u = s.toUpperCase();
  if (u === 'SAFE')       return 'rgba(34,197,94,0.12)';
  if (u === 'SUSPICIOUS') return 'rgba(245,158,11,0.12)';
  if (u === 'MALICIOUS')  return 'rgba(239,68,68,0.12)';
  return 'transparent';
};
const getRiskColor = (score) => score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';

// ── RiskGauge ─────────────────────────────────────────────────────────────────
function RiskGauge({ score }) {
  const color = getRiskColor(score);
  const r = 70, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="gauge-wrapper">
      <svg width="180" height="180" viewBox="0 0 180 180" className="gauge-svg">
        <defs>
          <filter id="glow-filter"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color} stopOpacity="1"/>
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1a2540" strokeWidth="12"/>
        <circle cx="90" cy="90" r={r} fill="none" stroke="url(#gauge-gradient)" strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 90 90)" filter="url(#glow-filter)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}/>
        <text x="90" y="82" textAnchor="middle" fill={color} fontSize="32" fontWeight="700" fontFamily="JetBrains Mono, monospace">{score}</text>
        <text x="90" y="100" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Space Grotesk" letterSpacing="2">/ 100</text>
        <text x="90" y="118" textAnchor="middle" fill={color} fontSize="9" fontFamily="Space Grotesk" letterSpacing="3" fontWeight="600">RISK SCORE</text>
      </svg>
      {score >= 70 && <div className="gauge-pulse-ring" style={{ borderColor: color }}/>}
    </div>
  );
}

// ── ThreatBreakdownChart ──────────────────────────────────────────────────────
function ThreatBreakdownChart({ agents }) {
  const getScore = (status) => {
    const u = (status || '').toUpperCase();
    if (u === 'MALICIOUS') return 92;
    if (u === 'SUSPICIOUS') return 55;
    return 12;
  };
  return (
    <div className="breakdown-chart">
      <div className="block-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AnalyticsIcon size={16} color="var(--cyan)" />
        <span className="block-label">AGENT THREAT BREAKDOWN</span>
      </div>
      {agents.map((agent, i) => {
        const score = getScore(agent.status);
        const color = getStatusColor(agent.status);
        const AgentIcon = {
          link: LinkIcon,
          brain: BrainIcon,
          money: MoneyIcon
        }[AGENTS[i]?.icon];
        return (
          <div key={i} className="bar-row">
            <span className="bar-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {AgentIcon && <AgentIcon size={14} color={AGENTS[i]?.color} />}
              {AGENTS[i]?.name.split(' ').slice(0, 2).join(' ')}
            </span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${score}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}/></div>
            <span className="bar-pct" style={{ color }}>{score}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ── TextHighlighter ───────────────────────────────────────────────────────────
function TextHighlighter({ text, indicators = [] }) {
  if (!indicators.length) return <p className="summary-text">{text}</p>;
  const escaped = indicators.map(i => i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <p className="summary-text highlighted-text">
      {parts.map((part, i) =>
        indicators.some(ind => ind.toLowerCase() === part.toLowerCase())
          ? <mark key={i} className="threat-mark">{part}</mark>
          : part
      )}
    </p>
  );
}

// ── RecommendedActions ────────────────────────────────────────────────────────
function RecommendedActions({ verdict, aiActions = [] }) {
  const actions = aiActions.length
    ? aiActions.map(a => ({ icon: 'play', text: a }))
    : (ACTIONS_BY_VERDICT[verdict] || ACTIONS_BY_VERDICT['SAFE']);
  const color = verdict === 'CRITICAL THREAT' ? '#ef4444' : verdict === 'SUSPICIOUS' ? '#f59e0b' : '#22c55e';
  return (
    <div className="actions-block" style={{ borderColor: `${color}30` }}>
      <div className="block-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldIcon size={16} color="var(--cyan)" />
        <span className="block-label">RECOMMENDED RESPONSE ACTIONS</span>
        {verdict === 'CRITICAL THREAT' && <span className="urgent-badge">URGENT</span>}
      </div>
      <div className="actions-grid">
        {actions.map((action, i) => {
          const ActIcon = IconMap[action.icon] || (() => <PlayIcon size={12} color={color} />);
          return (
            <div key={i} className="action-item animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="action-icon" style={{ display: 'flex', alignItems: 'center' }}>
                {ActIcon({ size: 16 })}
              </span>
              <span className="action-text">{action.text}</span>
            </div>
          );
        })}
      </div>
      {verdict === 'CRITICAL THREAT' && (
        <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="report-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <AlertIcon size={14} color="var(--red)" /> File Report at cybercrime.gov.in →
        </a>
      )}
    </div>
  );
}

// ── AgentCard ─────────────────────────────────────────────────────────────────
function AgentCard({ agent, agentDef, animDelay = 0 }) {
  const statusColor = getStatusColor(agent?.status);
  const statusGlow  = getStatusGlow(agent?.status);
  const AgentIcon = {
    link: LinkIcon,
    brain: BrainIcon,
    money: MoneyIcon
  }[agentDef?.icon];
  return (
    <div className="agent-result-card animate-slide-up"
      style={{ animationDelay: `${animDelay}ms`, borderLeft: `3px solid ${statusColor}`, background: `linear-gradient(135deg, ${statusGlow} 0%, transparent 60%), var(--bg-card)` }}>
      <div className="agent-result-header">
        <div className="agent-result-identity">
          <span className="agent-icon" style={{ color: agentDef?.color, display: 'flex', alignItems: 'center' }}>
            {AgentIcon && <AgentIcon size={18} />}
          </span>
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
  const isActive = state === 'active', isDone = state === 'done';
  const AgentIcon = {
    link: LinkIcon,
    brain: BrainIcon,
    money: MoneyIcon
  }[agentDef.icon];
  return (
    <div className={`pipeline-row ${state}`}>
      <div className="pipeline-indicator">
        {isDone   && <CheckIcon size={12} color="var(--green)" />}
        {isActive && <div className="pipeline-spinner"/>}
        {!isActive && !isDone && <span className="pipeline-dot"/>}
      </div>
      <div className="pipeline-info">
        <span className="pipeline-icon" style={{ color: agentDef.color, display: 'flex', alignItems: 'center' }}>
          {AgentIcon && <AgentIcon size={16} />}
        </span>
        <span className="pipeline-name" style={{ color: isActive ? agentDef.color : isDone ? '#94a3b8' : '#2d4070' }}>{agentDef.name}</span>
      </div>
      <div className={`pipeline-status-tag ${state}`}>
        {isDone ? 'COMPLETE' : isActive ? 'SCANNING...' : 'STANDBY'}
      </div>
    </div>
  );
}

// ── Main Analyzer ─────────────────────────────────────────────────────────────
export default function Analyzer() {
  const navigate = useNavigate();
  const [inputContent, setInputContent]     = useState('');
  const [aiEngine, setAiEngine]             = useState(import.meta.env.VITE_GEMINI_API_KEY ? 'gemini' : 'groq');
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [activeAgentIdx, setActiveAgentIdx] = useState(-1);
  const [swarmPayload, setSwarmPayload]     = useState(null);
  const [errorMsg, setErrorMsg]             = useState('');
  const [showRawJSON, setShowRawJSON]       = useState(false);
  const [charCount, setCharCount]           = useState(0);
  const [scanTime, setScanTime]             = useState(null);
  const [copied, setCopied]                 = useState(false);
  const dashboardRef = useRef(null);
  const intervalRef  = useRef(null);
  const startTimeRef = useRef(null);
 
  const handleTextChange = useCallback((e) => {
    setInputContent(e.target.value);
    setCharCount(e.target.value.length);
    if (errorMsg) setErrorMsg('');
  }, [errorMsg]);
 
  const loadPreset = (key) => {
    const p = SAMPLE_PAYLOADS[key];
    setInputContent(p.text);
    setCharCount(p.text.length);
    setErrorMsg('');
    setSwarmPayload(null);
  };
 
  const copyReport = () => {
    if (!swarmPayload) return;
    const report = `SCAM SWARM ANALYSIS REPORT\nVerdict: ${swarmPayload.verdict}\nRisk Score: ${swarmPayload.overallRiskScore}/100\nCategory: ${swarmPayload.scamCategory}\nSummary: ${swarmPayload.executiveSummary}\nAgents:\n${swarmPayload.agents.map(a => `  • ${a.name}: ${a.status} — ${a.finding}`).join('\n')}\n\nGenerated by Scam Swarm — cybercrime.gov.in | Helpline: 1930`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
 
  const resetScan = () => { setSwarmPayload(null); setInputContent(''); setCharCount(0); setErrorMsg(''); setScanTime(null); setShowRawJSON(false); };
 
  const executeSwarmAnalysis = async () => {
    if (!inputContent.trim()) { setErrorMsg('⚠ Insert a message or log before deploying the swarm.'); return; }
    
    if (aiEngine === 'gemini' && !import.meta.env.VITE_GEMINI_API_KEY) {
      setErrorMsg('🔑 VITE_GEMINI_API_KEY is not configured in your .env file. Switch to Groq or add the key to scan.');
      return;
    }
    if (aiEngine === 'groq' && !import.meta.env.VITE_GROQ_API_KEY) {
      setErrorMsg('🔑 VITE_GROQ_API_KEY is not configured in your .env file. Switch to Gemini or add the key to scan.');
      return;
    }
 
    setIsAnalyzing(true); setErrorMsg(''); setSwarmPayload(null); setShowRawJSON(false);
    setActiveAgentIdx(0); startTimeRef.current = Date.now();
 
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx > 2) clearInterval(intervalRef.current);
      else setActiveAgentIdx(idx);
    }, 1400);
 
    const prompt = `You are a cybersecurity fraud detection AI called Scam Swarm. Analyze the text below for scams, phishing, UPI fraud, or social engineering.
Text: "${inputContent.slice(0, 800)}"
Respond ONLY with a valid JSON object (no extra text) matching this structure exactly:
{"overallRiskScore":<0-100>,"verdict":"SAFE or SUSPICIOUS or CRITICAL THREAT","scamCategory":"<category>","executiveSummary":"<2 sentence analysis>","confidence":<0-100>,"threatIndicators":["<phrase1>","<phrase2>","<phrase3>"],"recommendedActions":["<action1>","<action2>","<action3>"],"agents":[{"name":"Link & Domain Investigator","status":"SAFE or SUSPICIOUS or MALICIOUS","finding":"<finding>"},{"name":"Psychological Urgency Cop","status":"SAFE or SUSPICIOUS or MALICIOUS","finding":"<finding>"},{"name":"Financial Pattern Auditor","status":"SAFE or SUSPICIOUS or MALICIOUS","finding":"<finding>"}]}`;
 
    try {
      const parsed = await callAI(prompt, aiEngine);
      clearInterval(intervalRef.current);
      setActiveAgentIdx(3);
      setScanTime(((Date.now() - startTimeRef.current) / 1000).toFixed(2));
      await new Promise(r => setTimeout(r, 500));
      setSwarmPayload(parsed);
      setTimeout(() => dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } catch (err) {
      console.error('Swarm core disruption:', err);
      clearInterval(intervalRef.current);
      const msg = err?.message || '';
      if (msg.includes('429') || msg.includes('rate_limit')) {
        setErrorMsg('⏳ Rate limit hit. Wait ~30 seconds and try again.');
      } else if (msg.includes('API key') || msg.includes('401') || msg.includes('invalid_api_key')) {
        setErrorMsg(`🔑 Invalid API key for ${aiEngine === 'gemini' ? 'Gemini' : 'Groq'}. Check your .env file.`);
      } else {
        setErrorMsg(`❌ Analysis failed: ${msg || 'Check network connection and API keys.'}`);
      }
    } finally {
      setIsAnalyzing(false);
      setActiveAgentIdx(-1);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const verdictColor = swarmPayload ? getRiskColor(swarmPayload.overallRiskScore) : '#94a3b8';
  const isCritical   = swarmPayload?.overallRiskScore >= 70;
  const isSafe       = swarmPayload?.overallRiskScore < 40;

  return (
    <div className="app-root">
      <div className="scanline-overlay"/>

      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <button className="back-btn" onClick={() => navigate('/')} title="Back to Home">←</button>
            <div className="brand-icon-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldIcon size={24} color="var(--cyan)" />
            </div>
            <div>
              <h1 className="brand-title">SCAM SWARM</h1>
              <p className="brand-subtitle">Multi-Agent Fraud Detection Console // GCP Native</p>
            </div>
          </div>
          <div className="header-meta">
            <div className="status-pill online"><span className="status-dot"/>SYSTEM ONLINE</div>
            <div className="powered-tag" style={{ gap: '6px' }}><ShieldIcon size={14} color="var(--cyan)" />AI-Powered</div>
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <main className="app-main">

        {/* ─── LEFT: INGESTION ─── */}
        <section className="panel ingestion-panel">
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IngestionIcon size={20} color="var(--cyan)" />
            <h2 className="panel-title">Ingestion Vector</h2>
            <div className="panel-badge">INPUT CONTROL</div>
          </div>

          <p className="input-label">Paste suspicious SMS, phishing emails, UPI requests, or any suspicious communication:</p>

          <div className="textarea-wrapper">
            <textarea id="scam-input" className="scam-textarea" value={inputContent}
              onChange={handleTextChange} disabled={isAnalyzing}
              placeholder={"// Awaiting payload telemetry input...\n// Paste suspicious content here"}/>
            <div className="textarea-footer">
              <span className="char-count">{charCount} chars</span>
              {inputContent && <button className="clear-btn" onClick={() => { setInputContent(''); setCharCount(0); }}>Clear ✕</button>}
            </div>
          </div>


          {/* AI Core Engine Selector */}
          <div className="preset-section">
            <span className="preset-label">AI Core Engine Selector:</span>
            <div className="preset-grid" style={{ marginBottom: '14px' }}>
              <button 
                type="button"
                className="preset-btn" 
                onClick={() => { setAiEngine('gemini'); setErrorMsg(''); }}
                disabled={isAnalyzing}
                style={{
                  flex: '1',
                  textAlign: 'center',
                  fontWeight: '600',
                  border: aiEngine === 'gemini' ? '1px solid var(--cyan)' : '1px solid var(--border-mid)',
                  background: aiEngine === 'gemini' ? 'var(--cyan-glow)' : 'var(--bg-card)',
                  color: aiEngine === 'gemini' ? 'var(--cyan)' : 'var(--text-secondary)',
                  boxShadow: aiEngine === 'gemini' ? '0 0 10px var(--cyan-glow)' : 'none',
                }}
              >
                ✦ Google Gemini API
              </button>
              <button 
                type="button"
                className="preset-btn" 
                onClick={() => { setAiEngine('groq'); setErrorMsg(''); }}
                disabled={isAnalyzing}
                style={{
                  flex: '1',
                  textAlign: 'center',
                  fontWeight: '600',
                  border: aiEngine === 'groq' ? '1px solid var(--amber)' : '1px solid var(--border-mid)',
                  background: aiEngine === 'groq' ? 'var(--amber-glow)' : 'var(--bg-card)',
                  color: aiEngine === 'groq' ? 'var(--amber)' : 'var(--text-secondary)',
                  boxShadow: aiEngine === 'groq' ? '0 0 10px var(--amber-glow)' : 'none',
                }}
              >
                ⚡ Groq LLaMA Engine
              </button>
            </div>
          </div>

          <div className="preset-section">
            <span className="preset-label">Quick Load Threat Payloads:</span>
            <div className="preset-grid">
              {Object.entries(SAMPLE_PAYLOADS).map(([key, val]) => (
                <button key={key} className="preset-btn" onClick={() => loadPreset(key)} disabled={isAnalyzing}>{val.label}</button>
              ))}
            </div>
          </div>


          {errorMsg && <div className="error-bar animate-flicker">{errorMsg}</div>}

          <button id="deploy-swarm-btn" className={`deploy-btn ${isAnalyzing ? 'deploying' : ''}`}
            onClick={executeSwarmAnalysis} disabled={isAnalyzing} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            {isAnalyzing
              ? <><span className="btn-spinner"/>SWARM DEPLOYED &amp; SCANNING...</>
              : <><RocketIcon size={18} />DEPLOY INTEL SWARM</>}
          </button>

          {isAnalyzing && (
            <div className="pipeline-console animate-flicker">
              <div className="pipeline-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RobotIcon size={16} color="var(--cyan)" />
                <span className="pipeline-title">ACTIVE AGENT WORKFORCE</span>
                <span className="pipeline-blink">●</span>
              </div>
              {AGENTS.map((agent, idx) => (
                <AgentPipelineRow key={agent.id} agentDef={agent}
                  state={activeAgentIdx > idx ? 'done' : activeAgentIdx === idx ? 'active' : 'idle'}/>
              ))}
              <div className="pipeline-progress-bar">
                <div className="pipeline-progress-fill" style={{ width: `${Math.max(5, (activeAgentIdx + 1) * 33.3)}%` }}/>
              </div>
            </div>
          )}
        </section>

        {/* ─── RIGHT: DASHBOARD ─── */}
        <section className="panel analytics-panel" ref={dashboardRef}>
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AnalyticsIcon size={20} color="var(--cyan)" />
            <h2 className="panel-title">Analytics Dashboard</h2>
            <div className="panel-badge">THREAT INTEL</div>
          </div>

          {!swarmPayload && !isAnalyzing && (
            <div className="empty-state animate-flicker">
              <div className="empty-icon" style={{ marginBottom: '8px' }}>
                <EmptyIcon size={48} color="var(--border-glow)" />
              </div>
              <p className="empty-title">System Operational</p>
              <p className="empty-sub">Awaiting payload telemetry. Load a preset or paste a suspicious message, then deploy the swarm.</p>
              <div className="empty-hint" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <RocketIcon size={14} /> Deploy the swarm to see results here
              </div>
            </div>
          )}

          {isAnalyzing && !swarmPayload && (
            <div className="analyzing-state">
              <div className="analyzing-spinner">
                <div className="spin-outer"/><div className="spin-inner"/>
                <span className="spin-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldIcon size={18} color="var(--cyan)" />
                </span>
              </div>
              <p className="analyzing-title">AI Engine Processing</p>
              <p className="analyzing-sub">Routing payload through multi-agent analysis pipeline...</p>
              <div className="skeleton-lines">
                <div className="skel-line long shimmer"/>
                <div className="skel-line medium shimmer"/>
                <div className="skel-line short shimmer"/>
              </div>
            </div>
          )}

          {swarmPayload && (
            <div className="results-container animate-flicker">

              {/* Scan meta */}
              {scanTime && (
                <div className="scan-meta-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LightningIcon size={14} color="var(--cyan)" />
                    Analyzed in <strong>{scanTime}s</strong>
                  </span>
                  <span className="scan-meta-sep">•</span>
                  <span>Confidence: <strong style={{ color: verdictColor }}>{swarmPayload.confidence ?? '—'}%</strong></span>
                  <span className="scan-meta-sep">•</span>
                  <span>3 agents deployed</span>
                </div>
              )}

              {/* Verdict + Gauge */}
              <div className={`verdict-block ${isCritical ? 'critical' : isSafe ? 'safe' : 'suspicious'}`}
                style={{ borderColor: verdictColor, boxShadow: `0 0 30px ${verdictColor}22` }}>
                <div className="verdict-layout">
                  <div className="verdict-left">
                    <div className="verdict-label">THREAT VERDICT</div>
                    <div className="verdict-value" style={{ color: verdictColor }}>{swarmPayload.verdict}</div>
                    <div className="verdict-category">
                      <span className="category-chip" style={{ borderColor: `${verdictColor}40`, color: verdictColor }}>{swarmPayload.scamCategory}</span>
                    </div>
                  </div>
                  <RiskGauge score={swarmPayload.overallRiskScore}/>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="summary-block animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="block-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardIcon size={16} color="var(--cyan)" />
                  <span className="block-label">EXECUTIVE COGNITIVE SUMMARY</span>
                </div>
                <TextHighlighter text={swarmPayload.executiveSummary} indicators={swarmPayload.threatIndicators || []}/>
                {swarmPayload.threatIndicators?.length > 0 && (
                  <div className="threat-indicators">
                    {swarmPayload.threatIndicators.map((t, i) => <span key={i} className="threat-chip">{t}</span>)}
                  </div>
                )}
              </div>

              {/* Threat Breakdown Chart */}
              <ThreatBreakdownChart agents={swarmPayload.agents}/>

              {/* Agent Cards */}
              <div className="agents-section">
                <div className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RobotIcon size={16} color="var(--cyan)" />
                  <span>GRANULAR AGENT TELEMETRY LOG</span>
                </div>
                {swarmPayload.agents.map((agent, i) => (
                  <AgentCard key={i} agent={agent} agentDef={AGENTS[i]} animDelay={i * 120}/>
                ))}
              </div>

              {/* Recommended Actions */}
              <RecommendedActions verdict={swarmPayload.verdict} aiActions={swarmPayload.recommendedActions || []}/>

              {/* Export */}
              <div className="export-bar">
                <button className="export-btn" onClick={copyReport} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  {copied ? '✓ Copied!' : <><ClipboardIcon size={14} /> Copy Report</>}
                </button>
                <button className="export-btn secondary" onClick={resetScan} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <ResetIcon size={14} /> New Scan
                </button>
              </div>

              {/* JSON Inspector */}
              <div className="json-inspector">
                <button className="json-toggle-btn" onClick={() => setShowRawJSON(v => !v)} aria-expanded={showRawJSON}>
                  <span className="json-toggle-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {showRawJSON ? <PlayIcon size={10} style={{ transform: 'rotate(90deg)' }} /> : <PlayIcon size={10} />}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SearchIcon size={14} color="var(--cyan)" />
                    Inspect Live AI Structured JSON Response
                  </span>
                  <span className="json-badge">schema</span>
                </button>
                {showRawJSON && (
                  <div className="json-panel animate-flicker">
                    <div className="json-toolbar">
                      <span className="json-dot red"/><span className="json-dot amber"/><span className="json-dot green"/>
                      <span className="json-filename">swarm_response.json</span>
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
        <span>SCAM SWARM v2.0</span>
        <span className="footer-sep">//</span>
        <span>Powered by <strong style={{ color: aiEngine === 'gemini' ? '#22d3ee' : '#f59e0b' }}>
          {aiEngine === 'gemini' ? 'Gemini 1.5 Flash · Google Cloud' : 'LLaMA 3.3 · Groq'}
        </strong></span>
        <span className="footer-sep">//</span>
        <span>GCP · Firebase · Cloud Functions · Pub/Sub</span>
        <span className="footer-sep">//</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertIcon size={14} color="var(--red)" />
          Cybercrime Helpline: <strong style={{ color: '#ef4444' }}>1930</strong>
        </span>
      </footer>
    </div>
  );
}
