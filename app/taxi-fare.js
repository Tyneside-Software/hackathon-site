/* The Python checker in scripts/taxi_fare_check.py is the proof.
   Lengths are integer tenths of a yard. Times are integer tenths of a second.
   Money is pence. November 2024 prices only. No build step and no package. */
(function (root) {
  var TARIFFS = {
    1: { unitYards: 1613, unitSeconds: 468, flag: 240, further: 25 },
    2: { unitYards: 1405, unitSeconds: 450, flag: 315, further: 25 }
  };
  var SOILING = 12500;
  var PASSENGER_AFTER_TWO = 50;
  var BAG_OUTSIDE = 40;
  var ANIMAL = 300;
  var GUIDE_OR_HEARING_DOG = 0;
  var BICYCLE = 300;
  var PRAM = 50;

  function count(extras, name) {
    var value = extras && extras[name] ? extras[name] : 0;
    if (value < 0) {
      throw new Error("an extra cannot be negative");
    }
    return value;
  }

  function extrasPence(extras) {
    extras = extras || {};
    var tolls = extras.tollsPence || 0;
    if (tolls < 0) {
      throw new Error("an extra cannot be negative");
    }
    return count(extras, "soiling") * SOILING
      + count(extras, "passengersAfterTwo") * PASSENGER_AFTER_TWO
      + count(extras, "bags") * BAG_OUTSIDE
      + count(extras, "animals") * ANIMAL
      + count(extras, "guideOrHearingDogs") * GUIDE_OR_HEARING_DOG
      + count(extras, "bicycles") * BICYCLE
      + count(extras, "prams") * PRAM
      + tolls;
  }

  function quoteMeter(tariffNumber, segments) {
    var tariff = TARIFFS[tariffNumber];
    if (!tariff) {
      return null;
    }
    var units = 0;
    var intoYards = 0;
    var intoSeconds = 0;
    var index;
    for (index = 0; index < segments.length; index += 1) {
      var applied = applySegment(
        segments[index][0],
        segments[index][1],
        tariff,
        intoYards,
        intoSeconds,
        units
      );
      units = applied.units;
      intoYards = applied.intoYards;
      intoSeconds = applied.intoSeconds;
    }
    if (intoYards > 0 || intoSeconds > 0) {
      units += 1;
    }
    if (units === 0) {
      return 0;
    }
    return tariff.flag + (units - 1) * tariff.further;
  }

  function applySegment(yards, seconds, tariff, intoYards, intoSeconds, units) {
    var guard = 0;
    while (yards > 0 || seconds > 0) {
      guard += 1;
      if (guard > 100000) {
        throw new Error("fare unit loop did not finish");
      }
      var needYards = tariff.unitYards - intoYards;
      var needSeconds = tariff.unitSeconds - intoSeconds;
      if (needYards <= 0 || needSeconds <= 0) {
        units += 1;
        intoYards = 0;
        intoSeconds = 0;
        continue;
      }
      if (seconds === 0) {
        if (yards >= needYards) {
          yards -= needYards;
          units += 1;
          intoYards = 0;
          intoSeconds = 0;
        } else {
          intoYards += yards;
          yards = 0;
        }
        continue;
      }
      if (yards === 0) {
        if (seconds >= needSeconds) {
          seconds -= needSeconds;
          units += 1;
          intoYards = 0;
          intoSeconds = 0;
        } else {
          intoSeconds += seconds;
          seconds = 0;
        }
        continue;
      }
      var distanceFirst = yards >= needYards && seconds * needYards <= needSeconds * yards;
      var timeFirst = seconds >= needSeconds && yards * needSeconds < needYards * seconds;
      if (distanceFirst) {
        var yardsLeft = yards - needYards;
        seconds = Math.floor(seconds * yardsLeft / yards);
        yards = yardsLeft;
        units += 1;
        intoYards = 0;
        intoSeconds = 0;
      } else if (timeFirst) {
        var secondsLeft = seconds - needSeconds;
        yards = Math.floor(yards * secondsLeft / seconds);
        seconds = secondsLeft;
        units += 1;
        intoYards = 0;
        intoSeconds = 0;
      } else {
        intoYards += yards;
        intoSeconds += seconds;
        yards = 0;
        seconds = 0;
      }
    }
    return { units: units, intoYards: intoYards, intoSeconds: intoSeconds };
  }

  function tariffFor(minutes, sunday, decemberDay) {
    if (sunday) {
      return 2;
    }
    if (decemberDay >= 27 && decemberDay <= 31) {
      return 2;
    }
    if (minutes >= 22 * 60 || minutes < 7 * 60) {
      return 2;
    }
    return 1;
  }

  function quotePence(tariffNumber, segments, extras) {
    var meter = quoteMeter(tariffNumber, segments || []);
    if (meter === null) {
      return null;
    }
    return meter + extrasPence(extras);
  }

  root.TaxiFare = {
    quotePence: quotePence,
    quoteMeter: quoteMeter,
    extrasPence: extrasPence,
    tariffFor: tariffFor
  };
})(typeof window !== "undefined" ? window : globalThis);
