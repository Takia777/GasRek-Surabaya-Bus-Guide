from pyswip import Prolog

p = Prolog()
p.consult("rules/gasrek.pl")

ROUTES = "[r(a, 60, 1, 2500), r(b, 45, 2, 5000), r(c, 45, 1, 5000), r(d, 70, 0, 2500)]"

def chosen_id(filter_name, routes):
    q = f"filter_routes({filter_name}, {routes}, [r(Id, _, _, _)])"
    return list(p.query(q))[0]["Id"]

# R9 + R11: durasi terkecil 45 menit (b dan c). Durasi sama, c pindah 1x, b 2x -> c
def test_r9_r11_fastest_prefers_fewer_transfers():
    assert chosen_id("fastest", ROUTES) == "c"

# R10: tarif terendah 2500 (a dan d). Tarif sama, a 60 menit, d 70 menit -> a
def test_r10_cheapest_prefers_faster_on_equal_fare():
    assert chosen_id("cheapest", ROUTES) == "a"

# R11 pada filter termurah: tarif dan durasi sama (2500, 60 menit), e pindah 0x, a 1x -> e
def test_r11_cheapest_ties_prefer_fewer_transfers():
    routes = "[r(a, 60, 1, 2500), r(e, 60, 0, 2500)]"
    assert chosen_id("cheapest", routes) == "e"

# all: semua rute dikembalikan
def test_filter_all_keeps_every_route():
    q = f"filter_routes(all, {ROUTES}, L), length(L, N)"
    assert list(p.query(q))[0]["N"] == 4