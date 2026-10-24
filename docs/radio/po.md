# Product owner

Master unpaused the lanes. The integrator refilled this list. Do not put the cash locks back in front. Do not rebuild the fullscreen map or the Start error text. Those are on `main` as `715b7c9`.

The old app/ queue is paused. Do not build issues #699 through #786. Do not edit app/map.js for this game. The turn is about 30 minutes. One slice, then the radio, then the next. You are not paused.

A line marked OPEN has no issue number yet. The product owner opens it. A dev skips that line and takes the next numbered line. A dev does not invent the OPEN sentence.

There is no cash_pence column yet. Do not build #1180, #1152, #1231, #1232, #1233, or #1234 until the cash_pence issue from this list is on main. fare_in is not the cash balance. 800000 is not added to fare_in.

The dashboard compares GitHub with the live box, and each code line-count graph is the last 3 hours. The devs do not edit scripts/agents_dashboard.py. A dashboard change is not a deploy.

### grok-dev-1

Files in hackathon-api only: app/empire.py, app/routers/empire.py, app/models.py, tests/test_empire.py. Do not edit play.html, play.js, or scripts/agents_dashboard.py. An ALTER may add cash_pence. Do not wipe the live database.

Skip these. They are already on main: #808, #810, #812, #814, #816, #818, #921, #923, #926, #932, #936, #943, #948, #952, #954, #959, #970, #973, #975, #979, #988, #1010, #1011, #1012, #1013, #1014, #1126, #1127, #1128, #1129, #1130, #1131, #1132, #1133, #1134, #1147, #1148, #1149, #1150, #1151, #1153.

Next: POST /v1/empire/buy spends 800000 and adds T11. Issue #1178. Label repo:api only. No ready label. Keep going for about 30 minutes.

- #1178 POST /v1/empire/buy spends 800000 and adds T11. The route calls buy_car. Label repo:api only. No ready label.
- #1184 POST /v1/empire/buy without a token adds no car. Label repo:api only. No ready label.
- #1185 POST /v1/empire/buy uses the token account. Label repo:api only. No ready label.
- #1186 GET /v1/empire after the buy lists T11 and the ten. Label repo:api only. No ready label.
- #1135 One purchase spends 800000 once. A second buy does not add T12. Label repo:api only. No ready label.
- #1226 A payment under 800000 is not a successful purchase. Label repo:api only. No ready label.
- #1227 A purchase body with no pence adds no car. Label repo:api only. No ready label.
- #1228 A rejected bearer token on the purchase adds no car. Label repo:api only. No ready label.
- #1230 A purchase without a valid token answers 401. Label repo:api only. No ready label.
- #1235 A tick does not spend 800000 and does not add a car. Label repo:api only. No ready label.
- #1154 The bought car's first fare stays inside the circle. Label repo:api only. No ready label.
- OPEN. EmpireGame stores cash_pence, default 0. GET /v1/empire returns cash_pence. fare_in stays 0 until a job completes. Add the column with ALTER. Do not wipe the database. Label repo:api only. No ready label.
- OPEN. A completed with_passenger trip adds that trip's North Tyneside tariff to fare_in for that account only. 800000 is not added to fare_in. Driver share stays half of fare_in. Label repo:api only. No ready label.
- OPEN. The feed fuel is every mile already driven this game, at 20 pence a mile. Buying a car does not change the 20 pence rate. Label repo:api only. No ready label.
- OPEN. After the depot pause the bought car takes a fare inside the circle. A tick still does not add a car. Label repo:api only. No ready label.
- OPEN. POST /v1/empire/buy subtracts 800000 from that account's cash_pence only. Another account's cash_pence stays. fare_in does not fall by 800000. Label repo:api only. No ready label.

Held until the cash_pence issue is on main. Not the next slice: #1180, #1152, #1231, #1232, #1233, #1234.

### grok-dev-2

Files: play.html and play.js only. Do not edit app/map.js, app/empire.py, tests/test_empire.py, or scripts/agents_dashboard.py. Keep the map filling the screen under the bar. Keep the money in the corner panel.

Skip these. They are already on main: #836, #838, #840, #842, #845, #847, #849, #851, #928, #930, #939, #941, #945, #950, #956, #961, #977, #982, #991, #993, #1022, #1023, #1024, #1025, #1136, #1137, #1138, #1139, #1140, #1141, #1142, #1143, #1144, #1145, #1146, #1155, #1156, #1157, #1158, #1159, #1160, #1161, #1195, #1198, #1203.

Next: The bought car trail follows the feed. Issue #1194. Label repo:site only. No ready label. Keep going for about 30 minutes.

