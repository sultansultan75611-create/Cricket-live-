const matchesGrid = document.getElementById("matchesGrid");
const loadingBox = document.getElementById("loadingBox");
const errorBox = document.getElementById("errorBox");
const emptyBox = document.getElementById("emptyBox");
const lastUpdated = document.getElementById("lastUpdated");
const searchInput = document.getElementById("searchInput");
const dialog = document.getElementById("matchDialog");
let allMatches = [];
let activeFilter = "all";

document.getElementById("todayLabel").textContent =
  new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
document.getElementById("year").textContent = new Date().getFullYear();

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function matchCategory(match) {
  if (match.matchEnded) return "completed";
  if (match.matchStarted) return "live";
  return "upcoming";
}

function statusLabel(match) {
  const category = matchCategory(match);
  if (category === "live") return "● LIVE";
  if (category === "completed") return "RESULT";
  return "UPCOMING";
}

function teamScore(match, teamName) {
  const innings = (match.score || []).filter(item =>
    String(item.inning || "").toLowerCase().includes(String(teamName).toLowerCase())
  );
  const score = innings[innings.length - 1];
  return score ? `${score.r}/${score.w} <small>(${score.o} ov)</small>` : "—";
}

function teamMarkup(match, name) {
  const info = (match.teamInfo || []).find(team =>
    String(team.name).toLowerCase() === String(name).toLowerCase()
  );
  const logo = info && info.img
    ? `<img class="team-logo" src="${escapeHTML(info.img)}" alt="" onerror="this.style.display='none'">`
    : `<span class="team-fallback">${escapeHTML(String(name).slice(0, 3).toUpperCase())}</span>`;
  return `<div class="team-row">${logo}<span class="team-name">${escapeHTML(name)}</span><span class="team-score">${teamScore(match, name)}</span></div>`;
}

function cardMarkup(match) {
  const teams = match.teams || [];
  const category = matchCategory(match);
  const series = match.name || "Cricket match";
  const venue = match.venue || "Venue unavailable";
  const date = match.date || "";
  return `<article class="match-card">
    <div class="card-top"><span class="series-name" title="${escapeHTML(series)}">${escapeHTML(series)}</span>
      <span class="status-pill ${category === "live" ? "live" : ""}">${statusLabel(match)}</span></div>
    <div class="teams">
      ${teams.slice(0, 2).map(team => teamMarkup(match, team)).join("")}
    </div>
    <div class="match-status">${escapeHTML(match.status || "Match details not yet available")}</div>
    <div class="card-bottom"><span>${escapeHTML(venue)}${date ? " · " + escapeHTML(date) : ""}</span>
      <button class="details-link" data-match-id="${escapeHTML(match.id || "")}">MATCH DETAILS ↗</button></div>
  </article>`;
}

function renderMatches() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = allMatches.filter(match => {
    const category = matchCategory(match);
    const matchesFilter = activeFilter === "all" || category === activeFilter;
    const searchable = `${match.name || ""} ${(match.teams || []).join(" ")} ${match.venue || ""}`.toLowerCase();
    return matchesFilter && searchable.includes(query);
  });

  matchesGrid.innerHTML = filtered.map(cardMarkup).join("");
  emptyBox.classList.toggle("hidden", filtered.length !== 0);
  matchesGrid.classList.toggle("hidden", filtered.length === 0);
}

async function loadMatches() {
  const firstLoad = allMatches.length === 0;
  if (firstLoad) loadingBox.classList.remove("hidden");
  errorBox.classList.add("hidden");

  try {
    const response = await fetch("/api/matches", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to load matches.");
    if (!Array.isArray(result.data)) throw new Error("The cricket API returned an unexpected response.");
    allMatches = result.data;
    renderMatches();
    lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    errorBox.textContent = `${error.message} Check your API key and server connection.`;
    errorBox.classList.remove("hidden");
    if (firstLoad) emptyBox.classList.add("hidden");
  } finally {
    loadingBox.classList.add("hidden");
  }
}

document.querySelectorAll(".filter-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderMatches();
  });
});

document.querySelectorAll("[data-filter-link]").forEach(link => {
  link.addEventListener("click", () => {
    activeFilter = link.dataset.filterLink;
    document.querySelectorAll(".filter-tab").forEach(item => {
      item.classList.toggle("active", item.dataset.filter === activeFilter);
    });
    renderMatches();
  });
});

searchInput.addEventListener("input", renderMatches);
document.getElementById("refreshBtn").addEventListener("click", loadMatches);
document.getElementById("closeDialog").addEventListener("click", () => dialog.close());

matchesGrid.addEventListener("click", async event => {
  const button = event.target.closest("[data-match-id]");
  if (!button || !button.dataset.matchId) return;
  document.getElementById("dialogContent").innerHTML = "<p>Loading match details…</p>";
  dialog.showModal();
  try {
    const response = await fetch(`/api/match/${encodeURIComponent(button.dataset.matchId)}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load match details.");
    const match = result.data || result;
    const score = (match.score || []).map(item =>
      `<div class="dialog-team"><strong>${escapeHTML(item.inning || "Innings")}</strong><br>${escapeHTML(item.r)}/${escapeHTML(item.w)} <span class="dialog-note">(${escapeHTML(item.o)} overs)</span></div>`
    ).join("");
    document.getElementById("dialogContent").innerHTML = `
      <h2>${escapeHTML(match.name || "Match details")}</h2>
      <p class="dialog-status">${escapeHTML(match.status || "Status unavailable")}</p>
      ${score || '<p class="dialog-note">Detailed scorecard data is not available for this match from the current API response.</p>'}
      <p class="dialog-note">Venue: ${escapeHTML(match.venue || "Not available")}</p>`;
  } catch (error) {
    document.getElementById("dialogContent").innerHTML =
      `<p class="dialog-note">${escapeHTML(error.message)}</p>`;
  }
});

loadMatches();
setInterval(loadMatches, 60000);
