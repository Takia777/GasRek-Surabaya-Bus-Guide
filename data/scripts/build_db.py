"""Build the GasRek! dataset from Moovit data (data/raw/moovit/moovit_lines.json)."""
import csv, json, math, re, collections, os

RAW = json.load(open("data/raw/moovit/moovit_lines.json", encoding="utf-8"))
KEC = RAW["kec"]
LINES = RAW["lines"]
OUT = "data/processed/"
os.makedirs(OUT, exist_ok=True)
RETRIEVED = "2026-11-21"

OPERATORS = [("SB", "Suroboyo Bus"), ("WW", "Wira Wiri Suroboyo"), ("TSS", "Trans Semanggi Suroboyo")]
OP_OF = {"Suroboyo Bus": "SB", "Wira Wiri Suroboyo": "WW", "Trans Semanggi Suroboyo": "TSS"}

EXCLUDED = {
    "K2L": "Nama lama koridor yang sama dengan R2 (Kejawan Putih Tambak - UNESA). Dishub kini memakai nama R2; dipakai data R2.",
    "K3L": "Digantikan Wira Wiri FD12 (Terminal Purabaya - Kenjeran Park) sejak 1 Januari 2026; Moovit masih menampilkan K3L.",
}
NOTES = {
    "R5": "Di beberapa sumber disebut Wira Wiri FD01 (Terminal Benowo - Tunjungan). Moovit mencatatnya sebagai Suroboyo Bus R5.",
    "SBT": "Layanan dengan jadwal jarang; headway diambil rata-rata dari rentang di Moovit dan berbeda tiap hari.",
    "R2": "Juga dikenal sebagai K2L. Arah ke Kejawan Putih Tambak melewati kawasan Tunjungan.",
    "FD4": "Headway arah Kota Lama kosong di Moovit; dipakai headway arah sebaliknya (15 menit).",
    "FD12": "Menggantikan Trans Semanggi K3L.",
    "FD3": "Akhir pekan diperpanjang ke Gunung Anyar Mangrove Park menurut sumber berita; Moovit belum mencantumkan perpanjangan.",
}
ROUTE_ORDER = ["R1", "R4", "R5", "SBT", "R2"] + [f"FD{i}" for i in range(1, 13)]

ACRO = {"its", "upn", "rs", "rsi", "rsud", "rsia", "rsal", "sdn", "smpn", "sman", "smkn", "sd", "smk", "sma", "pens",
        "unair", "uinsa", "unesa", "tij", "bi", "spbu", "swk", "kbs", "itc", "pmi", "itats", "ukdc", "ubaya", "untag",
        "ykp", "mi", "ptc", "kpu", "bpjs", "merr", "sier", "arh", "giki", "koni", "tmp", "upa", "skg", "thp", "rmi",
        "gsja", "btpn", "stiesia", "lpmk", "uin", "dbl", "p&r", "pdam", "pln", "kfc", "bri", "bni", "bca", "polsek",
        "smp", "tk", "bkr", "hr", "jl", "bpr", "uwk", "ppns", "kua", "uks", "wtc", "atm", "ukm"}
ACRO.discard("polsek"); ACRO.discard("jl")


def clean_name(n):
    n = n.strip()
    n = re.sub(r"\bTeminal\b", "Terminal", n, flags=re.I)
    words = []
    for w in n.split():
        core = re.sub(r"[^\w&]", "", w).lower()
        if core in ACRO:
            words.append(w.upper() if w.lower() == core else re.sub(core, core.upper(), w, flags=re.I))
        else:
            words.append(w)
    return " ".join(words)


def base_key(n):
    s = n.lower()
    s = re.sub(r"\bhalte\b|\bshelter\b|\bteminal\b|\bterminal\b|\bstop\b", " ", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\s+(\d+[ab]?|[ab])$", "", " ".join(s.split()))
    return s.strip()


def hav(a, b):
    R = 6371.0088
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


# ---- choose lines and directions ----
kept = [g for g in LINES if g["line"] not in EXCLUDED]
by_route = collections.OrderedDict()
for g in kept:
    by_route.setdefault(g["line"], []).append(g)
routes = sorted(by_route, key=lambda r: ROUTE_ORDER.index(r) if r in ROUTE_ORDER else 99)

# ---- raw stops (Moovit id) ----
raw = {}
for g in kept:
    for sid, name, lat, lng in g["stops"]:
        raw.setdefault(sid, {"ids": [sid], "names": collections.Counter(), "pts": []})
        raw[sid]["names"][name] += 1
        raw[sid]["pts"].append((lat, lng))

# ---- merge duplicate stops: same base name within 60 m, or any name within 15 m ----
parent = {k: k for k in raw}
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]; x = parent[x]
    return x
def union(a, b):
    a, b = find(a), find(b)
    if a != b: parent[b] = a

