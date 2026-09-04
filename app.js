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
const TIMELINE_RADIUS = 600;
const MIN_YEAR = -3200;
const MAX_YEAR = 1800;
const YEAR_STEP = 25;
const timeDial = document.querySelector("#timeDial");

const THEMES = [...new Set(HISTORY_ITEMS.map(item => item.theme))].sort();

function formatYear(year) {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  if (year === 0) return `1 BCE / 1 CE`;
  return `${year.toLocaleString()} CE`;
}

function formatSpan(item) {
  if (!item.endYear || item.endYear === item.year) return `Around ${formatYear(item.year)}`;
  return `${formatYear(item.year)}–${formatYear(item.endYear)}`;
}

function setYear(value) {
  const rounded = Math.round(value / YEAR_STEP) * YEAR_STEP;
  yearRange.value = Math.max(MIN_YEAR, Math.min(MAX_YEAR, rounded));
  render();
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
  button.style.top = `${10 + lane * 34}px`;
  if (!isPoint) button.style.width = `${width}%`;
  button.setAttribute("aria-label", `${item.title}, ${formatSpan(item)}. Open details.`);
  const thumbnail = item.image ? `<img class="timeline-thumb" src="${item.image}" alt="" loading="lazy">` : "";
  button.classList.toggle("has-image", Boolean(item.image));
  button.classList.toggle("milestone-event", Boolean(item.milestone));
  const milestone = item.milestone ? `<span class="milestone-glyph" aria-hidden="true">◆</span>` : "";
  button.innerHTML = isPoint
    ? `${thumbnail || '<span class="event-dot"></span>'}<span class="point-label">${milestone}${item.title}<small>${formatSpan(item)}</small></span>`
    : `${thumbnail}<span class="bar-label">${milestone}${item.title}<small>${formatSpan(item)}</small></span>`;
  button.addEventListener("click", () => showDetail(item));
  return button;
}

function renderTimeline(items) {
  timelineView.replaceChildren();
  const year = Number(yearRange.value);
  const axis = document.createElement("div");
  axis.className = "time-axis-row";
  axis.innerHTML = `<div class="axis-heading"><span>Earlier</span><small><b>◆</b> earliest writing evidence</small></div><div class="time-axis"><span>${formatYear(year - TIMELINE_RADIUS)}</span><strong>${formatYear(year)}</strong><span>${formatYear(year + TIMELINE_RADIUS)}</span></div>`;
  timelineView.appendChild(axis);
  REGIONS.forEach(region => {
    const row = document.createElement("section");
    row.className = "region-row";
    row.style.setProperty("--region-colour", region.colour);
    row.innerHTML = `<header class="region-heading"><span class="region-swatch" aria-hidden="true"></span><h2>${region.name}</h2><p>${region.note}</p></header>`;
    const track = document.createElement("div");
    track.className = "region-track";
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
  const rotation = -145 + ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 290;
  timeDial.style.setProperty("--dial-rotation", `${rotation}deg`);
  timeDial.setAttribute("aria-valuenow", String(year));
  timeDial.setAttribute("aria-valuetext", formatYear(year));
  const themeText = selectedThemes.size ? ` matching ${[...selectedThemes].join(", ")}` : " across all themes";
  resultsText.textContent = `${items.length} historical ${items.length === 1 ? "item" : "items"} between ${formatYear(year - TIMELINE_RADIUS)} and ${formatYear(year + TIMELINE_RADIUS)}${themeText}.`;
  renderTimeline(items);
  if (!mapView.hidden) renderMap(items);
}

let dialDragging = false;
let previousDialAngle = 0;
let dragYear = Number(yearRange.value);

function pointerAngle(event) {
  const bounds = timeDial.getBoundingClientRect();
  const hiddenDialCentreY = bounds.top + bounds.width / 2;
  return Math.atan2(event.clientY - hiddenDialCentreY, event.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI;
}

timeDial.addEventListener("pointerdown", event => {
  dialDragging = true;
  dragYear = Number(yearRange.value);
  previousDialAngle = pointerAngle(event);
  timeDial.setPointerCapture(event.pointerId);
  timeDial.classList.add("turning");
});

timeDial.addEventListener("pointermove", event => {
  if (!dialDragging) return;
  const angle = pointerAngle(event);
  let change = angle - previousDialAngle;
  if (change > 180) change -= 360;
  if (change < -180) change += 360;
  dragYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, dragYear + change * 12));
  previousDialAngle = angle;
  setYear(dragYear);
});

function stopTurning(event) {
  dialDragging = false;
  timeDial.classList.remove("turning");
  if (event.pointerId !== undefined && timeDial.hasPointerCapture(event.pointerId)) timeDial.releasePointerCapture(event.pointerId);
}

timeDial.addEventListener("pointerup", stopTurning);
timeDial.addEventListener("pointercancel", stopTurning);
timeDial.addEventListener("wheel", event => {
  event.preventDefault();
  setYear(Number(yearRange.value) + (event.deltaY > 0 ? YEAR_STEP : -YEAR_STEP));
}, { passive: false });

timeDial.addEventListener("keydown", event => {
  const changes = { ArrowLeft: -YEAR_STEP, ArrowDown: -YEAR_STEP, ArrowRight: YEAR_STEP, ArrowUp: YEAR_STEP, PageDown: -100, PageUp: 100 };
  if (event.key === "Home") setYear(MIN_YEAR);
  else if (event.key === "End") setYear(MAX_YEAR);
  else if (changes[event.key]) setYear(Number(yearRange.value) + changes[event.key]);
  else return;
  event.preventDefault();
});

document.querySelector("#yearBack").addEventListener("click", () => setYear(Number(yearRange.value) - YEAR_STEP));
document.querySelector("#yearForward").addEventListener("click", () => setYear(Number(yearRange.value) + YEAR_STEP));
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
