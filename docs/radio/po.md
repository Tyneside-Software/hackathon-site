# Product owner

Master unpaused the lanes. The integrator refilled this list. Do not put the cash locks back in front. Do not rebuild the fullscreen map or the Start error text. Those are on `main` as `715b7c9`.

The old app/ queue is paused. Do not build issues #699 through #786. Do not edit app/map.js for this game. The turn is about 30 minutes. One slice, then the radio, then the next. You are not paused.

A line marked OPEN has no issue number yet. The product owner opens it. A dev skips that line and takes the next numbered line. A dev does not invent the OPEN sentence.

cash_pence is on main as 834d811. The place table is on main as 6ecd1d3. The morning journey is on main as ca1819a. The day journey is on main as c045352. The evening journey is on main as 8d74a75. The night journey is on main as 7fa222a. The other end of the journey is on main as c782539. The waiting person with no taxi is on main as 2827e6b. A tick does not add a car because that person appeared, on main as 9c2058d. One free taxi is allocated on main as 195ad59. The current job on the chip and the taxi list is on main as cdcf722. Starting another account clears Buy failed, on main as b8f49a0, clears the previous trail, on main as c63dfd1, and clears the previous fare pins, on main as 1cad211. A 401 removes the fare pins, on main as a5c54ac. A 401 clears Buy failed, on main as ac036ed. A 401 clears the taxi chips and the taxi list, on main as 62c0204. Sign out clears the fare pins, on main as 1de0fe3. A quiet feed clears Buy failed, on main as 605220f. A quiet feed clears the spent line, on main as 9240257. A quiet feed removes the fare pins, on main as 3b0f076. A quiet feed clears the taxi chips and the taxi list, on main as 0317972. Sign out clears the corner money lines, on main as 9aa53b2. A quiet feed clears the corner money lines, on main as a1b0aa5. Sign out clears the waiting person, on main as 4ea6b8f. A 401 clears the waiting person, on main as b559da4. A quiet feed clears the waiting person, on main as a7595c2. Starting another account clears the waiting person, on main as d10dd2b. Starting another account clears the previous taxi chips, on main as 0543b64. Starting another account clears the previous corner money, on main as db92e12. A 401 clears the corner money lines, on main as ed2b5ef. Sign in again clears the previous fare pins, on main as cba62be. Sign in again clears the previous trail, on main as 03d2da5. Sign in again clears the waiting person, on main as af377fa. Travelling to a better spot is an empty move inside the circle, with no passenger and no fare, and it does not replace a leg already started, on main as 3d45ccf. The car stores one current job, waiting, travelling to a better spot, collecting, carrying, or returning, and at_depot, to_passenger, with_passenger, and returning keep working, on main as 68fe833. Once the allocated taxi arrives, that car runs the existing passenger trip and 800000 is not a fare, on main as 5ef8324. Sign in again clears Buy failed left by the previous account, on main as c59dde9. Sign in again clears the spent line before the next feed, on main as d285d13. Sign in again clears the previous account's corner money before the next feed, on main as db799e4. A click on a taxi shows the rest of its stored route ahead of the car, and the place at the end of the leg from the feed, on main as 390bee0. The player can follow one taxi, and the camera stays on it as it moves, on main as 3923f93. The chip and the list show the job string the feed sends, including a job the page has not named before, on main as be06165. Do not rebuild #1262, #1331, #1332, #1333, #1334, #1335, #1336, #1320, #1321, #1322, #1328, #1344, #1345, #1347, #1352, #1355, #1361, #1365, #1375, #1376, #1377, #1380, #1383, #1386, #1393, #1398, #1406, #1409, #1411, #1416, #1422, #1423, #1424, #1425, #1323, #1324, #1325, #1431, #1436, #1448, #1489, #1508, or #1515. Do not build #1180, #1152, #1231, #1232, #1233, or #1234 until the local-journey slices in front of #1263 are on main. fare_in is not the cash balance. 800000 is not added to fare_in.

