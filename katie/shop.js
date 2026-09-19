(function () {
  var STORAGE_KEY = "fidget-squish-catalog";
  var AUTH_KEY = "fidget-squish-admin";
  var PRODUCTS = [];
  var REVIEW_KEY = "fidget-squish-reviews";
  var REVIEWS = [];
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
      { id: "dumpling", group: "squishies", name: "Dumpling", price: "£4", meta: "Glow in the dark mystery dumpling", photos: ["photos/mystery-dumpling.jpeg"], stock: 1, badge: "featured" },
      { id: "mini-pack", group: "squishies", name: "4 pack of mini squishies", price: "Email for price", meta: "Four mini squishies in a pack.", photos: ["photos/4-pack-of-mini-squishies.jpeg"], stock: 1 },
      { id: "santa-popit", group: "squishies", name: "Santa popit", price: "£5.49", meta: "Red and white popit", photos: ["photos/santa-popit.jpeg"], stock: 1 },
      { id: "popit", group: "squishies", name: "Popit", price: "£4.99", meta: "Fidget dice popit", photos: ["photos/popit-die.jpeg"], stock: 1 },
      { id: "fidget-spinner", group: "squishies", name: "Fidget spinner", price: "£3.99", meta: "Earth fidget spinner", photos: ["photos/earth-fidget-spinner.jpeg"], stock: 1 },
      { id: "cheese", group: "squishies", name: "Cheese", price: "£4.99", meta: "Super slow-rise cheese", photos: ["photos/slowrise-cheese.jpeg"], stock: 1 },
      { id: "balloon-squishies", group: "homemade", name: "Homemade balloon squishies", price: "50p", meta: "Homemade balloon squishies.", photos: [], stock: 1, badge: "new" },
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

  function asList(val) {
    if (Array.isArray(val)) return val.slice();
    if (val) return [val];
    return [];
  }

  function normalizeGroups(item) {
    var allowed = { squishies: 1, homemade: 1, mystery: 1, fidgets: 1, slime: 1 };
    var out = [];
    asList(item && (item.groups || item.group)).forEach(function (g) {
      if (allowed[g] && out.indexOf(g) === -1) out.push(g);
    });
    if (!out.length) out.push("squishies");
    return out;
  }

  function normalizeBadges(item) {
    var out = [];
    asList(item && (item.badges || item.badge)).forEach(function (b) {
      if ((b === "new" || b === "featured") && out.indexOf(b) === -1) out.push(b);
    });
    return out;
  }

  function hasGroup(p, key) {
    return (p.groups || [p.group]).indexOf(key) !== -1;
  }

  function hasBadge(p, key) {
    return (p.badges || (p.badge ? [p.badge] : [])).indexOf(key) !== -1;
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
    var groups = normalizeGroups(item);
    var badges = normalizeBadges(item);
    return {
      id: (item && item.id) || newId(name),
      group: groups[0],
      groups: groups,
      name: name,
      price: (item && item.price) || "Email for price",
      meta: (item && (item.meta || item.description)) || "",
      photos: photos,
      stock: stockQty(item),
      inStock: stockQty(item) > 0,
      badge: badges[0] || "",
      badges: badges,
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

  function apiBase() {
    var raw = window.HACKATHON_API || "https://hackathon-api-git-975511976696.europe-west2.run.app";
    return String(raw).replace(/\/$/, "");
  }

  function getToken() {
    try {
      return sessionStorage.getItem(AUTH_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function userToken() {
    try { return localStorage.getItem("fidget-squish-user-token") || ""; } catch (e) { return ""; }
  }

  function authHeaders() {
    var h = { "Content-Type": "application/json", Accept: "application/json" };
    var tok = userToken();
    if (tok) h.Authorization = "Bearer " + tok;
    return h;
  }

  function adminHeaders() {
    var h = authHeaders();
    var tok = getToken();
    if (tok) h["X-Katie-Admin"] = tok;
    return h;
  }

  function isAdmin() {
    return getToken().length > 20;
  }

  function setAdmin(on, token) {
    try {
      if (on && token) sessionStorage.setItem(AUTH_KEY, token);
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
  }

  function loginAdmin(password) {
    var me = meLocal();
    if (!me || !isShopAdminName(me.username)) {
      return Promise.resolve({
        ok: false,
        detail: "Only Admins can open Admin. Log in on Account first."
      });
    }
    return fetch(apiBase() + "/katie/admin/login", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ password: String(password || "") })
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || !data || !data.token) {
          return { ok: false, detail: (data && data.detail) || "Wrong password." };
        }
        setAdmin(true, data.token);
        return { ok: true };
      }).catch(function () { return { ok: false, detail: "Could not reach Admin." }; });
    }).catch(function () { return { ok: false, detail: "Could not reach Admin." }; });
  }

  function verifyAdmin() {
    var token = getToken();
    if (!token) return Promise.resolve(false);
    return fetch(apiBase() + "/katie/admin/verify", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ token: token })
    }).then(function (r) {
      return r.json().then(function (data) {
        var ok = !!(r.ok && data && data.ok);
        if (!ok) setAdmin(false);
        return ok;
      }).catch(function () {
        setAdmin(false);
        return false;
      });
    }).catch(function () {
      return false;
    });
  }

  function query() {
    var input = document.querySelector("[data-search] input");
    return ((input && input.value) || "").trim().toLowerCase();
  }

  function matches(p, q) {
    if (!q) return true;
    return (p.name + " " + p.meta + " " + (p.groups || [p.group]).join(" ") + " " + (p.badges || []).join(" ") + " " + p.price).toLowerCase().indexOf(q) !== -1;
  }

  function galleryHtml(p) {
    var photos = p.photos || [];
    var slides;
    if (photos.length) {
      slides = photos.map(function (src, i) {
        var on = i === 0 ? " is-on" : "";
        return '<div class="slide' + on + '"><img class="is-loading" src="' + esc(assetUrl(src)) + '" alt="' + esc(p.name) + '"></div>';
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
    var n = stockQty(p);
    if (n > 0) {
      return '<p class="stock is-in">' + n + (n === 1 ? " in stock" : " in stock") + "</p>";
    }
    return '<p class="stock is-out">Out of stock</p>';
  }

  function readReviews() {
    try {
      var raw = localStorage.getItem(REVIEW_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : (data && data.reviews) || [];
    } catch (e) {
      return [];
    }
  }

  function writeReviews(list) {
    REVIEWS = list || [];
    try {
      localStorage.setItem(REVIEW_KEY, JSON.stringify(REVIEWS));
    } catch (e) {
      return "Could not save the review. Try a smaller photo.";
    }
    return null;
  }

  function reviewsFor(id) {
    return REVIEWS.filter(function (r) { return r.itemId === id; });
  }

  function starChars(n) {
    var s = "";
    var rounded = Math.round(Number(n) || 0);
    for (var i = 1; i <= 5; i++) s += i <= rounded ? "★" : "☆";
    return s;
  }

  function starRowHtml(n, label) {
    var score = Math.max(0, Math.min(5, Number(n) || 0));
    var aria = label || (score.toFixed(1) + " out of 5");
    var slots = "";
    for (var i = 1; i <= 5; i++) {
      var fill = Math.max(0, Math.min(1, score - (i - 1))) * 100;
      slots +=
        '<span class="star-slot">' +
          '<span class="star-back">★</span>' +
          '<span class="star-fill" style="width:' + fill.toFixed(2) + '%">★</span>' +
        "</span>";
    }
    return '<span class="star-row" aria-label="' + esc(aria) + '">' + slots + "</span>";
  }

  function reviewStats(p) {
    var list = reviewsFor(p.id);
    var sum = 0;
    list.forEach(function (r) { sum += Number(r.stars) || 0; });
    var avg = list.length ? sum / list.length : 0;
    return { list: list, avg: avg, count: list.length };
  }

  function reviewSummaryHtml(p) {
    var stats = reviewStats(p);
    var countLabel = stats.count === 1 ? "1 review" : stats.count + " reviews";
    return (
      '<p class="stars">' +
        starRowHtml(stats.avg, stats.avg.toFixed(1) + " out of 5") +
        '<span class="star-avg"> ' + stats.avg.toFixed(1) + " out of 5 · " + countLabel + "</span>" +
      "</p>"
    );
  }

  function flagHtml(p) {
    var bits = "";
    if (hasBadge(p, "featured")) bits += '<span class="flag flag-featured">Featured</span>';
    if (hasBadge(p, "new")) bits += '<span class="flag flag-new">New</span>';
    if (!bits) return "";
    return '<div class="flags">' + bits + "</div>";
  }

  function burstHtml() {
    var bits = "";
    for (var i = 0; i < 10; i++) bits += "<span></span>";
    return '<div class="burst" aria-hidden="true">' + bits + "</div>";
  }

  function cardHtml(p) {
    var mail = "mailto:katie@tyneside.software?subject=" + encodeURIComponent(p.mail || ("Order " + p.name));
    var inStock = stockQty(p) > 0;
    var buy = inStock
      ? '<a class="buy" href="' + mail + '">Email to buy</a>'
      : '<span class="buy is-off">Out of stock</span>';
    return (
      '<article class="product is-clickable' + (inStock ? " is-in" : " is-out") + '" data-id="' + esc(p.id) + '" data-name="' + esc(p.name) + '">' +
        (inStock ? burstHtml() : "") +
        flagHtml(p) +
        galleryHtml(p) +
        '<p class="price">' + esc(p.price) + "</p>" +
        stockHtml(p) +
        "<h2>" + esc(p.name) + "</h2>" +
        '<p class="meta">' + esc(p.meta) + "</p>" +
        reviewSummaryHtml(p) +
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
    var wrap = gallery.closest("[data-pdp-gallery]") || gallery.parentElement;
    if (wrap) {
      wrap.querySelectorAll("[data-thumb]").forEach(function (thumb, t) {
        thumb.classList.toggle("is-on", t === i);
      });
    }
  }

  function waitImg(img) {
    if (!img || img.dataset.waitBound) return;
    img.dataset.waitBound = "1";
    function done() { img.classList.remove("is-loading"); }
    if (img.complete) {
      done();
      return;
    }
    img.addEventListener("load", done);
    img.addEventListener("error", done);
  }

  function waitImgs(root) {
    (root || document).querySelectorAll(".slide img, .thumb img, .more-card img, .review-photo").forEach(waitImg);
  }

  function bindGalleries(root) {
    (root || document).querySelectorAll("[data-gallery]").forEach(function (gallery) {
      if (gallery.dataset.bound) return;
      gallery.dataset.bound = "1";
      gallery.dataset.index = "0";
      show(gallery, 0);

      gallery.querySelectorAll("img").forEach(function (img) {
        waitImg(img);
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
    (root || document).querySelectorAll("[data-thumbs]").forEach(function (thumbs) {
      if (thumbs.dataset.bound) return;
      thumbs.dataset.bound = "1";
      var wrap = thumbs.closest("[data-pdp-gallery]") || thumbs.parentElement;
      var gallery = wrap && wrap.querySelector("[data-gallery]");
      if (!gallery) return;
      thumbs.querySelectorAll("[data-thumb]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var i = Number(btn.dataset.thumb);
          show(gallery, i);
          thumbs.querySelectorAll("[data-thumb]").forEach(function (b) {
            b.classList.toggle("is-on", b === btn);
          });
        });
      });
    });
    waitImgs(root);
  }

  function bindProductLinks(root) {
    (root || document).querySelectorAll(".product.is-clickable").forEach(function (el) {
      if (el.dataset.linkBound) return;
      el.dataset.linkBound = "1";
      el.addEventListener("click", function (e) {
        if (e.target.closest("a, button, label, input, textarea, select")) return;
        var id = el.dataset.id;
        if (id) location.href = "product.html?id=" + encodeURIComponent(id);
      });
    });
  }

  function productUrl(id) {
    try {
      return new URL("product.html?id=" + encodeURIComponent(id), location.href).href;
    } catch (e) {
      return "product.html?id=" + encodeURIComponent(id);
    }
  }

  function copyProductLink(url, btn) {
    function copied() {
      if (!btn) return;
      btn.textContent = "Link copied";
      setTimeout(function () { btn.textContent = "Share"; }, 1800);
    }
    function fallback() {
      window.prompt("Copy this link", url);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(copied).catch(function () {
        try {
          var ta = document.createElement("textarea");
          ta.value = url;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (ok) copied();
          else fallback();
        } catch (e) {
          fallback();
        }
      });
      return;
    }
    fallback();
  }

  function reviewEntryHtml(r) {
    var photo = r.photo ? '<img class="review-photo is-loading" src="' + esc(r.photo) + '" alt="">' : "";
    return (
      '<article class="review-card">' +
        photo +
        "<div>" +
          '<p class="stars">' + starRowHtml(r.stars, r.stars + " out of 5") + " " + esc(r.stars) + " / 5</p>" +
          '<p class="meta">' + esc(r.text) + "</p>" +
        "</div>" +
      "</article>"
    );
  }

  function thumbsHtml(p) {
    var photos = p.photos || [];
    if (photos.length < 2) return "";
    return (
      '<div class="thumbs" data-thumbs>' +
        photos.map(function (src, i) {
          return (
            '<button type="button" class="thumb' + (i === 0 ? " is-on" : "") + '" data-thumb="' + i + '" aria-label="Photo ' + (i + 1) + '">' +
              '<img class="is-loading" src="' + esc(assetUrl(src)) + '" alt="">' +
            "</button>"
          );
        }).join("") +
      "</div>"
    );
  }

  function suggestedItems(current) {
    var curGroups = current.groups || [current.group];
    var same = PRODUCTS.filter(function (p) {
      if (p.id === current.id) return false;
      return (p.groups || [p.group]).some(function (g) { return curGroups.indexOf(g) !== -1; });
    });
    var other = PRODUCTS.filter(function (p) {
      if (p.id === current.id) return false;
      return (p.groups || [p.group]).every(function (g) { return curGroups.indexOf(g) === -1; });
    });
    return same.concat(other).slice(0, 6);
  }

  function renderProductPage() {
    var view = document.querySelector("[data-product-page]");
    if (!view) return;
    var id = "";
    try { id = new URLSearchParams(location.search).get("id") || ""; } catch (e) {}
    var item = null;
    PRODUCTS.forEach(function (p) {
      if (p.id === id) item = p;
    });
    if (!item) {
      PRODUCTS.forEach(function (p) {
        if (slug(p.name) === id) item = p;
      });
    }
    var missing = view.querySelector("[data-product-missing]");
    var oos = view.querySelector("[data-product-oos]");
    var body = view.querySelector("[data-product-view]");
    function showNote(el, on) {
      if (!el) return;
      el.hidden = !on;
      el.classList.toggle("is-on", !!on);
    }
    if (!item) {
      showNote(missing, true);
      showNote(oos, false);
      if (body) body.hidden = true;
      return;
    }
    showNote(missing, false);
    showNote(oos, stockQty(item) < 1);
    if (body) body.hidden = false;
    document.title = item.name + " · fidget squish";
    var gallery = view.querySelector("[data-pdp-gallery]");
    var info = view.querySelector("[data-pdp-info]");
    var reviewsEl = view.querySelector("[data-pdp-reviews]");
    var suggestEl = view.querySelector("[data-suggested]");
    var stats = reviewStats(item);
    var mail = "mailto:katie@tyneside.software?subject=" + encodeURIComponent(item.mail || ("Order " + item.name));
    var buy = stockQty(item) > 0
      ? '<a class="buy" href="' + mail + '">Email to buy</a>'
      : '<span class="buy is-off">Out of stock</span>';
    if (gallery) {
      gallery.innerHTML = galleryHtml(item) + thumbsHtml(item);
      bindGalleries(gallery);
    }
    if (info) {
      info.innerHTML =
        flagHtml(item) +
        "<h1>" + esc(item.name) + "</h1>" +
        reviewSummaryHtml(item) +
        '<p class="price">' + esc(item.price) + "</p>" +
        stockHtml(item) +
        '<p class="meta">' + esc(item.meta) + "</p>" +
        '<div class="pdp-actions">' + buy +
          '<button type="button" class="share-btn" data-share>Share</button>' +
          '<a class="write-review" href="reviews.html?item=' + encodeURIComponent(item.id) + '">Write a review</a>' +
        "</div>";
      var shareBtn = info.querySelector("[data-share]");
      if (shareBtn) {
        shareBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var url = productUrl(item.id);
          var payload = {
            title: item.name + " · fidget squish",
            text: (item.meta || item.name) + "\n" + url,
            url: url
          };
          var canShare = typeof navigator.share === "function";
          if (canShare && navigator.canShare) {
            try { canShare = navigator.canShare(payload); } catch (err) { canShare = false; }
          }
          if (canShare) {
            navigator.share(payload).catch(function (err) {
              if (err && err.name === "AbortError") return;
              copyProductLink(url, shareBtn);
            });
            return;
          }
          copyProductLink(url, shareBtn);
        });
      }
    }
    if (reviewsEl) {
      if (!stats.list.length) {
        reviewsEl.innerHTML = '<p class="review-empty">No reviews yet. <a href="reviews.html?item=' + encodeURIComponent(item.id) + '">Write the first one</a>.</p>';
      } else {
        reviewsEl.innerHTML = stats.list.map(reviewEntryHtml).join("");
      }
    }
    if (suggestEl) {
      var ideas = suggestedItems(item);
      suggestEl.innerHTML = ideas.map(cardHtml).join("");
      bindGalleries(suggestEl);
      bindProductLinks(suggestEl);
    }
  }

  function moreCardHtml(p) {
    return (
      '<a class="product more-card" href="' + esc(p.href) + '">' +
        '<div class="gallery" data-gallery><div class="slides"><div class="slide is-on">' +
          '<img class="is-loading" src="' + esc(assetUrl(p.img)) + '" alt="' + esc(p.name) + '">' +
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

  function shelfItems(key) {
    if (key === "featured") return PRODUCTS.filter(function (p) { return hasBadge(p, "featured"); });
    if (key === "new") return PRODUCTS.filter(function (p) { return hasBadge(p, "new"); });
    return PRODUCTS.filter(function (p) { return hasGroup(p, key); });
  }

  function render() {
    var q = query();
    var shown = 0;
    document.querySelectorAll("[data-products]").forEach(function (el) {
      var group = el.dataset.products;
      var items = shelfItems(group).filter(function (p) {
        return matches(p, q);
      });
      el.innerHTML = items.map(cardHtml).join("");
      bindGalleries(el);
      bindProductLinks(el);
      shown += items.length;
      var section = el.closest(".group");
      if (section) section.hidden = items.length === 0;
    });
    document.querySelectorAll("[data-more]").forEach(function (el) {
      var items = moreItems(el.dataset.more).filter(function (p) {
        return matchesMore(p, q);
      });
      el.innerHTML = items.map(moreCardHtml).join("");
      bindGalleries(el);
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

  function applyCatalog(items) {
    PRODUCTS = (items && items.length ? items : defaultItems()).map(normalize);
    if (!PRODUCTS.some(function (p) { return (p.badges && p.badges.length) || p.badge; })) {
      PRODUCTS.forEach(function (p) {
        if (p.id === "dumpling") { p.badge = "featured"; p.badges = ["featured"]; }
        if (p.id === "balloon-squishies") { p.badge = "new"; p.badges = ["new"]; }
      });
    }
    return PRODUCTS;
  }

  function loadCatalog(done) {
    var local = readLocal();
    if (local && local.length) {
      applyCatalog(local);
      if (done) done(PRODUCTS);
      return;
    }
    applyCatalog(defaultItems());
    if (done) done(PRODUCTS);
    fetchStock(function (items) {
      if (readLocal()) return;
      if (items && items.length) applyCatalog(items);
      if (done) done(PRODUCTS);
    });
  }

  function refresh(next) {
    if (next) applyCatalog(next);
    render();
    renderProductPage();
  }

  var ACCOUNT_KEY = "fidget-squish-accounts";
  var USER_SESSION = "fidget-squish-user-token";
  var FOUNDER = "lewisthomson";
  var DEFAULT_ADMINS = ["lewisthomson", "katiethomson"];
  var accountBook = { users: [], friends: {}, admins: DEFAULT_ADMINS.slice(), updated: 0 };

  function emptyAccountBook() {
    return { users: [], friends: {}, admins: DEFAULT_ADMINS.slice(), updated: 0 };
  }

  function normaliseAccountName(name) {
    return String(name || "").trim().toLowerCase();
  }

  function readAccountBook() {
    try {
      var raw = localStorage.getItem(ACCOUNT_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.users)) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function dedupeUsers(list) {
    var byName = {};
    (list || []).forEach(function (u) {
      if (!u || !u.username) return;
      u.username = normaliseAccountName(u.username);
      byName[u.username] = u;
    });
    return Object.keys(byName).sort().map(function (k) { return byName[k]; });
  }

  function unionAdmins() {
    var lists = Array.prototype.slice.call(arguments);
    var out = [];
    DEFAULT_ADMINS.forEach(function (a) { out.push(a); });
    lists.forEach(function (list) {
      (list || []).forEach(function (a) {
        a = normaliseAccountName(a);
        if (a && out.indexOf(a) === -1) out.push(a);
      });
    });
    return out;
  }

  function writeAccountBook() {
    accountBook.updated = Date.now();
    accountBook.users = dedupeUsers(accountBook.users);
    accountBook.admins = unionAdmins(accountBook.admins);
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accountBook));
      return { error: null };
    } catch (e) {
      return { error: "Could not save accounts on this computer." };
    }
  }

  function isShopAdminName(name) {
    name = normaliseAccountName(name);
    return (accountBook.admins || []).indexOf(name) !== -1;
  }

  function publicAccount(u) {
    if (!u) return null;
    return {
      username: u.username,
      email: u.email || "",
      full_name: u.full_name || null,
      photo: u.photo || "",
      admin: isShopAdminName(u.username)
    };
  }

  function findAccount(nameOrEmail) {
    var q = normaliseAccountName(nameOrEmail);
    if (!q) return null;
    var users = accountBook.users || [];
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var name = normaliseAccountName(u.username);
      var email = String(u.email || "").toLowerCase();
      if (name === q || (email && email === q)) return u;
    }
    return null;
  }

  function hexBytes(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ("0" + b.toString(16)).slice(-2);
    }).join("");
  }

  function newSalt() {
    var a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return hexBytes(a);
  }

  function hashPass(password, salt) {
    var enc = new TextEncoder();
    return crypto.subtle.digest("SHA-256", enc.encode(salt + "\n" + password)).then(hexBytes);
  }

  function setUserSession(username) {
    try {
      if (username) localStorage.setItem(USER_SESSION, "local:" + normaliseAccountName(username));
      else localStorage.removeItem(USER_SESSION);
    } catch (e) {}
  }

  function sessionUsername() {
    try {
      var t = localStorage.getItem(USER_SESSION) || "";
      if (t.indexOf("local:") === 0) return t.slice(6);
      return "";
    } catch (e) {
      return "";
    }
  }

  function meLocal() {
    return publicAccount(findAccount(sessionUsername()));
  }

  function loadAccountBook(done) {
    var local = readAccountBook();
    fetch("accounts.json?v=20260920katieadmin")
      .then(function (r) { return r.ok ? r.json() : emptyAccountBook(); })
      .catch(function () { return emptyAccountBook(); })
      .then(function (file) {
        if (!file || !Array.isArray(file.users)) file = emptyAccountBook();
        var localUsers = (local && local.users) || [];
        accountBook = {
          users: dedupeUsers((file.users || []).concat(localUsers)),
          friends: Object.assign({}, file.friends || {}, (local && local.friends) || {}),
          admins: unionAdmins(file.admins, local && local.admins),
          updated: Math.max(file.updated || 0, (local && local.updated) || 0)
        };
        writeAccountBook();
        if (done) done(accountBook);
      });
  }

  function registerLocal(payload) {
    var username = normaliseAccountName(payload.username);
    var email = String(payload.email || "").trim().toLowerCase();
    var password = String(payload.password || "");
    if (!/^[a-z0-9._-]{3,64}$/.test(username)) {
      return Promise.reject(new Error("Usernames can only use letters, numbers, dots, underscores and hyphens — no spaces."));
    }
    if (!email || email.indexOf("@") === -1) return Promise.reject(new Error("Enter a real email"));
    if (password.length < 8) return Promise.reject(new Error("Password must be at least 8 characters."));
    if (findAccount(username)) return Promise.reject(new Error("That username is taken. Pick another."));
    if (findAccount(email)) return Promise.reject(new Error("That email already has an account."));
    var salt = newSalt();
    return hashPass(password, salt).then(function (pass) {
      accountBook.users.push({
        username: username,
        email: email,
        full_name: payload.full_name || null,
        photo: payload.photo || "",
        salt: salt,
        pass: pass
      });
      var saved = writeAccountBook();
      if (saved.error) throw new Error(saved.error);
      setUserSession(username);
      return publicAccount(findAccount(username));
    });
  }

  function loginLocal(user, password) {
    var row = findAccount(user);
    if (!row) return Promise.reject(new Error("Incorrect email, username or password"));
    return hashPass(password, row.salt).then(function (h) {
      if (h !== row.pass) throw new Error("Incorrect email, username or password");
      setUserSession(row.username);
      return publicAccount(row);
    });
  }

  function logoutLocal() {
    setUserSession("");
  }

  function patchLocal(payload) {
    var row = findAccount(sessionUsername());
    if (!row) return Promise.reject(new Error("Log in first."));
    var old = row.username;
    if (payload.photo != null) row.photo = payload.photo;
    if (payload.full_name != null) row.full_name = payload.full_name;
    if (payload.username) {
      var next = normaliseAccountName(payload.username);
      if (!/^[a-z0-9._-]{3,64}$/.test(next)) {
        return Promise.reject(new Error("Usernames can only use letters, numbers, dots, underscores and hyphens — no spaces."));
      }
      if (next !== old && findAccount(next)) return Promise.reject(new Error("That username is taken. Pick another."));
      if (next !== old) {
        row.username = next;
        var pals = accountBook.friends[old] || [];
        delete accountBook.friends[old];
        accountBook.friends[next] = pals;
        Object.keys(accountBook.friends).forEach(function (k) {
          accountBook.friends[k] = (accountBook.friends[k] || []).map(function (n) { return n === old ? next : n; });
        });
        accountBook.admins = (accountBook.admins || []).map(function (n) { return n === old ? next : n; });
        setUserSession(next);
      }
    }
    var saved = writeAccountBook();
    if (saved.error) return Promise.reject(new Error(saved.error));
    return Promise.resolve(publicAccount(row));
  }

  function searchLocal(q, exclude) {
    var needle = normaliseAccountName(q);
    exclude = normaliseAccountName(exclude || sessionUsername());
    var hits = (accountBook.users || []).filter(function (u) {
      if (u.username === exclude) return false;
      if (!needle) return true;
      return u.username.indexOf(needle) !== -1;
    });
    hits.sort(function (a, b) {
      var as = needle && a.username.indexOf(needle) === 0 ? 0 : 1;
      var bs = needle && b.username.indexOf(needle) === 0 ? 0 : 1;
      if (as !== bs) return as - bs;
      return a.username < b.username ? -1 : 1;
    });
    var friends = friendNamesFor(exclude);
    return hits.slice(0, needle ? 8 : 24).map(function (u) {
      var card = publicAccount(u);
      card.friend = friends.indexOf(u.username) !== -1;
      return card;
    });
  }

  function friendNamesFor(username) {
    username = normaliseAccountName(username);
    return (accountBook.friends[username] || []).slice();
  }

  function listFriendsLocal() {
    return friendNamesFor(sessionUsername()).map(function (name) {
      var card = publicAccount(findAccount(name)) || { username: name, photo: "", admin: isShopAdminName(name) };
      card.friend = true;
      return card;
    });
  }

  function addFriendLocal(username) {
    var me = sessionUsername();
    username = normaliseAccountName(username);
    if (!me) return Promise.reject(new Error("Log in first."));
    if (username === me) return Promise.reject(new Error("That’s you."));
    if (!findAccount(username)) return Promise.reject(new Error("No account with that name."));
    var list = accountBook.friends[me] || [];
    if (list.indexOf(username) === -1) list.push(username);
    accountBook.friends[me] = list;
    writeAccountBook();
    var card = publicAccount(findAccount(username));
    card.friend = true;
    return Promise.resolve(card);
  }

  function removeFriendLocal(username) {
    var me = sessionUsername();
    username = normaliseAccountName(username);
    accountBook.friends[me] = (accountBook.friends[me] || []).filter(function (n) { return n !== username; });
    writeAccountBook();
    return Promise.resolve({ ok: true });
  }

  function listAdminsLocal() {
    return (accountBook.admins || []).map(function (name) {
      var card = publicAccount(findAccount(name)) || { username: name, photo: "", admin: true };
      card.admin = true;
      card.founder = name === FOUNDER;
      return card;
    });
  }

  function addAdminLocal(username) {
    username = normaliseAccountName(username);
    if (username === sessionUsername()) return Promise.reject(new Error("That’s you — you’re already an Admin."));
    if (!findAccount(username)) return Promise.reject(new Error("No account with that name."));
    if ((accountBook.admins || []).indexOf(username) === -1) accountBook.admins.push(username);
    writeAccountBook();
    var card = publicAccount(findAccount(username));
    card.admin = true;
    card.founder = username === FOUNDER;
    return Promise.resolve(card);
  }

  function removeAdminLocal(username) {
    username = normaliseAccountName(username);
    if (username === FOUNDER) return Promise.reject(new Error("LewisThomson has to stay an Admin."));
    var next = (accountBook.admins || []).filter(function (n) { return n !== username; });
    if (!next.length) return Promise.reject(new Error("There has to be at least one Admin."));
    accountBook.admins = next;
    writeAccountBook();
    return Promise.resolve({ ok: true });
  }

  function downloadAccounts() {
    writeAccountBook();
    var blob = new Blob([JSON.stringify({
      users: accountBook.users,
      friends: accountBook.friends,
      admins: accountBook.admins,
      updated: accountBook.updated
    }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "accounts.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  window.FidgetSquish = {
    STORAGE_KEY: STORAGE_KEY,
    defaultItems: defaultItems,
    normalize: normalize,
    readLocal: readLocal,
    writeLocal: writeLocal,
    clearLocal: clearLocal,
    loginAdmin: loginAdmin,
    verifyAdmin: verifyAdmin,
    getToken: getToken,
    adminHeaders: adminHeaders,
    isAdmin: isAdmin,
    setAdmin: setAdmin,
    loadAccountBook: loadAccountBook,
    meLocal: meLocal,
    registerLocal: registerLocal,
    loginLocal: loginLocal,
    logoutLocal: logoutLocal,
    patchLocal: patchLocal,
    searchLocal: searchLocal,
    listFriendsLocal: listFriendsLocal,
    addFriendLocal: addFriendLocal,
    removeFriendLocal: removeFriendLocal,
    listAdminsLocal: listAdminsLocal,
    addAdminLocal: addAdminLocal,
    removeAdminLocal: removeAdminLocal,
    downloadAccounts: downloadAccounts,
    isShopAdminName: isShopAdminName,
    loadCatalog: loadCatalog,
    fetchStock: fetchStock,
    refresh: refresh,
    esc: esc,
    assetUrl: assetUrl,
    newId: newId,
    getProducts: function () { return PRODUCTS; },
    readReviews: readReviews,
    writeReviews: writeReviews,
    reviewsFor: reviewsFor,
    starChars: starChars,
    starRowHtml: starRowHtml,
    refreshAccountNav: function () { bindAccountNav(); }
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

  function bindLegal() {
    if (document.querySelector("[data-legal]")) return;
    var foot = document.querySelector(".foot");
    var block = document.createElement("section");
    block.className = "policies";
    block.setAttribute("data-legal", "");
    block.innerHTML =
      "<h2>Terms &amp; conditions</h2>" +
      "<ul>" +
        "<li>This is Katie’s fidget squish shop. Email katie@tyneside.software to buy.</li>" +
        "<li>Prices are shown on each item. How many are in stock can change.</li>" +
        "<li>Orders are agreed by email. Payment and how you get the item will be set out in that email.</li>" +
        "<li>Homemade items are handmade, so they may look a bit different from the photos.</li>" +
        "<li>If something is wrong with an order, email us and we will help.</li>" +
        "<li>Reviews are written by customers. Photos in reviews belong to the person who posted them.</li>" +
        "<li>This site is provided as-is for browsing and ordering by email. We may update items, prices and these terms at any time.</li>" +
      "</ul>" +
      '<p class="lewis-here">lewis was here</p>';
    if (foot) {
      var inner = foot.querySelector(".inner");
      if (inner) inner.insertAdjacentElement("afterend", block);
      else foot.appendChild(block);
    } else {
      document.body.appendChild(block);
    }
  }

  function bindAccountNav() {
    var links = document.querySelectorAll('nav a[href="account.html"]');
    if (!links.length) return;
    var user = meLocal();
    if (!user) {
      links.forEach(function (link) {
        link.textContent = "Account";
        link.classList.remove("account-chip");
      });
      return;
    }
    links.forEach(function (link) {
      link.classList.add("account-chip");
      link.innerHTML = (user.photo ? '<img src="' + esc(user.photo) + '" alt="">' : "") + esc(user.username);
    });
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
  bindLegal();
  loadAccountBook(function () {
    bindAccountNav();
  });
  REVIEWS = readReviews();

  bindSearch();
  loadCatalog(function () {
    render();
    renderProductPage();
  });
})();
