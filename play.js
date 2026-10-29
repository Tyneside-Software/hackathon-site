(function () {
  document.documentElement.dataset.page = "taxi-game";
  const monument = [54.9783, -1.6178];
  const map = L.map("play-map");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  const circle = L.circle(monument, {
    radius: 80467,
    color: "#054a9e",
    weight: 2,
    fillColor: "#00BFFF",
    fillOpacity: 0.08,
    interactive: false
  }).addTo(map);
  map.setView(monument, 10);
  map.fitBounds(circle.getBounds());
  function seatPlayScreen() {
    const nav = document.querySelector(".site-nav");
    const top = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty("--play-nav", top + "px");
    map.invalidateSize();
    keepDepotClear();
    keepStatusClear();
    requestAnimationFrame(function () {
      map.invalidateSize();
      keepDepotClear();
    });
  }
  function keepStatusClear() {
    const status = document.getElementById("play-status");
    const zoom = document.querySelector("#play-map .leaflet-control-zoom");
    const node = document.getElementById("play-zoom-clear");
    if (!status) return;
    status.style.marginLeft = "0px";
    if (zoom) {
      const zoomBox = zoom.getBoundingClientRect();
      let box = status.getBoundingClientRect();
      const hits = function (rect) {
        return rect.left < zoomBox.right && rect.right > zoomBox.left && rect.top < zoomBox.bottom && rect.bottom > zoomBox.top;
      };
      if (hits(box)) status.style.marginLeft = Math.ceil(zoomBox.right - box.left + 12) + "px";
      box = status.getBoundingClientRect();
      if (node) node.dataset.cover = hits(box) ? "covers" : "clear";
    } else if (node) {
      node.dataset.cover = "clear";
    }
    if (node) node.dataset.zoom = zoom ? "control" : "absent";
  }
  function keepDepotClear() {
    const money = document.getElementById("play-money");
    const mapEl = document.getElementById("play-map");
    const node = document.getElementById("play-depot-clear");
    if (!money || !mapEl) return;
    const pin = map.latLngToContainerPoint(L.latLng(55.0367, -1.5075));
    const mapBox = mapEl.getBoundingClientRect();
    const x = mapBox.left + pin.x;
    const y = mapBox.top + pin.y;
    money.style.marginTop = "0px";
    let box = money.getBoundingClientRect();
    const hits = function (rect) {
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };
    if (hits(box)) money.style.marginTop = Math.ceil(y - box.top + 36) + "px";
    box = money.getBoundingClientRect();
    const clear = !hits(box);
    if (node) {
      node.dataset.cover = clear ? "clear" : "covers";
      node.dataset.pin = "55.0367,-1.5075";
    }
  }
  seatPlayScreen();
  map.fitBounds(circle.getBounds());
  window.addEventListener("resize", seatPlayScreen);
  map.on("moveend", keepDepotClear);
  map.on("click", fillLoiterPoint);
  function clearBusToggle() {
    document.querySelectorAll("button, input, select").forEach((node) => {
      const label = ((node.textContent || "") + " " + (node.id || "") + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (label.indexOf("bus") === -1) return;
      node.remove();
    });
  }
  function clearOfficeGrid() {
    document.querySelectorAll(".office-grid, #quote-form, #quote-result, #btn-quote, #btn-add, #empty-book, #ledger-slips, #day-ledger, #ledger-total").forEach((node) => {
      if (!node || node.id === "play-ledger" || node.id === "play-office-grid") return;
      node.remove();
    });
  }
  function clearPhoneList() {
    document.querySelectorAll("ul, ol, section, button, h2, h3").forEach((node) => {
      if (!node || node.id === "play-phones") return;
      const label = ((node.id || "") + " " + String(node.className || "") + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (label.indexOf("phone") === -1) return;
      node.remove();
    });
  }
  function clearPlaceStops() {
    document.querySelectorAll("button, input, select").forEach((node) => {
      if (!node || node.id === "play-stops") return;
      const label = ((node.textContent || "") + " " + (node.id || "") + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (label.indexOf("place stops") === -1 && node.id !== "btn-stops") return;
      node.remove();
    });
  }
  function keepPlayMoney() {
    const screen = document.getElementById("play-screen");
    const money = document.getElementById("play-money");
    if (screen) screen.hidden = false;
    if (money) money.hidden = false;
  }

  function seatPlayLocks() {
    const under = document.getElementById("play-under-map");
    const mapEl = document.getElementById("play-map");
    const screen = document.getElementById("play-screen");
    const desk = document.getElementById("play-desk");
    if (!under || !mapEl) return;
    if (desk && desk.contains(mapEl)) {
      if (under.previousElementSibling !== desk) desk.insertAdjacentElement("afterend", under);
    } else if (screen && screen.contains(mapEl)) {
      if (under.previousElementSibling !== screen) screen.insertAdjacentElement("afterend", under);
    } else if (mapEl.parentNode && under.previousElementSibling !== mapEl) {
      mapEl.insertAdjacentElement("afterend", under);
    }
    [
      "play-moving",
      "play-bought-moves",
      "play-bought-trail",
      "play-trail-colour",
      "play-trail-order",
      "play-trail-age",
      "play-trail-replace",
      "play-trail-chip",
      "play-depot-chip",
      "play-t11-only",
      "play-price-still",
      "play-buy-flight",
      "play-buy-once",
      "play-spent-feed",
      "play-fare-in",
      "play-buy-reject",
      "play-started-screen",
      "play-started-ten",
      "play-signed-again",
      "play-cash-pence",
      "play-depot-clear",
      "play-zoom-clear",
      "play-signout-flight",
      "play-next-account",
      "play-fare-t12",
      "play-next-feed",
      "play-feed-401",
      "play-fare-name",
      "play-buy-cleared",
      "play-with-passenger",
      "play-signout-failed",
      "play-driver-share",
      "play-to-passenger",
      "play-fare-riding",
      "play-signed-chips",
      "play-person-waiting",
      "play-person-stays",
      "play-person-sign",
      "play-car-job",
      "play-job-feed",
      "play-next-failed",
      "play-next-trail",
      "play-next-fares",
      "play-feed-401-fares",
      "play-feed-401-failed",
      "play-feed-401-chips",
      "play-signout-fares",
      "play-quiet-failed",
      "play-quiet-spent",
      "play-quiet-fares",
      "play-quiet-chips",
      "play-signout-money",
      "play-quiet-money",
      "play-signout-person",
      "play-feed-401-person",
      "play-quiet-person",
      "play-next-person",
      "play-next-chips",
      "play-next-money",
      "play-feed-401-money",
      "play-signed-fares",
      "play-signed-trail",
      "play-signed-person",
      "play-signed-failed",
      "play-signed-spent",
      "play-signed-money",
      "play-route-ahead",
      "play-follow",
      "play-locks",
      "play-osrm",
      "play-buses",
      "play-phones",
      "play-stops",
      "play-depot",
      "play-dead-token",
      "play-from-feed",
      "play-standin",
      "play-returning",
      "play-bought",
      "play-ledger",
      "play-pence",
      "play-office-grid",
      "play-totals"
    ].forEach((id) => {
      const node = document.getElementById(id);
      if (!node || node.parentElement === under) return;
      under.appendChild(node);
    });
    keepPlayMoney();
  }
  clearBusToggle();
  clearOfficeGrid();
  clearPhoneList();
  clearPlaceStops();
  seatPlayLocks();

  const depot = [55.0367, -1.5075];
  L.marker(depot, { title: "Shiremoor depot" })
    .bindTooltip("Shiremoor depot 55.0367, -1.5075", { permanent: true, direction: "top" })
    .addTo(map);

  const PLAY_SIGNS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"];
  const PLAY_SECOND = 1;
  const FEED_COLOURS = {
    T1: "#f5b942",
    T2: "#38bdf8",
    T3: "#4ade80",
    T4: "#c084fc",
    T5: "#fb7185",
    T6: "#f97316",
    T7: "#a3e635",
    T8: "#22d3ee",
    T9: "#e879f9",
    T10: "#facc15"
  };
  const playChips = new Map();
  const playSaleChips = new Map();
  let playSalePick = "";
  const playFirmChips = new Map();
  const playDepots = [];
  let feedLoiter = null;
  const playFares = [];
  const playPeople = [];
  const playTrails = [];
  const playTrailFed = new Map();
  const playAhead = [];
  let playChosen = "";
  let playFollow = false;
  let playFollowFit = "";
  let playOfficeName = "";
  let playFeed = null;
  let playFeedEpoch = 0;
  let playFed = false;
  let playClock = null;
  let playMotion = 0;

  function haversineKm(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const lat1 = a.lat * rad;
    const lat2 = b.lat * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function placeOnRoute(points, durationS, elapsedS) {
    if (!points.length) return null;
    if (durationS <= 0 || elapsedS <= 0) return points[0];
    if (elapsedS >= durationS) return points[points.length - 1];
    const fraction = elapsedS / durationS;
    const distances = [0];
    for (let i = 1; i < points.length; i++) {
      distances.push(distances[i - 1] + haversineKm(
        { lat: points[i - 1][0], lng: points[i - 1][1] },
        { lat: points[i][0], lng: points[i][1] }
      ));
    }
    const total = distances[distances.length - 1];
    if (total === 0) return points[0];
    const target = total * fraction;
    for (let j = 1; j < distances.length; j++) {
      if (distances[j] < target) continue;
      const span = distances[j] - distances[j - 1];
      const step = span === 0 ? 0 : (target - distances[j - 1]) / span;
      const start = points[j - 1];
      const end = points[j];
      return [start[0] + (end[0] - start[0]) * step, start[1] + (end[1] - start[1]) * step];
    }
    return points[points.length - 1];
  }

  function routePoints(car) {
    const route = car && Array.isArray(car.route) ? car.route : [];
    const points = [];
    route.forEach((row) => {
      if (!Array.isArray(row) || row.length < 2) return;
      const lat = Number(row[0]);
      const lng = Number(row[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      points.push([lat, lng]);
    });
    return points;
  }

  function routeAhead(car, now) {
    if (!car || car.status === "at_depot") return [];
    const points = routePoints(car);
    if (points.length < 2) return [];
    const here = playPlace(car, now);
    if (!here) return [];
    const duration = Number(car.duration_s) || 0;
    const started = Number(car.leg_started) || 0;
    const elapsed = now - started;
    if (duration > 0 && elapsed >= duration) return [];
    let index = 1;
    if (duration > 0 && elapsed > 0) {
      const fraction = Math.min(1, elapsed / duration);
      const distances = [0];
      for (let i = 1; i < points.length; i++) {
        distances.push(distances[i - 1] + haversineKm(
          { lat: points[i - 1][0], lng: points[i - 1][1] },
          { lat: points[i][0], lng: points[i][1] }
        ));
      }
      const total = distances[distances.length - 1];
      const target = total * fraction;
      for (let j = 1; j < distances.length; j++) {
        if (distances[j] < target) continue;
        index = j;
        break;
      }
    }
    const ahead = [here];
    for (let k = index; k < points.length; k++) ahead.push(points[k]);
    if (ahead.length < 2) return [];
    const last = ahead[ahead.length - 1];
    if (ahead.length === 2 && here[0] === last[0] && here[1] === last[1]) return [];
    return ahead;
  }

  function legEndName(car) {
    if (!car || typeof car.place !== "string") return "";
    const name = car.place.trim();
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "";
    return name;
  }

  function feedPlaceName(car) {
    const sent = destinationName(car);
    if (sent) return sent;
    return legEndName(car);
  }

  function playNow() {
    if (!playClock) return Date.now() / 1000;
    const elapsed = Date.now() / 1000 - playClock.client;
    return playClock.server + elapsed * PLAY_SECOND;
  }

  function newCarLineReady() {
    const row = document.querySelector('[data-money="new_car"]');
    return !!(row && String(row.textContent).indexOf("800000") !== -1);
  }

  function boughtAtDepot(car) {
    if (!car || car.status !== "at_depot") return false;
    const sign = String(car.sign || "");
    return PLAY_SIGNS.indexOf(sign) === -1;
  }

  function tenIgnoreNewCarLine(car) {
    const sign = String(car && car.sign || "");
    return PLAY_SIGNS.indexOf(sign) !== -1;
  }

  function notePriceStill() {
    const node = document.getElementById("play-price-still");
    if (!node) return;
    node.dataset.moves = "no";
  }

  function noteBoughtDepot(car) {
    const node = document.getElementById("play-depot-chip");
    if (!node) return;
    const lat = Number(car && car.lat);
    const lng = Number(car && car.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) node.dataset.pin = lat + "," + lng;
    node.dataset.placedBy = "feed";
  }

  function playPlace(car, now) {
    if (!car) return null;
    if (car.status === "at_depot") {
      const lat = Number(car.lat);
      const lng = Number(car.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
      return null;
    }
    const route = Array.isArray(car.route) ? car.route : [];
    const duration = Number(car.duration_s) || 0;
    const started = Number(car.leg_started) || 0;
    const elapsed = now - started;
    const outside = PLAY_SIGNS.indexOf(String(car.sign || "")) === -1;
    if (!outside && car.status === "returning" && (!route.length || elapsed >= duration)) return [55.0367, -1.5075];
    if (route.length) return placeOnRoute(route, duration, elapsed);
    const lat = Number(car.lat);
    const lng = Number(car.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return null;
  }

  function chipFill(car) {
    const fromFeed = car && typeof car.colour === "string" ? car.colour.trim() : "";
    if (/^#[0-9a-fA-F]{6}$/.test(fromFeed)) return fromFeed;
    return FEED_COLOURS[car.sign] || "#94a3b8";
  }

  function trailColour(car) {
    const fromFeed = car && typeof car.colour === "string" ? car.colour.trim() : "";
    if (/^#[0-9a-fA-F]{6}$/.test(fromFeed)) return fromFeed;
    const sign = String(car && car.sign || "");
    if (PLAY_SIGNS.indexOf(sign) !== -1 && FEED_COLOURS[sign]) return FEED_COLOURS[sign];
    return "#94a3b8";
  }

  function chipLabel(sign) {
    return String(sign || "").replace(/device/ig, "").trim();
  }

  function carJob(car) {
    if (!car) return "";
    const sent = typeof car.job === "string" ? car.job.trim() : "";
    if (sent) return sent;
    const raw = String(car.status || "").trim();
    if (raw === "waiting" || raw === "at_depot") return "waiting";
    if (raw === "travelling to a better spot" || raw === "travelling" || raw === "to_better_spot") return "travelling to a better spot";
    if (raw === "collecting" || raw === "to_passenger") return "collecting";
    if (raw === "carrying" || raw === "with_passenger") return "carrying";
    if (raw === "returning") return "returning";
    return "";
  }

  function carriedName(car) {
    if (!car) return "";
    const status = String(car.status || "").trim();
    if (status !== "with_passenger" && carJob(car) !== "carrying") return "";
    const name = typeof car.passenger === "string" ? car.passenger.trim() : "";
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "";
    return name;
  }

  function carriedJourney(car) {
    if (!car) return "";
    const status = String(car.status || "").trim();
    if (status !== "with_passenger" && carJob(car) !== "carrying") return "";
    const journey = typeof car.journey === "string" ? car.journey.trim() : "";
    if (!journey || journey === "2860" || journey === "1130" || journey === "1240" || journey === "-1120") return "";
    return journey;
  }

  function chipText(sign, job, endName, passenger, journey) {
    let text = chipLabel(sign);
    if (job) text += " " + job;
    if (passenger) text += " " + passenger;
    if (journey) text += " " + journey;
    if (endName) text += " " + endName;
    return text;
  }

  function chipIcon(sign, fill, job, endName, passenger, journey) {
    const raw = chipText(sign, job, endName, passenger, journey);
    const text = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const width = Math.max(36, 8 + raw.length * 7);
    const html = '<span class="play-chip" style="display:flex;align-items:center;justify-content:center;min-width:' + width + 'px;height:22px;padding:0 4px;border-radius:6px;background:' + fill + ';color:#0c1219;font:700 11px/1 system-ui,sans-serif;white-space:nowrap">' + text + "</span>";
    return L.divIcon({ className: "play-chip-icon", html: html, iconSize: [width, 22], iconAnchor: [width / 2, 11] });
  }

  function apiBase() {
    return String(window.HACKATHON_API || "").replace(/\/$/, "");
  }

  function playFeedPath() {
    return "/v1/empire";
  }

  function playMayRequest(path) {
    const target = String(path);
    if (target.indexOf("office") !== -1 || target.indexOf("ledger") !== -1) return false;
    return target === "/v1/empire";
  }

  function feedPlace(car) {
    const lat = Number(car.lat);
    const lng = Number(car.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return null;
  }

  function clearStandInTaxis() {
    if (playFed) return;
    playChips.forEach((marker) => map.removeLayer(marker));
    playChips.clear();
    playSalePick = "";
    playSaleChips.forEach((marker) => map.removeLayer(marker));
    playSaleChips.clear();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
  }

  function drawnPlaySign(sign) {
    const name = String(sign || "");
    if (PLAY_SIGNS.indexOf(name) !== -1) return true;
    return name === "T11";
  }

  function noteT11Only() {
    const node = document.getElementById("play-t11-only");
    if (!node) return;
    node.dataset.t11 = playChips.has("T11") ? "drawn" : "waiting";
    node.dataset.t12 = playChips.has("T12") ? "drawn" : "not-drawn";
  }

  function paintPlayCars(feed) {
    if (!playFed) return;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const seen = new Set();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
    function paintOne(car) {
      if (!car) return;
      const sign = String(car.sign || "");
      if (!sign || seen.has(sign)) return;
      const reported = feedPlace(car);
      const place = reported || playPlace(car, playNow());
      if (!place) return;
      seen.add(sign);
      if (boughtAtDepot(car)) noteBoughtDepot(car);
      const fill = chipFill(car);
      const job = carJob(car);
      const endName = feedPlaceName(car);
      const passenger = carriedName(car);
      const journey = carriedJourney(car);
      const title = chipText(sign, job, endName, passenger, journey);
      let marker = playChips.get(sign);
      if (!marker) {
        marker = L.marker(place, {
          icon: chipIcon(sign, fill, job, endName, passenger, journey),
          title: title
        }).addTo(map);
        marker._playFill = fill;
        marker._playJob = job;
        marker._playPlace = endName;
        marker._playPassenger = passenger;
        marker._playJourney = journey;
        marker._playClick = true;
        marker.on("click", function () {
          playChosen = sign;
          playFollow = true;
          playSalePick = car && car.for_sale ? sign : "";
          paintPlayCars(playFeed);
          paintPlaySale(playFeed);
          paintPlayBuy();
        });
        playChips.set(sign, marker);
      } else if (marker._playFill !== fill || marker._playJob !== job || marker._playPlace !== endName || marker._playPassenger !== passenger || marker._playJourney !== journey) {
        marker.setIcon(chipIcon(sign, fill, job, endName, passenger, journey));
        marker._playFill = fill;
        marker._playJob = job;
        marker._playPlace = endName;
        marker._playPassenger = passenger;
        marker._playJourney = journey;
      }
      marker.options.title = title;
      if (marker._icon) marker._icon.title = title;
      if (list) {
        const item = document.createElement("li");
        fillTaxiListItem(item, sign, car, reported ? reported[0] : null, reported ? reported[1] : null);
        item.addEventListener("click", function () {
          playChosen = sign;
          playFollow = true;
          paintPlayCars(playFeed);
        });
        list.appendChild(item);
      }
    }
    PLAY_SIGNS.forEach((sign) => {
      const car = cars.find((row) => row && row.sign === sign);
      if (car) paintOne(car);
    });
    cars.forEach((car) => {
      if (!car || PLAY_SIGNS.indexOf(car.sign) !== -1) return;
      if (!drawnPlaySign(car.sign)) return;
      paintOne(car);
    });
    playChips.forEach((marker, sign) => {
      if (seen.has(sign)) return;
      map.removeLayer(marker);
      playChips.delete(sign);
    });
    dropSecondTen();
    noteT11Only();
    notePriceStill();
    noteSignedAgain(feed);
    noteWithPassenger();
    noteToPassenger();
    noteCarJob();
    paintPlayAhead(feed);
    paintPlayFirms(feed);
    followChosenTaxi(feed);
  }

  function followedCar(feed) {
    if (!playFollow || !playChosen) return null;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const own = cars.find((row) => row && String(row.sign) === playChosen);
    if (own) return own;
    const rival = chosenFirmCar(feed);
    return rival ? rival.car : null;
  }

  const ROUTE_DOT_GAP = 16;

  function prefersQuietMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function routeDotOffset(line) {
    if (prefersQuietMotion()) return 0;
    let dash = (line._playDash || 0) - 1.2;
    while (dash <= -ROUTE_DOT_GAP) dash += ROUTE_DOT_GAP;
    line._playDash = dash;
    return dash;
  }

  function routeDotStyle(colour, offset) {
    return {
      color: colour,
      weight: 6,
      opacity: 0.95,
      dashArray: "0, " + ROUTE_DOT_GAP,
      dashOffset: String(offset),
      lineCap: "round",
      lineJoin: "round"
    };
  }

  function paintPlayAhead(feed) {
    const node = document.getElementById("play-route-ahead");
    const tracking = !!(playFollow && playChosen);
    const car = tracking ? followedCar(feed) : null;
    const ahead = car ? routeAhead(car, playNow()) : [];
    if (ahead.length < 2) {
      clearPlayAhead();
      if (node) {
        node.dataset.ahead = "clear";
        node.dataset.chosen = tracking ? playChosen : "";
        node.dataset.place = "feed";
        node.dataset.click = tracking ? "shows" : "waiting";
      }
      return;
    }
    const colour = trailColour(car);
    const line = playAhead[0];
    if (line && line._playSign === playChosen) {
      line.setLatLngs(ahead);
      const offset = routeDotOffset(line);
      line.setStyle(routeDotStyle(colour, offset));
      line._playColour = colour;
    } else {
      clearPlayAhead();
      const drawn = L.polyline(ahead, Object.assign(routeDotStyle(colour, 0), {
        className: "play-route-ahead",
        interactive: false
      })).addTo(map);
      drawn._playSign = playChosen;
      drawn._playColour = colour;
      drawn._playDash = 0;
      playAhead.push(drawn);
    }
    if (!node) return;
    node.dataset.ahead = "drawn";
    node.dataset.chosen = playChosen;
    node.dataset.place = "feed";
    node.dataset.click = "shows";
  }

  function noteFollow() {
    const node = document.getElementById("play-follow");
    const button = document.getElementById("play-follow-stop");
    if (button) button.hidden = !playFollow;
    if (!node) return;
    node.dataset.follow = playFollow ? "on" : "off";
    node.dataset.chosen = playChosen;
    node.dataset.circle = playFollow ? "taxi" : "fleet";
  }

  function taxiHere(car, now) {
    if (!car) return null;
    const own = playPlace(car, now);
    if (own) return own;
    return firmPlace(car, now);
  }

  function followViewBounds(car, now) {
    const points = [];
    const here = taxiHere(car, now);
    if (here) points.push(here);
    routePoints(car).forEach((point) => points.push(point));
    routeAhead(car, now).forEach((point) => points.push(point));
    if (!points.length) return null;
    return L.latLngBounds(points);
  }

  function allTaxiBounds(feed) {
    const points = [];
    const now = playNow();
    function take(car, placeFn) {
      if (!car) return;
      const here = placeFn(car, now);
      if (here) points.push(here);
    }
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    cars.forEach((car) => take(car, playPlace));
    const firms = feed && Array.isArray(feed.firms) ? feed.firms : [];
    firms.forEach((firm) => {
      const rows = firm && Array.isArray(firm.cars) ? firm.cars : [];
      rows.forEach((car) => take(car, firmPlace));
    });
    if (!points.length) return null;
    return L.latLngBounds(points);
  }

  function fitPlayBounds(bounds, maxZoom) {
    if (!bounds || !bounds.isValid()) return false;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    if (ne.equals(sw)) {
      map.setView(bounds.getCenter(), Math.min(14, maxZoom || 14), { animate: false });
      return true;
    }
    map.fitBounds(bounds, {
      animate: false,
      maxZoom: maxZoom || 15,
      padding: [48, 48]
    });
    return true;
  }

  function zoomToFollowedTaxi(car) {
    const bounds = followViewBounds(car, playNow());
    if (!fitPlayBounds(bounds, 15)) return;
  }

  function zoomToAllTaxis(feed) {
    const bounds = allTaxiBounds(feed);
    if (fitPlayBounds(bounds, 13)) return;
    map.fitBounds(circle.getBounds(), { animate: false });
  }

  function followChosenTaxi(feed) {
    noteFollow();
    refreshCarLabels(feed);
    if (!playFollow || !playChosen) return;
    const car = followedCar(feed);
    if (!car) return;
    const now = playNow();
    const here = taxiHere(car, now);
    const key = playChosen + "|" + String(car.status || "") + "|" + String(car.leg_started || "") + "|" + String(car.duration_s || "");
    if (playFollowFit !== key) {
      playFollowFit = key;
      zoomToFollowedTaxi(car);
      return;
    }
    if (here && !map.getBounds().pad(-0.12).contains(L.latLng(here[0], here[1]))) {
      map.panTo(here, { animate: false });
    }
  }

  function stopPlayFollow() {
    playFollow = false;
    playChosen = "";
    playFollowFit = "";
    clearPlayAhead();
    zoomToAllTaxis(playFeed);
    noteFollow();
    refreshCarLabels(playFeed);
    paintPlaySide(playFeed);
  }

  function londonParts(nowS) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = fmt.formatToParts(new Date(nowS * 1000));
    const out = { weekday: "", hour: 0, minute: 0 };
    parts.forEach((part) => {
      if (part.type === "weekday") out.weekday = part.value;
      if (part.type === "hour") out.hour = Number(part.value);
      if (part.type === "minute") out.minute = Number(part.value);
    });
    return out;
  }

  function londonBandName(nowS) {
    const clock = londonParts(nowS);
    const minutes = clock.hour * 60 + clock.minute;
    if (minutes >= 7 * 60 && minutes < 9 * 60 + 30) return "Morning commute";
    if (minutes >= 9 * 60 + 30 && minutes < 16 * 60 + 30) return "Daytime";
    if (minutes >= 16 * 60 + 30 && minutes < 19 * 60 + 30) return "Evening";
    if (minutes >= 19 * 60 + 30 || minutes < 60) return "Night out";
    return "Small hours";
  }

  function routeMilesTotal(points) {
    let miles = 0;
    for (let i = 1; i < points.length; i++) {
      miles += haversineKm(
        { lat: points[i - 1][0], lng: points[i - 1][1] },
        { lat: points[i][0], lng: points[i][1] }
      ) / 1.609344;
    }
    return miles;
  }

  function fleetCounts(feed) {
    const counts = { waiting: 0, collecting: 0, carrying: 0, returning: 0, hunting: 0, break: 0 };
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    cars.forEach((car) => {
      const job = carJob(car);
      if (job === "waiting") counts.waiting += 1;
      else if (job === "collecting") counts.collecting += 1;
      else if (job === "carrying") counts.carrying += 1;
      else if (job === "returning") counts.returning += 1;
      else if (job === "on break") counts.break += 1;
      else if (job === "hunting" || job === "travelling to a better spot") counts.hunting += 1;
    });
    return counts;
  }

  function canCancelJob(feed, sign) {
    if (!sign) return false;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const car = cars.find((row) => row && String(row.sign) === sign);
    if (!car) return false;
    const job = carJob(car);
    if (job === "collecting" || job === "carrying") return true;
    const people = feed && Array.isArray(feed.people) ? feed.people : [];
    return people.some((person) => String(person.sign || "") === sign);
  }

  function paintPlayClock(feed) {
    const now = Number(feed && feed.server_now);
    const stamp = Number.isFinite(now) ? now : playNow();
    const clock = document.getElementById("play-clock");
    const band = document.getElementById("play-band");
    const parts = londonParts(stamp);
    if (clock) {
      const hh = String(parts.hour).padStart(2, "0");
      const mm = String(parts.minute).padStart(2, "0");
      clock.textContent = (parts.weekday ? parts.weekday + " " : "") + hh + ":" + mm;
    }
    if (band) band.textContent = londonBandName(stamp);
  }

  function paintFleetCounts(feed) {
    const node = document.getElementById("play-fleet-counts");
    if (!node) return;
    const counts = fleetCounts(feed);
    node.textContent = counts.waiting + " waiting · " + counts.collecting + " collecting · " +
      counts.carrying + " carrying · " + counts.returning + " returning · " +
      counts.hunting + " hunting · " + counts.break + " on break";
  }

  function paintFollowPanel(feed) {
    const who = document.getElementById("play-follow-who");
    const detail = document.getElementById("play-follow-detail");
    const milesNode = document.getElementById("play-follow-miles");
    const routeNode = document.getElementById("play-follow-route");
    const cancel = document.getElementById("play-cancel");
    const car = followedCar(feed);
    if (!car) {
      if (who) who.textContent = "Click a taxi on the map or in the list to follow it.";
      if (detail) detail.textContent = "";
      if (milesNode) milesNode.textContent = "";
      if (routeNode) routeNode.textContent = "";
      if (cancel) cancel.hidden = true;
      return;
    }
    const sign = String(car.sign || playChosen);
    const job = carJob(car);
    if (who) who.textContent = "Following " + sign + (job ? " · " + job : "");
    const bits = [];
    const pickup = feedText(car.pickup);
    const drop = feedText(car.drop);
    if (pickup || drop) bits.push((pickup || "?") + " → " + (drop || "?"));
    const journey = carriedJourney(car) || feedText(car.journey);
    if (journey) bits.push(journey);
    const passenger = typeof car.passenger === "string" ? car.passenger.trim() : "";
    if (passenger) bits.push(passenger);
    const trip = feedPence(car, "trip_pence");
    if (trip !== null) bits.push(trip + " pence");
    const left = feedSecondsLeft(car, playNow());
    if (left !== null) bits.push(left + "s left");
    if (detail) detail.textContent = bits.join(" · ");
    const points = routePoints(car);
    const total = routeMilesTotal(points);
    const duration = Number(car.duration_s) || 0;
    const started = Number(car.leg_started) || 0;
    const frac = duration > 0 ? Math.min(1, Math.max(0, (playNow() - started) / duration)) : 0;
    if (milesNode) {
      milesNode.textContent = total > 0
        ? (total * frac).toFixed(2) + " miles driven · " + (total * (1 - frac)).toFixed(2) + " miles left"
        : "";
    }
    if (routeNode) {
      if (car.osrm === false) routeNode.textContent = "Straight-line fallback";
      else if (car.osrm === true) routeNode.textContent = "Street route (OSRM)";
      else routeNode.textContent = "";
    }
    if (cancel) cancel.hidden = !canCancelJob(feed, sign);
  }

  function paintRivalCover(feed) {
    const node = document.getElementById("play-rival-cover");
    if (!node) return;
    const people = feed && Array.isArray(feed.people) ? feed.people : [];
    let yours = 0;
    let rival = 0;
    let none = 0;
    people.forEach((person) => {
      if (!person || allocatedTaxiArrived(feed, person)) return;
      const sign = String(person.sign || "").trim();
      if (!sign) none += 1;
      else if (sign.charAt(0) === "T") yours += 1;
      else rival += 1;
    });
    node.textContent = rival + " claimed by north/south. " + yours + " claimed by your cars. " + none + " unallocated.";
  }

  function paintFirmSummaries(feed) {
    ["north", "south"].forEach((name) => {
      const node = document.getElementById("play-firm-" + name);
      if (!node) return;
      const firm = firmCalled(feed, name);
      if (!firm) {
        node.textContent = name + " — no feed yet.";
        return;
      }
      const rows = Array.isArray(firm.cars) ? firm.cars : [];
      let out = 0;
      rows.forEach((car) => {
        if (carJob(car) && carJob(car) !== "waiting" && carJob(car) !== "on break") out += 1;
      });
      const fare = feedPence(firm, "fare_in");
      const books = Array.isArray(firm.bookings) ? firm.bookings.length : 0;
      node.textContent = name + " · " + rows.length + " cars · " + out + " out · " +
        (fare === null ? "0" : String(fare)) + " pence in · " + books + " bookings";
    });
  }

  function paintDepotsList(feed) {
    const list = document.getElementById("play-depots-list");
    if (!list) return;
    list.textContent = "";
    function add(name, lat, lng) {
      const item = document.createElement("li");
      item.textContent = name + " · " + Number(lat).toFixed(4) + ", " + Number(lng).toFixed(4);
      list.appendChild(item);
    }
    add("Shiremoor (yours)", 55.0367, -1.5075);
    const firms = feed && Array.isArray(feed.firms) ? feed.firms : [];
    firms.forEach((firm) => {
      if (!firm || !Array.isArray(firm.depot) || firm.depot.length < 2) return;
      const lat = Number(firm.depot[0]);
      const lng = Number(firm.depot[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const name = depotFirmName(firm);
      add((name || "firm") + " depot", lat, lng);
    });
  }

  function paintLoiterNow(feed) {
    const node = document.getElementById("play-loiter-now");
    if (!node) return;
    const patch = feed && feed.loiter;
    if (!patch) {
      node.textContent = "No loiter patch. Click the map to fill lat/lng, then set a radius and firm.";
      return;
    }
    const lat = Number(patch.lat);
    const lng = Number(patch.lng);
    const km = Number(patch.radius_km);
    const firm = typeof patch.firm === "string" ? patch.firm.trim() : "";
    const bits = [];
    if (firm) bits.push(firm);
    if (Number.isFinite(lat) && Number.isFinite(lng)) bits.push(lat.toFixed(4) + ", " + lng.toFixed(4));
    if (Number.isFinite(km)) bits.push(km + " km");
    node.textContent = bits.length ? bits.join(" · ") : "No loiter patch.";
  }

  function paintPlaySide(feed) {
    paintPlayClock(feed);
    paintFleetCounts(feed);
    paintFollowPanel(feed);
    paintRivalCover(feed);
    paintFirmSummaries(feed);
    paintDepotsList(feed);
    paintLoiterNow(feed);
  }

  function mapHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function sentSeconds(value) {
    if (value === undefined || value === null || value === "") return null;
    const sent = Number(value);
    if (!Number.isFinite(sent)) return null;
    return Math.max(0, Math.round(sent));
  }

  function feedSecondsLeft(car, now) {
    if (!car) return null;
    const sent = sentSeconds(car.seconds_left);
    if (sent !== null) return sent;
    const duration = Number(car.duration_s);
    const started = Number(car.leg_started);
    if (!Number.isFinite(duration) || !Number.isFinite(started) || duration <= 0) return null;
    return Math.max(0, Math.round(duration - (now - started)));
  }

  function destinationName(car) {
    if (!car || typeof car.destination !== "string") return "";
    const name = car.destination.trim();
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "";
    return name;
  }

  function carOnLeg(car) {
    return !!(car && car.status && car.status !== "at_depot");
  }

  function legLabel(car, now) {
    if (!carOnLeg(car)) return "";
    const parts = [];
    const place = destinationName(car);
    if (place) parts.push(place);
    const left = feedSecondsLeft(car, now);
    if (left !== null) parts.push(left + "s");
    return parts.join(" ");
  }

  function feedText(value) {
    if (typeof value !== "string") return "";
    const name = value.trim();
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "";
    return name;
  }

  function feedPence(holder, key) {
    if (!holder || !Object.prototype.hasOwnProperty.call(holder, key)) return null;
    const pence = Number(holder[key]);
    if (!Number.isFinite(pence)) return null;
    const whole = Math.trunc(pence);
    if (whole === 2860 || whole === 1130 || whole === 1240 || whole === -1120 || whole === 800000) return null;
    return whole;
  }

  function followBoxText(car, now, firm) {
    const lines = [];
    const place = destinationName(car);
    if (place) lines.push(place);
    const left = feedSecondsLeft(car, now);
    if (left !== null) lines.push(left + "s");
    const pickup = feedText(car && car.pickup);
    if (pickup) lines.push(pickup);
    const drop = feedText(car && car.drop);
    if (drop) lines.push(drop);
    const trip = feedPence(car, "trip_pence");
    if (trip !== null) lines.push(trip + " pence");
    const passenger = typeof car.passenger === "string" ? car.passenger.trim() : "";
    if (passenger) lines.push(passenger);
    const job = carJob(car);
    if (job) lines.push(job);
    if (firm) lines.push(firm);
    return lines.map(mapHtml).join("<br>");
  }

  function setMapLabel(marker, text, followed) {
    if (!marker) return;
    const want = followed ? "play-follow-box" : "play-leg-label";
    if (!text) {
      if (marker.getTooltip()) marker.unbindTooltip();
      marker._playLabelKind = "";
      return;
    }
    const html = followed ? text : mapHtml(text);
    if (marker.getTooltip() && marker._playLabelKind === want) {
      marker.setTooltipContent(html);
      return;
    }
    if (marker.getTooltip()) marker.unbindTooltip();
    marker._playLabelKind = want;
    marker.bindTooltip(html, { permanent: true, direction: "top", className: want, opacity: 0.95 });
  }

  function chosenFirmCar(feed) {
    const firms = feed && Array.isArray(feed.firms) ? feed.firms : [];
    for (let i = 0; i < firms.length; i++) {
      const firm = firms[i];
      const name = firm && typeof firm.firm === "string" ? firm.firm.trim() : "";
      const rows = firm && Array.isArray(firm.cars) ? firm.cars : [];
      for (let j = 0; j < rows.length; j++) {
        const car = rows[j];
        if (car && String(car.sign || "") === playChosen) return { car: car, firm: name };
      }
    }
    return null;
  }

  function labelOneCar(marker, car, now, firm) {
    const followed = !!(playFollow && car && String(car.sign || "") === playChosen);
    const text = followed ? followBoxText(car, now, firm) : legLabel(car, now);
    setMapLabel(marker, text, followed);
  }

  function refreshCarLabels(feed) {
    const now = playNow();
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    cars.forEach((car) => {
      if (!car || !car.sign) return;
      const marker = playChips.get(String(car.sign));
      if (!marker) return;
      labelOneCar(marker, car, now, "");
    });
    playFirmChips.forEach((marker) => {
      if (!marker || !marker._playFirmCar) return;
      labelOneCar(marker, marker._playFirmCar, now, marker._playFirmName || "");
    });
  }

  function firmPlace(car, now) {
    if (!car) return null;
    if (car.status === "at_depot") {
      const lat = Number(car.lat);
      const lng = Number(car.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
      return null;
    }
    const route = Array.isArray(car.route) ? car.route : [];
    const duration = Number(car.duration_s) || 0;
    const started = Number(car.leg_started) || 0;
    if (route.length) return placeOnRoute(route, duration, now - started);
    const lat = Number(car.lat);
    const lng = Number(car.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return null;
  }

  function firmChipText(sign, firm, job, place, passenger) {
    let text = chipLabel(sign);
    if (firm) text += " " + firm;
    if (job) text += " " + job;
    if (passenger) text += " " + passenger;
    if (place) text += " " + place;
    return text;
  }

  function clearPlayFirms() {
    playFirmChips.forEach((marker) => map.removeLayer(marker));
    playFirmChips.clear();
  }

  function clearFeedDepots() {
    playDepots.forEach((marker) => map.removeLayer(marker));
    playDepots.length = 0;
  }

  function clearFeedLoiter() {
    if (!feedLoiter) return;
    map.removeLayer(feedLoiter);
    feedLoiter = null;
  }

  function loiterTitle(patch) {
    const name = patch && typeof patch.firm === "string" ? patch.firm.trim() : "";
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "loiter";
    return name + " loiter";
  }

  function paintFeedLoiter(feed) {
    clearFeedLoiter();
    const patch = feed && feed.loiter;
    if (!patch) return;
    const lat = Number(patch.lat);
    const lng = Number(patch.lng);
    const radiusKm = Number(patch.radius_km);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm) || radiusKm <= 0) return;
    const title = loiterTitle(patch);
    feedLoiter = L.circle([lat, lng], {
      radius: radiusKm * 1000,
      color: "#38bdf8",
      weight: 2,
      fillColor: "#38bdf8",
      fillOpacity: 0.12,
      interactive: false
    }).addTo(map);
    feedLoiter.bindTooltip(mapHtml(title), { permanent: true, direction: "center", className: "play-leg-label", opacity: 0.95 });
  }

  function fillLoiterPoint(event) {
    const form = document.getElementById("play-loiter");
    if (!form || form.hidden) return;
    if (!event || !event.latlng) return;
    const latNode = document.getElementById("play-loiter-lat");
    const lngNode = document.getElementById("play-loiter-lng");
    if (latNode) latNode.value = String(event.latlng.lat);
    if (lngNode) lngNode.value = String(event.latlng.lng);
  }

  function depotFirmName(firm) {
    const name = firm && typeof firm.firm === "string" ? firm.firm.trim() : "";
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "";
    return name;
  }

  function paintFeedDepots(feed) {
    clearFeedDepots();
    const firms = feed && Array.isArray(feed.firms) ? feed.firms : [];
    firms.forEach((firm) => {
      if (!firm || !Array.isArray(firm.depot) || firm.depot.length < 2) return;
      const lat = Number(firm.depot[0]);
      const lng = Number(firm.depot[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const name = depotFirmName(firm);
      const title = name ? name + " depot" : "depot";
      const marker = L.marker([lat, lng], { title: title }).addTo(map);
      marker.bindTooltip(mapHtml(title), { permanent: true, direction: "top", className: "play-leg-label", opacity: 0.95 });
      playDepots.push(marker);
    });
  }

  function paintPlayFirms(feed) {
    const seen = new Set();
    const firms = feed && Array.isArray(feed.firms) ? feed.firms : [];
    const now = playNow();
    firms.forEach((firm) => {
      if (!firm) return;
      const name = typeof firm.firm === "string" ? firm.firm.trim() : "";
      const rows = Array.isArray(firm.cars) ? firm.cars : [];
      rows.forEach((car) => {
        if (!car) return;
        const sign = String(car.sign || "");
        if (!sign || seen.has(sign)) return;
        const place = firmPlace(car, now);
        if (!place) return;
        seen.add(sign);
        const fill = chipFill(car);
        const job = carJob(car);
        const placeName = feedPlaceName(car);
        const passenger = carriedName(car);
        const journey = carriedJourney(car);
        const title = firmChipText(sign, name, job, placeName, passenger);
        const iconEnd = name && placeName ? name + " " + placeName : (name || placeName);
        let marker = playFirmChips.get(sign);
        if (!marker) {
          marker = L.marker(place, {
            icon: chipIcon(sign, fill, job, iconEnd, passenger, journey),
            title: title
          }).addTo(map);
          marker.on("click", function () {
            playChosen = sign;
            playFollow = true;
            paintPlayCars(playFeed);
          });
          playFirmChips.set(sign, marker);
        } else if (marker._playFirmTitle !== title || marker._playFill !== fill || marker._playJourney !== journey) {
          marker.setIcon(chipIcon(sign, fill, job, iconEnd, passenger, journey));
          marker._playFill = fill;
          marker._playJourney = journey;
        }
        marker._playJourney = journey;
        marker._playFirmTitle = title;
        marker._playFirmName = name;
        marker._playFirmCar = car;
        marker.setLatLng(place);
        marker.options.title = title;
        labelOneCar(marker, car, now, name);
      });
    });
    playFirmChips.forEach((marker, sign) => {
      if (seen.has(sign)) return;
      map.removeLayer(marker);
      playFirmChips.delete(sign);
    });
  }

  function personTimeText(person) {
    const sign = personTaxiSign(person);
    if (sign) {
      const left = sentSeconds(person.seconds_left);
      return left === null ? "" : left + "s";
    }
    const waited = sentSeconds(person.waiting_s);
    return waited === null ? "" : waited + "s";
  }

  function listStatus(car) {
    const job = carJob(car);
    return job ? " " + job : "";
  }

  function taxiListText(sign, car, lat, lng) {
    const placeName = feedPlaceName(car);
    const passenger = carriedName(car);
    let text = String(sign || "");
    text += listStatus(car);
    if (passenger) text += " " + passenger;
    if (placeName) text += " " + placeName;
    else if (lat !== null && lat !== undefined && lng !== null && lng !== undefined && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
      text += " " + lat + ", " + lng;
    }
    return text;
  }

  function fillTaxiListItem(item, sign, car, lat, lng) {
    const job = carJob(car);
    item.dataset.sign = sign;
    item.dataset.job = job;
    const left = feedSecondsLeft(car, playNow());
    item.textContent = taxiListText(sign, car, lat, lng) + (left !== null ? " " + left + "s" : "");
    item.classList.toggle("is-selected", !!(playFollow && playChosen === sign));
    item.style.borderLeftColor = chipFill(car);
  }

  function noteCarJob() {
    const node = document.getElementById("play-car-job");
    const feed = document.getElementById("play-job-feed");
    const jobs = ["waiting", "travelling to a better spot", "collecting", "carrying", "returning"];
    const list = document.getElementById("play-taxi-list");
    const text = list ? list.textContent : "";
    const listed = [];
    const chips = [];
    const sent = [];
    function keep(job) {
      if (!job || sent.indexOf(job) !== -1) return;
      sent.push(job);
    }
    jobs.forEach((job) => {
      if (text.indexOf(" " + job) !== -1) listed.push(job);
      playChips.forEach((marker) => {
        const title = marker && marker.options ? String(marker.options.title || "") : "";
        if (title.indexOf(job) !== -1 && chips.indexOf(job) === -1) chips.push(job);
      });
    });
    if (list) Array.from(list.children).forEach((item) => keep(String(item.dataset.job || "")));
    playChips.forEach((marker) => keep(String(marker && marker._playJob || "")));
    const extra = sent.filter((job) => jobs.indexOf(job) === -1);
    if (node) {
      node.dataset.list = listed.join(",");
      node.dataset.chip = chips.join(",");
    }
    if (!feed) return;
    feed.dataset.sent = sent.join(",");
    feed.dataset.extra = extra.join(",");
    feed.dataset.break = sent.indexOf("on break") === -1 ? "absent" : "feed";
  }

  function noteWithPassenger() {
    const node = document.getElementById("play-with-passenger");
    if (!node) return;
    const list = document.getElementById("play-taxi-list");
    const text = list ? list.textContent : "";
    node.dataset.named = text.indexOf(" is with_passenger") === -1 ? "no" : "yes";
    node.dataset.returning = text.indexOf(" is returning") === -1 ? "no" : "yes";
  }

  function noteToPassenger() {
    const node = document.getElementById("play-to-passenger");
    if (!node) return;
    const list = document.getElementById("play-taxi-list");
    const text = list ? list.textContent : "";
    node.dataset.named = text.indexOf(" is to_passenger") === -1 ? "no" : "yes";
    node.dataset.returning = text.indexOf(" is returning") === -1 ? "no" : "yes";
  }

  function dropSecondTen() {
    const list = document.getElementById("play-taxi-list");
    if (!list) return;
    const once = new Set();
    Array.from(list.children).forEach((item) => {
      const sign = item.dataset.sign || "";
      if (PLAY_SIGNS.indexOf(sign) === -1) return;
      if (once.has(sign)) item.remove();
      else once.add(sign);
    });
  }

  let playSignAgain = false;

  function noteSignedAgain(feed) {
    const node = document.getElementById("play-signed-again");
    if (!node || !playSignAgain) return;
    const list = document.getElementById("play-taxi-list");
    let doubled = false;
    PLAY_SIGNS.forEach((sign) => {
      if (!list) return;
      if (list.querySelectorAll('[data-sign="' + sign + '"]').length > 1) doubled = true;
    });
    const listed = feedListsT11(feed);
    node.dataset.t11 = listed && playChips.has("T11") ? "shown" : "absent";
    node.dataset.ten = doubled ? "doubled" : "once";
  }

  function clearPlayTrails() {
    playTrails.forEach((line) => map.removeLayer(line));
    playTrails.length = 0;
  }

  function clearPlayAhead() {
    playAhead.forEach((line) => map.removeLayer(line));
    playAhead.length = 0;
  }

  function trailPoint(row) {
    if (!Array.isArray(row) || row.length < 3) return null;
    const lng = Number(row[0]);
    const lat = Number(row[1]);
    const at = Number(row[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(at)) return null;
    return { lat: lat, lng: lng, at: at };
  }

  const TRAIL_TEN_MINUTES = 600;

  function boughtTrailSeconds(car) {
    const sign = String(car && car.sign || "");
    if (PLAY_SIGNS.indexOf(sign) !== -1) return null;
    return TRAIL_TEN_MINUTES;
  }

  function noteBoughtTrailAge(dropped) {
    const node = document.getElementById("play-trail-age");
    if (!node) return;
    node.dataset.minutes = "10";
    node.dataset.dropped = String(dropped);
  }

  function trailStamp(point) {
    return String(point.lng) + "," + String(point.lat) + "," + String(point.at);
  }

  function noteTrailReplaced(signs) {
    const node = document.getElementById("play-trail-replace");
    if (!node) return;
    node.dataset.replaced = "feed";
    node.dataset.signs = signs.join(",");
  }

  function keepTrailChip(sign) {
    const marker = playChips.get(String(sign));
    if (!marker) return false;
    if (!map.hasLayer(marker)) marker.addTo(map);
    marker._keptWithTrail = true;
    return true;
  }

  function noteTrailChips(signs) {
    const node = document.getElementById("play-trail-chip");
    if (!node) return;
    node.dataset.kept = signs.join(",");
  }

  function paintPlayTrails(feed) {
    clearPlayTrails();
    const keep = Number(feed && feed.trail_s);
    const trailS = Number.isFinite(keep) && keep > 0 ? keep : 600;
    const now = playNow();
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const fedSigns = [];
    const keptSigns = [];
    cars.forEach((car) => {
      if (!car || !car.sign || !Array.isArray(car.trail)) return;
      if (!drawnPlaySign(car.sign)) return;
      const sign = String(car.sign);
      const boughtS = boughtTrailSeconds(car);
      const keepS = boughtS === null ? trailS : boughtS;
      const points = [];
      const stamps = [];
      let dropped = 0;
      car.trail.forEach((row) => {
        const point = trailPoint(row);
        if (!point) return;
        if (now - point.at > keepS) {
          if (boughtS !== null) dropped += 1;
          return;
        }
        stamps.push(trailStamp(point));
        points.push([point.lat, point.lng]);
      });
      playTrailFed.set(sign, stamps);
      fedSigns.push(sign);
      if (boughtS !== null) noteBoughtTrailAge(dropped);
      if (points.length < 2) return;
      const line = L.polyline(points, {
        color: trailColour(car),
        weight: 4,
        opacity: 0.7
      }).addTo(map);
      line._feedStamps = stamps.slice();
      playTrails.push(line);
      if (keepTrailChip(sign)) keptSigns.push(sign);
    });
    const stale = [];
    playTrailFed.forEach(function (stamps, sign) {
      if (fedSigns.indexOf(sign) === -1) stale.push(sign);
    });
    stale.forEach(function (sign) { playTrailFed.delete(sign); });
    noteTrailReplaced(fedSigns);
    noteTrailChips(keptSigns);
  }

  function paintPlayFares(feed) {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const fares = feed && Array.isArray(feed.fares) ? feed.fares : [];
    let skippedT12 = 0;
    let skippedRiding = 0;
    const fareNames = [];
    fares.forEach((fare) => {
      if (!fare) return;
      if (String(fare.sign || "") === "T12") {
        skippedT12 += 1;
        return;
      }
      if (fareCarRiding(feed, fare)) {
        skippedRiding += 1;
        return;
      }
      const lat = Number(fare.lat);
      const lng = Number(fare.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const name = fare.name || "Passenger";
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "play-chip-icon",
          html: '<span class="play-fare" style="display:inline-block;padding:2px 6px;border-radius:6px;background:#fff;color:#0c1219;font:700 11px/1.2 system-ui,sans-serif;white-space:nowrap">' + name + "</span>",
          iconSize: [120, 22],
          iconAnchor: [60, 22]
        }),
        title: name,
        zIndexOffset: 650
      }).addTo(map);
      playFares.push(marker);
      fareNames.push(name);
    });
    const note = document.getElementById("play-fare-t12");
    if (note) {
      note.dataset.t12 = skippedT12 ? "hidden" : "none";
      note.dataset.skipped = String(skippedT12);
    }
    noteFareName(fareNames);
    noteFareRiding(skippedRiding);
  }

  function personTaxiSign(person) {
    if (!person) return "";
    return String(person.sign || person.taxi || "").trim();
  }

  function allocatedTaxiArrived(feed, person) {
    if (!person) return false;
    if (person.arrived === true) return true;
    const sign = personTaxiSign(person);
    if (!sign) return false;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    return cars.some(function (car) {
      return !!(car && String(car.sign || "") === sign && car.status === "with_passenger");
    });
  }

  function paintPlayPeople(feed) {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    const people = feed && Array.isArray(feed.people) ? feed.people : [];
    let drawn = 0;
    let stayed = 0;
    let arrived = 0;
    people.forEach((person) => {
      if (!person) return;
      if (allocatedTaxiArrived(feed, person)) {
        arrived += 1;
        return;
      }
      const lat = Number(person.lat);
      const lng = Number(person.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const sign = personTaxiSign(person);
      const label = personPinText(person);
      const width = Math.max(72, 8 + label.length * 7);
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "play-chip-icon",
          html: '<span class="play-person" style="display:inline-block;padding:2px 6px;border-radius:999px;background:#111827;color:#f8fafc;font:700 11px/1.2 system-ui,sans-serif;white-space:nowrap">' + personPinHtml(label) + "</span>",
          iconSize: [width, 22],
          iconAnchor: [width / 2, 22]
        }),
        title: label,
        zIndexOffset: 700
      }).addTo(map);
      marker._playPersonSign = sign;
      const time = personTimeText(person);
      if (time) marker.bindTooltip(mapHtml(time), { permanent: true, direction: "top", className: "play-leg-label", opacity: 0.95 });
      playPeople.push(marker);
      drawn += 1;
      if (person.allocated === true || sign) stayed += 1;
    });
    notePersonWaiting(drawn, stayed);
    notePersonStays(stayed, arrived);
    notePersonSign();
    showWaitingCount(waitingPeople(feed));
    showWaitingNames(waitingNames(feed));
  }

  function personPinText(person) {
    const name = String(person && person.name || "Person").trim() || "Person";
    const sign = personTaxiSign(person);
    const journey = String(person && person.journey || "").trim();
    let text = name;
    if (sign) text += " " + sign;
    if (journey) text += " " + journey;
    return text;
  }

  function personPinHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function notePersonSign() {
    const node = document.getElementById("play-person-sign");
    if (!node) return;
    const claimed = playPeople.filter((marker) => marker && marker._playPersonSign).length;
    node.dataset.sign = claimed ? "feed" : "none";
    node.dataset.claimed = String(claimed);
    node.dataset.offset = "none";
  }

  function waitingPeople(feed) {
    const people = feed && Array.isArray(feed.people) ? feed.people : [];
    let count = 0;
    people.forEach((person) => {
      if (!person || allocatedTaxiArrived(feed, person)) return;
      count += 1;
    });
    return count;
  }

  function waitingNames(feed) {
    const people = feed && Array.isArray(feed.people) ? feed.people : [];
    const names = [];
    people.forEach((person) => {
      if (!person || allocatedTaxiArrived(feed, person)) return;
      const name = String(person.name || "").trim();
      if (!name) return;
      const bits = [name];
      const journey = feedText(person.journey);
      if (journey) bits.push(journey);
      const sign = String(person.sign || "").trim();
      bits.push(sign || "unallocated");
      if (sign) {
        const left = sentSeconds(person.seconds_left);
        if (left !== null) bits.push(left + "s");
      } else {
        const waited = sentSeconds(person.waiting_s);
        if (waited !== null) bits.push("waited " + waited + "s");
      }
      names.push(bits.join(" · "));
    });
    return names;
  }

  function showWaitingNames(names) {
    const list = document.getElementById("play-waiting-names");
    if (!list) return;
    list.textContent = "";
    if (!names || !names.length) {
      list.hidden = true;
      return;
    }
    list.hidden = false;
    names.forEach((name) => {
      const item = document.createElement("li");
      item.textContent = name;
      list.appendChild(item);
    });
  }

  function jobCounts(feed) {
    const seen = new Set();
    let hunting = 0;
    let onBreak = 0;
    function take(car) {
      if (!car) return;
      const sign = String(car.sign || "");
      if (sign) {
        if (seen.has(sign)) return;
        seen.add(sign);
      }
      const job = typeof car.job === "string" ? car.job.trim() : "";
      if (job === "on break") onBreak += 1;
      else if (job === "hunting" || job === "travelling to a better spot") hunting += 1;
    }
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    cars.forEach(take);
    const firms = feed && Array.isArray(feed.firms) ? feed.firms : [];
    firms.forEach((firm) => {
      const rows = firm && Array.isArray(firm.cars) ? firm.cars : [];
      rows.forEach(take);
    });
    return { hunting: hunting, onBreak: onBreak };
  }

  function showJobCount(counts) {
    const node = document.getElementById("play-job-count");
    if (!node) return;
    if (!counts) {
      node.textContent = "";
      node.hidden = true;
      return;
    }
    node.hidden = false;
    node.textContent = counts.hunting + " hunting. " + counts.onBreak + " on break.";
  }

  function showWaitingCount(count) {
    const node = document.getElementById("play-waiting-count");
    if (count === null || count === undefined) {
      showWaitingNames(null);
      if (!node) return;
      node.textContent = "";
      node.hidden = true;
      return;
    }
    if (!node) return;
    node.hidden = false;
    node.textContent = count + " waiting";
  }

  function notePersonWaiting(drawn, stayed) {
    const node = document.getElementById("play-person-waiting");
    if (!node) return;
    node.dataset.person = drawn ? "drawn" : "none";
    node.dataset.drawn = String(drawn);
    node.dataset.allocated = String(stayed);
  }

  function notePersonStays(stayed, arrived) {
    const node = document.getElementById("play-person-stays");
    if (!node) return;
    node.dataset.stayed = stayed ? "stays" : "none";
    node.dataset.arrived = String(arrived);
  }

  function fareCarRiding(feed, fare) {
    const sign = String(fare && fare.sign || "");
    if (!sign) return false;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    return cars.some(function (car) {
      return !!(car && String(car.sign || "") === sign && car.status === "with_passenger");
    });
  }

  function noteFareRiding(skipped) {
    const node = document.getElementById("play-fare-riding");
    if (!node) return;
    node.dataset.riding = skipped ? "hidden" : "none";
    node.dataset.skipped = String(skipped);
  }

  function noteFareName(names) {
    const node = document.getElementById("play-fare-name");
    if (!node) return;
    node.dataset.text = "name";
    node.dataset.pins = String(names.length);
  }

  function showPlayAccount() {
    const form = document.getElementById("play-account");
    if (form) form.hidden = false;
    const start = document.getElementById("play-start");
    if (start) start.hidden = false;
    const signIn = document.getElementById("play-signin");
    const create = document.getElementById("play-create");
    if (signIn) signIn.hidden = true;
    if (create) create.hidden = true;
  }

  function keepPlayMap() {
    const page = document.getElementById("play-map-page");
    const mapEl = document.getElementById("play-map");
    if (page) page.hidden = false;
    if (mapEl) mapEl.hidden = false;
  }

  function hidePlayAccount() {
    const form = document.getElementById("play-account");
    if (form) form.hidden = true;
  }

  function clearPlayChips() {
    const wasFollowing = playFollow;
    playChosen = "";
    playFollow = false;
    clearPlayAhead();
    clearPlayFirms();
    clearFeedDepots();
    clearFeedLoiter();
    showJobCount(null);
    if (wasFollowing) zoomToAllTaxis(playFeed);
    noteFollow();
    playChips.forEach((marker) => map.removeLayer(marker));
    playChips.clear();
    playSalePick = "";
    playSaleChips.forEach((marker) => map.removeLayer(marker));
    playSaleChips.clear();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
  }

  function dropBoughtChips() {
    Array.from(playChips.keys()).forEach((sign) => {
      if (PLAY_SIGNS.indexOf(sign) !== -1) return;
      const marker = playChips.get(sign);
      if (marker) map.removeLayer(marker);
      playChips.delete(sign);
      const item = document.querySelector('#play-taxi-list [data-sign="' + sign + '"]');
      if (item) item.remove();
    });
  }

  function firmCalled(feed, name) {
    const firms = feed && Array.isArray(feed.firms) ? feed.firms : [];
    for (let i = 0; i < firms.length; i++) {
      const firm = firms[i];
      const called = firm && typeof firm.firm === "string" ? firm.firm.trim().toLowerCase() : "";
      if (called === name) return firm;
    }
    return null;
  }

  function paintPlayOffice() {
    const panel = document.getElementById("play-office");
    if (!panel) return;
    if (playOfficeName !== "north" && playOfficeName !== "south") {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    const title = document.getElementById("play-office-title");
    if (title) title.textContent = playOfficeName === "north" ? "North office" : "South office";
    const firm = firmCalled(playFeed, playOfficeName);
    const fareNode = document.getElementById("play-office-fare");
    const fare = feedPence(firm, "fare_in");
    if (fareNode) fareNode.textContent = fare === null ? "" : "fare_in " + fare + " pence";
    const list = document.getElementById("play-office-rows");
    const empty = document.getElementById("play-office-empty");
    if (list) list.textContent = "";
    const rows = firm && Array.isArray(firm.bookings) ? firm.bookings : [];
    let shown = 0;
    rows.forEach((row) => {
      if (!row || typeof row !== "object") return;
      const sign = feedText(row.sign);
      const pickup = feedText(row.pickup);
      const drop = feedText(row.drop);
      const pence = feedPence(row, "pence");
      if (!sign && !pickup && !drop && pence === null) return;
      shown += 1;
      if (!list) return;
      const item = document.createElement("li");
      const bits = [];
      if (sign) bits.push(sign);
      if (pickup) bits.push(pickup);
      if (drop) bits.push(drop);
      if (pence !== null) bits.push(pence + " pence");
      item.textContent = bits.join(" ");
      list.appendChild(item);
    });
    if (empty) {
      empty.hidden = shown > 0;
      empty.textContent = shown > 0 ? "" : "No bookings.";
    }
  }

  function openPlayOffice(name) {
    playOfficeName = name;
    paintPlayOffice();
  }

  function closePlayOffice() {
    playOfficeName = "";
    paintPlayOffice();
  }

  function signOutPlay() {
    closePlayOffice();
    localStorage.removeItem("hackathon-empire-token");
    localStorage.removeItem("hackathon-empire-user");
    playSignAgain = false;
    dropBoughtChips();
    clearPlayChips();
    const leftDuringBuy = playBuying;
    clearPlaySpent();
    clearPlayTrails();
    showPlayAccount();
    paintPlayStatus(null);
    paintPlaySide(null);
    paintPlayBuy();
    if (leftDuringBuy) {
      clearPlaySpent();
      noteSignOutFlight();
    }
    clearSignOutFailed();
    clearSignOutFares();
    clearSignOutMoney();
    clearSignOutPeople();
  }

  function clearSignOutFares() {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-signout-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.signed = "out";
  }

  function clearSignOutMoney() {
    const rows = document.querySelectorAll("#play-money-lines li");
    rows.forEach((row) => {
      row.textContent = "";
    });
    const balance = document.getElementById("play-balance");
    if (balance) balance.textContent = "";
    const node = document.getElementById("play-signout-money");
    if (!node) return;
    let showing = false;
    rows.forEach((row) => {
      if (row.textContent) showing = true;
    });
    node.dataset.money = showing ? "shows" : "clear";
    node.dataset.signed = "out";
  }

  function clearSignOutPeople() {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    showWaitingCount(null);
    const node = document.getElementById("play-signout-person");
    if (!node) return;
    node.dataset.person = playPeople.length === 0 ? "clear" : "shows";
    node.dataset.signed = "out";
  }

  function clearSignOutFailed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-signout-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.signed = "out";
  }

  function noteSignOutFlight() {
    const node = document.getElementById("play-signout-flight");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.flight = "left";
  }

  let playBuying = false;
  let playLoitering = false;
  let playCancelling = false;

  function playBuyPence() {
    return 800000;
  }

  function noteBuyFlight() {
    const node = document.getElementById("play-buy-flight");
    if (!node) return;
    node.dataset.flight = playBuying ? "in-flight" : "ready";
    node.dataset.pence = String(playBuyPence());
  }

  function paintPlaySpent(feed) {
    const line = document.getElementById("play-spent");
    if (!line) return;
    const token = !!(localStorage.getItem("hackathon-empire-token") || "");
    if (token && feedListsT11(feed)) line.textContent = String(playBuyPence()) + " pence spent";
    else line.textContent = "";
    const note = document.getElementById("play-spent-feed");
    if (!note) return;
    note.dataset.spent = line.textContent ? "t11" : "empty";
  }

  function showPlaySpent() {
    paintPlaySpent(playFeed);
  }

  function clearPlaySpent() {
    const line = document.getElementById("play-spent");
    if (line) line.textContent = "";
  }

  function noteBuyReject() {
    const node = document.getElementById("play-buy-reject");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const start = document.getElementById("play-start");
    const mapEl = document.getElementById("play-map");
    const page = document.getElementById("play-map-page");
    const mapStays = !!(page && page.hidden === false && mapEl && mapEl.hidden === false);
    node.dataset.spent = line && line.textContent === "" ? "cleared" : "shows";
    node.dataset.start = start && start.hidden === false ? "back" : "away";
    node.dataset.map = mapStays ? "stays" : "gone";
    node.dataset.screen = mapStays ? "full" : "hidden";
    node.dataset.pence = String(playBuyPence());
  }

  function clearFeed401Chips() {
    clearPlayChips();
    const list = document.getElementById("play-taxi-list");
    const node = document.getElementById("play-feed-401-chips");
    if (!node) return;
    node.dataset.chips = playChips.size === 0 ? "clear" : "shows";
    node.dataset.list = list && list.textContent === "" ? "clear" : "shows";
    node.dataset.feed = "401";
  }

  function clearFeed401Failed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-feed-401-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.feed = "401";
  }

  function clearFeed401Fares() {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-feed-401-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.feed = "401";
  }

  function clearFeed401People() {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    showWaitingCount(null);
    const node = document.getElementById("play-feed-401-person");
    if (!node) return;
    node.dataset.person = playPeople.length === 0 ? "clear" : "shows";
    node.dataset.feed = "401";
  }

  function clearFeed401Money() {
    const rows = document.querySelectorAll("#play-money-lines li");
    rows.forEach((row) => {
      row.textContent = "";
    });
    const balance = document.getElementById("play-balance");
    if (balance) balance.textContent = "";
    const node = document.getElementById("play-feed-401-money");
    if (!node) return;
    let showing = false;
    rows.forEach((row) => {
      if (row.textContent) showing = true;
    });
    node.dataset.money = showing ? "shows" : "clear";
    node.dataset.feed = "401";
  }

  function noteFeed401() {
    const node = document.getElementById("play-feed-401");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.chip = playChips.has("T11") ? "stays" : "gone";
    node.dataset.feed = "empire";
  }

  function seatPlayBuy() {
    const money = document.getElementById("play-money");
    const mapEl = document.getElementById("play-map");
    const row = document.getElementById("play-buy-row");
    const note = document.getElementById("play-buy-sits");
    const button = document.getElementById("play-buy");
    if (money && row && !money.contains(row)) money.appendChild(row);
    if (money && note && !money.contains(note)) money.appendChild(note);
    ["play-spent-rule", "play-spent"].forEach((id) => {
      const node = document.getElementById(id);
      if (money && node && !money.contains(node)) money.appendChild(node);
    });
    if (!button) return;
    button.style.position = "static";
    button.style.inset = "auto";
    button.style.zIndex = "auto";
    if (mapEl && mapEl.contains(button) && money) money.appendChild(button);
  }

  function feedListsT11(feed) {
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    return cars.some(function (car) {
      return !!(car && String(car.sign) === "T11" && !car.for_sale);
    });
  }

  function noteBuyOnce(listed) {
    const node = document.getElementById("play-buy-once");
    if (!node) return;
    node.dataset.offered = listed ? "no" : "yes";
    node.dataset.pence = String(playBuyPence());
  }

  function saleRows(feed) {
    const rows = feed && Array.isArray(feed.for_sale) ? feed.for_sale : [];
    const owned = new Set();
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    cars.forEach((car) => {
      if (car && car.sign && !car.for_sale) owned.add(String(car.sign));
    });
    return rows.filter((row) => row && row.sign && !owned.has(String(row.sign)) && String(row.sign) === "T11");
  }

  function playBalance(feed) {
    if (!feed) return 0;
    const sent = Number(feed.balance);
    if (Number.isFinite(sent)) return Math.trunc(sent);
    const cash = Number(feed.cash_pence);
    const fare = Number(feed.fare_in);
    const share = Number(feed.driver_share);
    const fuel = Number(feed.fuel);
    const standing = Number(feed.standing);
    if ([cash, fare, share, fuel, standing].every(Number.isFinite)) {
      return Math.trunc(cash + fare - share - fuel - standing);
    }
    return 0;
  }

  function selectedSale() {
    if (!playSalePick) return null;
    const ghost = saleRows(playFeed).find((row) => String(row.sign) === playSalePick);
    if (ghost) return { sign: playSalePick, pence: Number(ghost.pence) || playBuyPence() };
    const cars = playFeed && Array.isArray(playFeed.cars) ? playFeed.cars : [];
    const car = cars.find((row) => row && String(row.sign) === playSalePick && row.for_sale);
    if (car) return { sign: playSalePick, pence: playBuyPence() };
    return null;
  }

  function saleIcon(sign) {
    const picked = playSalePick === sign;
    const border = picked ? "2px solid #f8fafc" : "2px dashed #99f6e4";
    const html = '<span class="play-chip" style="display:flex;align-items:center;justify-content:center;min-width:92px;height:22px;padding:0 6px;border-radius:6px;background:#134e4a;color:#f8fafc;border:' + border + ';cursor:pointer;font:700 11px/1 system-ui,sans-serif;white-space:nowrap">' + sign + " for sale</span>";
    return L.divIcon({ className: "play-chip-icon", html: html, iconSize: [92, 22], iconAnchor: [46, 11] });
  }

  function paintPlaySale(feed) {
    if (!playFed) return;
    const rows = saleRows(feed);
    const seen = new Set();
    rows.forEach((row) => {
      const sign = String(row.sign);
      const lat = Number(row.lat);
      const lng = Number(row.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      seen.add(sign);
      const place = [lat - 0.02, lng];
      let marker = playSaleChips.get(sign);
      if (!marker) {
        marker = L.marker(place, {
          icon: saleIcon(sign),
          title: sign + " for sale",
          zIndexOffset: 800
        }).addTo(map);
        marker.on("click", function (event) {
          if (event && event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
          playSalePick = sign;
          playChosen = sign;
          playFollow = false;
          paintPlaySale(playFeed);
          paintPlayBuy();
        });
        playSaleChips.set(sign, marker);
      } else {
        marker.setLatLng(place);
        marker.setIcon(saleIcon(sign));
      }
    });
    playSaleChips.forEach((marker, sign) => {
      if (seen.has(sign)) return;
      map.removeLayer(marker);
      playSaleChips.delete(sign);
      if (playSalePick === sign) playSalePick = "";
    });
  }

  function paintPlayBuy() {
    const button = document.getElementById("play-buy");
    const note = document.getElementById("play-sale-pick");
    seatPlayBuy();
    if (!button) return;
    const listed = feedListsT11(playFeed);
    const sale = selectedSale();
    const token = !!(localStorage.getItem("hackathon-empire-token") || "");
    const price = sale ? sale.pence : playBuyPence();
    const affordable = playBalance(playFeed) >= price;
    button.hidden = !token || listed || !sale;
    button.disabled = playBuying || !affordable;
    if (!sale) button.textContent = "Buy this taxi for " + playBuyPence();
    else if (affordable) button.textContent = "Buy " + sale.sign + " for " + price;
    else button.textContent = "Not enough money for " + sale.sign;
    if (note) {
      if (!token) note.textContent = "";
      else if (sale) note.textContent = sale.sign + " is for sale at " + price + " pence.";
      else if (listed) note.textContent = "No taxi is for sale.";
      else note.textContent = "Click the taxi marked for sale, then buy it here.";
    }
    noteBuyOnce(listed);
    paintPlaySpent(playFeed);
    paintPlayLoiter();
  }

  async function buyPlayCar() {
    if (playBuying) return;
    const sale = selectedSale();
    if (!sale || feedListsT11(playFeed)) return;
    const status = document.getElementById("play-buy-status");
    if (playBalance(playFeed) < sale.pence) {
      if (status) status.textContent = "Not enough money.";
      paintPlayBuy();
      return;
    }
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    if (!token || !base) {
      if (status) status.textContent = "";
      showPlayAccount();
      return;
    }
    playBuying = true;
    noteBuyFlight();
    paintPlayBuy();
    let res;
    try {
      res = await fetch(base + "/v1/empire/buy", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ pence: sale.pence })
      });
    } catch (err) {
      if (localStorage.getItem("hackathon-empire-token") || "") {
        if (status) status.textContent = "Buy failed.";
      }
      return;
    } finally {
      playBuying = false;
      noteBuyFlight();
      paintPlayBuy();
      if (!(localStorage.getItem("hackathon-empire-token") || "")) {
        clearPlaySpent();
        noteSignOutFlight();
      }
    }
    if (!(localStorage.getItem("hackathon-empire-token") || "")) return;
    if (res.status === 401) {
      localStorage.removeItem("hackathon-empire-token");
      closePlayOffice();
      paintPlayStatus(null);
      showPlayAccount();
      keepPlayMap();
      paintPlayBuy();
      clearPlaySpent();
      noteBuyReject();
      return;
    }
    if (!res.ok) {
      let detail = "";
      try {
        const payload = await res.json();
        detail = payload && payload.detail ? String(payload.detail) : "";
      } catch (err) {
        detail = "";
      }
      if (status) status.textContent = detail.indexOf("Not enough") !== -1 ? "Not enough money." : "Buy failed.";
      return;
    }
    if (status) status.textContent = "";
    showPlaySpent();
    pollPlay();
  }

  async function cancelPlayJob() {
    if (playCancelling || !playFollow || !playChosen) return;
    const status = document.getElementById("play-cancel-status");
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    if (!token || !base) {
      if (status) status.textContent = "";
      return;
    }
    playCancelling = true;
    const cancel = document.getElementById("play-cancel");
    if (cancel) cancel.disabled = true;
    if (status) status.textContent = "Cancelling…";
    let res;
    try {
      res = await fetch(base + "/v1/empire/cancel", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ sign: playChosen })
      });
    } catch (err) {
      if (status) status.textContent = "Cancel failed.";
      return;
    } finally {
      playCancelling = false;
      if (cancel) cancel.disabled = false;
    }
    if (!res) return;
    if (res.status === 401) {
      localStorage.removeItem("hackathon-empire-token");
      showPlayAccount();
      if (status) status.textContent = "";
      return;
    }
    if (!res.ok) {
      if (status) status.textContent = "That job is not waiting to move.";
      return;
    }
    if (status) status.textContent = "Job cancelled.";
    pollPlay();
  }

  function paintPlayLoiter() {
    const form = document.getElementById("play-loiter");
    if (!form) return;
    const token = !!(localStorage.getItem("hackathon-empire-token") || "");
    form.hidden = !token;
    if (!token) {
      const status = document.getElementById("play-loiter-status");
      if (status) status.textContent = "";
    }
    const button = document.getElementById("play-loiter-set");
    if (button) button.disabled = playLoitering;
  }

  function loiterFieldNumber(id) {
    const node = document.getElementById(id);
    const raw = node ? String(node.value).trim() : "";
    if (raw === "") return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;
    return value;
  }

  async function setPlayLoiter(event) {
    if (event) event.preventDefault();
    if (playLoitering) return;
    const status = document.getElementById("play-loiter-status");
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    const lat = loiterFieldNumber("play-loiter-lat");
    const lng = loiterFieldNumber("play-loiter-lng");
    const radiusKm = loiterFieldNumber("play-loiter-km");
    const firmNode = document.getElementById("play-loiter-firm");
    const firm = firmNode ? firmNode.value.trim() : "";
    if (!token || !base) {
      if (status) status.textContent = "";
      showPlayAccount();
      paintPlayLoiter();
      return;
    }
    if (lat === null || lng === null || radiusKm === null) {
      if (status) status.textContent = "The patch was not set.";
      return;
    }
    playLoitering = true;
    paintPlayLoiter();
    let res;
    try {
      res = await fetch(base + "/v1/empire/loiter", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ lat: lat, lng: lng, radius_km: radiusKm, firm: firm })
      });
    } catch (err) {
      if (localStorage.getItem("hackathon-empire-token") || "") {
        if (status) status.textContent = "The patch was not set.";
      }
      return;
    } finally {
      playLoitering = false;
      paintPlayLoiter();
    }
    if (!(localStorage.getItem("hackathon-empire-token") || "")) return;
    if (res.status === 401) {
      localStorage.removeItem("hackathon-empire-token");
      clearFeedLoiter();
      paintPlayStatus(null);
      showPlayAccount();
      keepPlayMap();
      paintPlayBuy();
      clearPlaySpent();
      noteBuyReject();
      return;
    }
    if (!res.ok) {
      if (status) status.textContent = "The patch was not set.";
      return;
    }
    const data = await res.json().catch(function () { return null; });
    if (status) status.textContent = "";
    if (data) paintFeedLoiter(data);
    pollPlay();
  }

  function clearSpentForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    clearPlaySpent();
    const node = document.getElementById("play-next-account");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.account = "next";
  }

  function clearFailedForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-next-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.account = "next";
  }

  function clearTrailForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    clearPlayTrails();
    playTrailFed.clear();
    const node = document.getElementById("play-next-trail");
    if (!node) return;
    node.dataset.trail = playTrails.length === 0 && playTrailFed.size === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearFaresForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-next-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearPeopleForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    showWaitingCount(null);
    const node = document.getElementById("play-next-person");
    if (!node) return;
    node.dataset.person = playPeople.length === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearChipsForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    clearPlayChips();
    const list = document.getElementById("play-taxi-list");
    const node = document.getElementById("play-next-chips");
    if (!node) return;
    node.dataset.chips = playChips.size === 0 ? "clear" : "shows";
    node.dataset.list = list && list.textContent === "" ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearMoneyForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    const rows = document.querySelectorAll("#play-money-lines li");
    rows.forEach((row) => {
      row.textContent = "";
    });
    const balance = document.getElementById("play-balance");
    if (balance) balance.textContent = "";
    const node = document.getElementById("play-next-money");
    if (!node) return;
    let showing = false;
    rows.forEach((row) => {
      if (row.textContent) showing = true;
    });
    node.dataset.money = showing ? "shows" : "clear";
    node.dataset.feed = "waiting";
  }

  function clearFeedForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return false;
    playFeed = null;
    playFeedEpoch += 1;
    return true;
  }

  function noteNextFeed() {
    const node = document.getElementById("play-next-feed");
    if (!node) return;
    const button = document.getElementById("play-buy");
    const token = !!(localStorage.getItem("hackathon-empire-token") || "");
    node.dataset.feed = playFeed ? "held" : "clear";
    node.dataset.t11 = feedListsT11(playFeed) ? "listed" : "gone";
    node.dataset.buy = token && button && !feedListsT11(playFeed) ? "offered" : "hidden";
  }

  async function createPlayAccount() {
    const usernameEl = document.getElementById("play-username");
    const passwordEl = document.getElementById("play-password");
    const status = document.getElementById("play-account-status");
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    const registered = await fetch(base + "/register", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    if (!registered.ok) {
      if (status) status.textContent = "Create account failed.";
      return;
    }
    const logged = await fetch(base + "/login", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    const session = await logged.json().catch(function () { return null; });
    if (!logged.ok || !session || !session.access_token) {
      if (status) status.textContent = "Sign in failed.";
      return;
    }
    clearSpentForNextAccount(username);
    clearFailedForNextAccount(username);
    const clearedFeed = clearFeedForNextAccount(username);
    clearTrailForNextAccount(username);
    clearFaresForNextAccount(username);
    clearPeopleForNextAccount(username);
    clearChipsForNextAccount(username);
    clearMoneyForNextAccount(username);
    localStorage.setItem("hackathon-empire-token", session.access_token);
    localStorage.setItem("hackathon-empire-user", username);
    paintPlayLoiter();
    if (clearedFeed) {
      paintPlayBuy();
      noteNextFeed();
    }
    if (status) status.textContent = "";
    hidePlayAccount();
    paintPlayStatus(null);
    pollPlay();
  }

  function accountProblem(body, fallback) {
    let msg = "";
    if (body && typeof body.detail === "string" && body.detail) msg = body.detail;
    else if (body && Array.isArray(body.detail) && body.detail[0] && body.detail[0].msg) msg = String(body.detail[0].msg);
    msg = msg.replace(/^Value error,\s*/i, "");
    return msg || fallback;
  }

  function keepStartedScreen() {
    const screen = document.getElementById("play-screen");
    const money = document.getElementById("play-money");
    const mapEl = document.getElementById("play-map");
    keepPlayMap();
    keepPlayMoney();
    if (screen && money && money.parentElement !== screen) screen.appendChild(money);
    if (screen && window.getComputedStyle) {
      const shown = window.getComputedStyle(screen).display;
      if (shown === "grid" || shown === "flex") screen.style.display = "block";
    }
    seatPlayScreen();
    const node = document.getElementById("play-started-screen");
    if (!node) return;
    const nav = document.querySelector(".site-nav");
    const mapBox = mapEl && mapEl.hidden === false ? mapEl.getBoundingClientRect() : null;
    const navBox = nav ? nav.getBoundingClientRect() : null;
    const under = !!(mapBox && navBox && mapBox.top + 1 >= navBox.bottom && mapBox.height > 0);
    const placed = money && window.getComputedStyle ? window.getComputedStyle(money).position : "";
    node.dataset.screen = under ? "full" : "short";
    node.dataset.money = money && money.hidden === false && (placed === "fixed" || placed === "absolute") ? "corner" : "away";
    const column = screen && window.getComputedStyle ? window.getComputedStyle(screen).display : "";
    node.dataset.column = column === "grid" || column === "flex" ? "side" : "none";
  }

  async function startPlay(event) {
    if (event) event.preventDefault();
    const form = document.getElementById("play-account");
    const usernameEl = document.getElementById("play-username");
    const passwordEl = document.getElementById("play-password");
    const status = document.getElementById("play-account-status");
    if (form && typeof form.reportValidity === "function" && !form.reportValidity()) {
      if (status) status.textContent = "";
      return;
    }
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    let registered;
    let registerProblem = "";
    try {
      registered = await fetch(base + "/register", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
      });
    } catch (err) {
      if (status) status.textContent = "The API did not answer.";
      return;
    }
    const registeredBody = await registered.json().catch(function () { return null; });
    if (registered && !registered.ok && registered.status !== 409) {
      registerProblem = accountProblem(registeredBody, "");
    }
    let logged;
    try {
      logged = await fetch(base + "/login", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
      });
    } catch (err) {
      if (status) status.textContent = registerProblem || "The API did not answer.";
      return;
    }
    const session = await logged.json().catch(function () { return null; });
    if (!logged.ok || !session || !session.access_token) {
      if (status) status.textContent = registerProblem || accountProblem(session, "Start failed.");
      return;
    }
    clearSpentForNextAccount(username);
    clearFailedForNextAccount(username);
    const clearedFeed = clearFeedForNextAccount(username);
    clearTrailForNextAccount(username);
    clearFaresForNextAccount(username);
    clearPeopleForNextAccount(username);
    clearChipsForNextAccount(username);
    clearMoneyForNextAccount(username);
    localStorage.setItem("hackathon-empire-token", session.access_token);
    localStorage.setItem("hackathon-empire-user", username);
    paintPlayLoiter();
    if (clearedFeed) {
      paintPlayBuy();
      noteNextFeed();
    }
    if (status) status.textContent = "";
    playSignAgain = !!(registered && registered.status === 409);
    if (playSignAgain) {
      dropSignedChips();
      clearSignedFares();
      clearSignedTrails();
      clearSignedPeople();
      clearSignedFailed();
      clearSignedSpent();
      clearSignedMoney();
    }
    hidePlayAccount();
    keepStartedScreen();
    paintPlayStatus(null);
    pollPlay();
  }

  function noteStartedTen(feed) {
    const mapEl = document.getElementById("play-map");
    if (!mapEl) return;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    let count = 0;
    PLAY_SIGNS.forEach((sign) => {
      if (cars.some((car) => car && car.sign === sign) && playChips.has(sign)) count += 1;
    });
    mapEl.dataset.ten = String(count);
  }

  async function signInPlay(event) {
    event.preventDefault();
    const usernameEl = document.getElementById("play-username");
    const passwordEl = document.getElementById("play-password");
    const status = document.getElementById("play-account-status");
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    const logged = await fetch(base + "/login", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    const session = await logged.json().catch(function () { return null; });
    if (!logged.ok || !session || !session.access_token) {
      if (status) status.textContent = "Sign in failed.";
      return;
    }
    localStorage.setItem("hackathon-empire-token", session.access_token);
    localStorage.setItem("hackathon-empire-user", username);
    paintPlayLoiter();
    if (status) status.textContent = "";
    playSignAgain = true;
    dropSignedChips();
    clearSignedFares();
    clearSignedTrails();
    clearSignedPeople();
    clearSignedFailed();
    clearSignedSpent();
    clearSignedMoney();
    hidePlayAccount();
    keepPlayMap();
    paintPlayStatus(null);
    pollPlay();
  }

  function dropSignedChips() {
    clearPlayChips();
    playFeedEpoch += 1;
    const node = document.getElementById("play-signed-chips");
    if (!node) return;
    node.dataset.chips = playChips.size === 0 ? "gone" : "stays";
    node.dataset.feed = "waiting";
  }

  function clearSignedFares() {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-signed-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearSignedTrails() {
    clearPlayTrails();
    playTrailFed.clear();
    const node = document.getElementById("play-signed-trail");
    if (!node) return;
    node.dataset.trail = playTrails.length === 0 && playTrailFed.size === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearSignedPeople() {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    showWaitingCount(null);
    const node = document.getElementById("play-signed-person");
    if (!node) return;
    node.dataset.person = playPeople.length === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearSignedFailed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-signed-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.feed = "waiting";
  }

  function clearSignedSpent() {
    clearPlaySpent();
    const node = document.getElementById("play-signed-spent");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearSignedMoney() {
    const rows = document.querySelectorAll("#play-money-lines li");
    rows.forEach((row) => {
      row.textContent = "";
    });
    const balance = document.getElementById("play-balance");
    if (balance) balance.textContent = "";
    const node = document.getElementById("play-signed-money");
    if (!node) return;
    let showing = false;
    rows.forEach((row) => {
      if (row.textContent) showing = true;
    });
    node.dataset.money = showing ? "shows" : "clear";
    node.dataset.feed = "waiting";
  }

  function clearBuyFailed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-buy-cleared");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.feed = "good";
  }

  function clearQuietFailed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-quiet-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.feed = "quiet";
  }

  function clearQuietSpent() {
    clearPlaySpent();
    const node = document.getElementById("play-quiet-spent");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.feed = "quiet";
  }

  function clearQuietFares() {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-quiet-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.feed = "quiet";
  }

  function clearQuietChips() {
    clearPlayChips();
    const list = document.getElementById("play-taxi-list");
    const node = document.getElementById("play-quiet-chips");
    if (!node) return;
    node.dataset.chips = playChips.size === 0 ? "clear" : "shows";
    node.dataset.list = list && list.textContent === "" ? "clear" : "shows";
    node.dataset.feed = "quiet";
  }

  function clearQuietMoney() {
    const rows = document.querySelectorAll("#play-money-lines li");
    rows.forEach((row) => {
      row.textContent = "";
    });
    const balance = document.getElementById("play-balance");
    if (balance) balance.textContent = "";
    const node = document.getElementById("play-quiet-money");
    if (!node) return;
    let showing = false;
    rows.forEach((row) => {
      if (row.textContent) showing = true;
    });
    node.dataset.money = showing ? "shows" : "clear";
    node.dataset.feed = "quiet";
  }

  function paintQuietFeed() {
    const line = document.getElementById("play-status");
    if (line) line.textContent = "The feed is quiet.";
    keepStatusClear();
    clearQuietFailed();
    clearQuietSpent();
    clearQuietFares();
    clearQuietChips();
    clearQuietMoney();
    clearQuietPeople();
  }

  function clearQuietPeople() {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    showWaitingCount(null);
    const node = document.getElementById("play-quiet-person");
    if (!node) return;
    node.dataset.person = playPeople.length === 0 ? "clear" : "shows";
    node.dataset.feed = "quiet";
  }

  async function pollPlay() {
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    if (!token || !base) return;
    const path = playFeedPath();
    if (!playMayRequest(path) || path.indexOf("/v1/devices") !== -1) return;
    const epoch = playFeedEpoch;
    let res;
    try {
      res = await fetch(base + path, {
        headers: { Authorization: "Bearer " + token }
      });
    } catch (err) {
      if (epoch !== playFeedEpoch) return;
      paintQuietFeed();
      return;
    }
    if (epoch !== playFeedEpoch) return;
    if (res.status === 401) {
      localStorage.removeItem("hackathon-empire-token");
      closePlayOffice();
      paintPlayStatus(null);
      showPlayAccount();
      keepPlayMap();
      dropBoughtChips();
      clearFeed401Chips();
      paintPlayBuy();
      clearPlaySpent();
      noteFeed401();
      clearFeed401Fares();
      clearFeed401Failed();
      clearFeed401People();
      clearFeed401Money();
      return;
    }
    if (!res.ok) {
      paintQuietFeed();
      return;
    }
    const data = await res.json();
    playFeed = data;
    clearBuyFailed();
    const server = Number(data.server_now);
    if (Number.isFinite(server)) playClock = { server: server, client: Date.now() / 1000 };
    clearBusToggle();
    clearOfficeGrid();
    clearPhoneList();
    clearPlaceStops();
    seatPlayLocks();
    hidePlayAccount();
    paintPlayBuy();
    paintPlayStatus(data);
    paintPlayMoney(data);
    playFed = true;
    paintPlayCars(data);
    paintPlaySale(data);
    paintFeedDepots(data);
    paintPlayOffice();
    paintFeedLoiter(data);
    showJobCount(jobCounts(data));
    noteStartedTen(data);
    paintPlayTrails(data);
    paintPlayFares(data);
    paintPlayPeople(data);
    paintPlayOsrm(data);
    paintPlaySide(data);
    if (!playMotion) playMotion = requestAnimationFrame(glidePlay);
  }

  function glidePlay() {
    playMotion = 0;
    const cars = playFeed && Array.isArray(playFeed.cars) ? playFeed.cars : [];
    const now = playNow();
    cars.forEach((car) => {
      if (!car || !car.sign) return;
      const sign = String(car.sign);
      const marker = playChips.get(sign);
      if (!marker) return;
      const place = playPlace(car, now);
      if (!place) return;
      marker.setLatLng(place);
      labelOneCar(marker, car, now, "");
      const item = document.querySelector('#play-taxi-list [data-sign="' + sign + '"]');
      if (!item) return;
      fillTaxiListItem(item, sign, car, place[0], place[1]);
    });
    noteWithPassenger();
    noteToPassenger();
    noteCarJob();
    paintPlayAhead(playFeed);
    paintPlayFirms(playFeed);
    followChosenTaxi(playFeed);
    paintPlaySide(playFeed);
    playMotion = requestAnimationFrame(glidePlay);
  }

  function statusName(value) {
    const name = typeof value === "string" ? value.trim() : "";
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "";
    return name;
  }

  function paintPlayStatus(feed) {
    const line = document.getElementById("play-status");
    if (!line) return;
    const fleet = "The fleet runs on the box.";
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const fromFeed = statusName(feed && feed.username);
    const fromStore = statusName(localStorage.getItem("hackathon-empire-user"));
    const who = token ? (fromFeed || fromStore) : "";
    let text = who ? who + ". " + fleet : fleet;
    if (feed && feed.osrm_unavailable === true) text += " OSRM unavailable";
    line.textContent = text;
    hideCompanyTotals();
    keepStatusClear();
  }

  function paintPlayOsrm(feed) {
    const line = document.getElementById("play-osrm");
    const side = document.getElementById("play-side-osrm");
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const missing = (feed && feed.osrm_unavailable === true) || cars.some((car) => car && car.osrm === false);
    const text = missing ? "OSRM unavailable" : "";
    if (line) line.textContent = text;
    if (side) side.textContent = text;
  }

  function hideCompanyTotals() {
    ["2860", "1130", "1240"].forEach((bad) => {
      document.querySelectorAll("#play-money-lines li, #play-status").forEach((node) => {
        if (!node || node.textContent.indexOf(bad) === -1) return;
        node.textContent = node.textContent.split(bad).join("").replace(/\s{2,}/g, " ").trim();
      });
    });
  }

  function shownPence(value) {
    const pence = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
    if (pence === 2860 || pence === 1130 || pence === 1240 || pence === -1120) return "";
    return String(pence);
  }

  function feedHasCash(feed) {
    return !!(feed && Object.prototype.hasOwnProperty.call(feed, "cash_pence") && Number.isFinite(Number(feed.cash_pence)));
  }

  function cashPenceAmount(feed) {
    if (!feedHasCash(feed)) return "";
    return shownPence(feed.cash_pence);
  }

  function noteCashPence(feed) {
    const node = document.getElementById("play-cash-pence");
    const row = document.querySelector('[data-money="cash_pence"]');
    if (row) row.dataset.place = "corner";
    if (!node) return;
    node.dataset.cash = feedHasCash(feed) ? "pence" : "waiting";
    node.dataset.amount = cashPenceAmount(feed);
  }

  function fareInAmount(value) {
    const amount = shownPence(value);
    if (amount === "800000") return "";
    return amount;
  }

  function driverShareAmount(value) {
    const amount = shownPence(value);
    if (amount === "400000") return "";
    return amount;
  }

  function noteDriverShare() {
    const row = document.querySelector('[data-money="driver_share"]');
    const note = document.getElementById("play-driver-share");
    if (!note) return;
    note.dataset.share = row && row.textContent.indexOf("400000") !== -1 ? "shows" : "clear";
  }

  function noteFareIn() {
    const row = document.querySelector('[data-money="fare_in"]');
    const note = document.getElementById("play-fare-in");
    if (!note) return;
    note.dataset.fare = row && row.textContent.indexOf("800000") !== -1 ? "shows" : "clear";
  }

  function paintPlayMoney(feed) {
    ["fare_in", "driver_share", "fuel", "standing", "new_car", "cash_pence"].forEach((key) => {
      const row = document.querySelector('[data-money="' + key + '"]');
      if (!row) return;
      const amount = key === "fare_in" ? fareInAmount(feed && feed[key]) : key === "driver_share" ? driverShareAmount(feed && feed[key]) : key === "cash_pence" ? cashPenceAmount(feed) : shownPence(feed && feed[key]);
      const cost = amount !== "" && (key === "driver_share" || key === "fuel" || key === "standing");
      row.textContent = (amount === "" ? key : key + " " + (cost ? "-" : "") + amount) + " pence";
    });
    const balanceNode = document.getElementById("play-balance");
    if (balanceNode) balanceNode.textContent = feed ? playBalance(feed) + " pence" : "";
    hideCompanyTotals();
    noteFareIn();
    noteDriverShare();
    noteCashPence(feed);
    const money = document.getElementById("play-money");
    if (money) money.dataset.follows = "feed";
    keepPlayMoney();
  }

  const playAccount = document.getElementById("play-account");
  if (playAccount) playAccount.addEventListener("submit", startPlay);
  const playStart = document.getElementById("play-start");
  if (playStart) playStart.addEventListener("click", startPlay);
  const playCreate = document.getElementById("play-create");
  if (playCreate) playCreate.addEventListener("click", createPlayAccount);
  const playSignOut = document.getElementById("play-signout");
  if (playSignOut) playSignOut.addEventListener("click", signOutPlay);
  const playFollowStop = document.getElementById("play-follow-stop");
  if (playFollowStop) playFollowStop.addEventListener("click", stopPlayFollow);
  const playCancel = document.getElementById("play-cancel");
  if (playCancel) playCancel.addEventListener("click", cancelPlayJob);
  const playOfficeNorth = document.getElementById("play-office-north");
  if (playOfficeNorth) playOfficeNorth.addEventListener("click", function () { openPlayOffice("north"); });
  const playOfficeSouth = document.getElementById("play-office-south");
  if (playOfficeSouth) playOfficeSouth.addEventListener("click", function () { openPlayOffice("south"); });
  const playOfficeClose = document.getElementById("play-office-close");
  if (playOfficeClose) playOfficeClose.addEventListener("click", closePlayOffice);
  if (!(localStorage.getItem("hackathon-empire-token") || "")) showPlayAccount();
  paintPlayBuy();
  const playBuy = document.getElementById("play-buy");
  if (playBuy) playBuy.addEventListener("click", buyPlayCar);
  const playLoiterForm = document.getElementById("play-loiter");
  if (playLoiterForm) playLoiterForm.addEventListener("submit", setPlayLoiter);
  paintPlayStatus(null);
  clearStandInTaxis();
  setInterval(pollPlay, 2000);
  pollPlay();
})();
