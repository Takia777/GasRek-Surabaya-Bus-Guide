# Data

Owner: Nashwa. Contributors: Naura (Suroboyo Bus), Fathiya (Trans Semanggi, fares).

Route and stop data for the 3 operators: **Suroboyo Bus**, **Wira Wiri Suroboyo** and **Trans Semanggi Suroboyo**, covering the whole of Surabaya. The dataset is still being collected; counts and sources will be added here once it is final.

## Folders

| Folder | Content |
| --- | --- |
| `raw/<operator>/` | Data as collected from each source, unchanged |
| `raw/fares.md` | Fare rules per operator, with sources |
| `processed/` | Clean, merged data used by the ontology and the graph |

## Files in `processed/` (final format)

### `operators.csv`

| Column | Example |
| --- | --- |
| `operator_id` | `SB` |
| `name` | `Suroboyo Bus` |

### `routes.csv`

| Column | Description |
| --- | --- |
| `route_id` | Code used by the operator, e.g. `FD11` |
| `operator_id` | From `operators.csv` |
| `name` | Route name, e.g. `Terminal Bratang – Shelter Bulak` |
| `first_departure` | `HH:MM` |
| `last_departure` | `HH:MM` |
| `headway_min` | Minutes between buses |
| `trip_duration_min` | One-way trip duration, if known |
| `source` | Where the data came from |
| `retrieved_on` | `YYYY-MM-DD` |
| `notes` | Anything unusual (e.g. one direction derived by reversal) |

### `stops.csv`

| Column | Description |
| --- | --- |
| `stop_id` | Unique ID, format `STP0001` |
| `name` | Stop name as shown to users |
| `aliases` | Other names for the same stop, separated by `;` |
| `group_id` | Same value for stops at one location (both sides of a road, different names per route) |
| `lat`, `lon` | Coordinates (WGS84) |
| `area` | Kecamatan |
| `coord_status` | `ok`, `manual`, `check` |

### `route_stops.csv`

| Column | Description |
| --- | --- |
| `route_id` | From `routes.csv` |
| `direction` | `outbound` or `inbound` |
| `seq` | Order of the stop on this route and direction, starting at 1 |
| `stop_id` | From `stops.csv` |
| `distance_from_prev_km` | Distance from the previous stop |
| `travel_min_from_prev` | Estimated travel time from the previous stop |

### `fares.csv`

| Column | Description |
| --- | --- |
| `operator_id` | From `operators.csv` |
| `passenger_type` | `general`, `student`, `free` |
| `amount` | Rupiah |
| `transfer_window_min` | Minutes in which a transfer is free, if any |
| `source` | Where the rule came from |

## Rules for clean data

- One `stop_id` per physical stop; never reuse an ID.
- Every route has both directions, or a note saying why not.
- Every stop has coordinates or `coord_status = check`.
- Sources and retrieval dates are always recorded.
- Raw files are never edited by hand after they are saved; fixes go into `processed/`.