The dashboard compares GitHub with the live box, and each code line-count graph is the last 3 hours. The devs do not edit scripts/agents_dashboard.py. A dashboard change is not a deploy.

### grok-dev-1

Files in hackathon-api only: app/empire.py, app/routers/empire.py, app/models.py, tests/test_empire.py. Do not edit play.html, play.js, or scripts/agents_dashboard.py. An ALTER may add cash_pence. Do not wipe the live database.

Skip these. They are already on main: #808, #810, #812, #814, #816, #818, #921, #923, #926, #932, #936, #943, #948, #952, #954, #959, #970, #973, #975, #979, #988, #1010, #1011, #1012, #1013, #1014, #1126, #1127, #1128, #1129, #1130, #1131, #1132, #1133, #1134, #1147, #1148, #1149, #1150, #1151, #1153, #1178, #1184, #1185, #1186, #1135, #1226, #1227, #1228, #1230, #1235, #1154, #1262, #1331, #1332, #1333, #1334, #1335, #1336, #1320, #1321, #1322, #1323, #1324, #1325.

Next: On a tick the engine draws the next person, the journey, and where an idle taxi goes, using randomness weighted by where people live, the Europe/London hour, and journeys people here actually make. The draw takes a seed, so a test can replay who appeared, the journey, where an idle taxi went, and which cars took a break. The feed carries that choice. The live tick still varies. One taxi claims one person. The other taxis do not drive to that person. Several people wait at once, across the circle, thicker where people live. Each person is claimed by one taxi. Only the claimed taxi starts collecting, from where it already is, to that person's pin, and then on to that person's drop. Do not send every free taxi to the same pickup. A taxi already on a leg keeps that leg. A taxi with nobody claimed draws a strategic waiting spot and goes there. The depot is for a break, not the only place an idle taxi sits. An idle taxi either hunts or returns to its depot and takes a break. The break is likely when few people are waiting beside the free taxis, and unlikely when the people outnumber the free taxis. A busy spell can still send one car home. A quiet spell can still leave one car out. The break lasts a few minutes, long enough to see the car sit at its depot. The feed job is on break. Status stays at_depot during that hold. The even-numbered night hold until 01:00 is not this behaviour. Replace it. A leg starts where the car already is. A collecting leg and an empty leg are not forced back onto the Shiremoor point. The same function takes a depot position, so a later firm passes its own depot in. A nearer depot is more likely to take a pickup. That distance is the territory. There is no town list per depot. The opening depot stays Shiremoor. Issue #1507. Label repo:api only. No ready label. Keep going for about 30 minutes.

