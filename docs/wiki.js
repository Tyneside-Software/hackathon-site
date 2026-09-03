function wiki() {
  return {
    catalog: { sections: [] },
    current: "home",
    html: "",
    status: "Loading wiki…",
    error: "",
    q: "",

    get sections() {
      const q = (this.q || "").trim().toLowerCase();
      return (this.catalog.sections || []).map((section) => {
        const pages = (section.pages || []).filter((p) => {
          if (!q) return true;
          const blob = [p.title, p.summary, p.id].join(" ").toLowerCase();
          return blob.indexOf(q) !== -1;
        });
        return Object.assign({}, section, { pages: pages });
      }).filter((s) => s.pages.length);
    },

    pageById(id) {
      const sections = this.catalog.sections || [];
      for (let i = 0; i < sections.length; i++) {
        const pages = sections[i].pages || [];
        for (let j = 0; j < pages.length; j++) {
          if (pages[j].id === id) return pages[j];
        }
      }
      return null;
    },

    allPages() {
      const out = [];
      (this.catalog.sections || []).forEach((s) => {
        (s.pages || []).forEach((p) => out.push(p));
      });
      return out;
    },

    hashId() {
      const raw = (location.hash || "").replace(/^#/, "").split("?")[0];
      return raw || this.catalog.default || "home";
    },

    async boot() {
      try {
        const res = await fetch("pages.json", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("pages.json HTTP " + res.status);
        this.catalog = await res.json();
        this.error = "";
        await this.open(this.hashId(), false);
      } catch (err) {
        this.error = "Could not load the wiki index. Serve the site over http://127.0.0.1:5500/docs/ (not file://). " + (err && err.message ? err.message : err);
        this.status = "Failed to load pages.json";
      }
      window.addEventListener("hashchange", () => this.open(this.hashId(), false));
    },

    async open(id, push) {
      const page = this.pageById(id) || this.pageById(this.catalog.default) || this.allPages()[0];
      if (!page) return;
      if (page.href) {
        location.href = page.href;
        return;
      }
      this.current = page.id;
      if (push !== false && location.hash.replace(/^#/, "") !== page.id) {
        history.pushState(null, "", "#" + page.id);
      }
      this.status = "Loading " + page.title + "…";
      this.html = "";
      try {
        const res = await fetch(page.file);
        if (!res.ok) throw new Error(page.file + " HTTP " + res.status);
        const md = await res.text();
        const parse = window.marked && (window.marked.parse || window.marked);
        if (typeof parse !== "function") throw new Error("marked.js did not load");
        this.html = this.linkify(parse(md));
        this.status = "";
        this.error = "";
        this.$nextTick(() => {
          const article = document.getElementById("wiki-article");
          if (article) article.scrollTop = 0;
          window.scrollTo(0, 0);
        });
      } catch (err) {
        this.error = String(err && err.message ? err.message : err);
        this.status = "Could not load this page.";
      }
    },

    linkify(html) {
      const pages = this.allPages();
      return html.replace(/href="([^"]+)"/g, (full, href) => {
        const file = href.replace(/^\.\//, "");
        const match = pages.find((p) => p.file === file || p.file === href);
        if (match) return 'href="#' + match.id + '"';
        if (href === "JAVASCRIPT.md") return 'href="#javascript"';
        if (href === "STACK.md") return 'href="#stack"';
        if (href.indexOf("../scripts/README.md") !== -1) return 'href="#board"';
        if (href.charAt(0) === "#") return full;
        return full;
      });
    },
  };
}