- #1194 The bought car trail follows the feed, including a sign outside T1 to T10. Label repo:site only. No ready label.
- #1218 The bought car trail uses the feed colour. Label repo:site only. No ready label.
- #1221 The bought car trail is drawn latitude then longitude. The feed point is longitude, latitude, unix. Label repo:site only. No ready label.
- #1202 The bought car trail drops points older than ten minutes. Label repo:site only. No ready label.
- #1223 Each feed replaces the bought car trail. Label repo:site only. No ready label.
- #1224 The bought car chip stays when its trail is drawn. Label repo:site only. No ready label.
- #1222 While the bought car is at the depot the chip stays on the depot pin. Label repo:site only. No ready label.
- #1196 The play map draws T11 and does not draw T12. Label repo:site only. No ready label.
- #1197 The 800000 price does not move the ten. Label repo:site only. No ready label.
- #1214 The buy control ignores a second press while the purchase is in flight. Label repo:site only. No ready label.
- #1215 Once the feed lists T11 the buy control does not offer another car. Label repo:site only. No ready label.
- #1217 The spent line follows T11 in the feed. Label repo:site only. No ready label.
- #1216 The fare_in line does not show 800000. Label repo:site only. No ready label.
- #1220 A rejected buy clears the spent line and keeps the map full screen. Label repo:site only. No ready label.
- OPEN. After Start the map still fills the screen under the bar. The money stays in the corner panel. Do not bring the side column back. Label repo:site only. No ready label.
- OPEN. Signing in again shows T11 when that account's feed already has it, and does not draw a second T1 to T10. Label repo:site only. No ready label.

## Reservoir

Not assigned. Do not start these until the product owner moves a line into a dev queue. When a line moves, write a new one so this list stays at 24. Do not copy issues #699 through #786, the office list, or map titles M1 to M32 back into a queue.

- A job cancelled before the car moves adds no fare and no fuel. Label repo:api only. No ready label.
- A job cancelled after the car has left adds fuel for the miles driven and no fare. Label repo:api only. No ready label.
- cash_pence on the feed is never 2860, 1130, or 1240. Label repo:api only. No ready label.
- Standing on the feed is 1500 pence times the car count, including T11 after the purchase. Label repo:api only. No ready label.
- The feed does not add T12. Label repo:api only. No ready label.
- When OSRM answers, that duration is the bought car's journey. Label repo:api only. No ready label.
- When OSRM does not answer, the bought car moves straight at 30 mph and osrm_unavailable is true. Label repo:api only. No ready label.
- T11 trail points are longitude, latitude, unix, and they drop after trail_s. Label repo:api only. No ready label.
- ensure_game does not add an eleventh car when the account already has T1 to T10. Label repo:api only. No ready label.
- A second account has its own ten cars and its own cash_pence. Label repo:api only. No ready label.
- Restarting the clock does not create a second game row for the same username. Label repo:api only. No ready label.
- The purchase is committed before the response, so the next GET sees T11. Label repo:api only. No ready label.
- The corner panel shows cash_pence once the feed has it, in integer pence. Label repo:site only. No ready label.
- The corner money panel does not cover the depot pin. Label repo:site only. No ready label.
- The status line does not cover the zoom control. Label repo:site only. No ready label.
- A 401 on the feed brings the account card back and leaves the map full screen. Label repo:site only. No ready label.
- The bought car tooltip is the call sign. It does not say device. Label repo:site only. No ready label.
- The page keeps moving the chips between polls. One real second is one game second. Label repo:site only. No ready label.
- The circle stays on Grey's Monument, 54.9783, -1.6178. Label repo:site only. No ready label.
- Sign out removes T11's trail as well as the chip. Label repo:site only. No ready label.
- The buy button shows 800000 and no other price. Label repo:site only. No ready label.
- The account card stays above the map until Start succeeds. Label repo:site only. No ready label.
- play.html does not request buses, phones, or Place stops. Label repo:site only. No ready label.
- The home page link to the taxi game stays play.html. Label repo:site only. No ready label.

## Next for me

- Open a GitHub issue for every queue line marked OPEN. One po.md commit replaces OPEN with the issue number. Label repo:api or repo:site only. No ready label. Do not change the sentence. Do not put the new issue in front of #1178 or #1194.
- After cash_pence has an issue number, move #1180, #1152, #1231, #1232, #1233, and #1234 to the end of ### grok-dev-1, behind that issue. They are not the next slice before the column exists.
- Read both dev radios. The grok-dev-1 line `morning order not at the front` is stale. Say so. Point grok-dev-1 at #1178 and grok-dev-2 at #1194.
- If a dev stopped after one slice, say the turn was short and name the next numbered line. Leave 16 unfinished lines in front of each dev.
- When a numbered line lands on main, move one reservoir line into that queue and write a new reservoir line. Do not copy #699 through #786 back.
- After the OPEN lines have numbers, one dashboard change in scripts/agents_dashboard.py. The empire card says whether origin app/routers/empire.py has POST /v1/empire/buy, and whether play.js still skips a trail outside T1 to T10. No second line-count graph. No agents.html. No password.
- Do not edit play.html, play.js, or the API. Do not deploy.
- When those jobs are done, write the next four here before the turn ends: top up from the reservoir, read the dev radios, the next dashboard gap, and the next player-visible slice. Do not leave this heading empty.
