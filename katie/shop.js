(function () {
  var STORAGE_KEY = "fidget-squish-catalog";
  var AUTH_KEY = "fidget-squish-admin";
  var PASSWORD = "cassiethecat";
  var PRODUCTS = [];
  var MORE = {
    group: [
      { name: "Tyneside Group", meta: "All the Tyneside doors", href: "https://tyneside.group/", img: "more/group.svg" },
      { name: "Tyneside Software", meta: "Evening project · websites and tools", href: "https://tyneside.software/", img: "more/software.svg" },
      { name: "Tyneside Cleaning", meta: "Local cleaning in Howden Ward", href: "https://tyneside.cleaning/", img: "more/cleaning.svg" },
      { name: "Tyneside Charity", meta: "Welcome-home cleans for new parents", href: "https://tyneside.charity/", img: "more/charity.svg" },
      { name: "Tyneside Technology", meta: "Cheap working computers", href: "https://tyneside.technology/", img: "more/technology.svg" },
      { name: "Tyneside Games", meta: "Games Lewis built", href: "https://tyneside.games/", img: "more/games.svg" }
    ],
    hackathon: [
      { name: "Tyneside Logistics", meta: "Hackathon home", href: "../index.html", img: "more/logistics.svg" },
      { name: "Progress", meta: "Catch-up for anyone who’s been away", href: "../progress.html", img: "more/progress.svg" },
      { name: "Map", meta: "Routes, phones and buses", href: "../app/", img: "more/map.svg" },
      { name: "Board", meta: "Hackathon kanban", href: "../board.html", img: "more/board.svg" },
      { name: "To do", meta: "Open cards", href: "../todo.html", img: "more/todo.svg" },
      { name: "Done", meta: "Finished cards", href: "../done.html", img: "more/done.svg" },
      { name: "Docs", meta: "Wiki and how it fits together", href: "../docs/", img: "more/docs.svg" },
      { name: "API test", meta: "Call the live API", href: "../api-test.html", img: "more/api.svg" },
      { name: "Account", meta: "Register, login, fetch me", href: "../account.html", img: "more/account.svg" },
      { name: "Onboarding", meta: "Clone, run and git", href: "../onboarding.html", img: "more/onboarding.svg" },
      { name: "Lewis", meta: "Lewis’s log", href: "../lewis.html", img: "more/lewis.svg" }
    ]
  };

  function defaultItems() {
    return [
      { id: "dumpling", group: "squishies", name: "Dumpling", price: "£4", meta: "Glow in the dark mystery dumpling", photos: ["photos/mystery-dumpling.jpeg"], stock: 1 },
      { id: "mini-pack", group: "squishies", name: "4 pack of mini squishies", price: "Email for price", meta: "Four mini squishies in a pack.", photos: ["photos/4-pack-of-mini-squishies.jpeg"], stock: 1 },
      { id: "santa-popit", group: "squishies", name: "Santa popit", price: "£5.49", meta: "Red and white popit", photos: ["photos/santa-popit.jpeg"], stock: 1 },
      { id: "popit", group: "squishies", name: "Popit", price: "£4.99", meta: "Fidget dice popit", photos: ["photos/popit-die.jpeg"], stock: 1 },
      { id: "fidget-spinner", group: "squishies", name: "Fidget spinner", price: "£3.99", meta: "Earth fidget spinner", photos: ["photos/earth-fidget-spinner.jpeg"], stock: 1 },
      { id: "cheese", group: "squishies", name: "Cheese", price: "£4.99", meta: "Super slow-rise cheese", photos: ["photos/slowrise-cheese.jpeg"], stock: 1 },
      { id: "balloon-squishies", group: "homemade", name: "Homemade balloon squishies", price: "50p", meta: "Homemade balloon squishies.", photos: [], stock: 1 },
      { id: "homemade-squishie", group: "homemade", name: "Homemade squishie", price: "£2", meta: "Homemade squishie.", photos: [], stock: 1 },
      { id: "squishie-skin", group: "homemade", name: "Squishie skin", price: "£1", meta: "Squishie skin.", photos: [], stock: 1 },
      { id: "water-slime", group: "slime", name: "Water slime", price: "Email for price", meta: "At some point. Matches the photo.", photos: [], stock: 1 },
      { id: "cloud-slime", group: "slime", name: "Cloud slime", price: "Email for price", meta: "At some point. Matches the photo.", photos: [], stock: 1 },
      { id: "normal-slime", group: "slime", name: "Normal slime", price: "Email for price", meta: "A few for sale.", photos: [], stock: 1 },
      { id: "homemade-slime", group: "slime", name: "Homemade slime", price: "Email for price", meta: "There might be homemade slimes too.", photos: [], stock: 1 }
    ];
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slug(s) {
    var t = String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return t || "item";
  }

  function newId(name) {
    return slug(name) + "-" + Date.now().toString(36);
  }

  function assetUrl(src) {
    if (!src) return src;
    if (/^(https?:|data:|blob:)/i.test(src)) return src;
    var el = document.querySelector('script[src*="shop.js"]');
    var base = "";
    if (el && el.src) {
      base = el.src.replace(/shop\.js(\?.*)?$/, "");
    }
    return base + src;
  }

  function stockQty(item) {
    if (!item) return 0;
    var raw = item.stock;
    if (raw == null) raw = item.stockCount;
    if (raw == null) raw = item.inStock === false ? 0 : 1;
    var n = parseInt(raw, 10);
    if (isNaN(n) || n < 0) n = 0;
    return n;
  }

  function normalize(item) {
    var name = (item && item.name) || "Untitled";
    var photos = item && item.photos;
    if (typeof photos === "string") {
      photos = photos.split(/\r?\n|,/).map(function (p) { return p.trim(); });
    }
    if (!Array.isArray(photos)) photos = [];
    photos = photos.map(function (p) { return String(p || "").trim(); }).filter(Boolean);
    var group = item && item.group;
    if (group !== "homemade" && group !== "slime") group = "squishies";
    return {
      id: (item && item.id) || newId(name),
      group: group,
      name: name,
      price: (item && item.price) || "Email for price",
      meta: (item && (item.meta || item.description)) || "",
      photos: photos,
      stock: stockQty(item),
      inStock: stockQty(item) > 0,
      mail: (item && item.mail) || ("Order " + name)
    };
  }

  function readLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var items = Array.isArray(data) ? data : data && data.items;
      if (!Array.isArray(items) || !items.length) return null;
      return items.map(normalize);
    } catch (e) {
      return null;
    }
  }

  function writeLocal(items) {
    var payload = { items: (items || []).map(normalize) };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      payload.error = null;
    } catch (e) {
      payload.error = "Could not save pictures. Try a smaller photo.";
    }
    return payload;
  }

  function clearLocal() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function passwordOk(value) {
    var typed = String(value || "").trim();
    return typed === PASSWORD || typed === '"' + PASSWORD;
  }

  function isAdmin() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setAdmin(on) {
    try {
      if (on) sessionStorage.setItem(AUTH_KEY, "1");
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
  }

  function query() {
    var input = document.querySelector("[data-search] input");
    return ((input && input.value) || "").trim().toLowerCase();
  }

  function matches(p, q) {
    if (!q) return true;
    return (p.name + " " + p.meta + " " + p.group + " " + p.price).toLowerCase().indexOf(q) !== -1;
  }

  function galleryHtml(p) {
    var photos = p.photos || [];
    var slides;
    if (photos.length) {
      slides = photos.map(function (src, i) {
        var on = i === 0 ? " is-on" : "";
        return '<div class="slide' + on + '"><img src="' + esc(assetUrl(src)) + '" alt="' + esc(p.name) + '"></div>';
      });
    } else {
      slides = ['<div class="slide is-on"><div class="empty"><strong>Photo</strong>Picture coming</div></div>'];
    }
    var nav = "";
    if (slides.length > 1) {
      var dots = slides.map(function (_, i) {
        var on = i === 0 ? ' class="is-on"' : "";
        return '<button type="button" data-dot' + on + ' aria-label="Photo ' + (i + 1) + '"></button>';
      }).join("");
      nav =
        '<button type="button" class="g-btn g-prev" data-prev aria-label="Previous">‹</button>' +
        '<button type="button" class="g-btn g-next" data-next aria-label="Next">›</button>' +
        '<div class="dots">' + dots + "</div>";
    }
    return '<div class="gallery" data-gallery><div class="slides">' + slides.join("") + "</div>" + nav + "</div>";
  }

  function stockHtml(p) {
    if (p.inStock) {
      var n = p.stock;
      var label = n === 1 ? "1 in stock" : n + " in stock";
      return '<p class="stock is-in">' + label + "</p>";
    }
    return '<p class="stock is-out">Out of stock</p>';
  }

  function burstHtml() {
    var bits = "";
    for (var i = 0; i < 10; i++) bits += "<span></span>";
    return '<div class="burst" aria-hidden="true">' + bits + "</div>";
  }

  function cardHtml(p) {
    var mail = "mailto:katie@tyneside.software?subject=" + encodeURIComponent(p.mail || ("Order " + p.name));
    var buy = p.inStock
      ? '<a class="buy" href="' + mail + '">Email to buy</a>'
      : '<span class="buy is-off">Out of stock</span>';
    return (
      '<article class="product' + (p.inStock ? " is-in" : " is-out") + '" data-name="' + esc(p.name) + '">' +
        (p.inStock ? burstHtml() : "") +
        galleryHtml(p) +
        '<p class="price">' + esc(p.price) + "</p>" +
        stockHtml(p) +
        "<h2>" + esc(p.name) + "</h2>" +
        '<p class="meta">' + esc(p.meta) + "</p>" +
        buy +
      "</article>"
    );
  }

  function show(gallery, index) {
    var slides = gallery.querySelectorAll(".slide");
    var dots = gallery.querySelectorAll("[data-dot]");
    var n = slides.length;
    if (!n) return;
    var i = (index + n) % n;
    gallery.dataset.index = String(i);
    for (var s = 0; s < n; s++) {
      slides[s].classList.toggle("is-on", s === i);
      var video = slides[s].querySelector("video");
      if (video) {
        if (s === i) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      }
    }
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle("is-on", d === i);
    }
  }

  function bindGalleries(root) {
    (root || document).querySelectorAll("[data-gallery]").forEach(function (gallery) {
      if (gallery.dataset.bound) return;
      gallery.dataset.bound = "1";
      gallery.dataset.index = "0";
      show(gallery, 0);

      gallery.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("error", function () {
          var empty = document.createElement("div");
          empty.className = "empty";
          empty.innerHTML = "<strong>Photo</strong>Picture coming";
          img.replaceWith(empty);
        });
      });

      var prev = gallery.querySelector("[data-prev]");
      var next = gallery.querySelector("[data-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          show(gallery, Number(gallery.dataset.index) - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(gallery, Number(gallery.dataset.index) + 1);
        });
      }
      gallery.querySelectorAll("[data-dot]").forEach(function (dot, j) {
        dot.addEventListener("click", function () { show(gallery, j); });
      });

      var slides = gallery.querySelectorAll(".slide");
      if (slides.length < 2) {
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
      }
    });
  }

  function moreCardHtml(p) {
    return (
      '<a class="product more-card" href="' + esc(p.href) + '">' +
        '<div class="gallery"><div class="slides"><div class="slide is-on">' +
          '<img src="' + esc(assetUrl(p.img)) + '" alt="' + esc(p.name) + '">' +
        "</div></div></div>" +
        "<h2>" + esc(p.name) + "</h2>" +
        '<p class="meta">' + esc(p.meta) + "</p>" +
      "</a>"
    );
  }

  function moreItems(key) {
    if (key === "all") return MORE.group.concat(MORE.hackathon);
    return MORE[key] || [];
  }

  function matchesMore(p, q) {
    if (!q) return true;
    return (p.name + " " + p.meta).toLowerCase().indexOf(q) !== -1;
  }

  function render() {
    var q = query();
    var shown = 0;
    document.querySelectorAll("[data-products]").forEach(function (el) {
      var group = el.dataset.products;
      var items = PRODUCTS.filter(function (p) {
        return p.group === group && matches(p, q);
      });
      el.innerHTML = items.map(cardHtml).join("");
      bindGalleries(el);
      shown += items.length;
      var section = el.closest(".group");
      if (section) section.hidden = items.length === 0;
    });
    document.querySelectorAll("[data-more]").forEach(function (el) {
      var items = moreItems(el.dataset.more).filter(function (p) {
        return matchesMore(p, q);
      });
      el.innerHTML = items.map(moreCardHtml).join("");
      shown += items.length;
      var section = el.closest(".group");
      if (section) section.hidden = items.length === 0;
    });
    var empty = document.querySelector("[data-search-empty]");
    if (empty) empty.classList.toggle("is-on", shown === 0);
  }

  function bindSearch() {
    var form = document.querySelector("[data-search]");
    if (!form) return;
    var input = form.querySelector("input");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    if (input) {
      input.addEventListener("input", render);
    }
  }

  function fetchStock(done) {
    fetch(assetUrl("stock.json"), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        var items = Array.isArray(data) ? data : data && data.items;
        if (!Array.isArray(items) || !items.length) {
          done(null);
          return;
        }
        done(items.map(normalize));
      })
      .catch(function () { done(null); });
  }

  function loadCatalog(done) {
    var local = readLocal();
    if (local) {
      PRODUCTS = local;
      if (done) done(PRODUCTS);
      return;
    }
    fetchStock(function (items) {
      PRODUCTS = items && items.length ? items : defaultItems();
      if (done) done(PRODUCTS);
    });
  }

  function refresh(next) {
    if (next) PRODUCTS = next.map(normalize);
    render();
  }

  window.FidgetSquish = {
    STORAGE_KEY: STORAGE_KEY,
    defaultItems: defaultItems,
    normalize: normalize,
    readLocal: readLocal,
    writeLocal: writeLocal,
    clearLocal: clearLocal,
    passwordOk: passwordOk,
    isAdmin: isAdmin,
    setAdmin: setAdmin,
    loadCatalog: loadCatalog,
    fetchStock: fetchStock,
    refresh: refresh,
    esc: esc,
    assetUrl: assetUrl,
    newId: newId
  };

  var DARK_KEY = "fidget-squish-dark";

  function isDark() {
    try {
      return localStorage.getItem(DARK_KEY) === "1";
    } catch (e) {
      return document.documentElement.classList.contains("is-dark");
    }
  }

  function applyDark(on) {
    document.documentElement.classList.toggle("is-dark", on);
    if (document.body) document.body.classList.toggle("is-dark", on);
    try {
      if (on) localStorage.setItem(DARK_KEY, "1");
      else localStorage.removeItem(DARK_KEY);
    } catch (e) {}
    var btn = document.querySelector("[data-mode-toggle]");
    if (btn) {
      btn.classList.toggle("is-on", on);
      btn.textContent = on ? "Light mode" : "Dark mode";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.title = on ? "Turn light mode on" : "Turn dark mode on";
    }
  }

  function bindModeToggle() {
    applyDark(isDark());
    if (document.querySelector("[data-mode-toggle]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mode-toggle";
    btn.setAttribute("data-mode-toggle", "");
    btn.textContent = "Dark mode";
    btn.addEventListener("click", function () {
      applyDark(!document.documentElement.classList.contains("is-dark"));
    });
    document.body.appendChild(btn);
    applyDark(isDark());
  }

  if (!document.body.hasAttribute("data-admin-page")) {
    setAdmin(false);
  }

  bindModeToggle();

  if (document.querySelector("[data-products]") || document.querySelector("[data-more]")) {
    PRODUCTS = readLocal() || defaultItems();
    bindSearch();
    render();
    if (document.querySelector("[data-products]") && !readLocal()) {
      fetchStock(function (items) {
        if (items && items.length) {
          PRODUCTS = items;
          render();
        }
      });
    }
  }
})();