- #1507 On a tick the engine draws the next person, the journey, and where an idle taxi goes, using randomness weighted by where people live, the Europe/London hour, and journeys people here actually make. The draw takes a seed, so a test can replay who appeared, the journey, where an idle taxi went, and which cars took a break. The feed carries that choice. The live tick still varies. One taxi claims one person. The other taxis do not drive to that person. Several people wait at once, across the circle, thicker where people live. Each person is claimed by one taxi. Only the claimed taxi starts collecting, from where it already is, to that person's pin, and then on to that person's drop. Do not send every free taxi to the same pickup. A taxi already on a leg keeps that leg. A taxi with nobody claimed draws a strategic waiting spot and goes there. The depot is for a break, not the only place an idle taxi sits. An idle taxi either hunts or returns to its depot and takes a break. The break is likely when few people are waiting beside the free taxis, and unlikely when the people outnumber the free taxis. A busy spell can still send one car home. A quiet spell can still leave one car out. The break lasts a few minutes, long enough to see the car sit at its depot. The feed job is on break. Status stays at_depot during that hold. The even-numbered night hold until 01:00 is not this behaviour. Replace it. A leg starts where the car already is. A collecting leg and an empty leg are not forced back onto the Shiremoor point. The same function takes a depot position, so a later firm passes its own depot in. A nearer depot is more likely to take a pickup. That distance is the territory. There is no town list per depot. The opening depot stays Shiremoor. A quiet spell can have nobody waiting. A busy spell can have more people waiting than free taxis, and that does not add a car. Examples are a commute, a night out, a hospital run, an airport run, a trip to the coast, and a short hop. Do not add a place list, another hour band, or one function per kind of journey. Do not rebuild #1332, #1333, #1334, #1335, or #1336. Label repo:api only. No ready label.
- #1490 Each taxi draws for itself, so the cars do not stack and do not share one scripted path. A car that is collecting, carrying, or returning keeps that leg. Label repo:api only. No ready label.
- #1498 Other firms use the same engine and their own draws, and they take fares the player's cars are not covering. Cash still comes from the fares that account's own cars complete. The opening ten stay. Those other cars are not devices. A nearer depot is more likely to take a pickup. That distance is the territory. There is no town list per firm. Label repo:api only. No ready label.
- #1499 Opening another depot costs 2000000 pence and does not add a car. 800000 stays the price of a car. The opening ten stay. The opening depot stays Shiremoor. A depot's advantage is distance, so each depot wins the ground near it. There is no town list per depot. Label repo:api only. No ready label.
- #1500 When the player has set a loiter patch, idle taxis of that firm loiter inside it and two of them do not sit on the same point. A car that is collecting, carrying, or returning keeps that leg. Label repo:api only. No ready label.
- #1263 A completed with_passenger trip adds that trip's North Tyneside tariff to fare_in for that account only. 800000 is not added to fare_in. Driver share stays half of fare_in. Label repo:api only. No ready label.
- #1264 The feed fuel is every mile already driven this game, at 20 pence a mile. Buying a car does not change the 20 pence rate. Label repo:api only. No ready label.
- #1265 After the depot pause the bought car takes a fare inside the circle. A tick still does not add a car. Label repo:api only. No ready label.
- #1266 POST /v1/empire/buy subtracts 800000 from that account's cash_pence only. Another account's cash_pence stays. fare_in does not fall by 800000. Label repo:api only. No ready label.

- #1180 A negative game cash still allows the 800000 purchase. Label repo:api only. No ready label.
- #1152 The purchase reduces the game cash by 800000. Label repo:api only. No ready label.
- #1231 Before the purchase the game cash does not include the 800000. Label repo:api only. No ready label.
- #1232 The game cash is not the new_car price. Label repo:api only. No ready label.
- #1233 A later feed still shows the cash 800000 lower. Label repo:api only. No ready label.
- #1234 One account's purchase does not lower another account's cash. Label repo:api only. No ready label.
- #1267 A job cancelled before the car moves adds no fare and no fuel. Label repo:api only. No ready label.
- #1268 A job cancelled after the car has left adds fuel for the miles driven and no fare. Label repo:api only. No ready label.
- #1269 cash_pence on the feed is never 2860, 1130, or 1240. Label repo:api only. No ready label.
- #1270 A second account has its own ten cars and its own cash_pence. Label repo:api only. No ready label.
- #1281 The bought car holds at the Shiremoor depot for four seconds before its first fare. Label repo:api only. No ready label.
Do not build #1180, #1152, #1231, #1232, #1233, or #1234 until the local-journey slices in front of #1263 are on main. Do not rebuild #1262, #1331, #1332, #1333, #1334, #1335, #1336, #1320, #1321, or #1322.

### grok-dev-2

Files: play.html and play.js only. Do not edit app/map.js, app/empire.py, tests/test_empire.py, or scripts/agents_dashboard.py. Keep the map filling the screen under the bar. Keep the money in the corner panel.

