const DB = "https://apws-vitc-default-rtdb.asia-southeast1.firebasedatabase.app";

const chartEl = document.getElementById("chart");
const statusEl = document.getElementById("status");

function setStatus(cls, text) {
  statusEl.className = cls;
  statusEl.textContent = text;
}

async function load() {
  chartEl.classList.add("loading");
  chartEl.textContent = "Loading…";
  try {
    const res = await fetch(`${DB}/readings.json?orderBy="$key"&limitToLast=500`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data) throw new Error("No data at /readings");

    const rows = Object.values(data).sort((a, b) => a.ts - b.ts);
    const xs = rows.map(r => r.ts);
    const ys = rows.map(r => r.moisture);

    chartEl.classList.remove("loading");
    chartEl.textContent = "";
    draw(xs, ys);

    const last = rows[rows.length - 1];
    const m = document.getElementById("moisture");
    if (m) m.textContent = last.moisture + "%";
    setStatus("ok", "live");
  } catch (err) {
    console.error(err);
    chartEl.textContent = "Could not load data: " + err.message;
    setStatus("error", "offline");
  }
}

function draw(xs, ys) {
  new uPlot({
    width: chartEl.clientWidth - 32, // minus the panel's padding
    height: 320,
    series: [{}, { label: "Moisture %", stroke: "#1a7f37", width: 2 }],
  }, [xs, ys], chartEl);
}

load();
