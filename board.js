(function () {
  const PEOPLE = ["reeve", "connor", "michael", "lewis"];
  const NAMES = { reeve: "Reeve", connor: "Connor", michael: "Michael", lewis: "Lewis" };

  function readFilter() {
    const q = new URLSearchParams(location.search).get("person");
    if (q && PEOPLE.includes(q.toLowerCase())) return q.toLowerCase();
    const hash = (location.hash || "").replace(/^#/, "");
    const m = hash.match(/^(?:filter|person)=([a-z]+)$/i);
    if (m && PEOPLE.includes(m[1].toLowerCase())) return m[1].toLowerCase();
    return "all";
  }

  function writeFilter(person) {
    const url = new URL(location.href);
    if (person === "all") url.searchParams.delete("person");
    else url.searchParams.set("person", person);
    if (/^(?:filter|person)=/i.test((url.hash || "").replace(/^#/, ""))) url.hash = "";
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function hoursOf(card) {
    const n = Number(card.getAttribute("data-hours"));
    return Number.isFinite(n) ? n : 0;
  }

  function fmtHours(n) {
    const rounded = Math.round(n * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function apply(person) {
    document.querySelectorAll(".filter").forEach(function (btn) {
      const on = btn.getAttribute("data-person") === person;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".person").forEach(function (btn) {
      const on = person !== "all" && btn.getAttribute("data-person") === person;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".who-table tbody tr[data-person]").forEach(function (row) {
      row.classList.toggle("is-on", person !== "all" && row.getAttribute("data-person") === person);
    });

    document.querySelectorAll(".card[data-person]").forEach(function (card) {
      const match = person === "all" || card.getAttribute("data-person") === person;
      card.classList.toggle("is-hidden", !match);
    });

    document.querySelectorAll(".col").forEach(function (col) {
      const cards = Array.prototype.slice.call(col.querySelectorAll(".card[data-person]"));
      const visible = cards.filter(function (c) { return !c.classList.contains("is-hidden"); });
      const hours = visible.reduce(function (sum, c) { return sum + hoursOf(c); }, 0);
      const countEl = col.querySelector(".count");
      if (countEl) countEl.textContent = visible.length + " · " + fmtHours(hours) + "h";
      const empty = col.querySelector(".empty-col");
      if (empty) {
        const show = visible.length === 0;
        empty.classList.toggle("is-hidden", !show);
        if (show) {
          empty.textContent = person === "all"
            ? (empty.getAttribute("data-all") || "Nothing here.")
            : "No cards for " + NAMES[person] + " here.";
        }
      }
    });

    const status = document.getElementById("filter-status");
    if (status) {
      if (person === "all") {
        status.textContent = "Showing everyone.";
      } else {
        const n = document.querySelectorAll(".card[data-person=\"" + person + "\"]").length;
        status.textContent = "Showing " + NAMES[person] + " — " + n + " card" + (n === 1 ? "" : "s") + ". Click Everyone to clear.";
      }
    }
  }

  function setFilter(person) {
    if (person !== "all" && PEOPLE.indexOf(person) === -1) person = "all";
    writeFilter(person);
    apply(person);
  }

  document.querySelectorAll(".filter[data-person], .person[data-person]").forEach(function (el) {
    el.addEventListener("click", function () {
      const next = el.getAttribute("data-person");
      const current = readFilter();
      if (el.classList.contains("person") && current === next) setFilter("all");
      else setFilter(next);
    });
  });

  document.querySelectorAll(".who-table tbody tr[data-person]").forEach(function (row) {
    row.addEventListener("click", function () {
      const next = row.getAttribute("data-person");
      setFilter(readFilter() === next ? "all" : next);
    });
    row.setAttribute("title", "Filter the board to this person");
  });

  window.addEventListener("popstate", function () { apply(readFilter()); });
  apply(readFilter());
})();
