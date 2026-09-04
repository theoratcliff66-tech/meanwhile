const yearRange = document.querySelector("#yearRange");
const yearOutput = document.querySelector("#yearOutput");
const timelineView = document.querySelector("#timelineView");
const mapView = document.querySelector("#mapView");
const resultsText = document.querySelector("#resultsText");
const detailDialog = document.querySelector("#detailDialog");
const detailContent = document.querySelector("#detailContent");
const aboutDialog = document.querySelector("#aboutDialog");
const selectedThemes = new Set();
let map;
let markerLayer;

const THEMES = [...new Set(HISTORY_ITEMS.map(item => item.theme))].sort();

function formatYear(year) {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  return `${year.toLocaleString()} CE`;
}

function formatSpan(item) {
  if (!item.endYear || item.endYear === item.year) return `Around ${formatYear(item.year)}`;
  return `${formatYear(item.year)}–${formatYear(item.endYear)}`;
}

function distanceFromYear(item, year) {
  if (year >= item.year && year <= item.endYear) return 0;
  return Math.min(Math.abs(year - item.year), Math.abs(year - item.endYear));
}

function getVisibleItems() {
  const year = Number(yearRange.value);
  return HISTORY_ITEMS
    .filter(item => selectedThemes.size === 0 || selectedThemes.has(item.theme))
    .filter(item => distanceFromYear(item, year) <= 450)
    .sort((a, b) => distanceFromYear(a, year) - distanceFromYear(b, year));
}

function createThemeFilters() {
  const container = document.querySelector("#themeFilters");
  THEMES.forEach(theme => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = theme;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedThemes.has(theme) ? selectedThemes.delete(theme) : selectedThemes.add(theme);
      button.classList.toggle("active");
      button.setAttribute("aria-pressed", String(selectedThemes.has(theme)));
      render();
    });
    container.appendChild(button);
  });
}

function cardFor(item, region) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "event-card";
  button.style.setProperty("--region-colour", region.colour);
  button.innerHTML = `<span class="date">${formatSpan(item)}</span><h3>${item.title}</h3><p>${item.summary}</p><span class="tag">${item.theme}</span>`;
  button.addEventListener("click", () => showDetail(item));
  return button;
}

function renderTimeline(items) {
  timelineView.replaceChildren();
  REGIONS.forEach(region => {
    const row = document.createElement("section");
    row.className = "region-row";
    row.innerHTML = `<header class="region-heading"><h2>${region.name}</h2><p>${region.note}</p></header>`;
    const cards = document.createElement("div");
    cards.className = "cards";
    const regionItems = items.filter(item => item.region === region.id).slice(0, 3);
    if (regionItems.length) regionItems.forEach(item => cards.appendChild(cardFor(item, region)));
    else cards.innerHTML = `<p class="empty-state">No matching item close to this date — yet.</p>`;
    row.appendChild(cards);
    timelineView.appendChild(row);
  });
}

function initialiseMap() {
  if (map) return;
  map = L.map("map", { worldCopyJump: true, minZoom: 2 }).setView([18, 12], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 8,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

function renderMap(items) {
  initialiseMap();
  markerLayer.clearLayers();
  items.forEach(item => {
    const region = REGIONS.find(candidate => candidate.id === item.region);
    const icon = L.divIcon({ className: "", html: `<span class="map-marker" style="--marker-colour:${region.colour}">${item.title.charAt(0)}</span>`, iconSize: [28, 28], iconAnchor: [14, 14] });
    const marker = L.marker([item.lat, item.lng], { icon }).addTo(markerLayer);
    const popup = document.createElement("div");
    popup.innerHTML = `<small>${formatSpan(item)} · ${region.name}</small><br>`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.title;
    button.addEventListener("click", () => showDetail(item));
    popup.appendChild(button);
    marker.bindPopup(popup);
  });
  setTimeout(() => map.invalidateSize(), 0);
}

function showDetail(item) {
  const region = REGIONS.find(candidate => candidate.id === item.region);
  detailContent.innerHTML = `
    <p class="eyebrow">${region.name} · ${item.theme}</p>
    <h2>${item.title}</h2>
    <p class="standfirst">${item.summary}</p>
    <div class="detail-meta"><div><span>When</span>${formatSpan(item)}</div><div><span>Where</span>${item.place}</div></div>
    <p class="detail-body">${item.body}</p>
    <a class="source-link" href="${item.sourceUrl}" target="_blank" rel="noopener">Explore the source: ${item.source} ↗</a>`;
  detailDialog.showModal();
}

function render() {
  const items = getVisibleItems();
  const year = Number(yearRange.value);
  yearOutput.value = formatYear(year);
  const themeText = selectedThemes.size ? ` matching ${[...selectedThemes].join(", ")}` : " across all themes";
  resultsText.textContent = `${items.length} historical ${items.length === 1 ? "item" : "items"} within 450 years of ${formatYear(year)}${themeText}.`;
  renderTimeline(items);
  if (!mapView.hidden) renderMap(items);
}

yearRange.addEventListener("input", render);
document.querySelectorAll(".view-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".view-button").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const showMap = button.dataset.view === "map";
    timelineView.hidden = showMap;
    mapView.hidden = !showMap;
    if (showMap) renderMap(getVisibleItems());
  });
});

document.querySelector("#resetButton").addEventListener("click", () => {
  selectedThemes.clear();
  document.querySelectorAll(".filter-button").forEach(button => {
    button.classList.remove("active");
    button.setAttribute("aria-pressed", "false");
  });
  yearRange.value = -2500;
  render();
});

document.querySelector("#aboutButton").addEventListener("click", () => aboutDialog.showModal());
document.querySelectorAll("dialog .close-button").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
}));

createThemeFilters();
render();

