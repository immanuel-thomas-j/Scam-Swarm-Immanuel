# 🛡️ Scam Swarm — Multi-Agent AI Fraud Detection Console

**Scam Swarm** is a production-grade, GCP-native cybersecurity analysis platform built to identify, dissect, and neutralize digital scams, phishing threats, and financial frauds in real time. 

Designed for high-impact social defense, Scam Swarm deploys a coordinated, multi-agent AI workforce to run parallel forensics on suspicious telemetry (SMS, email, UPI payment prompts, or suspect URLs) and returns a comprehensive intelligence verdict in under 2 seconds.

---

## 🏆 Hackathon Focus Areas & Standouts

### 1. Best Use of AI APIs
*   **Dual AI Engine Support**: Equipped with a runtime-switchable engine adapter. Test and compare **Google Gemini 1.5 Flash** (via the official `@google/genai` SDK) against **LLaMA 3.3** (via Groq Cloud SDK).
*   **Multi-Agent Parallel Forensics**: Simulates a decoupled Google Cloud Pub/Sub fan-out that spins up three specialized sub-agents:
    1.  **🔗 Link & Domain Investigator**: Analyzes lookalike URLs, domain age/entropy, and credential-harvesting signatures.
    2.  **🧠 Psychological Urgency Cop**: Scans for panic triggers, false authority, and artificial time limits.
    3.  **💰 Financial Pattern Auditor**: Checks for unauthorized UPI requests, advance fee/lottery scams, and irregular bank codes.
*   **Structured Schema Outputs**: Utilizes strict JSON mode definitions and schemas to ensure 100% reliable system telemetry, avoiding parse errors.

### 2. Best Deployed App
*   **GCP-Native & Serverless Architecture**: Designed to scale horizontally on Google Cloud:
    *   **Firebase Hosting**: Delivers the lightning-fast, secure React SPA globally.
    *   **Cloud Functions**: Decoupled serverless orchestrators and sub-agent workers.
    *   **Cloud Pub/Sub**: Manages asynchronous, non-blocking agent fan-out.
    *   **Firestore**: Real-time audit trail, transaction logging, and result store.
*   **Production Security**: Configured with strict security response headers (CSP, Frame protection, XSS control) and optimized caching rules for build bundles.

---

## ⚙️ Project Architecture

```
                    ┌─────────────────────────┐
                    │       User Client       │
                    └────────────┬────────────┘
                                 │ HTTPS
                                 ▼
                    ┌─────────────────────────┐
                    │    Firebase Hosting     │
                    └────────────┬────────────┘
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │     Cloud Function      │
                    │     (Orchestrator)      │
                    └────────────┬────────────┘
                                 │
                   ┌─────────────┼─────────────┐ (Pub/Sub Fan-Out)
                   ▼             ▼             ▼
             ┌───────────┐ ┌───────────┐ ┌───────────┐
             │ Link Agent│ │Psych Agent│ │ Fin Agent │
             │   (CF)    │ │   (CF)    │ │   (CF)    │
             └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                   │             │             │
                   └─────────────┼─────────────┘ (Aggregate)
                                 ▼
                    ┌─────────────────────────┐
                    │     Firestore DB        │
                    │   (Results & Audit)     │
                    └─────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   An API key from **[Google AI Studio](https://aistudio.google.com/)** (Gemini) or **[Groq Console](https://console.groq.com/)**.

### Local Setup
1.  **Clone the Repository & Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**:
    Copy the example template file to `.env`:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and configure your API keys:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    VITE_GROQ_API_KEY=your_groq_api_key_here
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Codebase Structure

```
├── public/                 # Static assets
├── src/
│   ├── pages/
│   │   ├── Landing.jsx     # Professional landing page, stats, and GCP overview
│   │   ├── Landing.css     # Landing page aesthetics, grid background, animations
│   │   ├── Analyzer.jsx    # Real-time multi-agent fraud analyzer dashboard
│   │   └── ...
│   ├── App.css             # Main application layout and dashboard styles
│   ├── index.css           # Global design system variables and keyframe animations
│   ├── main.jsx            # Router and React application entrypoint
│   └── ...
├── firebase.json           # Firebase Hosting security headers & rewrites config
├── vite.config.js          # Vite compilation config
└── package.json            # Dependencies list (React 19, React Router 7, @google/genai, groq-sdk)
```

---

## 🛡️ Production Deployment (Firebase Hosting)

To deploy the frontend application to production:

1.  **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Authenticate & Initialize**:
    ```bash
    firebase login
    firebase init hosting
    ```
    *Select your GCP project and set the public directory to `dist`.*

3.  **Build and Deploy**:
    ```bash
    npm run build
    firebase deploy
    ```

---

## 📞 Indian Cybercrime Support
If you have fallen victim to financial cyber fraud, immediately contact the **National Cybercrime Helpline** at **`1930`** or register a formal complaint at **[cybercrime.gov.in](https://cybercrime.gov.in)**.
