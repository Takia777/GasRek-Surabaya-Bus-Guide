"""Add Moovit timetables to the GasRek! dataset.

Run after build_db.py, from the repository root:
    python data/scripts/build_times.py
Writes trips.csv and stop_times.csv, and updates route_stops.csv (travel times)
and schedules.csv (hours, headway, duration, trip count) from the timetables.
"""
import csv, json, collections, statistics, os

BASE = "data/" if os.path.isdir("data/raw") else ""
RAW = BASE + "raw/moovit/" if os.path.isdir(BASE + "raw/moovit") else BASE + "raw/"
OUT = BASE + "processed/"

TT = json.load(open(RAW + "moovit_timetables.json", encoding="utf-8"))
LINES = json.load(open(RAW + ("moovit_lines_kec.json" if os.path.exists(RAW + "moovit_lines_kec.json") else "moovit_lines.json"),
                       encoding="utf-8"))["lines"]


def rd(name):
    return list(csv.DictReader(open(OUT + name, encoding="utf-8")))


def wr(name, header, rows):
    with open(OUT + name, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(header); w.writerows(rows)


def tmin(s):
    h, m = s.split(":"); return int(h) * 60 + int(m)


def hhmm(x):
    x = int(round(x)); return f"{x // 60:02d}:{x % 60:02d}"


direction_of = {}
for g in LINES:
    direction_of[(g["line"], g["dir"])] = "inbound" if g["url"].endswith("-1") else "outbound"

route_stops = rd("route_stops.csv")
seq = collections.defaultdict(list)
for r in route_stops:
    seq[(r["route_id"], r["direction"])].append(r)

SERVICE = {"Daily Schedule": "daily", "Weekday Schedule": "weekday", "Weekend Schedule": "weekend",
           "Saturday Schedule": "saturday", "Sunday Schedule": "sunday"}

trips, stop_times = [], []
seg_obs = collections.defaultdict(list)          # (route, dir, seq) -> minutes from previous stop
report = []
for x in TT:
    key = (x["line"], direction_of[(x["line"], x["dir"])])
    rows = seq[key]
    moovit_names = [s[1] for s in next(g for g in LINES if g["line"] == x["line"] and g["dir"] == x["dir"])["stops"]]
    dist = [float(r["distance_from_prev_km"]) for r in rows]
    cum = [sum(dist[:i + 1]) for i in range(len(dist))]
    for t in x["tabs"]:
        if t["type"] == 1:
            continue
        service = SERVICE.get(t["h"], "daily")
        if t["type"] == 2:
            cols = t["cols"]; trip_rows = [r[:len(cols)] for r in t["rows"]]
        else:  # transposed: first column is the stop name, each further column is one trip
            cols = [r[0] for r in t["rows"]]
            trip_rows = [[r[j] for r in t["rows"]] for j in range(1, len(t["cols"]))]
        # map timetable columns to positions in the route, in order
        pos, j = [], 0
        for c in cols:
            while j < len(moovit_names) and moovit_names[j] != c:
                j += 1
            pos.append(j if j < len(moovit_names) else None); j += 1
        known_pos = [p for p in pos if p is not None]
        n_est = len(rows) - len(set(known_pos))
        nonmono = 0
        for k, tr in enumerate(trip_rows, 1):
            times = [None] * len(rows)
            for p, v in zip(pos, tr):
                if p is not None and v and ":" in v:
                    times[p] = tmin(v)
            idx = [i for i, v in enumerate(times) if v is not None]
            # keep times non-decreasing along the route (drop values that go back in time)
            clean, last = [], -1
            for i in idx:
                if times[i] >= last:
                    clean.append(i); last = times[i]
                else:
                    times[i] = None; nonmono += 1
            idx = clean
            est = [i not in idx for i in range(len(rows))]
            # interpolate inside, extrapolate at the ends using this trip's speed
            span_d = cum[idx[-1]] - cum[idx[0]]
            span_t = times[idx[-1]] - times[idx[0]]
            speed = span_t / span_d if span_d > 0 and span_t > 0 else 2.5  # min per km
            for i in range(len(rows)):
                if times[i] is not None:
                    continue
                prev = max([p for p in idx if p < i], default=None)
                nxt = min([p for p in idx if p > i], default=None)
                if prev is not None and nxt is not None:
                    f = (cum[i] - cum[prev]) / (cum[nxt] - cum[prev]) if cum[nxt] > cum[prev] else 0
                    times[i] = times[prev] + f * (times[nxt] - times[prev])
                elif prev is not None:
                    times[i] = times[prev] + (cum[i] - cum[prev]) * speed
                else:
                    times[i] = times[nxt] - (cum[nxt] - cum[i]) * speed
            trip_id = f"{key[0]}-{'O' if key[1] == 'outbound' else 'I'}-{service[:3].upper()}-{k:03d}"
            trips.append([trip_id, key[0], key[1], service, hhmm(times[0]), hhmm(times[-1]),
                          int(round(times[-1] - times[0])), len(rows)])
            for i, r in enumerate(rows):
                stop_times.append([trip_id, key[0], key[1], service, i + 1, r["stop_id"], r["stop_name"],
                                   hhmm(times[i]), int(est[i])])
                if i > 0:
                    seg_obs[(key[0], key[1], i + 1)].append(times[i] - times[i - 1])
        report.append((key, service, len(trip_rows), len(rows), n_est, nonmono))

wr("trips.csv", ["trip_id", "route_id", "direction", "service", "departure_time", "arrival_time", "duration_min",
                 "stop_count"], trips)
wr("stop_times.csv", ["trip_id", "route_id", "direction", "service", "seq", "stop_id", "stop_name", "time",
                      "is_estimated"], stop_times)

# travel time between stops = average over all trips
for r in route_stops:
    k = (r["route_id"], r["direction"], int(r["seq"]))
    r["travel_min_from_prev"] = round(statistics.mean(seg_obs[k]), 2) if k in seg_obs else 0
wr("route_stops.csv", list(route_stops[0].keys()), [list(r.values()) for r in route_stops])

# schedules from the timetables
by = collections.defaultdict(list)
for t in trips:
    by[(t[1], t[2], t[3])].append(t)
def applies(service, day):
    return service == "daily" or service == day or (service == "weekend" and day in ("saturday", "sunday"))
sched = rd("schedules.csv")
for s in sched:
    cand = [v for (r, d, sv), v in by.items() if r == s["route_id"] and d == s["direction"] and applies(sv, s["day_type"])]
    if not cand:
        continue
    tl = sorted(cand[0], key=lambda t: tmin(t[4]))
    deps = [tmin(t[4]) for t in tl]
    gaps = [b - a for a, b in zip(deps, deps[1:])]
    s["first_departure"] = tl[0][4]; s["last_departure"] = tl[-1][4]
    s["headway_min"] = round(statistics.mean(gaps), 1) if gaps else ""
    s["trip_duration_min"] = round(statistics.median(t[6] for t in tl))
    s["trip_count"] = len(tl)
header = list(sched[0].keys())
if "trip_count" not in header:
    header.append("trip_count")
wr("schedules.csv", header, [[s.get(h, "") for h in header] for s in sched])

# routes.csv summary (weekday)
routes = rd("routes.csv")
for r in routes:
    ws = [s for s in sched if s["route_id"] == r["route_id"] and s["day_type"] == "weekday"]
    r["first_departure"] = min(s["first_departure"] for s in ws)
    r["last_departure"] = max(s["last_departure"] for s in ws)
    r["headway_min"] = round(statistics.mean(float(s["headway_min"]) for s in ws), 1)
    r["trip_duration_min"] = round(statistics.mean(float(s["trip_duration_min"]) for s in ws))
wr("routes.csv", list(routes[0].keys()), [list(r.values()) for r in routes])

print("trips", len(trips), "stop_times", len(stop_times))
for k, sv, nt, ns, ne, nm in report:
    if ne or nm:
        print("  ", k, sv, "trips", nt, "stops", ns, "estimated stops", ne, "dropped out-of-order times", nm)
