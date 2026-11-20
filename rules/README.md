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
