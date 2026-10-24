# Product owner

Master unpaused the lanes. The integrator refilled this list. Do not put the cash locks back in front. Do not rebuild the fullscreen map or the Start error text. Those are on `main` as `715b7c9`.

The old app/ queue is paused. Do not build issues #699 through #786. Do not edit app/map.js for this game. The turn is about 30 minutes. One slice, then the radio, then the next. You are not paused.

A line marked OPEN has no issue number yet. The product owner opens it. A dev skips that line and takes the next numbered line. A dev does not invent the OPEN sentence.

There is no cash_pence column yet. Do not build #1180, #1152, #1231, #1232, #1233, or #1234 until the cash_pence issue from this list is on main. fare_in is not the cash balance. 800000 is not added to fare_in.

The dashboard compares GitHub with the live box, and each code line-count graph is the last 3 hours. The devs do not edit scripts/agents_dashboard.py. A dashboard change is not a deploy.

### grok-dev-1

Files in hackathon-api only: app/empire.py, app/routers/empire.py, app/models.py, tests/test_empire.py. Do not edit play.html, play.js, or scripts/agents_dashboard.py. An ALTER may add cash_pence. Do not wipe the live database.

Skip these. They are already on main: #808, #810, #812, #814, #816, #818, #921, #923, #926, #932, #936, #943, #948, #952, #954, #959, #970, #973, #975, #979, #988, #1010, #1011, #1012, #1013, #1014, #1126, #1127, #1128, #1129, #1130, #1131, #1132, #1133, #1134, #1147, #1148, #1149, #1150, #1151, #1153, #1178, #1184, #1185, #1186, #1135, #1226, #1227, #1228, #1230, #1235, #1154.

Next: EmpireGame stores cash_pence, default 0. GET /v1/empire returns cash_pence. fare_in stays 0 until a job completes. Add the column with ALTER. Do not wipe the database. Issue #1262. Label repo:api only. No ready label. Keep going for about 30 minutes.

- #1262 EmpireGame stores cash_pence, default 0. GET /v1/empire returns cash_pence. fare_in stays 0 until a job completes. Add the column with ALTER. Do not wipe the database. Label repo:api only. No ready label.
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
Do not build #1180, #1152, #1231, #1232, #1233, or #1234 until #1262 is on main.

### grok-dev-2

Files: play.html and play.js only. Do not edit app/map.js, app/empire.py, tests/test_empire.py, or scripts/agents_dashboard.py. Keep the map filling the screen under the bar. Keep the money in the corner panel.

Skip these. They are already on main: #836, #838, #840, #842, #845, #847, #849, #851, #928, #930, #939, #941, #945, #950, #956, #961, #977, #982, #991, #993, #1022, #1023, #1024, #1025, #1136, #1137, #1138, #1139, #1140, #1141, #1142, #1143, #1144, #1145, #1146, #1155, #1156, #1157, #1158, #1159, #1160, #1161, #1195, #1198, #1203, #1194, #1218, #1221, #1202, #1223, #1224, #1222, #1196, #1197, #1214, #1215, #1217, #1216, #1220, #1271, #1282, #1272.

Next: The corner panel shows cash_pence once the feed has it, in integer pence. Issue #1273. Label repo:site only. No ready label. Keep going for about 30 minutes.

- #1273 The corner panel shows cash_pence once the feed has it, in integer pence. Label repo:site only. No ready label.
- #1274 The corner money panel does not cover the depot pin. Label repo:site only. No ready label.
- #1275 The status line does not cover the zoom control. Label repo:site only. No ready label.
- #1277 Signing out while the purchase request is in flight does not leave 800000 spent on the page. Label repo:site only. No ready label.
- #1278 Starting another account clears the spent line left by the previous account. Label repo:site only. No ready label.
- #1299 The play map does not draw a waiting fare for T12. Label repo:site only. No ready label.
- #1300 Starting another account clears the previous feed before the next poll, so a previous T11 does not hide the buy control. Label repo:site only. No ready label.
- #1301 A 401 on the empire feed clears the spent line and removes the bought car chip. Label repo:site only. No ready label.
- #1302 The play map fare pin shows the passenger name as text. Label repo:site only. No ready label.
- #1303 A later good feed clears Buy failed. Label repo:site only. No ready label.
- #1304 The taxi list on play.html names with_passenger the same way it names returning. Label repo:site only. No ready label.
- #1305 Sign out clears Buy failed. Label repo:site only. No ready label.
- #1306 The driver_share line does not show 400000. Label repo:site only. No ready label.
- #1308 The taxi list on play.html names to_passenger the same way it names returning. Label repo:site only. No ready label.
- #1309 The play map does not draw a waiting fare once that car is with_passenger. Label repo:site only. No ready label.
- #1315 Signing in again removes the previous account's chips before the next feed arrives. Label repo:site only. No ready label.

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
- The bought car's pickup is within 1.2 miles and the drop-off is within 3 miles. Label repo:api only. No ready label.
- Berwick is not a stop on the bought car's first fare. Label repo:api only. No ready label.

## Next for me

- When a numbered line lands on main, move one reservoir line into that queue and write a new reservoir line. Keep at least 16 unfinished lines in front of each dev. Do not copy issues #699 through #786, the office list, or map titles M1 to M32.
- Read both dev radios. Point grok-dev-1 at the first unfinished line in ### grok-dev-1 and grok-dev-2 at the first unfinished line in ### grok-dev-2. If a dev stopped after one slice, say the turn was short and name the next numbered line.
- One dashboard change in scripts/agents_dashboard.py. The empire card says whether the spent line shows 800000 pence only when the feed lists T11. No second line-count graph. No agents.html. No password.
- The next player-visible slice is #1273. The corner panel shows cash_pence once the feed has it, in integer pence. Do not rebuild the fullscreen map. Do not edit play.html, play.js, or the API. Do not deploy.
