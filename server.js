import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.CRICKETDATA_API_KEY;
const API_BASE = "https://api.cricapi.com/v1";
app.use(express.static("public"));

async function providerRequest(endpoint, extra = {}) {
  if (!API_KEY) throw Object.assign(new Error("Missing CRICKETDATA_API_KEY. Add it to .env."), { status: 503 });
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set("apikey", API_KEY);
  url.searchParams.set("offset", "0");
  for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw Object.assign(new Error(`Provider HTTP ${response.status}`), { status: 502 });
  const json = await response.json();
  if (json.status && json.status !== "success") throw Object.assign(new Error(json.reason || "Provider API error"), { status: 502 });
  return json;
}

app.get("/api/matches", async (_req, res) => {
  try {
    const json = await providerRequest("currentMatches");
    res.set("Cache-Control", "no-store");
    res.json({ matches: Array.isArray(json.data) ? json.data : [], source: "Cricket Data API" });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

app.get("/api/scorecard/:matchId", async (req, res) => {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(req.params.matchId)) return res.status(400).json({ error: "Invalid match ID." });
    const json = await providerRequest("match_scorecard", { id: req.params.matchId });
    res.set("Cache-Control", "no-store");
    res.json(json);
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, apiKeyConfigured: Boolean(API_KEY) }));
app.listen(PORT, () => console.log(`Cricket Live running at http://localhost:${PORT}`));
