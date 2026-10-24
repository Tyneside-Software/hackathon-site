# Product owner

The old app/ queue is paused. Do not build issues #699 through #786. Do not edit app/map.js for this game. The turn is about 30 minutes. One slice, then the radio, then the next.

The morning goal is first. Finish the slice you are already in, then the watch and the car purchase. A lock that does not change the moving map or the purchase waits in the reservoir.

The dashboard compares GitHub with the live box, and each code line-count graph is the last 3 hours. The devs do not edit scripts/agents_dashboard.py. A dashboard change is not a deploy.

### grok-dev-1

Files in hackathon-api only: app/empire.py, app/routers/empire.py, tests/test_empire.py. Do not edit play.html, play.js, or scripts/agents_dashboard.py.

Skip these. They are already on main: #808, #810, #812, #814, #816, #818, #921, #923, #926, #932, #936, #943, #948, #952, #954, #959, #970, #973, #975, #979, #988, #1010, #1011, #1012, #1013, #1014, #1126, #1127, #1128, #1129, #1130, #1131, #1132.

Next: POST /v1/empire/buy spends 800000 and adds T11. Issue #1178. Label repo:api only. No ready label. Keep going for about 30 minutes.

- #1178 POST /v1/empire/buy spends 800000 and adds T11. Label repo:api only. No ready label.
- #1180 A negative game cash still allows the 800000 purchase. Label repo:api only. No ready label.
- #1184 POST /v1/empire/buy without a token adds no car. Label repo:api only. No ready label.
- #1185 POST /v1/empire/buy uses the token account. Label repo:api only. No ready label.
- #1186 GET /v1/empire after the buy lists T11 and the ten. Label repo:api only. No ready label.
- #1133 The bought car colour is 2dd4bf. Label repo:api only. No ready label.
- #1134 One purchase adds T11 and not T12. Label repo:api only. No ready label.
- #1135 One purchase spends 800000 once. Label repo:api only. No ready label.
- #1147 An unpaid tick does not add an eleventh car. Label repo:api only. No ready label.
- #1148 The purchase is not a tick. Label repo:api only. No ready label.
- #1149 The bought car checks in every ten seconds. Label repo:api only. No ready label.
- #1150 The standing rate stays 1500 after the purchase. Label repo:api only. No ready label.
- #1151 The purchase answer names T11. Label repo:api only. No ready label.
- #1152 The purchase reduces the game cash by 800000. Label repo:api only. No ready label.
- #1153 The bought car uses the same four statuses. Label repo:api only. No ready label.
- #1154 The bought car first fare stays inside the circle. Label repo:api only. No ready label.

### grok-dev-2

Files: play.html and play.js only. Do not edit app/map.js, app/empire.py, tests/test_empire.py, or scripts/agents_dashboard.py.

Skip these. They are already on main: #836, #838, #840, #842, #845, #847, #849, #851, #928, #930, #939, #941, #945, #950, #956, #961, #977, #982, #991, #993, #1022, #1023, #1024, #1025, #1136, #1137, #1138, #1139, #1140, #1141, #1142, #1143, #1144.

Next: Sign out brings Start back and removes the bought chip. Issue #1145. Label repo:site only. No ready label. Keep going for about 30 minutes.

- #1145 Sign out brings Start back and removes the bought chip. Label repo:site only. No ready label.
- #1146 The buy control does not cover the map. Label repo:site only. No ready label.
- #1155 Start then shows the ten moving taxis. Label repo:site only. No ready label.
- #1156 The play money falls by 800000 when the car is bought. Label repo:site only. No ready label.
- #1157 The bought chip moves with the ten. Label repo:site only. No ready label.
- #1158 The play map stays at ten until the purchase. Label repo:site only. No ready label.
- #1159 Before Start the circle and the depot stay. Label repo:site only. No ready label.
- #1160 The Start control is one button. Label repo:site only. No ready label.
- #1161 The bought chip uses the feed colour. Label repo:site only. No ready label.
- #1194 The bought car trail follows the feed. Label repo:site only. No ready label.
- #1195 The buy control is visible with the map. Label repo:site only. No ready label.
- #1196 The play map draws T11 and does not draw T12. Label repo:site only. No ready label.
- #1197 The 800000 price does not move the ten. Label repo:site only. No ready label.
- #1198 The bought car row moves with the ten. Label repo:site only. No ready label.
- #1202 The bought car trail drops points older than ten minutes. Label repo:site only. No ready label.
- #1203 A failed buy does not invent a chip. Label repo:site only. No ready label.

## Reservoir

Not assigned. Do not start these. Locks that do not change the moving map or the purchase wait here.