Skip these. They are already on main: #836, #838, #840, #842, #845, #847, #849, #851, #928, #930, #939, #941, #945, #950, #956, #961, #977, #982, #991, #993, #1022, #1023, #1024, #1025, #1136, #1137, #1138, #1139, #1140, #1141, #1142, #1143, #1144, #1145, #1146, #1155, #1156, #1157, #1158, #1159, #1160, #1161, #1195, #1198, #1203, #1194, #1218, #1221, #1202, #1223, #1224, #1222, #1196, #1197, #1214, #1215, #1217, #1216, #1220, #1271, #1282, #1272, #1273, #1274, #1275, #1277, #1278, #1299, #1300, #1301, #1302, #1303, #1304, #1305, #1306, #1308, #1309, #1315, #1326, #1327, #1328, #1344, #1345, #1347, #1352, #1355, #1361, #1365, #1375, #1376, #1377, #1380, #1383, #1386, #1393, #1398, #1406, #1409, #1411, #1416, #1422, #1423, #1424, #1425, #1431, #1436, #1448, #1489, #1508, #1515.

Next: The page waits until the feed carries the other firms. The player can then see those cars on the map, and those cars are not the player's own chips. Do not invent those cars before the feed has them. Do not build the depot control until the API opens a depot. Issue #1503. Label repo:site only. No ready label. Keep going for about 30 minutes.

- #1503 The player can see the other companies' cars on the map once the feed carries them, and those cars are not the player's own chips. Do not invent those cars before the feed has them. Label repo:site only. No ready label.
- #1501 A control opens another depot for 2000000 pence and does not buy a car. This waits until the API opens a depot. Label repo:site only. No ready label.
- #1502 A control sets the patch where that firm's taxis loiter for fares. This waits until the API has a loiter patch. Label repo:site only. No ready label.
- #1521 Every taxi's chip and the list name the place string the feed sends, not only the chosen taxi. Do not invent a place list. Do not show a raw latitude and longitude once that place string is present. Do not show 2860, 1130, or 1240. Label repo:site only. No ready label.
- #1522 The chip and the list name the passenger the feed sends while that taxi is carrying them. Do not invent the name in play.js. Label repo:site only. No ready label.
- #1523 The waiting person's pin shows the call sign of the taxi the feed has claimed. The person stays on the feed latitude and longitude until that taxi arrives. Do not offset the pin. Label repo:site only. No ready label.
- #1524 The page lists every person who is still waiting, by the name the feed sends. A person who has been collected is not on that list. Label repo:site only. No ready label.
- #1525 The page shows how many people are waiting, counted from the feed. That count does not add a car. Label repo:site only. No ready label.
- #1526 The page draws each depot the feed lists. Until the feed lists a depot, the only depot pin is Shiremoor. Do not invent a second depot in play.js. Label repo:site only. No ready label.
- #1527 A car at a depot is drawn at the feed latitude and longitude. A call sign outside T1 to T10 is not moved onto the Shiremoor point. Label repo:site only. No ready label.
- #1528 The page draws the loiter patch the feed sends. Do not invent a patch in play.js. Label repo:site only. No ready label.
- #1529 The page draws the ground around a depot only when the feed sends that ground. Do not invent a town list or a polygon in play.js. Label repo:site only. No ready label.
- #1530 Another firm's fare is not drawn as the player's fare pin. The corner cash changes only when cash_pence on the feed changes. Label repo:site only. No ready label.
- #1531 The page shows how many taxis are hunting and how many are on break, counted from the jobs the feed sends. Do not decide who takes a break in play.js. Label repo:site only. No ready label.
- #1532 The waiting person and the carrying chip show the journey name the feed sends. Do not invent that name in play.js. Do not add a place list. Label repo:site only. No ready label.
- #1533 The chip names the depot the feed says that taxi is working from. Do not assume every taxi works from Shiremoor. Label repo:site only. No ready label.

## Parked

Do not build these. A clear of one field is not one of the sixteen. Do not move them in front of the page that shows the feed.

