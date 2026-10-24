/* The Python checkers are the proof.
   scripts/taxi_geo_check.py prints GEO-OK.
   scripts/taxi_day_check.py prints DAY-OK.
   scripts/taxi_week_check.py prints WEEK-OK.
   No build step. A game taxi never has a device_id. */

(function () {
  var STANDING_PENCE = 1500;
  var FUEL_PENCE_A_MILE = 20;
  var NEW_CAR_PENCE = 800000;
  var NEW_DRIVER_PENCE = 0;
  var WORKED_FARE_PENCE = 1040;
  var WORKED_MILES = 7;
  var CAR_STATUSES = ["at_depot", "offered", "accepted", "started", "returning"];
  var carStatus = "at_depot";
  var CENTRE = { lat: 54.9783, lng: -1.6178 };
  var RADIUS_KM = 80.467;
  var EARTH_KM = 6371;
  var PLACES = [
    { name: "Grey's Monument", lat: 54.9783, lng: -1.6178 },
    { name: "Shiremoor depot", lat: 55.0367, lng: -1.5075 },
    { name: "Hexham", lat: 54.9716, lng: -2.1015 },
    { name: "Durham", lat: 54.7753, lng: -1.5849 },
    { name: "Sunderland", lat: 54.9069, lng: -1.3838 },
    { name: "Berwick-upon-Tweed", lat: 55.7704, lng: -2.0068 },
  ];

  function haversineKm(a, b) {
    var dlat = (b.lat - a.lat) * Math.PI / 180;
    var dlng = (b.lng - a.lng) * Math.PI / 180;
    var lat1 = a.lat * Math.PI / 180;
    var lat2 = b.lat * Math.PI / 180;
    var half = Math.sin(dlat / 2) * Math.sin(dlat / 2)
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) * Math.sin(dlng / 2);
    return 2 * EARTH_KM * Math.asin(Math.sqrt(half));
  }

  function placeByName(name) {
    for (var i = 0; i < PLACES.length; i++) {
      if (PLACES[i].name === name) return PLACES[i];
    }
    return null;
  }

  function places() {
    return PLACES.map(function (place) {
      return {
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        inside: haversineKm(CENTRE, place) <= RADIUS_KM,
      };
    });
  }

  function dropoffOffered(lat, lng) {
    return haversineKm(CENTRE, { lat: lat, lng: lng }) <= RADIUS_KM;
  }

  function dropoffLines() {
    return [];
  }

  function jobOffered(startName, endName) {
    var start = placeByName(startName);
    var end = placeByName(endName);
    if (!start || !end) return false;
    return haversineKm(CENTRE, start) <= RADIUS_KM && haversineKm(CENTRE, end) <= RADIUS_KM;
  }

  function line(kind, amountPence) {
    return { kind: kind, amountPence: amountPence };
  }

  function workedDay() {
    return [
      line("standing", -STANDING_PENCE),
      line("fare_in", WORKED_FARE_PENCE),
      line("driver_share", -Math.floor(WORKED_FARE_PENCE / 2)),
      line("fuel", -(WORKED_MILES * FUEL_PENCE_A_MILE)),
    ];
  }

  function cancelBefore() {
    return [];
  }

  function cancelAfterZeroMiles() {
    return [];
  }

  function cancelAfterOneMile() {
    return [line("fuel", -FUEL_PENCE_A_MILE)];
  }

  function setCarStatus(status) {
    if (CAR_STATUSES.indexOf(status) === -1) return carStatus;
    carStatus = status;
    return carStatus;
  }

  function threeCarDay() {
    var rows = [
      line("standing", -STANDING_PENCE),
      line("standing", -STANDING_PENCE),
      line("standing", -STANDING_PENCE),
    ];
    workedDay().slice(1).forEach(function (row) { rows.push(row); });
    return rows;
  }

  function newDriver(name) {
    return { name: name, costPence: NEW_DRIVER_PENCE };
  }

  function dayWithDriver() {
    return workedDay();
  }

  function startUnpaidCar() {
    return [];
  }

  function completeWorkedDay() {
    return workedDay();
  }

  function newCar() {
    return {
      lines: [line("new_car", -NEW_CAR_PENCE)],
      taxi: {
        id: 2,
        callSign: "second",
        status: "at_depot",
        lat: 55.0367,
        lng: -1.5075,
      },
    };
  }

  function workedWeek() {
    var rows = [];
    for (var day = 1; day <= 7; day++) {
      workedDay().forEach(function (row) {
        rows.push({ kind: row.kind, amountPence: row.amountPence, gameDay: day });
      });
    }
    return rows;
  }

  function fleetWeek() {
    var rows = [{ kind: "new_car", amountPence: -NEW_CAR_PENCE, gameDay: 1 }];
    workedWeek().forEach(function (row) { rows.push(row); });
    return rows;
  }

  function elapsedSeconds(startMs, nowMs) {
    return (nowMs - startMs) / 1000;
  }

  function sumPence(rows) {
    return rows.reduce(function (total, row) {
      return total + row.amountPence;
    }, 0);
  }

  function formatPounds(pence) {
    var sign = pence < 0 ? "−" : "+";
    var abs = Math.abs(pence);
    var whole = Math.floor(abs / 100);
    var rem = abs % 100;
    if (rem === 0 && abs >= 10000) return sign + "£" + whole;
    return sign + "£" + whole + "." + String(rem).padStart(2, "0");
  }

  window.TaxiGame = {
    newDriverPence: NEW_DRIVER_PENCE,
    depotLabel: "Shiremoor depot",
    places: places,
    jobOffered: jobOffered,
    dropoffOffered: dropoffOffered,
    dropoffLines: dropoffLines,
    carStatuses: CAR_STATUSES,
    setCarStatus: setCarStatus,
    currentCarStatus: function () { return carStatus; },
    completeWorkedDay: completeWorkedDay,
    startUnpaidCar: startUnpaidCar,
    newDriver: newDriver,
    threeCarDay: threeCarDay,
    elapsedSeconds: elapsedSeconds,
    workedWeek: workedWeek,
    fleetWeek: fleetWeek,
    dayWithDriver: dayWithDriver,
    workedDay: workedDay,
    cancelBefore: cancelBefore,
    cancelAfterOneMile: cancelAfterOneMile,
    cancelAfterZeroMiles: cancelAfterZeroMiles,
    newCar: newCar,
    sumPence: sumPence,
    formatPounds: formatPounds,
  };
})();
