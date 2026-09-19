(function () {
  var shop = window.FidgetSquish;
  if (!shop) return;

  var items = [];
  var saveTimer = 0;
  var bound = false;
  var lock;
  var editor;
  var list;
  var statusEl;
  var gate;
  var errorEl;
  var passwordInput;

  function cacheEls() {
    lock = document.querySelector("[data-lock]");
    editor = document.querySelector("[data-editor]");
    list = document.querySelector("[data-list]");
    statusEl = document.querySelector("[data-status]");
    gate = document.querySelector("[data-gate]");
    errorEl = document.querySelector("[data-error]");
    passwordInput = document.getElementById("pw");
  }

  function setStatus(text, warn) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("is-warn", !!warn);
  }

  function showEditor(on) {
    if (lock) lock.hidden = on;
    if (editor) editor.hidden = !on;
  }

  function isPickedPhoto(src) {
    return /^(data:|blob:)/i.test(String(src || ""));
  }

  function typedPhotos(item) {
    return (item.photos || []).filter(function (src) { return !isPickedPhoto(src); });
  }

  function previewHtml(item) {
    var src = item.photos && item.photos[0];
    if (!src) return '<div class="empty"><strong>Photo</strong>Picture coming</div>';
    return '<img src="' + shop.esc(shop.assetUrl(src)) + '" alt="">';
  }

  function pencilHtml() {
    return (
      '<label class="admin-pencil" title="Add pictures">' +
        '<span class="sr-only">Add pictures</span>' +
        '<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/*" multiple data-photo-file>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
      "</label>"
    );
  }

  function photosHtml(item) {
    var thumbs = (item.photos || []).map(function (src, i) {
      return (
        '<div class="admin-thumb' + (i === 0 ? " is-main" : "") + '" data-photo-i="' + i + '">' +
          '<img src="' + shop.esc(shop.assetUrl(src)) + '" alt="">' +
          '<button type="button" class="admin-thumb-x" data-photo-remove="' + i + '" aria-label="Remove picture">×</button>' +
        "</div>"
      );
    }).join("");
    return (
      '<div class="wide admin-photos">' +
        '<p class="admin-photos-label">Pictures <span>(add as many as you like · tap a picture to make it the main one)</span></p>' +
        '<div class="admin-thumbs" data-thumbs>' +
          thumbs +
          '<label class="admin-add-photos">+ Add pictures' +
            '<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/*" multiple data-photo-files>' +
          "</label>" +
        "</div>" +
      "</div>"
    );
  }

  function cardHtml(item, index) {
    return (
      '<article class="admin-card" data-index="' + index + '">' +
        '<div class="admin-preview">' +
          '<div class="admin-preview-pic" data-preview-pic>' + previewHtml(item) + "</div>" +
          pencilHtml() +
        "</div>" +
        '<div class="admin-fields">' +
          '<label>Name<input data-field="name" type="text" value="' + shop.esc(item.name) + '"></label>' +
          '<label>Price<input data-field="price" type="text" value="' + shop.esc(item.price) + '"></label>' +
          '<label class="wide">Description<input data-field="meta" type="text" value="' + shop.esc(item.meta) + '"></label>' +
          '<label>Section<select data-field="group">' +
            '<option value="squishies"' + (item.group === "squishies" ? " selected" : "") + ">Squishies</option>" +
            '<option value="homemade"' + (item.group === "homemade" ? " selected" : "") + ">Homemade</option>" +
            '<option value="mystery"' + (item.group === "mystery" ? " selected" : "") + ">Mystery</option>" +
            '<option value="fidgets"' + (item.group === "fidgets" ? " selected" : "") + ">Fidgets</option>" +
            '<option value="slime"' + (item.group === "slime" ? " selected" : "") + ">Slime</option>" +
          "</select></label>" +
          photosHtml(item) +
          '<label>How many in stock<input data-field="stock" type="number" min="0" step="1" value="' + shop.esc(item.stock) + '"></label>' +
          '<label>Badge<select data-field="badge">' +
            '<option value=""' + (!item.badge ? " selected" : "") + ">None</option>" +
            '<option value="new"' + (item.badge === "new" ? " selected" : "") + ">New</option>" +
            '<option value="featured"' + (item.badge === "featured" ? " selected" : "") + ">Featured</option>" +
          "</select></label>" +
          '<p class="admin-stock-note wide">' + (item.stock > 0 ? "In stock" : "Out of stock") + "</p>" +
        "</div>" +
        '<div class="admin-card-foot"><button type="button" class="remove" data-remove>Remove</button></div>' +
      "</article>"
    );
  }

  function bindPreviewError(root) {
    (root || document).querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        var empty = document.createElement("div");
        empty.className = "empty";
        empty.innerHTML = "<strong>Photo</strong>Picture coming";
        img.replaceWith(empty);
      });
    });
  }

  function setPreview(card, item) {
    var pic = card && card.querySelector("[data-preview-pic]");
    if (!pic) return;
    pic.innerHTML = previewHtml(item);
    bindPreviewError(pic);
  }

  function renderList() {
    if (!list) return;
    list.innerHTML = items.map(cardHtml).join("");
    bindPreviewError(list);
  }

  function persist(message) {
    var result = shop.writeLocal(items);
    if (shop.refresh) shop.refresh(items);
    if (result && result.error) setStatus(result.error, true);
    else setStatus(message || "Saved on this computer.");
  }

  function scheduleSave() {
    setStatus("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { persist(); }, 180);
  }

  function readCard(card) {
    var index = Number(card.dataset.index);
    var item = items[index];
    if (!item) return;
    card.querySelectorAll("[data-field]").forEach(function (field) {
      var key = field.dataset.field;
      if (key === "stock") {
        var n = parseInt(field.value, 10);
        item.stock = isNaN(n) || n < 0 ? 0 : n;
      }
      else item[key] = field.value;
    });
    items[index] = shop.normalize(item);
  }

  function drawDataUrl(img, file) {
    var max = 1200;
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
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    var png = file && file.type === "image/png";
    return canvas.toDataURL(png ? "image/png" : "image/jpeg", 0.82);
  }

  function readRawFile(file, done) {
    var reader = new FileReader();
    reader.onload = function () { done(String(reader.result || "")); };
    reader.onerror = function () { done(null, "Could not read that picture."); };
    reader.readAsDataURL(file);
  }

  function fileToDataUrl(file, done) {
    if (!file) {
      done(null, "Please pick a picture.");
      return;
    }
    var name = file.name || "";
    var type = file.type || "";
    var looksImage = !type || type.indexOf("image/") === 0 || /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(name);
    if (type && type.indexOf("image/") !== 0 && !/\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(name)) {
      done(null, "Please pick a picture.");
      return;
    }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      try {
        done(drawDataUrl(img, file));
      } catch (e) {
        readRawFile(file, done);
      }
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      readRawFile(file, done);
    };
    img.src = url;
  }

  function addPhotos(card, files) {
    var index = Number(card.dataset.index);
    var item = items[index];
    if (!item) return;
    var list = Array.prototype.slice.call(files || []);
    var left = list.length;
    if (!left) return;
    setStatus("Reading pictures…");
    list.forEach(function (file) {
      fileToDataUrl(file, function (dataUrl, error) {
        left -= 1;
        if (dataUrl) item.photos.push(dataUrl);
        else if (error) setStatus(error, true);
        if (left > 0) return;
        items[index] = shop.normalize(item);
        persist("Updated pictures for “" + items[index].name + "”.");
        renderList();
      });
    });
  }

  function openEditor() {
    showEditor(true);
    shop.loadCatalog(function (loaded) {
      items = (loaded && loaded.length ? loaded : shop.defaultItems()).map(shop.normalize);
      renderList();
      setStatus(shop.readLocal() ? "Loaded your saved catalog." : "Loaded website catalog. Changes save on this computer.");
    });
  }

  function start() {
    if (!document.body.hasAttribute("data-admin-page")) return;
    cacheEls();
    bind();
    if (shop.getToken && shop.getToken()) {
      shop.verifyAdmin().then(function (ok) {
        if (ok) openEditor();
        else showEditor(false);
      });
    } else showEditor(false);
  }

  function addItem() {
    items.push(shop.normalize({
      name: "New item",
      price: "Email for price",
      meta: "",
      group: "homemade",
      photos: [],
      stock: 1
    }));
    persist("Added a new item. Change the name, price and photo when you have them.");
    renderList();
    if (list && list.lastElementChild) {
      list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function bind() {
    if (bound) return;
    bound = true;
    if (gate) {
      gate.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = gate.querySelector("button[type='submit']");
        if (btn) btn.disabled = true;
        shop.loginAdmin(passwordInput && passwordInput.value).then(function (ok) {
          if (btn) btn.disabled = false;
          if (ok) {
            if (errorEl) errorEl.hidden = true;
            if (passwordInput) passwordInput.value = "";
            openEditor();
          } else if (errorEl) {
            errorEl.hidden = false;
          }
        });
      });
    }
    if (list) {
      list.addEventListener("input", function (e) {
        if (e.target.matches("[data-photo-file], [data-photo-files]")) return;
        var card = e.target.closest(".admin-card");
        if (!card) return;
        readCard(card);
        if (e.target.dataset.field === "stock") {
          var note = card.querySelector(".admin-stock-note");
          var qty = items[Number(card.dataset.index)];
          if (note && qty) note.textContent = qty.stock > 0 ? "In stock" : "Out of stock";
        }
        scheduleSave();
      });
      list.addEventListener("change", function (e) {
        var card = e.target.closest(".admin-card");
        if (!card) return;
        if (e.target.matches("[data-photo-file], [data-photo-files]")) {
          var files = Array.prototype.slice.call(e.target.files || []);
          e.target.value = "";
          if (files.length) addPhotos(card, files);
          return;
        }
        readCard(card);
        if (e.target.dataset.field === "group") renderList();
        scheduleSave();
      });
      list.addEventListener("click", function (e) {
        var photoRm = e.target.closest("[data-photo-remove]");
        if (photoRm) {
          e.preventDefault();
          var card = photoRm.closest(".admin-card");
          var index = Number(card && card.dataset.index);
          var item = items[index];
          if (!item) return;
          var slot = Number(photoRm.dataset.photoRemove);
          item.photos.splice(slot, 1);
          items[index] = shop.normalize(item);
          persist("Removed a picture.");
          renderList();
          return;
        }
        var thumb = e.target.closest("[data-photo-i]");
        if (thumb) {
          var card2 = thumb.closest(".admin-card");
          var index2 = Number(card2 && card2.dataset.index);
          var item2 = items[index2];
          var slot2 = Number(thumb.dataset.photoI);
          if (!item2 || slot2 <= 0) return;
          var moved = item2.photos.splice(slot2, 1)[0];
          item2.photos.unshift(moved);
          items[index2] = shop.normalize(item2);
          persist("Set the main picture.");
          renderList();
          return;
        }
        var btn = e.target.closest("[data-remove]");
        if (!btn) return;
        var card = btn.closest(".admin-card");
        var index = Number(card && card.dataset.index);
        var item = items[index];
        if (!item) return;
        if (!confirm("Remove “" + item.name + "” from the shop?")) return;
        items.splice(index, 1);
        persist("Removed “" + item.name + "”.");
        renderList();
      });
    }
    document.querySelectorAll("[data-add]").forEach(function (btn) {
      btn.addEventListener("click", addItem);
    });
    var downloadBtn = document.querySelector("[data-download]");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        var payload = shop.writeLocal(items);
        if (shop.refresh) shop.refresh(items);
        var blob = new Blob([JSON.stringify({ items: payload.items }, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "stock.json";
        a.click();
        URL.revokeObjectURL(a.href);
        setStatus("Downloaded stock.json. Replace katie/stock.json and push to update the live shop for everyone.");
      });
    }
    var resetBtn = document.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!confirm("Throw away the catalog saved on this computer and reload the website catalog?")) return;
        shop.clearLocal();
        shop.fetchStock(function (loaded) {
          items = (loaded && loaded.length ? loaded : shop.defaultItems()).map(shop.normalize);
          renderList();
          if (shop.refresh) shop.refresh(items);
          setStatus("Reset to the website catalog.", true);
        });
      });
    }
    var logoutBtn = document.querySelector("[data-logout]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        shop.setAdmin(false);
        showEditor(false);
        if (passwordInput) passwordInput.focus();
      });
    }
  }

  start();
})();
