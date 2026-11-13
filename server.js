require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.CRICKET_API_KEY;
const API_BASE = "https://api.cricapi.com/v1";

app.use(express.static(path.join(__dirname, "public")));

async function cricketApi(endpoint, params = {}) {
  if (!API_KEY) {
    const error = new Error("API key is not configured. Add CRICKET_API_KEY to your .env file.");
    error.status = 503;
    throw error;
  }

  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set("apikey", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!response.ok) {
    const error = new Error(`Cricket provider returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  if (payload.status === "failure" || payload.status === "error") {
    const error = new Error(payload.reason || payload.message || "Cricket API request failed");
    error.status = 502;
    throw error;
  }
  return payload;
}

app.get("/api/matches", async (req, res) => {
  try {
    const data = await cricketApi("currentMatches", { offset: req.query.offset || 0 });
    res.set("Cache-Control", "no-store");
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

app.get("/api/match/:id", async (req, res) => {
  try {
    const data = await cricketApi("match_info", { id: req.params.id });
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, apiKeyConfigured: Boolean(API_KEY) });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cricket Live is running on port ${PORT}`);
});