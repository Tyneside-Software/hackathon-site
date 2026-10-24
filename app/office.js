/* Booking-office desk. Quotes come from app/taxi-fare.js. No API and no database. */
(function () {
  var samples = [
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
      status: "offered"
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
      status: "offered"
    }
  ];
  var addedQuotes = [];
  var lastQuote = null;

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

  function runningPence() {
    var total = 0;
    samples.forEach(function (row) {
      if (row.status === "completed") {
        total += window.TaxiFare.quotePence(row.tariff, row.segments, row.extras);
      }
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
      ["cancelled-mile", cancelledMile]
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

  function renderSamples() {
    var root = document.getElementById("samples");
    root.textContent = "";
    samples.forEach(function (row, index) {
      var pence = window.TaxiFare.quotePence(row.tariff, row.segments, row.extras);
      var block = document.createElement("article");
      block.className = "office-row";
      var copy = document.createElement("div");
      var title = document.createElement("strong");
      title.textContent = row.title;
      var detail = document.createElement("p");
      detail.className = "office-note";
      detail.textContent = row.detail + ". " + penceText(pence) + ". Pickup " + row.pickup
        + ". Drop-off " + row.dropOff + ". Requested " + row.requestedTime
        + ". Vehicle " + row.callSign + ".";
      var status = document.createElement("p");
      status.className = "office-status";
      status.textContent = row.status;
      copy.appendChild(title);
      copy.appendChild(detail);
      copy.appendChild(status);
      var actions = document.createElement("div");
      actions.className = "office-actions";
      function addButton(label, next) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-ghost";
        button.textContent = label;
        button.addEventListener("click", function () {
          row.status = next;
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
      block.appendChild(copy);
      block.appendChild(actions);
      root.appendChild(block);
    });
  }

  document.getElementById("btn-quote").addEventListener("click", function () {
    showQuote(readQuote());
  });

  document.getElementById("btn-add").addEventListener("click", function () {
    var quote = readQuote();
    showQuote(quote);
    if (quote.error) return;
    if (quote.yards === 0 && quote.seconds === 0 && quote.extraPence === 0) return;
    addedQuotes.push(quote.pence);
    renderLedger();
  });

  document.getElementById("btn-mixed").addEventListener("click", function () {
    var pence = window.TaxiFare.quotePence(1, [[1613, 200], [0, 468]], {});
    document.getElementById("tariff").value = "1";
    document.getElementById("quote-result").textContent =
      "First 161.3 yards in 20 seconds, then 46.8 seconds waiting. " + penceText(pence) + ".";
    lastQuote = null;
  });

  renderSamples();
  renderLedger();
  renderDay();
})();
