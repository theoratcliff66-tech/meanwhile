const yearRange = document.querySelector("#yearRange");
const yearOutput = document.querySelector("#yearOutput");
const timelineView = document.querySelector("#timelineView");
const timelineShell = document.querySelector("#timelineShell");
const mapView = document.querySelector("#mapView");
const resultsText = document.querySelector("#resultsText");
const detailDialog = document.querySelector("#detailDialog");
const detailContent = document.querySelector("#detailContent");
const aboutDialog = document.querySelector("#aboutDialog");
const selectedThemes = new Set();
let map;
let markerLayer;
let eraStyle = "modern";
const TIMELINE_RADIUS = 600;

const THEMES = [...new Set(HISTORY_ITEMS.map(item => item.theme))].sort();

function formatYear(year) {
  const before = eraStyle === "modern" ? "BCE" : "BC";
  const after = eraStyle === "modern" ? "CE" : "AD";
  if (year < 0) return `${Math.abs(year).toLocaleString()} ${before}`;
  if (year === 0) return `1 ${before} / 1 ${after}`;
  return eraStyle === "modern" ? `${year.toLocaleString()} ${after}` : `${after} ${year.toLocaleString()}`;
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
    .filter(item => item.endYear >= year - TIMELINE_RADIUS && item.year <= year + TIMELINE_RADIUS)
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

function timelineItemFor(item, region, year, lane) {
  const windowStart = year - TIMELINE_RADIUS;
  const windowEnd = year + TIMELINE_RADIUS;
  const windowSize = TIMELINE_RADIUS * 2;
  const duration = item.endYear - item.year;
  const isPoint = duration <= 25;
  const clippedStart = Math.max(item.year, windowStart);
  const clippedEnd = Math.min(item.endYear, windowEnd);
  const anchorYear = isPoint ? (item.year + item.endYear) / 2 : clippedStart;
  const left = ((anchorYear - windowStart) / windowSize) * 100;
  const width = Math.max(2.5, ((clippedEnd - clippedStart) / windowSize) * 100);
  const button = document.createElement("button");
  button.type = "button";
  button.className = `timeline-item ${isPoint ? "point-event" : "duration-event"}`;
  button.style.setProperty("--region-colour", region.colour);
  button.style.left = `${left}%`;
  button.style.top = `${26 + lane * 50}px`;
  if (!isPoint) button.style.width = `${width}%`;
  button.setAttribute("aria-label", `${item.title}, ${formatSpan(item)}. Open details.`);
  button.innerHTML = isPoint
    ? `<span class="event-dot"></span><span class="point-label">${item.title}<small>${formatSpan(item)}</small></span>`
    : `<span class="bar-label">${item.title}<small>${formatSpan(item)}</small></span>`;
  button.addEventListener("click", () => showDetail(item));
  return button;
}

function renderTimeline(items) {
  timelineView.replaceChildren();
  const year = Number(yearRange.value);
  const axis = document.createElement("div");
  axis.className = "time-axis-row";
  axis.innerHTML = `<div class="axis-heading">Earlier</div><div class="time-axis"><span>${formatYear(year - TIMELINE_RADIUS)}</span><strong>${formatYear(year)}</strong><span>${formatYear(year + TIMELINE_RADIUS)}</span></div>`;
  timelineView.appendChild(axis);
  REGIONS.forEach(region => {
    const row = document.createElement("section");
    row.className = "region-row";
    row.style.setProperty("--region-colour", region.colour);
    row.innerHTML = `<header class="region-heading"><span class="region-swatch" aria-hidden="true"></span><h2>${region.name}</h2><p>${region.note}</p></header>`;
    const track = document.createElement("div");
    track.className = "region-track";
    track.innerHTML = `<span class="track-line" aria-hidden="true"></span><span class="now-line" aria-hidden="true"></span>`;
    const regionItems = items.filter(item => item.region === region.id).slice(0, 3);
    if (regionItems.length) regionItems.forEach((item, index) => track.appendChild(timelineItemFor(item, region, year, index)));
    else track.insertAdjacentHTML("beforeend", `<p class="empty-state">No matching item in this part of the timeline — yet.</p>`);
    row.appendChild(track);
    timelineView.appendChild(row);
  });
}

function initialiseMap() {
  if (map) return;
  map = L.map("map", { worldCopyJump: true, minZoom: 2 }).setView([18, 12], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 8,
    crossOrigin: true,
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
  const image = item.image ? `<figure class="detail-image"><img src="${item.image}" alt="${item.imageAlt}" loading="lazy"><figcaption>Image: <a href="${item.imageCreditUrl}" target="_blank" rel="noopener">${item.imageCredit}</a></figcaption></figure>` : "";
  detailContent.innerHTML = `
    <p class="eyebrow">${region.name} · ${item.theme}</p>
    <h2>${item.title}</h2>
    ${image}
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
  document.querySelector("#rangeStart").textContent = formatYear(-3200);
  document.querySelector("#rangeEnd").textContent = formatYear(1500);
  const themeText = selectedThemes.size ? ` matching ${[...selectedThemes].join(", ")}` : " across all themes";
  resultsText.textContent = `${items.length} historical ${items.length === 1 ? "item" : "items"} between ${formatYear(year - TIMELINE_RADIUS)} and ${formatYear(year + TIMELINE_RADIUS)}${themeText}.`;
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
    timelineShell.hidden = showMap;
    mapView.hidden = !showMap;
    if (showMap) renderMap(getVisibleItems());
  });
});

document.querySelectorAll(".era-button").forEach(button => {
  button.addEventListener("click", () => {
    eraStyle = button.dataset.era;
    document.querySelectorAll(".era-button").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
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
