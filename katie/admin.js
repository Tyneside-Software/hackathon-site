(function () {
  var shop = window.FidgetSquish;
  if (!shop) return;

  var items = [];
  var saveTimer = 0;
  var lock = document.querySelector("[data-lock]");
  var editor = document.querySelector("[data-editor]");
  var list = document.querySelector("[data-list]");
  var statusEl = document.querySelector("[data-status]");
  var gate = document.querySelector("[data-gate]");
  var errorEl = document.querySelector("[data-error]");
  var passwordInput = document.getElementById("pw");

  function setStatus(text, warn) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("is-warn", !!warn);
  }

  function showEditor(on) {
    if (lock) lock.hidden = on;
    if (editor) editor.hidden = !on;
  }

  function previewHtml(item) {
    var src = item.photos && item.photos[0];
    if (!src) return '<div class="empty"><strong>Photo</strong>Picture coming</div>';
    return '<img src="' + shop.esc(shop.assetUrl(src)) + '" alt="">';
  }

  function cardHtml(item, index) {
    return (
      '<article class="admin-card" data-index="' + index + '">' +
        '<div class="admin-preview">' + previewHtml(item) + "</div>" +
        '<div class="admin-fields">' +
          '<label>Name<input data-field="name" type="text" value="' + shop.esc(item.name) + '"></label>' +
          '<label>Price<input data-field="price" type="text" value="' + shop.esc(item.price) + '"></label>' +
          '<label class="wide">Description<input data-field="meta" type="text" value="' + shop.esc(item.meta) + '"></label>' +
          '<label>Section<select data-field="group">' +
            '<option value="squishies"' + (item.group === "squishies" ? " selected" : "") + ">Squishies</option>" +
            '<option value="homemade"' + (item.group === "homemade" ? " selected" : "") + ">Homemade</option>" +
            '<option value="slime"' + (item.group === "slime" ? " selected" : "") + ">Slime</option>" +
          "</select></label>" +
          '<label class="wide">Photos <span>(one path or link per line, e.g. photos/my-squishy.jpeg)</span>' +
            '<textarea data-field="photos">' + shop.esc((item.photos || []).join("\n")) + "</textarea>" +
          "</label>" +
          '<label class="admin-check wide"><input data-field="inStock" type="checkbox"' + (item.inStock ? " checked" : "") + "> In stock</label>" +
        "</div>" +
        '<div class="admin-card-foot"><button type="button" class="remove" data-remove>Remove</button></div>' +
      "</article>"
    );
  }

  function renderList() {
    if (!list) return;
    list.innerHTML = items.map(cardHtml).join("");
    list.querySelectorAll(".admin-preview img").forEach(function (img) {
      img.addEventListener("error", function () {
        var empty = document.createElement("div");
        empty.className = "empty";
        empty.innerHTML = "<strong>Photo</strong>Picture coming";
        img.replaceWith(empty);
      });
    });
  }

  function persist(message) {
    shop.writeLocal(items);
    setStatus(message || "Saved on this computer.");
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
      if (key === "inStock") item.inStock = field.checked;
      else if (key === "photos") item.photos = field.value;
      else item[key] = field.value;
    });
    items[index] = shop.normalize(item);
  }

  function openEditor() {
    showEditor(true);
    shop.loadCatalog(function (loaded) {
      items = (loaded && loaded.length ? loaded : shop.defaultItems()).map(shop.normalize);
      renderList();
      setStatus(shop.readLocal() ? "Loaded your saved catalog." : "Loaded website catalog. Changes save on this computer.");
    });
  }

  if (gate) {
    gate.addEventListener("submit", function (e) {
      e.preventDefault();
      if (shop.passwordOk(passwordInput && passwordInput.value)) {
        shop.setAdmin(true);
        if (errorEl) errorEl.hidden = true;
        if (passwordInput) passwordInput.value = "";
        openEditor();
      } else if (errorEl) {
        errorEl.hidden = false;
      }
    });
  }

  if (list) {
    list.addEventListener("input", function (e) {
      var card = e.target.closest(".admin-card");
      if (!card) return;
      readCard(card);
      if (e.target.dataset.field === "photos") {
        var preview = card.querySelector(".admin-preview");
        var item = items[Number(card.dataset.index)];
        if (preview && item) preview.innerHTML = previewHtml(item);
      }
      scheduleSave();
    });
    list.addEventListener("change", function (e) {
      var card = e.target.closest(".admin-card");
      if (!card) return;
      readCard(card);
      if (e.target.dataset.field === "group") renderList();
      scheduleSave();
    });
    list.addEventListener("click", function (e) {
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

  function addItem() {
    items.push(shop.normalize({
      name: "New item",
      price: "Email for price",
      meta: "",
      group: "homemade",
      photos: [],
      inStock: true
    }));
    persist("Added a new item. Change the name, price and photo when you have them.");
    renderList();
    if (list && list.lastElementChild) {
      list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", addItem);
  });

  var downloadBtn = document.querySelector("[data-download]");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      var payload = shop.writeLocal(items);
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
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

  if (shop.isAdmin()) openEditor();
  else showEditor(false);
})();
