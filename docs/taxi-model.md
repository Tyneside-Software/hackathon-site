# Tracker model

The shape to agree before anyone changes `device_links`. This page does not change `app/models.py`, does not migrate SQLite, and does not write to the live database. The brief is [Tracker, office, and game](#taxi). `app/map.js` stays as it is.

`devices` and `location_pings` stay the store for a phone's last-known position and its history. They stay keyed by `device_id` alone. The link table is only who may watch that phone.

## Today

`device_links` has one row per phone. `device_id` is the primary key, so a second account cannot have its own row.

| Column | Meaning today |
|--------|----------------|
| `device_id` | Primary key. One row per phone. |
| `username` | The single account. |
| `nickname` | The single name for that phone. |
| `linked_at` | When that one link was written. |

`link_device` refuses a second account. The message is `Device already linked to another account`, and `POST /v1/me/devices` returns HTTP 409. `list_device_rows` keeps one link per `device_id`, and `GET /v1/devices` adds that one `username` and one `nickname` onto the device. The route is public: the map loads every device that has pinged.

`save_location` is the writer of `devices` and `location_pings`. A ping does not read or write `device_links`. The phone app keeps posting `POST /v1/locations`.

## Replacement

The same table, `device_links`. The primary key is both ids, so one phone can be linked to several accounts and one account can link several phones. A second link does not replace or reject the first.

| Column | Meaning |
|--------|---------|
| `username` | Part of the primary key. The account. |
| `device_id` | Part of the primary key. The phone. |
| `role` | `owner` or `watcher`. |
| `kind` | `phone`, `child`, `car`, or `other`. How this account classifies the phone. |
| `nickname` | What this account calls it. Two accounts may use two names. |
| `linked_at` | Kept from today's row. When this account linked this device. |

`role` and `kind` sit on the link, with the nickname. They are not columns on `devices`. The brief allows several watchers on one device, and several devices for one person. It does not say a device must have exactly one owner. This page does not add that rule.

Removing one link deletes that row only. It does not delete the `devices` row and it does not delete `location_pings`.

`GET /v1/devices` cannot keep a single `username` and `nickname` once a phone has more than one link. The list of links replaces that pair. Who is allowed to see a device is a later read rule on that route, not a change to the ping. Until that rule lands, the map still shows every device, as it does now.

## Game taxis stay out of `devices`

A game taxi is not a phone. Simulated vehicles live in their own tables, named by the later simulated-taxis issue. This page does not create those tables.

| Store | What may be in it |
|-------|-------------------|
| `devices`, `location_pings` | Phones that have posted `POST /v1/locations`. |
| `device_links` | Accounts watching those phones. |
| Game tables | Simulated taxis and customers. No `device_id`. |

A game tick must not insert into `devices`, `location_pings`, or `device_links`. A phone ping must not insert a game taxi. `GET /v1/devices` must not return game taxis, so a tracked child and a game taxi cannot be the same marker. When a later issue draws the game, those markers come from the game tables. The phone markers stay on `GET /v1/devices`.

Game cash stays in the game ledger. A real company's money stays in that company's ledger. Neither ledger is a column on `devices`.

## Not in this change

- No `ALTER`, no new SQLite tables, and no write to the database on the box.
- `android-c55e59830b71ba38` stays. The live board stays. Do not re-seed it.
- `app/models.py` still says one phone belongs to one account until the migration issue.
- No edit to `docs/TAXI.md` or `app/map.js` for this page.

The migration issue is `Migrate device links to many-to-many`. It stays blocked until this page is agreed. It is the change that may touch `device_links`.
