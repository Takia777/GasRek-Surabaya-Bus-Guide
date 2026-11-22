# Rules

Owner: Fathiya. Task sheet: [`docs/tasks/fathiya.md`](../docs/tasks/fathiya.md).

Rules decide what the user sees: departure and arrival times, fares, which routes are still available, the fastest or cheapest route, and the "routes ended" or "no route" messages with an alternative stop.

## Planned files

| File | Content |
| --- | --- |
| `gasrek.pl` | Rules in SWI-Prolog |
| `engine.py` | Python bridge (PySwip) used by the backend |
| `engine_fallback.py` | Same rules in Python, used only if PySwip cannot run |

## Rule list

| Code | Rule |
| --- | --- |
| R1 | Fare per trip by operator and passenger type |
| R2 | Free transfer within the operator's transfer window |
| R3 | Free passengers pay nothing |
| R4 | Departure time at a stop = first departure + n × headway + travel time to that stop |
| R5 | Hide buses that have already left |
| R6 | Routes exist but none left today → "Sisa rute hari ini sudah habis, tunggu besok" |
| R7 | No route at all → "Tidak ada rute untuk tujuan tersebut" |
| R8 | For R6 and R7, suggest the nearest stop with a route within 1 km, otherwise "tidak ada" |
| R9 | Fastest filter → one route with the shortest duration |
| R10 | Cheapest filter → one route with the lowest fare; ties go to the faster route |
| R11 | Equal duration → fewer transfers first |
| R12 | Waiting time at a transfer stop comes from the next bus's schedule |

## Python interface

`engine.py` exposes one function, called by the backend after the graph returns candidate paths:

```python
from engine import evaluate

result = evaluate(candidates, search_time, passenger_type, filter_name="all")
```

### Input

| Argument | Type | Description |
| --- | --- | --- |
| `candidates` | list | Candidate paths from the graph, in order of travel time. Each is `{"legs": [leg, ...]}` |
| `search_time` | str | `"HH:MM"`, 24-hour |
| `passenger_type` | str | `general`, `student`, `elderly`, `child`, `disabled`, `veteran` |
| `filter_name` | str | `all`, `fastest`, `cheapest`. Any other value raises `ValueError` |

Each `leg`:

| Field | Description |
| --- | --- |
| `route_id`, `operator`, `direction` | Route and direction as shown to the user |
| `first_departure`, `last_departure` | `"HH:MM"`, first and last departure of the route from its first stop |
| `headway_min` | Minutes between buses |
| `board_stop`, `alight_stop` | `{"stop_id": ..., "name": ...}` |
| `board_offset_min`, `alight_offset_min` | Minutes of travel from the route's first stop to the boarding and alighting stops |
| `walk_min_from_previous` | Walking minutes from the previous leg's alighting stop (0 for the first leg) |
| `distance_km` | Distance of this leg |
| `stops` | Ordered stops passed, each `{"stop_id", "name", "lat", "lon"}` |

### Output

```python
{"status": "ok" | "ended_today" | "no_route",
 "message": str | None,
 "routes": [ ... ]}   # same route objects as POST /routes/search
```

`alternative_stop` is not returned here. The backend adds it when `status` is `ended_today` or `no_route`.

### Notes

- Departure times are computed from first departure, headway and travel offset (R4), not read from per-trip timetables.
- One route is returned per candidate path, using the earliest bus not yet departed.
- Fare uses the boarding time of every leg: legs boarded within 2 hours of the first boarding share one ticket (R2).