ids = list(raw)
pos = {k: tuple(sum(c) / len(c) for c in zip(*raw[k]["pts"])) for k in ids}
nm = {k: raw[k]["names"].most_common(1)[0][0] for k in ids}
for i, a in enumerate(ids):
    for b in ids[i + 1:]:
        d = hav(pos[a], pos[b]) * 1000
        if d <= 15 or (d <= 60 and base_key(nm[a]) == base_key(nm[b]) and nm[a].lower() == nm[b].lower()):
            union(a, b)

clusters = collections.defaultdict(list)
for k in ids:
    clusters[find(k)].append(k)

merged = []
for root, members in clusters.items():
    names = collections.Counter()
    pts = []
    for m in members:
        names.update(raw[m]["names"]); pts += raw[m]["pts"]
    lat = sum(p[0] for p in pts) / len(pts); lon = sum(p[1] for p in pts) / len(pts)
    spread = max(hav((lat, lon), p) * 1000 for p in pts)
    main = names.most_common(1)[0][0]
    aliases = sorted({clean_name(n) for n in names} | set(names) - {clean_name(main)})
    aliases = [a for a in aliases if a != clean_name(main)]
    kecs = collections.Counter(KEC.get(str(m), "") for m in members)
    area = kecs.most_common(1)[0][0] or "Waru (Sidoarjo)"
    merged.append({"members": members, "name": clean_name(main), "aliases": aliases, "lat": lat, "lon": lon,
                   "spread": spread, "area": area})

merged.sort(key=lambda s: (s["area"], s["name"], s["lat"]))
member_to_stop = {}
for i, s in enumerate(merged, 1):
    s["stop_id"] = f"STP{i:04d}"
    for m in s["members"]:
        member_to_stop[m] = s["stop_id"]
stop_by_id = {s["stop_id"]: s for s in merged}

# ---- stop groups: within 100 m, or within 250 m with the same base name ----
sids = [s["stop_id"] for s in merged]
gp = {k: k for k in sids}
def gfind(x):
    while gp[x] != x:
        gp[x] = gp[gp[x]]; x = gp[x]
    return x
for i, a in enumerate(sids):
    A = stop_by_id[a]
    for b in sids[i + 1:]:
        B = stop_by_id[b]
        d = hav((A["lat"], A["lon"]), (B["lat"], B["lon"])) * 1000
        if d <= 100 or (d <= 250 and base_key(A["name"]) == base_key(B["name"]) and base_key(A["name"])):
            ra, rb = gfind(a), gfind(b)
            if ra == rb: continue
            ma = [k for k in sids if gfind(k) == ra]; mb = [k for k in sids if gfind(k) == rb]
            diam = max(hav((stop_by_id[x]["lat"], stop_by_id[x]["lon"]), (stop_by_id[y]["lat"], stop_by_id[y]["lon"])) * 1000
                       for x in ma for y in mb)
            if diam <= 250: gp[rb] = ra
groups = collections.defaultdict(list)
for k in sids:
    groups[gfind(k)].append(k)

# ---- route stops, schedules ----
def parse_hw(s):
    nums = [float(x) for x in re.findall(r"\d+", s or "")]
    return round(sum(nums) / len(nums), 1) if nums else None

route_rows, sched_rows, rs_rows = [], [], []
DURATION = json.load(open("data/raw/moovit/moovit_durations.json"))
stop_routes = collections.defaultdict(set)
for r in routes:
    dirs = sorted(by_route[r], key=lambda g: g["url"].endswith("-1"))
    op = OP_OF[dirs[0]["op"]]
    hw_dir = {}
    for g in dirs:
        hw_dir[g["dir"]] = parse_hw(g["deps"][0][3])
    fallback_hw = next((v for v in hw_dir.values() if v), None)
    all_first, all_last, hws, durs = [], [], [], []
    for di, g in enumerate(dirs):
        direction = "outbound" if di == 0 else "inbound"
        seq_ids = [member_to_stop[s[0]] for s in g["stops"]]
        pts = [(stop_by_id[x]["lat"], stop_by_id[x]["lon"]) for x in seq_ids]
        seg = [0.0] + [hav(pts[i - 1], pts[i]) * 1.3 for i in range(1, len(pts))]  # road factor 1.3
        total = sum(seg)
        dur = DURATION.get(f"{r}|{g['dir']}")
        for i, sid in enumerate(seq_ids):
            tmin = (dur * seg[i] / total) if (dur and total) else None
            rs_rows.append([r, direction, i + 1, sid, stop_by_id[sid]["name"], round(seg[i], 3),
                            round(tmin, 2) if tmin is not None else ""])
            stop_routes[sid].add(r)
        # schedules per day type
        days = {d[0]: d for d in g["deps"]}
        types = [("weekday", "Mon"), ("saturday", "Sat"), ("sunday", "Sun")]
        for dt, key in types:
            d = days.get(key) or g["deps"][0]
            hw = parse_hw(d[3]) or fallback_hw
            sched_rows.append([r, direction, g["dir"], dt, d[1], d[2], hw, dur or "", round(total, 2), len(seq_ids)])
        wd = days.get("Mon") or g["deps"][0]
        all_first.append(wd[1]); all_last.append(wd[2]); hws.append(parse_hw(wd[3]) or fallback_hw)
        if dur: durs.append(dur)
    first_names = [stop_by_id[member_to_stop[dirs[0]["stops"][0][0]]]["name"],
                   stop_by_id[member_to_stop[dirs[0]["stops"][-1][0]]]["name"]]
    route_rows.append([r, op, dirs[0]["title"] or " - ".join(first_names), min(all_first), max(all_last),
                       round(sum(hws) / len(hws), 1), round(sum(durs) / len(durs)) if durs else "",
                       "Moovit", RETRIEVED, NOTES.get(r, ""), dirs[0]["url"]])

