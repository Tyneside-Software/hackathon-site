(function () {
  const PEOPLE = ["reeve", "connor", "michael", "lewis", "noah"];
  const NAMES = { reeve: "Reeve", connor: "Connor", michael: "Michael", lewis: "Lewis", noah: "Noah" };

  const dialog = document.getElementById("card-modal");
  const titleEl = document.getElementById("card-modal-title");
  const metaEl = document.getElementById("card-modal-meta");
  const bodyEl = document.getElementById("card-modal-body");
  const closeBtn = document.getElementById("card-modal-close");
  let lastFocus = null;
  let closingFromUrl = false;
  let scrollLockY = 0;
  let scrollLocked = false;

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

  function padCardId(raw) {
    const digits = String(raw || "").replace(/^t-/i, "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.padStart(2, "0");
  }

  function readCardHash() {
    const h = (location.hash || "").replace(/^#/, "");
    const m = h.match(/^t-(\d+)$/i);
    return m ? padCardId(m[1]) : "";
  }

  function cardById(id) {
    return document.getElementById("card-" + id) ||
      document.querySelector('.card[href="#t-' + id + '"]');
  }

  function lockPageScroll() {
    if (scrollLocked) return;
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = "-" + scrollLockY + "px";
    document.documentElement.classList.add("card-modal-open");
    scrollLocked = true;
  }

  function unlockPageScroll() {
    if (!scrollLocked) return;
    document.documentElement.classList.remove("card-modal-open");
    document.body.style.top = "";
    scrollLocked = false;
    window.scrollTo(0, scrollLockY);
  }

  function columnName(card) {
    const name = card.closest(".col") && card.closest(".col").querySelector(".col-name");
    return name ? name.textContent.trim() : "";
  }

  function fillModal(card) {
    const id = padCardId(card.id);
    const title = (card.querySelector(".title") && card.querySelector(".title").textContent) || ("Card " + id);
    const person = card.getAttribute("data-person") || "";
    const hours = card.getAttribute("data-hours") || "";
    const tag = card.querySelector(".tag");
    const tpl = card.querySelector("template.card-brief");
    titleEl.textContent = title;
    metaEl.textContent = [
      "#" + id,
      NAMES[person] || person,
      hours ? hours + "h" : "",
      columnName(card)
    ].filter(Boolean).join(" · ");
    bodyEl.innerHTML = "";
    if (tpl) {
      bodyEl.appendChild(tpl.content.cloneNode(true));
    } else {
      const p = document.createElement("p");
      p.textContent = tag ? tag.textContent.trim() : "No extra brief on this card yet.";
      bodyEl.appendChild(p);
    }
  }

  function openCard(id) {
    const card = cardById(id);
    if (!card || !dialog || !titleEl || !bodyEl) return;
    if (!dialog.open) lastFocus = document.activeElement;
    fillModal(card);
    if (!dialog.open) {
      lockPageScroll();
      dialog.showModal();
    }
    if (readCardHash() !== id) {
      const url = new URL(location.href);
      history.pushState(null, "", url.pathname + url.search + "#t-" + id);
    }
  }

  function syncFromUrl() {
    apply(readFilter());
    const id = readCardHash();
    if (id && cardById(id)) {
      if (!dialog.open) lastFocus = document.activeElement;
      fillModal(cardById(id));
      if (dialog && !dialog.open) {
        lockPageScroll();
        dialog.showModal();
      }
    } else if (dialog && dialog.open) {
      closingFromUrl = true;
      dialog.close();
      closingFromUrl = false;
    }
  }

  document.querySelectorAll(".card[href^='#t-']").forEach(function (card) {
    card.setAttribute("aria-haspopup", "dialog");
    card.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const id = padCardId(card.id || card.getAttribute("href"));
      if (id) openCard(id);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      if (dialog && dialog.open) dialog.close();
    });
  }

  if (dialog) {
    dialog.addEventListener("click", function (e) {
      const inner = dialog.querySelector(".card-modal-inner");
      if (inner && !inner.contains(e.target) && dialog.open) dialog.close();
    });
    dialog.addEventListener("close", function () {
      unlockPageScroll();
      if (!closingFromUrl && readCardHash()) {
        const url = new URL(location.href);
        history.pushState(null, "", url.pathname + url.search);
      }
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }
    });
  }

  window.addEventListener("popstate", syncFromUrl);
  window.addEventListener("hashchange", syncFromUrl);
  apply(readFilter());
  const initialCard = readCardHash();
  if (initialCard && cardById(initialCard) && dialog) {
    lastFocus = document.activeElement;
    fillModal(cardById(initialCard));
    lockPageScroll();
    dialog.showModal();
  }
})();
