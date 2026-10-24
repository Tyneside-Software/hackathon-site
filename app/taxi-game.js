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

  function cancelAfterOneMile() {
    return [line("fuel", -FUEL_PENCE_A_MILE)];
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
    workedDay: workedDay,
    cancelBefore: cancelBefore,
    cancelAfterOneMile: cancelAfterOneMile,
    newCar: newCar,
    sumPence: sumPence,
    formatPounds: formatPounds,
  };
})();
