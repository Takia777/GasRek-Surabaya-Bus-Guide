# Data

Route, stop, timetable and fare data for the 3 operators of GasRek!: **Suroboyo Bus**, **Wira Wiri Suroboyo** and **Trans Semanggi Suroboyo**, covering the whole of Surabaya. Snapshot taken on **21 November 2026**.

## At a glance

| Item | Count |
| --- | --- |
| Operators | 3 |
| Routes | 16 (Suroboyo Bus 4, Wira Wiri 11, Trans Semanggi 1) |
| Route directions | 32 (every route has both directions) |
| Stops | 832, all with coordinates |
| Stop visits along routes (`route_stops.csv`) | 1,201 |
| Stop groups (stops at one location) | 514 |
| Stop groups served by 2 or more routes | 115 |
| Scheduled trips (`trips.csv`) | 1,870 |
| Stop times, one per trip and stop (`stop_times.csv`) | 72,756 |
| Kecamatan covered | 29 of Surabaya's 31 (no stops in Semampir and Kenjeran), plus Terminal Purabaya in Waru, Sidoarjo |

| Operator | Routes |
| --- | --- |
| Suroboyo Bus | R1, R4, R5, SBT |
| Wira Wiri Suroboyo | FD2, FD3, FD4, FD5, FD6, FD7, FD8, FD9, FD10, FD11, FD12 |
| Trans Semanggi Suroboyo | R2 (also known as K2L) |

## Sources

| Data | Source |
| --- | --- |
| Routes, stop order, both directions, stop coordinates, timetable of every trip at every stop | Moovit, Surabaya (metro 4524), agencies Suroboyo Bus, Feeder Wira Wiri Suroboyo, Trans Semanggi Suroboyo |
| Kecamatan of each stop | OpenStreetMap administrative boundaries (admin level 6), point-in-polygon |
| Fares and transfer rule | News sources listed in [`raw/fares.md`](raw/fares.md) |
| Route status (K3L replaced, K2L = R2) | detikJatim and Wikipedia, see `excluded_routes.csv` |

## Folders

| Folder | Content |
| --- | --- |
| `raw/moovit/` | Data exactly as taken from Moovit (stops, coordinates, schedules, kecamatan) and trip durations |
| `raw/fares.md` | Fare rules with sources |
| `scripts/build_db.py`, `scripts/build_times.py` | Rebuild `processed/` from `raw/`. Run from the repository root: `python data/scripts/build_db.py`, then `python data/scripts/build_times.py` |
| `processed/` | Clean data used by the ontology and the graph |

## Files in `processed/`

### `operators.csv`

| Column | Description |
| --- | --- |
| `operator_id` | `SB`, `WW`, `TSS` |
| `name` | Operator name |

### `routes.csv` (one row per route)

| Column | Description |
| --- | --- |
| `route_id` | Route code, e.g. `FD11` |
| `operator_id` | From `operators.csv` |
| `name` | Route name |
| `first_departure`, `last_departure` | Earliest and latest weekday departure over both directions (`HH:MM`) |
| `headway_min` | Average weekday headway over both directions |
| `trip_duration_min` | Average one-way trip duration |
| `source`, `retrieved_on`, `source_url` | Where and when the data was taken |
| `notes` | Anything unusual about the route |

### `schedules.csv` (one row per route, direction and day type)

| Column | Description |
| --- | --- |
| `route_id` | From `routes.csv` |
| `direction` | `outbound` or `inbound` |
| `headsign` | Destination shown for this direction |
| `day_type` | `weekday`, `saturday`, `sunday` |
| `first_departure`, `last_departure` | `HH:MM` |
| `headway_min` | Minutes between buses; a range on Moovit (e.g. 128–136) is stored as its average |
| `trip_duration_min` | Trip duration from Moovit |
| `distance_km` | Estimated length of this direction |
| `stop_count` | Number of stops |
| `trip_count` | Number of trips that day |

### `trips.csv` (one row per scheduled trip)

| Column | Description |
| --- | --- |
| `trip_id` | e.g. `FD7-O-DAI-012` = FD7, outbound, daily timetable, 12th trip |
| `route_id`, `direction` | Route and direction |
| `service` | Days the trip runs: `daily`, or for SBT `weekday`, `weekend`, `saturday`, `sunday` |
| `departure_time`, `arrival_time` | At the first and last stop |
| `duration_min`, `stop_count` | Trip length |

