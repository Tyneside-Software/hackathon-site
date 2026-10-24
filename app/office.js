/* Booking-office desk. Quotes come from app/taxi-fare.js. No API and no database. */
(function () {
  var DAY_KEY = "hackathon-office-day";

  function copyRow(row) {
    var extras = {};
    var name;
    for (name in row.extras) {
      if (Object.prototype.hasOwnProperty.call(row.extras, name)) {
        extras[name] = row.extras[name];
      }
    }
    return {
      title: row.title,
      detail: row.detail,
      pickup: row.pickup,
      dropOff: row.dropOff,
      requestedTime: row.requestedTime,
      callSign: row.callSign,
      tariff: row.tariff,
      segments: row.segments.map(function (pair) { return [pair[0], pair[1]]; }),
      extras: extras,
      status: row.status,
      posted: !!row.posted,
      postedPence: row.postedPence || 0,
      driver: row.driver || "",
      payment: row.payment || ""
    };
  }

  function defaultRows() {
    return [
      {
        title: "£11.30 booking",
        detail: "Tariff one, 3 miles, no waiting, one extra passenger, one outside bag",
        pickup: "Grey's Monument",
        dropOff: "Shiremoor depot",
        requestedTime: "15:00",
        callSign: "T1",
        tariff: 1,
        segments: [[52800, 0]],
        extras: { passengersAfterTwo: 1, bags: 1 },
        status: "offered",
        driver: "Alex"
      },
      {
        title: "£12.40 night booking",
        detail: "Tariff two, 3 miles, no waiting, no extras",
        pickup: "Shiremoor depot",
        dropOff: "Grey's Monument",
        requestedTime: "22:00",
        callSign: "T2",
        tariff: 2,
        segments: [[52800, 0]],
        extras: {},
        status: "offered",
        driver: "Sam"
      },
      {
        title: "Soiling only",
        detail: "No miles, no waiting, soiling",
        pickup: "Grey's Monument",
        dropOff: "Shiremoor depot",
        requestedTime: "15:00",
        callSign: "T1",
        tariff: 1,
        segments: [[0, 0]],
        extras: { soiling: 1 },
        status: "offered"
      },
      {
        title: "One animal",
        detail: "Tariff one, 1 mile, no waiting, one animal, no soiling",
        pickup: "Shiremoor depot",
        dropOff: "Grey's Monument",
        requestedTime: "15:00",
        callSign: "T1",
        tariff: 1,
        segments: [[17600, 0]],
        extras: { animals: 1 },
        status: "offered"
      }
    ].map(copyRow);
  }

  function completedRow(row) {
    var copy = copyRow(row);
    copy.status = "completed";
    copy.posted = true;
    copy.postedPence = window.TaxiFare.quotePence(copy.tariff, copy.segments, copy.extras);
    return copy;
  }

  var samples = defaultRows();
  var addedQuotes = [];
  var lastQuote = null;

  function persistDay() {
    var payload = {
      rows: samples.map(copyRow),
      added: addedQuotes.slice()
    };
    try {
      localStorage.setItem(DAY_KEY, JSON.stringify(payload));
    } catch (err) {
      return;
    }
  }

  function loadDay() {
    var raw;
    try {
      raw = localStorage.getItem(DAY_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;
    var payload;
    try {
      payload = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!payload || !Array.isArray(payload.rows)) return;
    samples = payload.rows.map(copyRow);
    addedQuotes = (payload.added || []).slice();
  }

  function dayNote(text) {
    document.getElementById("day-store").textContent = text;
  }

  function money(pence) {
    var sign = pence < 0 ? "-" : "";
    var abs = Math.abs(pence);
    var rest = abs % 100;
    return sign + "£" + Math.floor(abs / 100) + "." + (rest < 10 ? "0" : "") + rest;
  }

  function penceText(pence) {
    return pence + " pence, " + money(pence);
  }

  function whole(id) {
    var value = document.getElementById(id).value;
    if (value === "") return 0;
    var number = Number(value);
    if (!isFinite(number) || number < 0) return 0;
    return Math.round(number);
  }

  function tenthsFromMiles(value) {
    if (value === "") return 0;
    var miles = Number(value);
    if (!isFinite(miles) || miles < 0) return 0;
    return Math.round(miles * 17600);
  }

  function tenthsFromSeconds(value) {
    if (value === "") return 0;
    var seconds = Number(value);
    if (!isFinite(seconds) || seconds < 0) return 0;
    return Math.round(seconds * 10);
  }

  function formExtras() {
    return {
      passengersAfterTwo: whole("passengers"),
      bags: whole("bags"),
      animals: whole("animals"),
      bicycles: whole("bicycles"),
      prams: whole("prams"),
      soiling: document.getElementById("soiling").checked ? 1 : 0
    };
  }

  function readQuote() {
    var tariff = document.getElementById("tariff").value;
    if (tariff !== "1" && tariff !== "2") {
      return { error: "The form needs a tariff." };
    }
    var yards = tenthsFromMiles(document.getElementById("miles").value);
    var seconds = tenthsFromSeconds(document.getElementById("waiting").value);
    var extras = formExtras();
    var extraPence = window.TaxiFare.extrasPence(extras);
    var pence = window.TaxiFare.quotePence(Number(tariff), [[yards, seconds]], extras);
    return { yards: yards, seconds: seconds, extraPence: extraPence, pence: pence };
  }

  function showQuote(quote) {
    var result = document.getElementById("quote-result");
    if (quote.error) {
      lastQuote = null;
      result.textContent = quote.error;
      return;
    }
    lastQuote = quote;
    if (quote.yards === 0 && quote.seconds === 0 && quote.extraPence === 0) {
      result.textContent = "0 pence, £0.00. The hiring has no distance and no time, so no fare is added to the ledger.";
      return;
    }
    result.textContent = penceText(quote.pence);
  }

  function rowPence(row) {
    return window.TaxiFare.quotePence(row.tariff, row.segments, row.extras);
  }

  function setStatus(row, next) {
    if (row.status === "completed") return;
    if (next === "completed") {
      if (row.posted) return;
      row.posted = true;
      row.postedPence = rowPence(row);
      row.status = "completed";
      return;
    }
    if (next === "cancelled") {
      row.posted = false;
      row.postedPence = 0;
      row.status = "cancelled";
      return;
    }
    row.status = next;
  }

  function runningPence() {
    var total = 0;
    samples.forEach(function (row) {
      if (row.posted) total += row.postedPence;
    });
    addedQuotes.forEach(function (pence) {
      total += pence;
    });
    return total;
  }

  function renderLedger() {
    document.getElementById("ledger-total").textContent = penceText(runningPence());
  }

  function renderDay() {
    var completed = [
      window.TaxiFare.quotePence(1, [[52800, 0]], { passengersAfterTwo: 1, bags: 1 }),
      window.TaxiFare.quotePence(2, [[52800, 0]], {}),
      window.TaxiFare.quotePence(1, [[17600, 0]], {})
    ];
    var cancel = 0;
    var completedDay = completed[0] + completed[1] + completed[2] + cancel;
    var cancelledMile = completed[0] + completed[1] + 0;
    var root = document.getElementById("day-ledger");
    root.textContent = "";
    var title = document.createElement("h3");
    title.textContent = "Company day";
    title.style.marginTop = "0.9rem";
    var note = document.createElement("p");
    note.className = "office-note";
    note.textContent = "This day is its own ledger, separate from any single booking above and separate from the game. Cancelling the 1 mile booking before it is completed leaves that fare off the ledger. Completed cannot become cancelled.";
    root.appendChild(title);
    root.appendChild(note);
    [
      ["Completed", completed[0]],
      ["Completed", completed[1]],
      ["Completed, tariff one, 1 mile", completed[2]],
      ["Cancel", cancel],
      ["completed-day", completedDay],
      ["soiling-day", window.TaxiFare.quotePence(1, [[0, 0]], { soiling: 1 })],
      ["Alex", completed[0] + completed[2]],
      ["Sam", completed[1]],
      ["cancelled-mile", cancelledMile],
      ["company-week", completedDay * 7],
      ["empty-day", 0],
      ["empty-day, cancelled 490 pence mile only", 0]
    ].forEach(function (line) {
      var row = document.createElement("p");
      row.className = "ledger-line";
      var name = document.createElement("span");
      name.textContent = line[0];
      var amount = document.createElement("strong");
      amount.textContent = penceText(line[1]);
      row.appendChild(name);
      row.appendChild(amount);
      root.appendChild(row);
    });
  }

  function receiptText(row) {
    var yards = 0;
    var seconds = 0;
    row.segments.forEach(function (pair) {
      yards += pair[0];
      seconds += pair[1];
    });
    var meter = window.TaxiFare.quoteMeter(row.tariff, row.segments);
    var extras = window.TaxiFare.extrasPence(row.extras);
    var total = meter + extras;
    var tariffName = row.tariff === 2 ? "two" : "one";
    return "Receipt\n"
      + "Tariff " + tariffName + "\n"
      + "Miles " + (yards / 17600) + "\n"
      + "Waiting seconds " + (seconds / 10) + "\n"
      + "Extras " + extras + "\n"
      + "Quoted pence " + total + "\n"
      + money(total);
  }

  function renderSamples() {
    var root = document.getElementById("samples");
    var empty = document.getElementById("empty-book");
    root.textContent = "";
    if (!samples.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    samples.forEach(function (row, index) {
      var meter = window.TaxiFare.quoteMeter(row.tariff, row.segments);
      var extras = window.TaxiFare.extrasPence(row.extras);
      var pence = meter + extras;
      var block = document.createElement("article");
      block.className = "office-row";
      var copy = document.createElement("div");
      var title = document.createElement("strong");
      title.textContent = row.title;
      var detail = document.createElement("p");
      detail.className = "office-note";
      detail.textContent = row.detail + ". Meter " + meter + ". Extras " + extras
        + ". Total " + pence + ". " + penceText(pence) + ". Pickup " + row.pickup
        + ". Drop-off " + row.dropOff + ". Requested " + row.requestedTime
        + ". Vehicle " + row.callSign
        + (row.driver ? ". Driver " + row.driver : "")
        + (row.payment ? ". Payment " + row.payment + ". Fare " + row.postedPence : "") + ".";
      var status = document.createElement("p");
      status.className = "office-status";
      status.textContent = row.status;
      copy.appendChild(title);
      copy.appendChild(detail);
      copy.appendChild(status);
      if (row.status === "completed") {
        var slip = document.createElement("pre");
        slip.className = "office-slip";
        slip.textContent = receiptText(row);
        copy.appendChild(slip);
      }
      var actions = document.createElement("div");
      actions.className = "office-actions";
      function addButton(label, next) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-ghost";
        button.textContent = label;
        button.addEventListener("click", function () {
          setStatus(row, next);
          persistDay();
          renderSamples();
          renderLedger();
        });
        actions.appendChild(button);
      }
      if (row.status === "offered") addButton("Accept", "accepted");
      if (row.status === "accepted") addButton("Start", "started");
      if (row.status === "started") addButton("Complete", "completed");
      if (row.status === "offered" || row.status === "accepted" || row.status === "started") {
        addButton("Cancel", "cancelled");
      }
      if (row.status === "completed") {
        ["cash", "account"].forEach(function (kind) {
          var pay = document.createElement("button");
          pay.type = "button";
          pay.className = "btn btn-ghost";
          pay.textContent = kind;
          pay.addEventListener("click", function () {
            row.payment = kind;
            persistDay();
            renderSamples();
            renderLedger();
          });
          actions.appendChild(pay);
        });
      }
      block.appendChild(copy);
      block.appendChild(actions);
      root.appendChild(block);
    });
  }

  function clockMinutes(value) {
    var parts = String(value || "").split(":");
    if (parts.length < 2) return null;
    var hours = Number(parts[0]);
    var mins = Number(parts[1]);
    if (!isFinite(hours) || !isFinite(mins)) return null;
    if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
    return hours * 60 + mins;
  }

  function applyClock() {
    var minutes = clockMinutes(document.getElementById("clock-time").value);
    if (minutes === null) return null;
    var dayRaw = document.getElementById("december-day").value;
    var december = dayRaw === "" ? null : Number(dayRaw);
    var tariff = window.TaxiFare.tariffFor(
      minutes,
      document.getElementById("sunday").checked,
      december
    );
    document.getElementById("tariff").value = String(tariff);
    var choice = document.getElementById("clock-choice");
    choice.textContent = tariff === 2 ? "Tariff two" : "Tariff one";
    return tariff;
  }

  function negativeMiles() {
    var value = document.getElementById("miles").value;
    if (value === "") return false;
    var miles = Number(value);
    return isFinite(miles) && miles < 0;
  }

  function rejectNegativeMiles() {
    if (!negativeMiles()) {
      document.getElementById("mile-note").textContent = "";
      return false;
    }
    document.getElementById("mile-note").textContent = "Negative miles are rejected.";
    return true;
  }

  document.getElementById("btn-quote").addEventListener("click", function () {
    if (rejectNegativeMiles()) return;
    applyClock();
    showQuote(readQuote());
  });
  ["clock-time", "december-day", "sunday"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", applyClock);
  });

  function placeRefused(value) {
    return value.trim() === "Berwick-upon-Tweed";
  }

  document.getElementById("btn-add").addEventListener("click", function () {
    if (rejectNegativeMiles()) return;
    var quote = readQuote();
    var pickup = document.getElementById("pickup").value;
    var dropOff = document.getElementById("drop-off").value;
    if (placeRefused(pickup) || placeRefused(dropOff)) {
      document.getElementById("quote-result").textContent =
        "Berwick-upon-Tweed is not saved, so 0 pence is added. The meter the clerk entered stays on the quote.";
      if (!quote.error) {
        document.getElementById("quote-result").textContent += " " + penceText(quote.pence) + ".";
      }
      lastQuote = null;
      return;
    }
    showQuote(quote);
    if (quote.error) return;
    if (quote.yards === 0 && quote.seconds === 0 && quote.extraPence === 0) return;
    addedQuotes.push(quote.pence);
    persistDay();
    renderLedger();
  });

  function showWorked(tariff, segments, sentence) {
    var pence = window.TaxiFare.quotePence(tariff, segments, {});
    document.getElementById("tariff").value = String(tariff);
    document.getElementById("quote-result").textContent = sentence + " " + penceText(pence) + ".";
    lastQuote = null;
  }

  document.getElementById("btn-mixed").addEventListener("click", function () {
    showWorked(1, [[1613, 200], [0, 468]], "First 161.3 yards in 20 seconds, then 46.8 seconds waiting.");
  });
  document.getElementById("btn-t1-yards").addEventListener("click", function () {
    showWorked(1, [[1613, 0]], "Tariff one, exactly 161.3 yards, no waiting.");
  });
  document.getElementById("btn-t2-yards").addEventListener("click", function () {
    showWorked(2, [[1405, 0]], "Tariff two, exactly 140.5 yards, no waiting.");
  });
  document.getElementById("btn-t2-wait").addEventListener("click", function () {
    showWorked(2, [[0, 450]], "Tariff two, no yards, 45 seconds.");
  });

  document.getElementById("btn-restore").addEventListener("click", function () {
    samples = [
      completedRow({
        title: "£11.30 booking",
        detail: "Tariff one, 3 miles, no waiting, one extra passenger, one outside bag",
        pickup: "Grey's Monument",
        dropOff: "Shiremoor depot",
        requestedTime: "15:00",
        callSign: "T1",
        tariff: 1,
        segments: [[52800, 0]],
        extras: { passengersAfterTwo: 1, bags: 1 },
        status: "offered",
        driver: "Alex"
      }),
      completedRow({
        title: "£12.40 night booking",
        detail: "Tariff two, 3 miles, no waiting, no extras",
        pickup: "Shiremoor depot",
        dropOff: "Grey's Monument",
        requestedTime: "22:00",
        callSign: "T2",
        tariff: 2,
        segments: [[52800, 0]],
        extras: {},
        status: "offered",
        driver: "Sam"
      }),
      completedRow({
        title: "Tariff one, 1 mile",
        detail: "Tariff one, 1 mile, no waiting, no extras",
        pickup: "Grey's Monument",
        dropOff: "Shiremoor depot",
        requestedTime: "15:00",
        callSign: "T1",
        tariff: 1,
        segments: [[17600, 0]],
        extras: {},
        status: "offered",
        driver: "Alex"
      })
    ];
    addedQuotes = [];
    persistDay();
    renderSamples();
    renderLedger();
    dayNote("Restored three completed bookings, 1130, 1240, and 490. The day shows " + runningPence() + ".");
  });

  document.getElementById("btn-clear").addEventListener("click", function () {
    try {
      localStorage.removeItem(DAY_KEY);
    } catch (err) {
      return;
    }
    samples = defaultRows();
    addedQuotes = [];
    renderSamples();
    renderLedger();
    dayNote("Cleared. The key hackathon-office-day is removed. A reload starts from the offered rows.");
  });

  loadDay();
  renderSamples();
  renderLedger();
  renderDay();
})();
