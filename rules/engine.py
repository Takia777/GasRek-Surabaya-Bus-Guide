"""Python bridge to the GasRek! rule base (rules/gasrek.pl) via PySwip."""
from pathlib import Path

from pyswip import Prolog

_prolog = Prolog()
_prolog.consult(Path(__file__).with_name("gasrek.pl").as_posix())

VALID_FILTERS = ("all", "fastest", "cheapest")


# --- time helpers ----------------------------------------------------------
def to_min(hhmm):
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def to_hhmm(minutes):
    minutes = int(round(minutes)) % 1440
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def _first(query):
    """First solution of a Prolog query, or None if it fails."""
    solutions = list(_prolog.query(query))
    return solutions[0] if solutions else None


# --- one candidate path -> one route (or None if no bus is left) ------------
def _build_route(candidate, search_min, passenger_type):
    legs_out, board_times = [], []
    arrive = None

    for i, leg in enumerate(candidate["legs"]):
        first = to_min(leg["first_departure"])
        last = to_min(leg["last_departure"])
        headway = leg["headway_min"]
        board_off = leg["board_offset_min"]
        alight_off = leg["alight_offset_min"]

        if i == 0:
            # R4 + R5: earliest bus that has not left before the search time
            sol = _first(f"next_departure({first}, {last}, {headway}, {board_off}, {search_min}, D)")
        else:
            # R12: wait for the next bus after walking to the transfer stop
            ready = arrive + leg.get("walk_min_from_previous", 0)
            sol = _first(f"transfer_wait({first}, {last}, {headway}, {board_off}, {ready}, W, D)")

        if sol is None:          # no bus left on this leg today
            return None

        dep = sol["D"]
        arrive = dep + (alight_off - board_off)
        board_times.append(dep)
        legs_out.append({
            "route_id": leg["route_id"],
            "operator": leg["operator"],
            "direction": leg["direction"],
            "board_stop": leg["board_stop"],
            "alight_stop": leg["alight_stop"],
            "departure_time": to_hhmm(dep),
            "arrival_time": to_hhmm(arrive),
            "stops": leg["stops"],
            "distance_km": leg["distance_km"],
        })

    # R1-R3 (+ R2): fare from the boarding time of every leg
    fare = _first(f"trip_fare({passenger_type}, {board_times}, F)")["F"]

    return {
        "departure_time": to_hhmm(board_times[0]),
        "arrival_time": to_hhmm(arrive),
        "duration_min": int(round(arrive - board_times[0])),  # includes waiting
        "transfers": len(candidate["legs"]) - 1,
        "fare": fare,
        "distance_km": round(sum(l["distance_km"] for l in candidate["legs"]), 1),
        "legs": legs_out,
    }


# --- entry point called by the backend -------------------------------------
def evaluate(candidates, search_time, passenger_type, filter_name="all"):
    if filter_name not in VALID_FILTERS:
        raise ValueError(f"unknown filter: {filter_name}")

    search_min = to_min(search_time)
    routes = [r for c in candidates
              if (r := _build_route(c, search_min, passenger_type)) is not None]

    # R6 / R7: status and message
    sol = _first(f"search_status({len(candidates)}, {len(routes)}, S, M)")
    status, message = sol["S"], (None if sol["M"] == "none" else sol["M"])

    # R9-R11: filter (routes are matched back by index)
    if routes:
        terms = ", ".join(
            f"r({i}, {r['duration_min']}, {r['transfers']}, {r['fare']})"
            for i, r in enumerate(routes))
        sol = _first(f"filter_routes({filter_name}, [{terms}], S), "
                     f"findall(I, member(r(I,_,_,_), S), Ids)")
        routes = [routes[i] for i in sol["Ids"]]

    return {"status": status, "message": message, "routes": routes}