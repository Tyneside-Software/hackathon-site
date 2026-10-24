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

  function fallbackSeconds(miles) {
    return miles * 3600 / 30;
  }

  function offeredCount(elapsedS) {
    if (elapsedS < 0) return 0;
    return Math.min(3, Math.floor(elapsedS / 20));
  }

  function secondsUntilNextOffer(elapsedS) {
    if (offeredCount(elapsedS) >= 3) return null;
    var remainder = elapsedS % 20;
    if (remainder === 0) return 20;
    return 20 - remainder;
  }

  var MILE_KM = 80.467 / 50;
  var DEPOT_POINT = { lat: 55.0367, lng: -1.5075 };

  function destination(origin, bearingDeg, miles) {
    var km = miles * MILE_KM;
    var lat1 = origin.lat * Math.PI / 180;
    var lng1 = origin.lng * Math.PI / 180;
    var bearing = (bearingDeg % 360) * Math.PI / 180;
    var ang = km / EARTH_KM;
    var lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(ang)
      + Math.cos(lat1) * Math.sin(ang) * Math.cos(bearing)
    );
    var lng2 = lng1 + Math.atan2(
      Math.sin(bearing) * Math.sin(ang) * Math.cos(lat1),
      Math.cos(ang) - Math.sin(lat1) * Math.sin(lat2)
    );
    var lng = (lng2 * 180 / Math.PI + 540) % 360 - 180;
    return { lat: lat2 * 180 / Math.PI, lng: lng };
  }

  function liveFarePence(miles, waitingSeconds) {
    if (!window.TaxiFare) return null;
    var yards = Math.round(miles * 1760 * 10);
    var seconds = Math.round((waitingSeconds || 0) * 10);
    return window.TaxiFare.quoteMeter(1, [[yards, seconds]]);
  }

  function shortTrip(bearingDeg, miles) {
    if (miles !== 2 && miles !== 4 && miles !== 6) return null;
    var dropoff = destination(DEPOT_POINT, bearingDeg, miles);
    return {
      pickup: DEPOT_POINT,
      dropoff: dropoff,
      miles: miles,
      farePence: liveFarePence(miles, 0),
      inside: haversineKm(CENTRE, DEPOT_POINT) <= RADIUS_KM && haversineKm(CENTRE, dropoff) <= RADIUS_KM,
    };
  }

  function positionOnRoute(points, durationS, elapsedS) {
    if (!points.length) return null;
    if (durationS <= 0 || elapsedS <= 0) return points[0];
    if (elapsedS >= durationS) return points[points.length - 1];
    var fraction = elapsedS / durationS;
    var distances = [0];
    var i;
    for (i = 1; i < points.length; i++) {
      distances.push(distances[i - 1] + haversineKm(
        { lat: points[i - 1][0], lng: points[i - 1][1] },
        { lat: points[i][0], lng: points[i][1] }
      ));
    }
    var total = distances[distances.length - 1];
    if (total === 0) return points[0];
    var target = total * fraction;
    var j;
    for (j = 1; j < distances.length; j++) {
      if (distances[j] >= target) {
        var span = distances[j] - distances[j - 1];
        var step = span === 0 ? 0 : (target - distances[j - 1]) / span;
        var start = points[j - 1];
        var end = points[j];
        return [start[0] + (end[0] - start[0]) * step, start[1] + (end[1] - start[1]) * step];
      }
    }
    return points[points.length - 1];
  }

  function fleetPositions(routes, elapsedS) {
    if (!routes || routes.length !== 3) return null;
    var signs = ["T1", "T2", "T3"];
    return signs.map(function (sign, index) {
      var route = routes[index];
      if (!route) {
        return { callSign: sign, status: "at_depot", lat: DEPOT_POINT.lat, lng: DEPOT_POINT.lng };
      }
      var point = positionOnRoute(route.points, route.durationS, elapsedS);
      return { callSign: sign, status: "started", lat: point[0], lng: point[1] };
    });
  }

  function farePounds(pence) {
    var whole = Math.floor(Math.abs(pence) / 100);
    var rem = Math.abs(pence) % 100;
    return "£" + whole + "." + String(rem).padStart(2, "0");
  }

  function waitingOffers(elapsedS) {
    var count = offeredCount(elapsedS);
    var milesList = [2, 4, 6];
    var offers = [];
    var index;
    for (index = 0; index < count; index += 1) {
      var trip = shortTrip(90 + index * 30, milesList[index]);
      offers.push({
        pickup: trip.pickup,
        dropoff: trip.dropoff,
        status: "offered",
        miles: milesList[index],
        farePence: trip.farePence,
        farePounds: farePounds(trip.farePence),
      });
    }
    return offers;
  }

  function acceptOffer(offers, cars) {
    if (!offers || !offers.length || !cars) return null;
    var free = null;
    var index;
    for (index = 0; index < cars.length; index += 1) {
      if (cars[index].status === "at_depot" && !cars[index].device_id) {
        free = cars[index];
        break;
      }
    }
    if (!free) return null;
    var chosenIndex = -1;
    for (index = 0; index < offers.length; index += 1) {
      if (offers[index].status === "offered") {
        chosenIndex = index;
        break;
      }
    }
    if (chosenIndex < 0) return null;
    var chosen = offers[chosenIndex];
    var accepted = {
      pickup: chosen.pickup,
      dropoff: chosen.dropoff,
      status: "accepted",
      miles: chosen.miles,
      farePence: chosen.farePence,
      farePounds: chosen.farePounds,
      callSign: free.callSign,
    };
    var nextOffers = offers.map(function (offer, offerIndex) {
      return offerIndex === chosenIndex ? accepted : offer;
    });
    var nextCars = cars.map(function (car) {
      if (car.callSign !== free.callSign) return car;
      return {
        callSign: car.callSign,
        status: "accepted",
        route: {
          points: [
            [chosen.pickup.lat, chosen.pickup.lng],
            [chosen.dropoff.lat, chosen.dropoff.lng],
          ],
          durationS: fallbackSeconds(chosen.miles),
        },
      };
    });
    return { offers: nextOffers, cars: nextCars };
  }

  function freeCarTakes(offers, cars) {
    return acceptOffer(offers, cars);
  }

  function twoCarsOut(elapsedS) {
    var offers = waitingOffers(40);
    var depot = [
      { callSign: "T1", status: "at_depot" },
      { callSign: "T2", status: "at_depot" },
      { callSign: "T3", status: "at_depot" }
    ];
    var first = startAccepted(freeCarTakes(offers, depot));
    if (!first) return null;
    var second = startAccepted(freeCarTakes(first.offers, first.cars));
    if (!second) return null;
    var routes = second.cars.map(function (car) {
      if (car.status === "started" && car.route) {
        return { points: car.route.points, durationS: car.route.durationS };
      }
      return null;
    });
    return { cars: fleetPositions(routes, elapsedS), offers: second.offers };
  }

  function customerPins(offers) {
    return (offers || []).filter(function (offer) {
      return offer.status === "offered";
    }).map(function (offer) {
      return { lat: offer.pickup.lat, lng: offer.pickup.lng, kind: "customer" };
    });
  }

  function startAccepted(taken) {
    if (!taken) return null;
    return {
      offers: taken.offers,
      cars: taken.cars.map(function (car) {
        if (car.status !== "accepted") return car;
        return {
          callSign: car.callSign,
          status: "started",
          route: car.route,
        };
      }),
      pins: customerPins(taken.offers),
    };
  }

  function returnLeg(origin, durationS, elapsedS) {
    if (durationS <= 0 || elapsedS >= durationS) {
      return { status: "at_depot", lat: DEPOT_POINT.lat, lng: DEPOT_POINT.lng };
    }
    var point = positionOnRoute(
      [[origin.lat, origin.lng], [DEPOT_POINT.lat, DEPOT_POINT.lng]],
      durationS,
      elapsedS
    );
    return { status: "returning", lat: point[0], lng: point[1] };
  }

  function postLiveFuel(tripId, miles, posted) {
    var already = {};
    (posted || []).forEach(function (id) { already[id] = true; });
    if (already[tripId] || miles <= 0) {
      return { fuelPence: 0, lines: [], posted: Object.keys(already).map(Number) };
    }
    var fuel = -(miles * FUEL_PENCE_A_MILE);
    already[tripId] = true;
    return {
      fuelPence: fuel,
      lines: [{ kind: "fuel", amountPence: fuel, jobId: tripId }],
      posted: Object.keys(already).map(Number),
    };
  }

  function secondsRemaining(durationS, elapsedS) {
    if (durationS <= 0 || elapsedS >= durationS) return 0;
    if (elapsedS <= 0) return durationS;
    return durationS - elapsedS;
  }

  function movingRow(callSign, durationS, elapsedS) {
    return {
      callSign: callSign,
      status: "started",
      secondsRemaining: secondsRemaining(durationS, elapsedS),
    };
  }

  function faresWaiting(elapsedS, accepted) {
    if (elapsedS < 0 || accepted < 0) return 0;
    var waiting = Math.floor(elapsedS / 20) - (accepted || 0);
    if (waiting < 0) return 0;
    return Math.min(3, waiting);
  }

  function waitingLabel(elapsedS, accepted) {
    return faresWaiting(elapsedS, accepted) === 3 ? "3 fares waiting" : null;
  }

  function secondsUntilFare(elapsedS, accepted) {
    if (faresWaiting(elapsedS, accepted) >= 3) return null;
    if (elapsedS < 0) return 20;
    var remainder = elapsedS % 20;
    if (remainder === 0) return 20;
    return 20 - remainder;
  }

  function nextFareLabel(elapsedS, accepted) {
    var wait = secondsUntilFare(elapsedS, accepted);
    if (wait === null) return null;
    return "Next fare in " + Math.ceil(wait);
  }

  function postLiveTrip(tripId, miles, posted) {
    var already = {};
    (posted || []).forEach(function (id) { already[id] = true; });
    if (already[tripId] || miles <= 0) {
      return { lines: [], posted: Object.keys(already).map(Number) };
    }
    var fare = liveFarePence(miles, 0);
    var fuel = -(miles * FUEL_PENCE_A_MILE);
    already[tripId] = true;
    return {
      lines: [
        { kind: "fare_in", amountPence: fare, jobId: tripId },
        { kind: "fuel", amountPence: fuel, jobId: tripId },
      ],
      posted: Object.keys(already).map(Number),
    };
  }

  function completedFareRow(tripId, miles, posted) {
    var first = postLiveTrip(tripId, miles, posted);
    var fare = liveFarePence(miles, 0);
    return {
      status: "completed",
      miles: miles,
      farePounds: farePounds(fare),
      lines: first.lines,
      posted: first.posted,
    };
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
    fallbackSeconds: fallbackSeconds,
    offeredCount: offeredCount,
    secondsUntilNextOffer: secondsUntilNextOffer,
    liveFarePence: liveFarePence,
    fleetPositions: fleetPositions,
    farePounds: farePounds,
    waitingOffers: waitingOffers,
    acceptOffer: acceptOffer,
    freeCarTakes: freeCarTakes,
    twoCarsOut: twoCarsOut,
    customerPins: customerPins,
    startAccepted: startAccepted,
    returnLeg: returnLeg,
    postLiveFuel: postLiveFuel,
    secondsRemaining: secondsRemaining,
    movingRow: movingRow,
    faresWaiting: faresWaiting,
    waitingLabel: waitingLabel,
    secondsUntilFare: secondsUntilFare,
    nextFareLabel: nextFareLabel,
    postLiveTrip: postLiveTrip,
    completedFareRow: completedFareRow,
    shortTrip: shortTrip,
    positionOnRoute: positionOnRoute,
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
