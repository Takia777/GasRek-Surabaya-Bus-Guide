# API contract

This document fixes the requests and responses between components so the team can work in parallel. The frontend can use these shapes as mock data before the backend is ready. This contract is final. If a change is truly needed, report it to Naura first; the file is updated before any code changes.

Conventions: times are `HH:MM` (24-hour, Asia/Jakarta), distances in kilometers, durations in minutes, fares in rupiah (integer).

## Backend API

### `GET /health`

```json
{ "status": "ok", "neo4j": true, "rules": true, "llm": false }
```

### `GET /stops?q=its&limit=10`

```json
[
  { "stop_id": "STP0001", "name": "Halte ITS", "group_id": "GRP0001", "operators": ["Suroboyo Bus", "Wira Wiri"], "lat": -7.28, "lon": 112.79 }
]
```

### `POST /routes/search`

Request:

```json
{
  "origin_stop_id": "STP0001",
  "destination_stop_id": "STP0200",
  "departure_time": "15:00",
  "passenger_type": "student",
  "filter": "all"
}
```

- `passenger_type`: `general` | `student` | `free`
- `filter`: `all` | `fastest` | `cheapest`

Response:

```json
{
  "status": "ok",
  "message": null,
  "routes": [
    {
      "departure_time": "15:06",
      "arrival_time": "16:02",
      "duration_min": 56,
      "transfers": 1,
      "fare": 2500,
      "distance_km": 14.2,
      "legs": [
        {
          "route_id": "FD11",
          "operator": "Wira Wiri",
          "direction": "Shelter Bulak → Terminal Bratang",
          "board_stop": { "stop_id": "STP0001", "name": "Halte ITS" },
          "alight_stop": { "stop_id": "STP0050", "name": "Terminal Bratang" },
          "departure_time": "15:06",
          "arrival_time": "15:31",
          "stops": [ { "stop_id": "STP0001", "name": "Halte ITS", "lat": -7.28, "lon": 112.79 } ],
          "distance_km": 7.1
        }
      ]
    }
  ],
  "alternative_stop": null
}
```

`status` values and their messages:

| `status` | `message` | `routes` | `alternative_stop` |
| --- | --- | --- | --- |
| `ok` | `null` | one or more | `null` |
| `ended_today` | "Sisa rute hari ini sudah habis, tunggu besok" | empty | a stop object, or `null` with text "tidak ada" shown by the UI |
| `no_route` | "Tidak ada rute untuk tujuan tersebut" | empty | a stop object, or `null` |
| `error` | description of the error | empty | `null` |

With `filter` = `fastest` or `cheapest`, `routes` contains exactly one item.

### `POST /chat`

Request:

```json
{ "session_id": "abc123", "message": "Dari Halte ITS ke Tunjungan jam 3 sore, saya pelajar" }
```

Response:

```json
{
  "reply": "Ada 3 rute yang masih tersedia. Yang tercepat: naik FD11 dari Halte ITS pukul 15.06 ...",
  "search": { "origin_stop_id": "STP0001", "destination_stop_id": "STP0200", "departure_time": "15:00", "passenger_type": "student", "filter": "all" },
  "result": { "status": "ok", "routes": [], "alternative_stop": null },
  "needs_clarification": false,
  "options": []
}
```

When a stop name is ambiguous, `needs_clarification` is `true` and `options` lists candidate stops for the user to pick.

## Rules module

Called by the backend after the graph returns candidate paths.

Input: candidate paths (legs with route, stops, travel minutes and distance), route schedules (first and last departure, headway), search time, passenger type, filter.

Output: the `status`, `message` and `routes` fields of `POST /routes/search`, with departure, arrival, duration and fare filled in. The backend adds `alternative_stop` when the rules return `ended_today` or `no_route`.
