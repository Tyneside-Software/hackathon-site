/* Interactive board. SQLite via the API when it answers, otherwise the
   snapshot committed with the site so the cards are still on the page. */
document.addEventListener("alpine:init", function () {
  Alpine.data("boardPage", function () {
    return {
      view: "board",
      source: "loading",
      api: "",
      people: [],
      columns: [],
      cards: [],
      filter: "all",
      query: "",
      selected: null,
      draft: {},
      editing: false,
      showAdd: false,
      adding: { title: "", person: "", hours: "", column: "todo", brief: "", tag: "", tag_kind: "wait", value: 3 },
      notice: "",
      error: "",
      busy: false,
      draggingId: "",
      dragKind: "",
      dropColumn: "",
      whoFor: "",
      whoCardId: "",
      whoSlot: "",
      whoLeft: 8,
      whoTop: 8,
      undoStack: [],
      redoStack: [],
      removeArmed: false,
      suppressClick: false,
      scrollLockY: 0,
      scrollLocked: false,
      _timer: 0,

      async boot() {
        this.view = document.body.dataset.boardView || "board";
        this.filter = this.readFilter();
        this.adding = this.blankAdd();
        this.loadHist();
        var self = this;
        window.addEventListener("scroll", function () { if (self.whoFor) self.closeWho(); }, true);
        window.addEventListener("resize", function () { if (self.whoFor) self.closeWho(); });
        await this.load();
        this.openFromHash();
      },

      defaultColumns() {
        return [
          { id: "backlog", label: "Backlog", empty: "Nothing waiting. Add a card, or send one back from the board." },
          { id: "todo", label: "To do", empty: "Nothing here." },
          { id: "next", label: "Next", empty: "Nothing lined up." },
          { id: "doing", label: "In progress", empty: "Empty on purpose. Pull a card and ship it." },
          { id: "ready", label: "Ready to deploy", empty: "Nothing ready to deploy." },
          { id: "done", label: "Done", empty: "Nothing finished yet." }
        ];
      },

      readFilter() {
        return (new URLSearchParams(location.search).get("person") || "all").toLowerCase();
      },

      apiBases() {
        var live = String(window.HACKATHON_API || "").replace(/\/$/, "");
        var bases = [];
        var host = location.hostname;
        if (host === "127.0.0.1" || host === "localhost") bases.push("http://127.0.0.1:8080");
        if (live && bases.indexOf(live) === -1) bases.push(live);
        return bases;
      },

      async load() {
        var bases = this.apiBases();
        for (var i = 0; i < bases.length; i++) {
          try {
            var res = await fetch(bases[i] + "/v1/board", {
              cache: "no-store",
              headers: { Accept: "application/json" },
              signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
            });
            if (!res.ok) continue;
            var data = await res.json();
            if (!data || !Array.isArray(data.cards)) continue;
            this.api = bases[i];
            this.apply(data, "api");
            return;
          } catch (err) {
            /* try the next base, then the snapshot */
          }
        }
        this.api = "";
        try {
          var snap = await fetch("board-snapshot.json", { cache: "no-store", headers: { Accept: "application/json" } });
          if (!snap.ok) throw new Error("snapshot " + snap.status);
          this.apply(await snap.json(), "snapshot");
        } catch (err) {
          this.source = "error";
          this.error = "The board could not be loaded from the API or from board-snapshot.json.";
        }
      },

      apply(data, source) {
        var openId = this.selected && this.selected.id;
        this.source = source;
        if (source !== "api") this.api = "";
        this.people = Array.isArray(data.people) && data.people.length ? data.people : [];
        this.columns = Array.isArray(data.columns) && data.columns.length ? data.columns : this.defaultColumns();
        this.cards = (data.cards || []).map(function (card) {
          var copy = Object.assign({}, card);
          delete copy.events;
          return copy;
        });
        if (this.filter !== "all" && !this.people.some(function (p) { return p.id === this.filter; }, this)) {
          /* keep a filter from the URL even before people load */
        }
        if (openId) {
          this.selected = this.cards.find(function (card) { return card.id === openId; }) || null;
          if (!this.selected && this.$refs.dlg && this.$refs.dlg.open) this.$refs.dlg.close();
        }
      },

      async reload() {
        if (!this.api) return;
        var res = await fetch(this.api + "/v1/board", { cache: "no-store", headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("Could not reload the board.");
        this.apply(await res.json(), "api");
      },

      async send(method, path, body) {
        var opts = { method: method, headers: { Accept: "application/json" } };
        if (body !== undefined) {
          opts.headers["Content-Type"] = "application/json";
          opts.body = JSON.stringify(body);
        }
        var res = await fetch(this.api + path, opts);
        var data = {};
        try { data = await res.json(); } catch (err) { data = {}; }
        if (!res.ok) {
          var detail = data && data.detail;
          throw new Error(typeof detail === "string" ? detail : "The board could not save that.");
        }
        this.api = this.api || "";
        this.apply(data, "api");
        this.api = this._keptApi || this.api;
        return data;
      },

      pageTitle() {
        return { board: "Work board", backlog: "Backlog", todo: "To do", done: "Done" }[this.view] || "Board";
      },

      intro() {
        if (this.view === "backlog") {
          return "Work that is not on the board yet. To board puts a card on To do. A card can move to any column, including back.";
        }
        if (this.view === "todo") {
          return "Everything still to do. Drag to reorder, or send a card to the backlog. Click a name tag to switch the person. Open a card for the note.";
        }
        if (this.view === "done") {
          return "Finished increments. Open a card for the note. Drag a card back onto the board when it is not finished.";
        }
        return "Drag a card between columns, or onto the Done count to finish it. Done cards stay on the done page. To do is the wide column, two cards to a row. Click a name tag to switch the person. The backlog is a side pile.";
      },

      statusText() {
        if (this.source === "loading") return "Loading the board…";
        if (this.source === "api") {
          return "Saved in SQLite.";
        }
        if (this.source === "snapshot") {
          return "Showing the cards stored in the site source. The API board is not reachable, so this page is read-only and nothing has been dropped.";
        }
        return "The board could not be loaded.";
      },

      banner() {
        var self = this;
        var bits = ["backlog", "todo", "next", "doing", "ready", "done"].map(function (id) {
          var col = self.columns.find(function (item) { return item.id === id; });
          var label = col ? col.label : id;
          return self.sorted(id).length + " " + label.toLowerCase();
        });
        return bits.join(" · ");
      },

      filterStatus() {
        var who = this.filter === "all" ? "everyone" : (this.filter === "none" ? "unassigned cards" : this.personName(this.filter));
        var rows = this.cards.filter(function (card) {
          return this.passes(card) && this.shownColumns().some(function (col) { return col.id === card.column; });
        }, this);
        var line = "Showing " + who + " — " + rows.length + " card" + (rows.length === 1 ? "" : "s") + " on this page.";
        if ((this.query || "").trim()) line += " Matching \"" + this.query.trim() + "\".";
        return line;
      },

      shownColumns() {
        var ids = this.view === "board" ? ["todo", "next", "doing", "ready"] : [this.view];
        var self = this;
        return ids.map(function (id) {
          return self.columns.find(function (col) { return col.id === id; });
        }).filter(Boolean);
      },

      personName(id) {
        var person = this.people.find(function (row) { return row.id === id; });
        return person ? person.name : (id || "");
      },

      columnLabel(id) {
        var col = this.columns.find(function (item) { return item.id === id; });
        return col ? col.label : id;
      },

      fmtHours(n) {
        if (n == null || n === "") return "";
        var rounded = Math.round(Number(n) * 100) / 100;
        if (Number.isNaN(rounded)) return "";
        return Number.isInteger(rounded) ? String(rounded) : String(rounded);
      },

      cardOwners(card) {
        if (!card) return [];
        if (Array.isArray(card.owners)) return card.owners.filter(Boolean);
        return card.person ? [card.person] : [];
      },

      ownerLine(card) {
        var self = this;
        var names = this.cardOwners(card).map(function (id) { return self.personName(id); });
        return names.length ? names.join(", ") : "Unassigned";
      },

      plainNote(card) {
        return String(card && card.brief || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/\s+/g, " ")
          .trim();
      },

      notePreview(card) {
        var text = this.plainNote(card);
        if (!text || text === String(card.title || "").trim()) return "";
        return text.length > 160 ? text.slice(0, 157).trim() + "…" : text;
      },

      valueMarks(n) {
        var on = Math.max(0, Math.min(5, Number(n) || 0));
        if (!on) return "";
        return "$".repeat(on) + "·".repeat(5 - on);
      },

      hoursLabel(rows) {
        var known = rows.filter(function (card) { return card.hours != null && card.hours !== ""; });
        var hours = known.reduce(function (sum, card) { return sum + Number(card.hours || 0); }, 0);
        var missing = rows.length - known.length;
        return this.fmtHours(hours) + "h" + (missing ? " + ∅" : "");
      },

      passes(card) {
        var owners = this.cardOwners(card);
        if (this.filter === "none") {
          if (owners.length) return false;
        } else if (this.filter !== "all" && owners.indexOf(this.filter) === -1) {
          return false;
        }
        var q = (this.query || "").trim().toLowerCase();
        if (!q) return true;
        var blob = (String(card.title || "") + " " + this.plainNote(card) + " " + String(card.id || "")).toLowerCase();
        return blob.indexOf(q) !== -1;
      },

      sorted(column) {
        return this.cards.filter(function (card) { return card.column === column; }).slice().sort(function (a, b) {
          return (a.rank || 0) - (b.rank || 0) || String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
        });
      },

      visible(column) {
        var self = this;
        return this.sorted(column).filter(function (card) { return self.passes(card); });
      },

      columnCount(id) {
        var rows = this.visible(id);
        return rows.length + " · " + this.hoursLabel(rows);
      },

      groups(column) {
        var cards = this.visible(column);
        var self = this;
        var keys = this.people.map(function (person) { return person.id; }).concat([""]);
        return keys.map(function (key) {
          var mine = cards.filter(function (card) {
            var owners = self.cardOwners(card);
            return (owners[0] || "") === key;
          });
          if (!mine.length) return null;
          var person = self.people.find(function (row) { return row.id === key; });
          return {
            key: key || "none",
            name: person ? person.name : "Unassigned",
            cards: mine,
            hours: self.hoursLabel(mine)
          };
        }).filter(Boolean);
      },

      progress() {
        var done = this.cards.filter(function (card) { return card.column === "done"; });
        var pct = this.cards.length ? Math.round(100 * done.length / this.cards.length) : 0;
        return {
          pct: pct,
          label: done.length + " of " + this.cards.length + " cards done · " + this.hoursLabel(done) + " of " + this.hoursLabel(this.cards) + " estimated"
        };
      },

      emptyText(col) {
        if (this.filter === "all") return col.empty || "Nothing here.";
        return "No cards for " + this.personName(this.filter) + " here.";
      },

      heldBy(card, id) {
        if (id === "none") return this.cardOwners(card).length === 0;
        return this.cardOwners(card).indexOf(id) !== -1;
      },

      stats(id) {
        var self = this;
        var cards = this.cards.filter(function (card) { return self.heldBy(card, id); });
        var bits = [];
        this.columns.forEach(function (col) {
          var n = cards.filter(function (card) { return card.column === col.id; }).length;
          if (!n) return;
          var word = { backlog: "backlog", todo: "to do", next: "next", doing: "in progress", ready: "ready", done: "done" }[col.id] || col.label;
          bits.push(n + " " + word);
        });
        return { hours: this.hoursLabel(cards).replace("h", ""), meta: bits.join(" · ") || "no cards", count: cards.length };
      },

      claimed(id) {
        var self = this;
        return this.cards.filter(function (card) { return self.heldBy(card, id); }).map(function (card) {
          var hours = card.hours == null ? "∅" : self.fmtHours(card.hours) + "h";
          return card.title + " (" + hours + ", " + self.columnLabel(card.column) + ")";
        }).join(" · ");
      },

      pageHref(page) {
        return this.filter === "all" ? page : page + "?person=" + encodeURIComponent(this.filter);
      },

      setFilter(id) {
        this.filter = id || "all";
        var url = new URL(location.href);
        if (this.filter === "all") url.searchParams.delete("person");
        else url.searchParams.set("person", this.filter);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      },

      togglePerson(id) {
        this.setFilter(this.filter === id ? "all" : id);
      },

      writable() {
        return this.source === "api" && !!this.api;
      },

      blankAdd() {
        var column = this.view === "backlog" || this.view === "done" || this.view === "todo" ? this.view : "todo";
        return {
          title: "",
          person: "",
          hours: "",
          column: column,
          brief: "",
          tag: "",
          tag_kind: "wait",
          value: 3
        };
      },

      flash(text) {
        this.notice = text;
        this.error = "";
        clearTimeout(this._timer);
        var self = this;
        this._timer = setTimeout(function () { self.notice = ""; }, 4000);
      },

      onCardDragStart(event, card) {
        if (!this.writable()) {
          event.preventDefault();
          return;
        }
        var node = event.target && event.target.nodeType === 1 ? event.target : event.target.parentElement;
        if (node && node.closest && node.closest("button, a, input, textarea, select")) {
          event.preventDefault();
          return;
        }
        this.dragKind = "card";
        this.draggingId = card.id;
        this._heldId = card.id;
        this.suppressClick = true;
        try { event.dataTransfer.setData("text/plain", card.id); } catch (err) {}
        event.dataTransfer.effectAllowed = "move";
      },

      onDragEnd() {
        var self = this;
        setTimeout(function () {
          self.draggingId = "";
          self.dragKind = "";
          self._heldId = "";
          self.dropColumn = "";
          var stale = document.querySelectorAll(".board-ui .is-drop");
          for (var i = 0; i < stale.length; i++) stale[i].classList.remove("is-drop");
        }, 0);
      },

      onDragOver(event, columnId) {
        if (!this.writable()) return;
        if (this.dragKind !== "card" && !this._heldId) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        var zone = event.currentTarget;
        if (this.dropColumn !== columnId) {
          var stale = document.querySelectorAll(".board-ui .is-drop");
          for (var i = 0; i < stale.length; i++) {
            if (stale[i] !== zone) stale[i].classList.remove("is-drop");
          }
          this.dropColumn = columnId;
        }
        if (zone && zone.classList) zone.classList.add("is-drop");
      },

      onDragLeave(event, columnId) {
        if (this.dropColumn !== columnId) return;
        var next = event.relatedTarget;
        if (next && event.currentTarget.contains(next)) return;
        var box = event.currentTarget.getBoundingClientRect();
        var x = event.clientX;
        var y = event.clientY;
        if (x > box.left && x < box.right && y > box.top && y < box.bottom) return;
        this.dropColumn = "";
        if (event.currentTarget.classList) event.currentTarget.classList.remove("is-drop");
      },

      onDrop(event, columnId) {
        if (!columnId) return;
        event.preventDefault();
        var raw = "";
        try { raw = event.dataTransfer ? event.dataTransfer.getData("text/plain") : ""; } catch (err) { raw = ""; }
        var id = this._heldId || this.draggingId || raw;
        if (!id) return;
        var el = event.target.closest ? event.target.closest("[data-card-id]") : null;
        var beforeId = el ? el.getAttribute("data-card-id") : "";
        this.dropColumn = "";
        this.requestMove(id, columnId, beforeId);
      },

      orderAfter(columnId, cardId, beforeId) {
        var dest = this.sorted(columnId).filter(function (card) { return card.id !== cardId; });
        if (!beforeId || beforeId === cardId) return dest.map(function (card) { return card.id; }).concat([cardId]);
        var ids = [];
        var placed = false;
        dest.forEach(function (card) {
          if (card.id === beforeId && !placed) {
            ids.push(cardId);
            placed = true;
          }
          ids.push(card.id);
        });
        if (!placed) ids.push(cardId);
        return ids;
      },

      requestMove(id, columnId, beforeId) {
        if (!this.writable()) {
          this.error = "This copy is read-only. The cards are still in the site source.";
          return;
        }
        var card = this.cards.find(function (item) { return item.id === id; });
        if (!card) return;
        if (card.column === columnId && (!beforeId || beforeId === id)) return;
        var order = this.orderAfter(columnId, id, beforeId);
        this.commitMove(id, columnId, order, "");
      },

      async commitMove(id, columnId, order, reason) {
        var card = this.cards.find(function (item) { return item.id === id; });
        if (!card) return;
        var fromColumn = card.column;
        var fromOrder = this.sorted(fromColumn).map(function (item) { return item.id; });
        this._keptApi = this.api;
        this.busy = true;
        this.error = "";
        try {
          if (fromColumn !== columnId) {
            await this.send("POST", "/v1/board/cards/" + encodeURIComponent(id) + "/move", {
              column: columnId,
              reason: reason || ""
            });
            this.remember("Move " + id, {
              op: "move",
              id: id,
              column: fromColumn,
              reason: "",
              order: fromOrder
            }, {
              op: "move",
              id: id,
              column: columnId,
              reason: reason || "",
              order: order
            });
          }
          await this.send("POST", "/v1/board/reorder", { column: columnId, ids: order });
          if (fromColumn === columnId) {
            this.remember("Reorder " + id, {
              op: "reorder",
              column: columnId,
              order: fromOrder
            }, {
              op: "reorder",
              column: columnId,
              order: order
            });
          }
          this.flash("Card " + id + " is in " + this.columnLabel(columnId) + ".");
        } catch (err) {
          this.error = err.message || "Could not save that move.";
          try { await this.reload(); } catch (ignore) { /* the error above stands */ }
        } finally {
          this.busy = false;
        }
      },

      moveTo(columnId) {
        if (!this.selected) return;
        this.requestMove(this.selected.id, columnId, "");
      },

      editCard(card) {
        this.suppressClick = false;
        this.openCard(card);
        this.editing = true;
      },

      lockPageScroll() {
        if (this.scrollLocked) return;
        this.scrollLockY = window.scrollY || window.pageYOffset || 0;
        document.body.style.top = "-" + this.scrollLockY + "px";
        document.documentElement.classList.add("card-modal-open");
        this.scrollLocked = true;
      },

      unlockPageScroll() {
        if (!this.scrollLocked) return;
        document.documentElement.classList.remove("card-modal-open");
        document.body.style.top = "";
        this.scrollLocked = false;
        window.scrollTo(0, this.scrollLockY);
      },

      openCard(card) {
        if (this.suppressClick) {
          this.suppressClick = false;
          return;
        }
        this.selected = card;
        this.draft = {
          title: card.title,
          owners: this.cardOwners(card).slice(),
          hours: card.hours == null ? "" : card.hours,
          tag: card.tag || "",
          tag_kind: card.tag_kind || "wait",
          brief: card.brief || "",
          value: card.value == null ? "" : card.value,
          column: card.column
        };
        this.editing = false;
        this.removeArmed = false;
        var url = new URL(location.href);
        url.hash = "t-" + card.id;
        history.replaceState(null, "", url.pathname + url.search + url.hash);
        this.lockPageScroll();
        if (this.$refs.dlg && !this.$refs.dlg.open) this.$refs.dlg.showModal();
      },

      closeCard() {
        if (this.$refs.dlg && this.$refs.dlg.open) this.$refs.dlg.close();
      },

      onDialogClose() {
        this.editing = false;
        this.unlockPageScroll();
        var url = new URL(location.href);
        if (/^t-/i.test((url.hash || "").replace(/^#/, ""))) {
          url.hash = "";
          history.replaceState(null, "", url.pathname + url.search);
        }
      },

      openFromHash() {
        var match = (location.hash || "").match(/^#t-(\d+)$/i);
        if (!match) return;
        var id = match[1].padStart(2, "0");
        var card = this.cards.find(function (item) { return item.id === id || item.id === match[1]; });
        if (card) this.openCard(card);
      },

      freshId(before) {
        var created = this.cards.find(function (card) { return !before[card.id]; });
        return created ? created.id : "";
      },

      snapshotCard(card) {
        return {
          id: card.id,
          title: card.title,
          owners: this.cardOwners(card).slice(),
          hours: card.hours == null ? null : card.hours,
          column: card.column,
          brief: card.brief || "",
          tag: card.tag || "",
          tag_kind: card.tag_kind || "",
          value: card.value == null ? null : card.value
        };
      },

      patchBody(card, reason) {
        return {
          title: card.title,
          owners: card.owners,
          hours: card.hours,
          brief: card.brief,
          tag: card.tag,
          tag_kind: card.tag_kind,
          value: card.value,
          column: card.column,
          reason: reason || ""
        };
      },

      async addCard() {
        if (!this.writable()) {
          this.error = "This copy is read-only. The cards are still in the site source.";
          return;
        }
        var before = {};
        this.cards.forEach(function (card) { before[card.id] = true; });
        var hours = this.adding.hours === "" || this.adding.hours == null ? null : Number(this.adding.hours);
        var owners = this.adding.person ? [this.adding.person] : [];
        this._keptApi = this.api;
        this.busy = true;
        try {
          await this.send("POST", "/v1/board/cards", {
            title: this.adding.title,
            owners: owners,
            hours: hours,
            column: this.adding.column,
            brief: this.adding.brief,
            tag: this.adding.tag,
            tag_kind: this.adding.tag ? (this.adding.tag_kind || "wait") : "",
            value: this.adding.value === "" ? null : Number(this.adding.value)
          });
          var id = this.freshId(before);
          var created = this.cards.find(function (card) { return card.id === id; });
          if (created) {
            this.remember("Add " + id, { op: "delete", id: id }, { op: "create", card: this.snapshotCard(created) });
          }
          this.showAdd = false;
          this.adding = this.blankAdd();
          this.flash("Card added.");
        } catch (err) {
          this.error = err.message;
        } finally {
          this.busy = false;
        }
      },

      async saveEdit() {
        if (!this.selected) return;
        var previous = this.snapshotCard(this.selected);
        var nextColumn = this.draft.column || previous.column;
        var hours = this.draft.hours === "" || this.draft.hours == null ? null : Number(this.draft.hours);
        var body = {
          title: this.draft.title,
          owners: (this.draft.owners || []).slice(),
          hours: hours,
          brief: this.draft.brief,
          tag: this.draft.tag,
          tag_kind: this.draft.tag ? (this.draft.tag_kind || "wait") : "",
          value: this.draft.value === "" || this.draft.value == null ? null : Number(this.draft.value),
          column: nextColumn
        };
        this._keptApi = this.api;
        this.busy = true;
        try {
          await this.send("PATCH", "/v1/board/cards/" + encodeURIComponent(previous.id), body);
          var after = this.cards.find(function (card) { return card.id === previous.id; });
          if (after) {
            this.remember(
              "Edit " + previous.id,
              { op: "patch", id: previous.id, body: this.patchBody(previous, "") },
              { op: "patch", id: previous.id, body: this.patchBody(this.snapshotCard(after), "") }
            );
          }
          this.editing = false;
          this.flash("Saved card " + previous.id + ".");
        } catch (err) {
          this.error = err.message;
        } finally {
          this.busy = false;
        }
      },

      async duplicateCard(card) {
        var source = card && card.id ? card : this.selected;
        if (!source) return;
        var before = {};
        this.cards.forEach(function (item) { before[item.id] = true; });
        this._keptApi = this.api;
        this.busy = true;
        try {
          await this.send("POST", "/v1/board/cards/" + encodeURIComponent(source.id) + "/duplicate", {});
          var id = this.freshId(before);
          var created = this.cards.find(function (item) { return item.id === id; });
          if (created) {
            this.remember("Duplicate " + source.id, { op: "delete", id: id }, { op: "create", card: this.snapshotCard(created) });
          }
          this.flash("Copied card " + source.id + ".");
        } catch (err) {
          this.error = err.message;
        } finally {
          this.busy = false;
        }
      },

      async removeCard() {
        if (!this.selected) return;
        if (!this.removeArmed) {
          this.removeArmed = true;
          return;
        }
        var snap = this.snapshotCard(this.selected);
        this._keptApi = this.api;
        this.busy = true;
        try {
          await this.send("DELETE", "/v1/board/cards/" + encodeURIComponent(snap.id) );
          this.remember("Remove " + snap.id, { op: "create", card: snap }, { op: "delete", id: snap.id });
          this.closeCard();
          this.flash("Removed card " + snap.id + ".");
        } catch (err) {
          this.error = err.message;
        } finally {
          this.busy = false;
          this.removeArmed = false;
        }
      },

      whoMenuStyle() {
        return "left:" + this.whoLeft + "px;top:" + this.whoTop + "px;";
      },

      toggleWho(event, card, slot) {
        if (!this.writable() || !card) return;
        var key = card.id + ":" + (slot || "");
        if (this.whoFor === key) {
          this.closeWho();
          return;
        }
        var rect = event.currentTarget.getBoundingClientRect();
        var width = 196;
        var height = 248;
        var left = rect.left;
        if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
        if (left < 8) left = 8;
        var top = rect.bottom + 6;
        if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
        this.whoLeft = left;
        this.whoTop = top;
        this.whoFor = key;
        this.whoCardId = card.id;
        this.whoSlot = slot || "";
        var menu = this.$refs.whoMenu;
        if (!menu) return;
        menu.style.left = left + "px";
        menu.style.top = top + "px";
        if (!menu.matches(":popover-open") && menu.showPopover) menu.showPopover();
      },

      closeWho() {
        this.whoFor = "";
        this.whoCardId = "";
        this.whoSlot = "";
        var menu = this.$refs.whoMenu;
        if (menu && menu.hidePopover && menu.matches(":popover-open")) menu.hidePopover();
      },

      onWhoAway(event) {
        if (!this.whoFor) return;
        var node = event.target;
        if (node && node.closest && (node.closest(".who-menu") || node.closest(".who-tag"))) return;
        this.closeWho();
      },

      onDialogCancel() {
        if (this.whoFor) {
          this.closeWho();
          return;
        }
        this.closeCard();
      },

      async choosePerson(personId) {
        var card = this.cards.find(function (item) { return item.id === this.whoCardId; }, this);
        var slot = this.whoSlot;
        this.closeWho();
        if (!card || !this.writable()) return;
        var have = this.cardOwners(card);
        var next;
        if (!personId) {
          if (!slot) return;
          next = have.filter(function (id) { return id !== slot; });
        } else if (!slot) {
          next = [personId];
        } else if (slot === personId) {
          return;
        } else {
          var seen = {};
          next = [];
          have.forEach(function (id) {
            var use = id === slot ? personId : id;
            if (seen[use]) return;
            seen[use] = true;
            next.push(use);
          });
        }
        if (next.join("|") === have.join("|")) return;
        this._keptApi = this.api;
        this.busy = true;
        try {
          await this.send("PATCH", "/v1/board/cards/" + encodeURIComponent(card.id), { owners: next });
          var label = !next.length
            ? ("No one on " + card.id)
            : (personId ? (this.personName(personId) + " on " + card.id) : (this.personName(slot) + " off " + card.id));
          this.remember(label, { op: "patch", id: card.id, body: { owners: have } }, { op: "patch", id: card.id, body: { owners: next } });
          if (this.selected && this.selected.id === card.id) this.draft.owners = next.slice();
          var said = !next.length
            ? ("No one is on card " + card.id + ".")
            : (personId ? (this.personName(personId) + " is on card " + card.id + ".") : (this.personName(slot) + " is off card " + card.id + "."));
          this.flash(said);
        } catch (err) {
          this.error = err.message;
        } finally {
          this.busy = false;
        }
      },

      quickMove(card, columnId) {
        this.requestMove(card.id, columnId, "");
      },

      loadHist() {
        try {
          var raw = JSON.parse(sessionStorage.getItem("hackathon-board-undo") || "null");
          if (!raw || !Array.isArray(raw.undo)) return;
          this.undoStack = raw.undo;
          this.redoStack = Array.isArray(raw.redo) ? raw.redo : [];
        } catch (err) { /* a bad stash is ignored */ }
      },

      persistHist() {
        try {
          if (!this.undoStack.length && !this.redoStack.length) sessionStorage.removeItem("hackathon-board-undo");
          else sessionStorage.setItem("hackathon-board-undo", JSON.stringify({ undo: this.undoStack, redo: this.redoStack }));
        } catch (err) { /* the buttons still work for this page view */ }
      },

      remember(label, undo, redo) {
        this.undoStack.push({ label: label, undo: undo, redo: redo });
        if (this.undoStack.length > 30) this.undoStack.shift();
        this.redoStack = [];
        this.persistHist();
      },

      undoLabel() {
        var step = this.undoStack[this.undoStack.length - 1];
        return step ? ("Undo: " + step.label) : "Nothing to undo";
      },

      redoLabel() {
        var step = this.redoStack[this.redoStack.length - 1];
        return step ? ("Redo: " + step.label) : "Nothing to redo";
      },

      async runStep(step) {
        if (!step) return;
        if (step.op === "move") {
          await this.send("POST", "/v1/board/cards/" + encodeURIComponent(step.id) + "/move", {
            column: step.column,
            reason: step.reason || ""
          });
          if (step.order) {
            await this.send("POST", "/v1/board/reorder", { column: step.column, ids: step.order });
          }
        } else if (step.op === "reorder") {
          await this.send("POST", "/v1/board/reorder", { column: step.column, ids: step.order });
        } else if (step.op === "patch") {
          await this.send("PATCH", "/v1/board/cards/" + encodeURIComponent(step.id), step.body || {});
        } else if (step.op === "delete") {
          await this.send("DELETE", "/v1/board/cards/" + encodeURIComponent(step.id));
        } else if (step.op === "create") {
          var card = step.card || {};
          await this.send("POST", "/v1/board/cards", {
            id: card.id,
            title: card.title,
            owners: card.owners || [],
            hours: card.hours,
            column: card.column,
            brief: card.brief || "",
            tag: card.tag || "",
            tag_kind: card.tag_kind || "",
            value: card.value
          });
        }
      },

      async undo() {
        if (!this.undoStack.length || !this.writable() || this.busy) return;
        var step = this.undoStack.pop();
        this.busy = true;
        try {
          await this.runStep(step.undo);
          this.redoStack.push(step);
          this.persistHist();
          this.flash("Undid " + step.label + ".");
        } catch (err) {
          this.undoStack.push(step);
          this.error = err.message;
          try { await this.reload(); } catch (ignore) { /* the error above stands */ }
        } finally {
          this.busy = false;
        }
      },

      async redo() {
        if (!this.redoStack.length || !this.writable() || this.busy) return;
        var step = this.redoStack.pop();
        this.busy = true;
        try {
          await this.runStep(step.redo);
          this.undoStack.push(step);
          this.persistHist();
          this.flash("Redid " + step.label + ".");
        } catch (err) {
          this.redoStack.push(step);
          this.error = err.message;
          try { await this.reload(); } catch (ignore) { /* the error above stands */ }
        } finally {
          this.busy = false;
        }
      },

      onKey(event) {
        if (event.key === "Escape" && this.whoFor) {
          event.preventDefault();
          event.stopPropagation();
          this.closeWho();
          return;
        }
        var tag = event.target && event.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (!(event.ctrlKey || event.metaKey)) return;
        var key = String(event.key || "").toLowerCase();
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) this.redo();
          else this.undo();
        } else if (key === "y") {
          event.preventDefault();
          this.redo();
        }
      }
    };
  });
});
