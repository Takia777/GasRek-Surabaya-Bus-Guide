import sys

sys.path.insert(0, "rules")   # supaya "engine" bisa diimpor dari folder utama repo
from engine import evaluate  # type: ignore

STOP = {"stop_id": "X", "name": "X"}

CANDIDATE = {"legs": [
    {   # Leg 1: bus A, 06:00-20:00, headway 30, naik 10 menit dari awal rute, turun menit ke-30
        "route_id": "A", "operator": "Op", "direction": "x",
        "first_departure": "06:00", "last_departure": "20:00", "headway_min": 30,
        "board_stop": STOP, "alight_stop": STOP,
        "board_offset_min": 10, "alight_offset_min": 30,
        "walk_min_from_previous": 0, "distance_km": 5.0, "stops": [],
    },
    {   # Leg 2: bus B, 06:00-20:00, headway 20, naik 5 menit dari awal rute, turun menit ke-25
        "route_id": "B", "operator": "Op", "direction": "y",
        "first_departure": "06:00", "last_departure": "20:00", "headway_min": 20,
        "board_stop": STOP, "alight_stop": STOP,
        "board_offset_min": 5, "alight_offset_min": 25,
        "walk_min_from_previous": 3, "distance_km": 4.0, "stops": [],
    },
]}

def test_evaluate_one_transfer():
    result = evaluate([CANDIDATE], "07:00", "student", "all")
    assert result["status"] == "ok"
    assert result["message"] is None
    route = result["routes"][0]
    assert route["departure_time"] == "07:10"
    assert route["arrival_time"] == "08:05"
    assert route["duration_min"] == 55
    assert route["transfers"] == 1
    assert route["fare"] == 2500
    assert route["distance_km"] == 9.0

def test_evaluate_ended_today():
    result = evaluate([CANDIDATE], "21:00", "student", "all")
    assert result["status"] == "ended_today"
    assert result["routes"] == []