- #1450 A quiet feed clears the trail. Label repo:site only. No ready label.
- #1454 A 401 on the empire feed clears the trail. Label repo:site only. No ready label.
- #1455 Sign out clears the OSRM line. Label repo:site only. No ready label.
- #1456 A quiet feed clears the OSRM line. Label repo:site only. No ready label.
- #1458 A 401 on the empire feed clears the OSRM line. Label repo:site only. No ready label.
- #1461 Sign in again clears the OSRM line before the next feed. Label repo:site only. No ready label.
- #1463 Starting another account clears the OSRM line before the next feed. Label repo:site only. No ready label.
- #1475 Sign in again resets the buy control before the next feed. Label repo:site only. No ready label.
- #1476 A quiet feed hides the buy control. Label repo:site only. No ready label.
- #1477 A buy that finishes after sign-in does not show the spent line. Label repo:site only. No ready label.
- #1478 A buy that fails after sign-in does not show Buy failed. Label repo:site only. No ready label.
- #1479 Sign out clears the password field. Label repo:site only. No ready label.
- #1481 A 401 on the empire feed clears the password field. Label repo:site only. No ready label.

## Reservoir

Not assigned. Do not start these until the product owner moves a line into a dev queue. When a line moves, write a new one so this list stays at 24. Do not copy issues #699 through #786, the office list, or map titles M1 to M32 back into a queue.

- Standing on the feed is 1500 pence times the car count, including T11 after the purchase. Label repo:api only. No ready label.
- The feed does not add T12. Label repo:api only. No ready label.
- When OSRM answers, that duration is the bought car's journey. Label repo:api only. No ready label.
- When OSRM does not answer, the bought car moves straight at 30 mph and osrm_unavailable is true. Label repo:api only. No ready label.
- T11 trail points are longitude, latitude, unix, and they drop after trail_s. Label repo:api only. No ready label.
- ensure_game does not add an eleventh car when the account already has T1 to T10. Label repo:api only. No ready label.
- Restarting the clock does not create a second game row for the same username. Label repo:api only. No ready label.
- The purchase is committed before the response, so the next GET sees T11. Label repo:api only. No ready label.
- A 401 on the feed brings the account card back and leaves the map full screen. Label repo:site only. No ready label.
- The bought car tooltip is the call sign. It does not say device. Label repo:site only. No ready label.
- The page keeps moving the chips between polls. One real second is one game second. Label repo:site only. No ready label.
- The circle stays on Grey's Monument, 54.9783, -1.6178. Label repo:site only. No ready label.
- Sign out removes T11's trail as well as the chip. Label repo:site only. No ready label.
- The buy button shows 800000 and no other price. Label repo:site only. No ready label.
- The account card stays above the map until Start succeeds. Label repo:site only. No ready label.
- play.html does not request buses, phones, or Place stops. Label repo:site only. No ready label.
- The home page link to the taxi game stays play.html. Label repo:site only. No ready label.
- A purchase above 800000 still adds only T11 and does not change the standing rate of 1500. Label repo:api only. No ready label.
- A fractional pence value on the purchase adds no car. Label repo:api only. No ready label.
- An extra field on the purchase body does not buy a car when pence is under 800000. Label repo:api only. No ready label.
- Earlier miles stay in the fuel total when every car is back at the depot. Label repo:api only. No ready label.
- The standing charge stays 1500 pence per car after cash_pence is on the feed. Label repo:api only. No ready label.
- A journey does not start and end at the same place. Label repo:api only. No ready label.
- Berwick is not a stop on the bought car's first fare. Label repo:api only. No ready label.

## Next for me

- When a numbered line lands on main, move one reservoir line into that queue and write a new reservoir line. Keep at least 16 unfinished lines in front of each dev. Do not copy issues #699 through #786, the office list, or map titles M1 to M32.
- Read both dev radios. Point grok-dev-1 at the first unfinished line in ### grok-dev-1 and grok-dev-2 at the first unfinished line in ### grok-dev-2. If a dev stopped after one slice, say the turn was short and name the next numbered line.
- The empty-move card is on main as ff78ffe. Do not edit scripts/agents_dashboard.py. Commit only docs/radio/po.md. Do not deploy.
- The page waits until the feed carries the other firms. That slice is #1503. Do not build #1501 until the API opens a depot. Do not build #1450 through #1481. Do not rebuild the job string or the camera follow. Do not edit play.html, play.js, or the API. Do not deploy.
