<div align="center">

<img src="https://img.shields.io/badge/Scam%20Swarm-Multi--Agent%20SOC-22d3ee?style=for-the-badge&logo=shield&logoColor=white" alt="Scam Swarm" />

# Scam Swarm
### Real-Time Multi-Agent AI Fraud Detection & Heuristic Forensics Console

[![React](https://img.shields.io/badge/Framework-React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite%208-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Gemini](https://img.shields.io/badge/Gen%20AI-Google%20Gemini-22d3ee?style=flat-square&logo=google-gemini&logoColor=white)](https://aistudio.google.com/)
[![Groq](https://img.shields.io/badge/LLM-Groq%20LLaMA-f59e0b?style=flat-square&logo=meta&logoColor=white)](https://console.groq.com/)
[![GCP](https://img.shields.io/badge/Cloud-Google%20Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Stop digital fraud, phishing, and UPI scams in under 2 seconds.**  
Multi-agent parallel forensics · Deterministic heuristics check · Switchable dual AI engine · Vite React SPA

Built for Gemini.exe 2.0

</div>

## 💡 The Problem

Digital scammers leverage multiple psychological triggers (urgency, panic) combined with deceptive infrastructure (brand typosquatting, disposable domains, and illicit UPI Virtual Payment Addresses) to defraud victims. Standard static firewalls cannot capture these dynamic social engineering threats. Scam Swarm resolves this by orchestrating a specialized multi-agent AI workforce to run parallel diagnostics on suspicious telemetry in real-time.

### 🎯 Problem Statement & Fintech Alignment
Scam Swarm aligns directly with the **Fintech** and **AI Security** tracks of Gemini.exe 2.0. By intercepting credential-harvesting billing links, fake lottery prize hooks, and blacklisted UPI Virtual Payment Addresses, Scam Swarm acts as an intelligent safety filter protecting consumers from financial fraud before digital transaction execution.

### ⚡ Gemini & Google Cloud Integrations
- **Google Gemini API**: Utilizes the official `@google/genai` SDK to harness the high-speed reasoning of **Gemini 1.5 Flash**. It enforces strict JSON schemas to run linguistic urgency analysis, evaluate lookalike domains, and generate structured recommended actions.
- **Firebase Hosting**: Serves the React SPA globally on Google Cloud's content delivery network (CDN) edge.

---

## ✨ Features

| Module | What it does |
|--------|-------------|
| 🤖 **Multi-Agent Pipeline** | Spawns three independent sub-agents (Link Investigator, Psychological Urgency Cop, and Financial Pattern Auditor) to analyze suspicious communications in parallel. |
| ⚡ **Dual AI Engine Support** | Equipped with a runtime-switchable adapter to test and compare **Google Gemini 1.5 Flash** (via `@google/genai`) against **LLaMA 3.3** (via Groq Cloud SDK). |
| 🔍 **Local Heuristics Engine** | Deterministically parses inputs for spoofed brand names, unencrypted HTTP links, blacklisted UPI handles, and urgency verbs before calling LLMs. |
| 📋 **Fail-Safe Exporter** | Allows users to copy analysis reports in clean plain text or Markdown formats with fallback clipboard APIs for insecure HTTP/IP contexts. |
| 💻 **Interactive SOC Dashboard** | Cyberpunk-themed Security Operations Center dashboard featuring custom SVG gauges, progress bars, and animations. |
| 🗂️ **JSON Schema Telemetry** | Leverages strict JSON mode formatting to ensure 100% reliable structural communication between orchestrators and model engines. |

---

## 🛠️ Tech Stack

- **Framework**: React 19 (Hooks, Context, Router guards)
- **Build Tooling**: Vite 8 (Fast dev server & optimized chunk building)
- **AI Core Engines**: Google Gemini 1.5 Flash & Groq LLaMA 3.3-70B
- **Cloud Hosting**: GCP (Firebase Hosting for static delivery)
- **Styling**: Vanilla CSS (Cyberpunk theme, flex columns, grid overlays, glassmorphic panels)

---

## 🗄️ Database & Telemetry Schema

Scam Swarm structures all agent analysis logs as a strict JSON telemetry payload:

```json
{
  "overallRiskScore": 94,
  "verdict": "CRITICAL THREAT",
  "scamCategory": "Phishing and Social Engineering",
  "executiveSummary": "The email attempts to steal credentials using suspend alerts and typosquatted links.",
  "confidence": 95,
  "metrics": {
    "linguisticUrgency": 80,
    "domainRisk": 100,
    "financialRisk": 90
  },
  "threatIndicators": [
    "unauthorized login",
    "netflix-billing-update.com",
    "terminated"
  ],
  "recommendedActions": [
    "Do NOT click on the provided link",
    "Verify the authenticity of the email with Netflix directly",
    "Report the incident to the cybersecurity team"
  ],
  "agents": [
    {
      "name": "Link & Domain Investigator",
      "status": "MALICIOUS",
      "finding": "The domain 'netflix-billing-update.com' is a known phishing domain."
    }
  ]
}
```

---

## 🚀 Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/immanuel-thomas-j/Scam-Swarm-Immanuel.git
cd Scam-Swarm-Immanuel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add your API credentials:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```
*(Note: A fallback config is embedded to gracefully alert the user if keys are omitted).*

### 4. Run the development server
```bash
npm run dev
```
Then open `http://localhost:5173`.

### 5. Production build
To build and optimize the project for production deployment:
```bash
npm run build
npm run preview
```

---

## 🛡️ National Helpline Support
If you have fallen victim to financial cyber fraud, immediately contact the **National Cybercrime Helpline** at **`1930`** or register a formal complaint at **[cybercrime.gov.in](https://cybercrime.gov.in)**.

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">
  <sub>Built with ❤️ for Gemini.exe 2.0</sub>
</div>
