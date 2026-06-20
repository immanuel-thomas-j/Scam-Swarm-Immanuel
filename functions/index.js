const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors")({ origin: true });

// Initialize Google Cloud Admin SDK (Firestore Access)
admin.initializeApp();
const db = admin.firestore();

/**
 * ── SCAM SWARM ORCHESTRATOR CLOUD FUNCTION ──
 * Receives suspicious text, runs a local heuristic scan, queries Gemini,
 * and saves transaction audit logs to Firestore.
 */
exports.analyzeTelemetry = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // Enable CORS pre-flight
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed. Use POST.");
    }

    const { text, engine } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid parameter: 'text' is required." });
    }

    try {
      // 1. Run local heuristics (exact replica of frontend heuristics engine for validation)
      const heuristicsReport = runLocalHeuristicDiagnostics(text);

      // 2. Fetch Gemini API key from GCP Environment Config
      const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key || "";
      if (!apiKey) {
        return res.status(500).json({ error: "Google Gemini API Key is not configured on this server." });
      }

      const ai = new GoogleGenAI({ apiKey });

      // 3. Construct prompt incorporating heuristic pre-extracted features
      const prompt = `You are a cybersecurity fraud detection AI called Scam Swarm.
We have run a deterministic heuristics engine on the input text, which has extracted the following findings:
${JSON.stringify(heuristicsReport.findings, null, 2)}

Analyze the text below for scams, phishing, UPI fraud, or social engineering, using these heuristic findings as pre-extracted threat indicators.
Text: "${text.slice(0, 800)}"
Respond ONLY with a valid JSON object (no extra text) matching this structure exactly:
{"overallRiskScore":<0-100>,"verdict":"SAFE or SUSPICIOUS or CRITICAL THREAT","scamCategory":"<category>","executiveSummary":"<2 sentence analysis>","confidence":<0-100>,"metrics":{"linguisticUrgency":<0-100>,"domainRisk":<0-100>,"financialRisk":<0-100>},"threatIndicators":["<phrase1>","<phrase2>","<phrase3>"],"recommendedActions":["<action1>","<action2>","<action3>"],"agents":[{"name":"Link & Domain Investigator","status":"SAFE or SUSPICIOUS or MALICIOUS","finding":"<finding>"},{"name":"Psychological Urgency Cop","status":"SAFE or SUSPICIOUS or MALICIOUS","finding":"<finding>"},{"name":"Financial Pattern Auditor","status":"SAFE or SUSPICIOUS or MALICIOUS","finding":"<finding>"}]}`;

      // 4. Query Gemini
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsedResult = JSON.parse(response.text);
      parsedResult.heuristics = heuristicsReport;

      // 5. Audit Log Logging to Google Cloud Firestore (GCP NoSQL)
      await db.collection("audit_logs").add({
        textPreview: text.slice(0, 200),
        verdict: parsedResult.verdict,
        overallRiskScore: parsedResult.overallRiskScore,
        scamCategory: parsedResult.scamCategory,
        engineUsed: engine || "gemini-2.5-flash",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // 6. Return response to React client
      return res.status(200).json(parsedResult);

    } catch (err) {
      console.error("GCP Orchestrator core disruption:", err);
      return res.status(500).json({ error: "Failed to process analysis: " + err.message });
    }
  });
});

/**
 * Deterministic Heuristic Engine
 */
function runLocalHeuristicDiagnostics(text) {
  const findings = [];
  let scoreWeight = 0;
  
  const reportedVPAs = ['claim-prize@ybl', 'upi-verify-sbi@okhdfcbank', 'bonus-claim@paytm', 'secure-sbi@ybl'];
  const reportedDomains = ['sbi-verification-secure-portal.net', 'netflix-billing-update.com', 'google-india-draw.xyz', 'icici-security-portal.in'];

  // URL Checks
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];
  if (urls.length > 0) {
    findings.push({ severity: "INFO", label: "Telemetry URL Link", desc: `Extracted ${urls.length} link(s).` });
    urls.forEach(urlStr => {
      try {
        const cleanUrl = urlStr.trim().replace(/[.,;:"]+$/, '');
        const urlObj = new URL(cleanUrl);
        const hostname = urlObj.hostname.toLowerCase();

        if (reportedDomains.includes(hostname)) {
          findings.push({ severity: "CRITICAL", label: "Blacklisted Scam Domain", desc: `Matches blacklisted threat intel domain '${hostname}'.` });
          scoreWeight += 45;
        }
        if (urlObj.protocol === "http:") {
          findings.push({ severity: "HIGH", label: "Insecure URL Protocol", desc: `HTTP link detected: '${hostname}'.` });
          scoreWeight += 25;
        }
      } catch (e) {}
    });
  }

  // UPI Checks
  const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]{3,}/gi;
  const upis = text.match(upiRegex) || [];
  if (upis.length > 0) {
    upis.forEach(upi => {
      if (reportedVPAs.includes(upi.toLowerCase())) {
        findings.push({ severity: "CRITICAL", label: "Blacklisted UPI Address", desc: `Matches active fraudulent VPA handle '${upi}'.` });
        scoreWeight += 45;
      }
    });
  }

  return { findings, heuristicScore: Math.min(95, scoreWeight) };
}
