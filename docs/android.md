# Android tracker

Sibling repo: [Tyneside-Software/hackathon-android](https://github.com/Tyneside-Software/hackathon-android).

How it fits: [Architecture](#architecture). Map UI: [The map](#map). Physical phone leftover: card **35**.

```
phone  --POST /v1/locations-->  hackathon-api  -->  Device (last-known) + LocationPing (history)
map    --GET  /v1/devices  -->  last-known, every 8s
drawer --GET  /v1/locations?device_id= --> ping history (Firestore, Datastore fallback)
```

One switch: tracking on or off. While on, a foreground service POSTs **every minute**, even if lat/lng have not moved. That ping is the heartbeat. `recorded_at` is when the ping left the phone, so the map age is last communication, not a stale GPS clock.

The toggle state is saved and restored on next launch (Noah, `b12a0ec`).

## Proven (11 September 2026)

Pixel 6a emulator (`emulator-5554`):

- Device id `android-c55e59830b71ba38` (and at least one other emulator id has pinged)
- `POST /v1/locations` → HTTP **200** `stored=datastore`, then a heartbeat POST one minute later
- Live coordinates on the map: **Grey’s Monument, Newcastle** (`54.9783, -1.6178`)
- Log tag `TynesideTracker`

This AVD ignores console `geo fix` and caches Google HQ as last-known. The debug app remaps that exact HQ default to Newcastle. A real GPS fix (not HQ) is used as-is. High-accuracy GPS is requested so a genuine fix can land.

## Run it

1. Clone `hackathon-android` beside the site and API.
2. Open that folder in Android Studio. Let Gradle sync.
3. **JDK 17**, not Android Studio’s bundled JBR (that is Java 25; AGP 8.7 will not run on it). Microsoft OpenJDK 17 works. Set `JAVA_HOME` before `gradlew`.
4. Start an AVD (Pixel 6a is the one already tested) or plug in a phone with USB debugging.
5. Run `app`. Grant location (and notifications on Android 13+).
6. Flip the switch on, or from a shell:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb shell pm grant software.tyneside.tracker android.permission.ACCESS_FINE_LOCATION
& $adb shell pm grant software.tyneside.tracker android.permission.ACCESS_COARSE_LOCATION
& $adb shell pm grant software.tyneside.tracker android.permission.POST_NOTIFICATIONS
& $adb shell am start -n software.tyneside.tracker/.MainActivity --ez start_tracking true
```

Watch the path:

```powershell
& $adb logcat -s TynesideTracker
```

You should see `post start` then, about a minute later, `post heartbeat`. Both HTTP 200.

## Device id

Modern Android will not give a sideloaded app the hardware serial or IMEI. The app uses `Settings.Secure.ANDROID_ID` (unique per app + user + device), prefix `android-`. Broken emulators that report `9774d56d682e549c` fall back to a UUID.

## APK

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`.

## Board

| Card | Who | Status | Slice |
|------|-----|--------|--------|
| 32 | Michael | Done | App: toggle, GPS, POST every minute |
| 33 | Michael | Done | API stores the ping |
| 34 | Michael | Done | Map draws last-known phones |
| 36 | Noah | Done | Took the path forward |
| 37 | Noah | Done | Phone cards, easy to tell apart |
| 38 | Noah | Done | Drawer + history path; same-place pings hidden |
| 35 | Michael | To do | Same APK on a physical phone |

History read: `GET /v1/locations?device_id=`.
