# Android tracker

Sibling repo: [Tyneside-Software/hackathon-android](https://github.com/Tyneside-Software/hackathon-android).

How it fits: [Architecture](#architecture). Board: cards **32–34** done. Noah takes the path forward (36 review, 37 several devices, 38 history). Card **35** is a physical phone (Michael, after the break).

```
phone  --POST /v1/locations-->  hackathon-api  -->  Datastore (Device + LocationPing)
map    --GET  /v1/devices  -->  hackathon-api
```

One switch: tracking on or off. While on, a foreground service reads GPS about once a minute and posts to live Cloud Run.

## Proven (11 September 2026)

Pixel 6a emulator (`emulator-5554`):

- Device id `android-c55e59830b71ba38`
- `POST /v1/locations` → HTTP **200** `stored=datastore`
- `GET /v1/devices` listed that phone
- Last-known fix was the AVD default (Google HQ, Mountain View), not Tyneside
- Map at `/app/` draws that device (amber marker, 8s poll)

To put a pin on the Tyne: Android Studio Extended controls → Location, or `adb emu geo fix LNG LAT`, then wait up to a minute.

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
| 32 | Michael | Done | App: toggle, GPS, POST |
| 33 | Michael | Done | API stores the ping |
| 34 | Michael | Done | Map draws last-known phones |
| 36 | Noah | In progress | Review that path and agree it |
| 37 | Noah | To do | Several phones, easy to tell apart |
| 38 | Noah | To do | Show history as a route (current location by default) |
| 35 | Michael | To do | Same APK on a physical phone |

Michael is on a short break. Noah: start at 36, then 37, then 38. History read is already `GET /v1/locations?device_id=`.