# ---- write files ----
def w(name, header, rows):
    with open(OUT + name, "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f); wr.writerow(header); wr.writerows(rows)

w("operators.csv", ["operator_id", "name"], OPERATORS)
w("routes.csv", ["route_id", "operator_id", "name", "first_departure", "last_departure", "headway_min",
                 "trip_duration_min", "source", "retrieved_on", "notes", "source_url"], route_rows)
w("schedules.csv", ["route_id", "direction", "headsign", "day_type", "first_departure", "last_departure",
                    "headway_min", "trip_duration_min", "distance_km", "stop_count"], sched_rows)
w("route_stops.csv", ["route_id", "direction", "seq", "stop_id", "stop_name", "distance_from_prev_km",
                      "travel_min_from_prev"], rs_rows)

group_of = {}
grows = []
for i, (root, mem) in enumerate(sorted(groups.items(), key=lambda kv: stop_by_id[kv[1][0]]["stop_id"]), 1):
    gid = f"GRP{i:04d}"
    lat = sum(stop_by_id[m]["lat"] for m in mem) / len(mem); lon = sum(stop_by_id[m]["lon"] for m in mem) / len(mem)
    rts = sorted(set().union(*[stop_routes[m] for m in mem]), key=lambda r: ROUTE_ORDER.index(r))
    names = collections.Counter(base_key(stop_by_id[m]["name"]) for m in mem)
    gname = min((stop_by_id[m]["name"] for m in mem), key=len)
    for m in mem: group_of[m] = gid
    diam = max([hav((stop_by_id[a]["lat"], stop_by_id[a]["lon"]), (stop_by_id[b]["lat"], stop_by_id[b]["lon"])) * 1000
                for a in mem for b in mem] or [0])
    grows.append([gid, gname, round(lat, 6), round(lon, 6), len(mem), round(diam), ";".join(mem), ";".join(rts), len(rts)])
w("stop_groups.csv", ["group_id", "name", "lat", "lon", "stop_count", "diameter_m", "stop_ids", "routes", "route_count"], grows)

srows = []
for s in merged:
    status = "averaged" if len(s["members"]) > 1 else "ok"
    srows.append([s["stop_id"], s["name"], ";".join(s["aliases"]), group_of[s["stop_id"]], round(s["lat"], 6),
                  round(s["lon"], 6), s["area"], status, ";".join(str(m) for m in s["members"]),
                  ";".join(sorted(stop_routes[s["stop_id"]], key=lambda r: ROUTE_ORDER.index(r)))])
w("stops.csv", ["stop_id", "name", "aliases", "group_id", "lat", "lon", "area", "coord_status", "moovit_stop_ids",
                "routes"], srows)

SRC_FARE = ("detikJatim 2026 (d-8605756); detikJatim 2023 (d-6714082); ejournal UNESA Swara Bhumi (Wira Wiri); "
            "Wikipedia Trans Semanggi Suroboyo (R2 ikut tarif Suroboyo Bus)")
FARE_TYPES = [
    ("general", "Umum", 5000, "Tiket berlaku 2 jam"),
    ("student", "Pelajar dan mahasiswa", 2500, "Menunjukkan kartu pelajar/mahasiswa atau memakai seragam; berlaku 2 jam"),
    ("elderly", "Lansia", 0, "Usia minimal 60 tahun"),
    ("child", "Anak", 0, "Di bawah 5 tahun"),
    ("disabled", "Penyandang disabilitas", 0, ""),
    ("veteran", "Veteran", 0, ""),
]
fares = []
for op, _ in OPERATORS:
    for code, label, amt, cond in FARE_TYPES:
        fares.append([op, code, label, amt, 120, cond, SRC_FARE])
w("fares.csv", ["operator_id", "passenger_type", "label", "amount", "transfer_window_min", "conditions", "source"], fares)

w("excluded_routes.csv", ["route_id", "operator_id", "reason"], [[k, "TSS", v] for k, v in EXCLUDED.items()])

print("routes", len(route_rows), "directions", len(sched_rows) // 3, "route_stops", len(rs_rows),
      "stops", len(srows), "groups", len(grows), "transfer groups", sum(1 for g in grows if g[-1] >= 2))
print("merged stops", sum(1 for s in merged if len(s["members"])>1), "max spread", round(max(s["spread"] for s in merged)))
print("largest groups", sorted(grows, key=lambda g: -g[5])[:5])
