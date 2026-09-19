(function () {
  var STORAGE_KEY = "fidget-squish-catalog";
  var AUTH_KEY = "fidget-squish-admin";
  var PASSWORD = "cassiethecat";
  var PRODUCTS = [];

  function defaultItems() {
    return [
      { id: "dumpling", group: "squishies", name: "Dumpling", price: "£4", meta: "Glow in the dark mystery dumpling", photos: ["photos/mystery-dumpling.jpeg"], inStock: true },
      { id: "mini-pack", group: "squishies", name: "4 pack of mini squishies", price: "Email for price", meta: "Four mini squishies in a pack.", photos: ["photos/4-pack-of-mini-squishies.jpeg"], inStock: true },
      { id: "santa-popit", group: "squishies", name: "Santa popit", price: "£5.49", meta: "Red and white popit", photos: ["photos/santa-popit.jpeg"], inStock: true },
      { id: "popit", group: "squishies", name: "Popit", price: "£4.99", meta: "Fidget dice popit", photos: ["photos/popit-die.jpeg"], inStock: true },
      { id: "fidget-spinner", group: "squishies", name: "Fidget spinner", price: "£3.99", meta: "Earth fidget spinner", photos: ["photos/earth-fidget-spinner.jpeg"], inStock: true },
      { id: "cheese", group: "squishies", name: "Cheese", price: "£4.99", meta: "Super slow-rise cheese", photos: ["photos/slowrise-cheese.jpeg"], inStock: true },
      { id: "balloon-squishies", group: "homemade", name: "Homemade balloon squishies", price: "50p", meta: "Homemade balloon squishies.", photos: [], inStock: true },
      { id: "homemade-squishie", group: "homemade", name: "Homemade squishie", price: "£2", meta: "Homemade squishie.", photos: [], inStock: true },
      { id: "squishie-skin", group: "homemade", name: "Squishie skin", price: "£1", meta: "Squishie skin.", photos: [], inStock: true },
      { id: "water-slime", group: "slime", name: "Water slime", price: "Email for price", meta: "At some point. Matches the photo.", photos: [], inStock: true },
      { id: "cloud-slime", group: "slime", name: "Cloud slime", price: "Email for price", meta: "At some point. Matches the photo.", photos: [], inStock: true },
      { id: "normal-slime", group: "slime", name: "Normal slime", price: "Email for price", meta: "A few for sale.", photos: [], inStock: true },
      { id: "homemade-slime", group: "slime", name: "Homemade slime", price: "Email for price", meta: "There might be homemade slimes too.", photos: [], inStock: true }
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
      inStock: !(item && item.inStock === false),
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
    if (p.group === "homemade") {
      return p.inStock
        ? '<p class="stock is-in">In stock</p>'
        : '<p class="stock is-out">Out of stock</p>';
    }
    if (!p.inStock) return '<p class="stock is-out">Out of stock</p>';
    return "";
  }

  function cardHtml(p) {
    var mail = "mailto:katie@tyneside.software?subject=" + encodeURIComponent(p.mail || ("Order " + p.name));
    var buy = p.inStock
      ? '<a class="buy" href="' + mail + '">Email to buy</a>'
      : '<span class="buy is-off">Out of stock</span>';
    return (
      '<article class="product' + (p.inStock ? "" : " is-out") + '" data-name="' + esc(p.name) + '">' +
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

  if (document.querySelector("[data-products]")) {
    PRODUCTS = readLocal() || defaultItems();
    bindSearch();
    render();
    if (!readLocal()) {
      fetchStock(function (items) {
        if (items && items.length) {
          PRODUCTS = items;
          render();
        }
      });
    }
  }
})();
