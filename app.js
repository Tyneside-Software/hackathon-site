(async function () {
  const status = document.getElementById("status");
  const out = document.getElementById("out");
  const base = (window.HACKATHON_API || "").replace(/\/$/, "");
  try {
    const res = await fetch(base + "/health");
    const data = await res.json();
    status.textContent = res.ok ? "API is up." : "API responded, but not healthy.";
    out.hidden = false;
    out.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    status.textContent = "API not reachable yet — deploy hackathon-api, then set HACKATHON_API in config.js.";
    out.hidden = false;
    out.textContent = String(err);
  }
})();
