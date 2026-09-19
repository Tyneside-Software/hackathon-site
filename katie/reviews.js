(function () {
  var shop = window.FidgetSquish;
  if (!shop || !document.querySelector("[data-reviews]")) return;

  var form = document.querySelector("[data-review-form]");
  var listEl = document.querySelector("[data-review-list]");
  var select = document.querySelector("[data-item-select]");
  var starPick = document.querySelector("[data-star-pick]");
  var starsInput = form && form.querySelector('input[name="stars"]');
  var statusEl = document.querySelector("[data-review-status]");
  var photoData = "";

  function setStatus(text, warn) {
    if (!statusEl) return;
    statusEl.hidden = !text;
    statusEl.textContent = text || "";
    statusEl.classList.toggle("is-warn", !!warn);
  }

  function paintStars(n) {
    if (!starPick) return;
    starPick.querySelectorAll("[data-star]").forEach(function (btn) {
      btn.classList.toggle("is-on", Number(btn.dataset.star) <= n);
    });
    if (starsInput) starsInput.value = String(n);
  }

  function fillItems(products) {
    if (!select) return;
    var wanted = "";
    try {
      wanted = new URLSearchParams(location.search).get("item") || "";
    } catch (e) {}
    select.innerHTML = '<option value="">Pick an item</option>' + (products || []).map(function (p) {
      var on = p.id === wanted ? " selected" : "";
      return '<option value="' + shop.esc(p.id) + '"' + on + ">" + shop.esc(p.name) + "</option>";
    }).join("");
  }

  function reviewCard(r) {
    var photo = r.photo
      ? '<img class="review-photo" src="' + shop.esc(r.photo) + '" alt="">'
      : "";
    return (
      '<article class="review-card" id="review-' + shop.esc(r.id) + '">' +
        photo +
        '<div>' +
          '<p class="stars">' + shop.starRowHtml(r.stars, r.stars + " out of 5") + " " + shop.esc(r.stars) + " / 5</p>" +
          "<h2>" + shop.esc(r.itemName || "Item") + "</h2>" +
          '<p class="meta">' + shop.esc(r.text) + "</p>" +
        "</div>" +
      "</article>"
    );
  }

  function renderList() {
    if (!listEl) return;
    var reviews = shop.readReviews();
    if (!reviews.length) {
      listEl.innerHTML = '<p class="review-empty">No reviews yet. Be the first.</p>';
      return;
    }
    listEl.innerHTML = reviews.map(reviewCard).join("");
  }

  function drawDataUrl(img, file) {
    var max = 1000;
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    if (w > max || h > max) {
      var scale = Math.min(max / w, max / h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    return canvas.toDataURL(file && file.type === "image/png" ? "image/png" : "image/jpeg", 0.8);
  }

  function fileToDataUrl(file, done) {
    if (!file) {
      done("");
      return;
    }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      try {
        done(drawDataUrl(img, file));
      } catch (e) {
        var reader = new FileReader();
        reader.onload = function () { done(String(reader.result || "")); };
        reader.onerror = function () { done(""); };
        reader.readAsDataURL(file);
      }
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      done("");
    };
    img.src = url;
  }

  if (starPick) {
    starPick.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-star]");
      if (!btn) return;
      paintStars(Number(btn.dataset.star));
    });
  }

  if (form) {
    var photoInput = form.querySelector('input[name="photo"]');
    if (photoInput) {
      photoInput.addEventListener("change", function () {
        var file = photoInput.files && photoInput.files[0];
        if (!file) {
          photoData = "";
          return;
        }
        setStatus("Reading picture…");
        fileToDataUrl(file, function (data) {
          photoData = data || "";
          setStatus(photoData ? "Photo ready." : "Could not read that picture.", !photoData);
        });
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var itemId = select && select.value;
      var stars = Number(starsInput && starsInput.value);
      var text = (form.text.value || "").trim();
      if (!itemId) {
        setStatus("Pick an item.", true);
        return;
      }
      if (!stars || stars < 1 || stars > 5) {
        setStatus("Pick a star rating out of 5.", true);
        return;
      }
      if (!text) {
        setStatus("Write a description for your review.", true);
        return;
      }
      var products = shop.getProducts() || [];
      var item = null;
      products.forEach(function (p) { if (p.id === itemId) item = p; });
      var reviews = shop.readReviews();
      reviews.unshift({
        id: Date.now().toString(36),
        itemId: itemId,
        itemName: item ? item.name : itemId,
        stars: stars,
        text: text,
        photo: photoData,
        at: new Date().toISOString()
      });
      var err = shop.writeReviews(reviews);
      if (err) {
        setStatus(err, true);
        return;
      }
      form.reset();
      photoData = "";
      paintStars(0);
      fillItems(products);
      if (itemId && select) select.value = itemId;
      setStatus("Review posted.");
      renderList();
    });
  }

  shop.loadCatalog(function (products) {
    fillItems(products);
    renderList();
  });
})();