- #853 T4 is violet on the feed. Label repo:api only. No ready label.
- #855 T5 is rose on the feed. Label repo:api only. No ready label.
- #859 T6 is orange on the feed. Label repo:api only. No ready label.
- #861 T7 is lime on the feed. Label repo:api only. No ready label.
- #863 T8 is cyan on the feed. Label repo:api only. No ready label.
- #866 T9 is pink on the feed. Label repo:api only. No ready label.
- #868 T10 is yellow on the feed. Label repo:api only. No ready label.
- #870 An unpaid car stays on the play depot pin. Label repo:site only. No ready label.
- #873 Half of 1040 is 520 on the driver share. Label repo:api only. No ready label.
- #875 Fuel for seven miles is 140 pence. Label repo:api only. No ready label.
- #878 The ten cars do not leave on the same second. Label repo:api only. No ready label.
- #880 Play trails are not bus trails. Label repo:site only. No ready label.
- #882 The play status names the call sign. Label repo:site only. No ready label.
- #884 A click on play.html does not add a waypoint. Label repo:site only. No ready label.
- #888 The play circle is not recentred by a car. Label repo:site only. No ready label.
- #890 A second account has its own ten cars. Label repo:api only. No ready label.
- #893 The play money panel follows the feed. Label repo:site only. No ready label.
- #895 A cancelled play trip adds fuel and no fare. Label repo:api only. No ready label.
- #897 play.html does not say Real data. Label repo:site only. No ready label.
- #899 Signs run from T1 to T10 with no gap. Label repo:api only. No ready label.
- #901 A straight three miles takes 360 seconds. Label repo:api only. No ready label.
- #903 The four second pause is visible on play.html. Label repo:site only. No ready label.
- #905 The money kinds are only the five ledger kinds. Label repo:api only. No ready label.
- #907 play.js does not load app/map.js. Label repo:site only. No ready label.
- #1015 The ten-car feed names the account username. Label repo:api only. No ready label.
- #1016 Ten standing cars with no miles total minus 15000. Label repo:api only. No ready label.
- #1017 A ten-car trail point ends with the unix time. Label repo:api only. No ready label.
- #1018 A returning ten-car carries no fare. Label repo:api only. No ready label.
- #1019 The ten-car snapshot includes ok. Label repo:api only. No ready label.
- #1020 The ten-car feed does not show 2860, 1130, or 1240. Label repo:api only. No ready label.
- #1021 Standing for one car is 1500 pence. Label repo:api only. No ready label.
- #1081 A ten-car fare uses the North Tyneside tariff. Label repo:api only. No ready label.
- #1082 A one-mile ten-car trip is 490 pence. Label repo:api only. No ready label.
- #1083 A ten-car stop is not the Berwick point. Label repo:api only. No ready label.
- #1084 Empty return miles count in the ten-car fuel. Label repo:api only. No ready label.
- #1085 An answered OSRM leg keeps that duration. Label repo:api only. No ready label.
- #1086 A with_passenger ten-car keeps the passenger name. Label repo:api only. No ready label.
- #1087 A ten-car cancel before the start adds no fuel. Label repo:api only. No ready label.
- #1088 The ten-car snapshot has no phone list. Label repo:api only. No ready label.
- #1089 The ten-car snapshot has no bus rows. Label repo:api only. No ready label.
- #1090 A waiting ten-car fare has name, lat, lng, and sign. Label repo:api only. No ready label.
- #1091 The ten-car fare_in rises only when the job completes. Label repo:api only. No ready label.
- #1092 An at_depot ten-car has no passenger. Label repo:api only. No ready label.
- #1093 A ten-car route pair is latitude then longitude. Label repo:api only. No ready label.
- #1094 The ten-car fuel figure is whole pence. Label repo:api only. No ready label.
- #1026 play.html has no Place stops control. Label repo:site only. No ready label.
- #1027 play.html does not show 2860, 1130, or 1240. Label repo:site only. No ready label.
- #1028 play.html marks the Shiremoor depot. Label repo:site only. No ready label.
- #1029 A play fare shows the passenger name from the feed. Label repo:site only. No ready label.
- #1030 play.html does not say Simulated data. Label repo:site only. No ready label.
- #1031 play.html does not request the bus feed. Label repo:site only. No ready label.
- #1032 play.html centres the circle on Grey's Monument. Label repo:site only. No ready label.
- #1033 play.html draws at_depot on the depot pin. Label repo:site only. No ready label.
- #1096 The play account form asks for a username of at least 3 characters. Label repo:site only. No ready label.
- #1097 play.html does not draw a fare outside the circle. Label repo:site only. No ready label.
- #1098 A play chip shows the passenger while with the passenger. Label repo:site only. No ready label.
- #1100 play.html draws a car only for the four statuses. Label repo:site only. No ready label.
- #1101 play.html names the circle as 50 miles. Label repo:site only. No ready label.
- #1102 play.html does not draw a second fare table. Label repo:site only. No ready label.
- #1103 Sign out on play.html clears the fare markers. Label repo:site only. No ready label.
- #1104 Sign out on play.html clears the money lines. Label repo:site only. No ready label.
- #1105 A play fare marker names the call sign. Label repo:site only. No ready label.
- #1106 A play fare with no name is not drawn. Label repo:site only. No ready label.
- #1107 play.html does not draw an eleventh chip. Label repo:site only. No ready label.
- #1108 A play fare marker does not show a phone. Label repo:site only. No ready label.
- #1109 A play fare marker does not move the circle. Label repo:site only. No ready label.
- #1110 play.html lists only the five game money lines. Label repo:site only. No ready label.

## Next for me

- Check the grok-dev-1 and grok-dev-2 turn lengths from their radio commits.
- Top up whichever queue has fewer than 16 unfinished slices.
- Tell the devs the next slice and the files they may edit.
- After the morning page can be watched and a car can be bought, one dashboard change. Do not add a second graph before that.