### `stop_times.csv` (one row per trip and stop)

| Column | Description |
| --- | --- |
| `trip_id`, `route_id`, `direction`, `service` | Trip |
| `seq`, `stop_id`, `stop_name` | Stop and its position on the route |
| `time` | Time the bus is at this stop (`HH:MM`) |
| `is_estimated` | `0` = from the Moovit timetable; `1` = calculated (see below) |

### `stops.csv`

| Column | Description |
| --- | --- |
| `stop_id` | Unique ID, `STP0001` … |
| `name` | Stop name as shown to users (typos and abbreviations fixed, e.g. `Teminal` → `Terminal`, `Its` → `ITS`) |
| `aliases` | Other names for the same stop, separated by `;` |
| `group_id` | Stop group from `stop_groups.csv` |
| `lat`, `lon` | Coordinates (WGS84) |
| `area` | Kecamatan |
| `coord_status` | `ok` = one Moovit point; `averaged` = several Moovit points for the same stop, averaged |
| `moovit_stop_ids` | Original Moovit stop IDs |
| `routes` | Routes that stop here |

### `route_stops.csv`

| Column | Description |
| --- | --- |
| `route_id`, `direction` | Route and direction |
| `seq` | Order of the stop, starting at 1 |
| `stop_id`, `stop_name` | Stop |
| `distance_from_prev_km` | Estimated road distance from the previous stop |
| `travel_min_from_prev` | Estimated travel time from the previous stop |

### `stop_groups.csv`

| Column | Description |
| --- | --- |
| `group_id` | `GRP0001` … |
| `name` | Short name of the group |
| `lat`, `lon` | Average of the stops in the group |
| `stop_count`, `diameter_m` | Number of stops and largest distance between two of them |
| `stop_ids` | Stops in the group |
| `routes`, `route_count` | Routes serving the group |

### `fares.csv`

| Column | Description |
| --- | --- |
| `operator_id` | From `operators.csv` |
| `passenger_type` | `general`, `student`, `elderly`, `child`, `disabled`, `veteran` |
| `label` | Name in Indonesian |
| `amount` | Rupiah |
| `transfer_window_min` | Minutes in which a transfer needs no new payment |
| `conditions` | Requirement, e.g. minimum age |
| `source` | Where the rule came from |

### `excluded_routes.csv`

Routes shown on Moovit but left out, with the reason: **K3L** (replaced by FD12) and **K2L** (same corridor as R2).

## How the data was processed

1. **Stops.** Every Moovit stop is kept. Stops with the same name within 60 m, or any two stops within 15 m, are treated as one stop; their coordinates are **averaged** and the other names kept as aliases (54 stops).
2. **Stop groups.** Stops within 100 m of each other, or within 250 m with the same base name (e.g. `Halte ITS` and `Bundaran ITS`, both sides of a road), form one group, with no group wider than 250 m. Groups are where passengers can change buses on foot. Which groups count as **transfer stops** is decided by the ontology, not here.
3. **Distances.** Straight-line distance between consecutive stops × 1.3 to approximate road distance.
4. **Timetables.** Every trip's time at every stop comes from Moovit's schedule tables. `schedules.csv` (hours, headway, duration, trip count) and `routes.csv` are computed from these trips.
5. **Travel times.** `travel_min_from_prev` in `route_stops.csv` is the average over all trips.
6. **Gaps in the timetable.** Two directions miss some stops in Moovit's table: FD4 towards Kota Lama (29 of 43 stops, after Terminal Intermoda Joyoboyo) and R5 towards Terminal Benowo (4 of 41 stops, the loop at Terminal Benowo). Their times are calculated from the trip's own speed and the distance, and marked `is_estimated = 1`.

## Known limitations

- Timetables are the planned schedule; real buses can be early or late. Times at 33 stop positions (FD4 to Kota Lama, R5 loop at Benowo) are calculated.
- Fares come from news sources and a journal article; promotional fares are not modelled.
- R5 (Terminal Benowo – Tunjungan) is listed under Suroboyo Bus on Moovit; some sources call it Wira Wiri FD01. It is kept once, as R5.
- FD3's weekend extension to Gunung Anyar Mangrove Park is reported in the news but not on Moovit, so it is not included.
