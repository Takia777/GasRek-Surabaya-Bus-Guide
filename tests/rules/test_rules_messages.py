from pyswip import Prolog

# 15:09 22/11/2026: Test R6, R7, R8

# Testing langsung di terminal:
# python
# >>> from pyswip import Prolog
# >>> p = Prolog()
# >>> p.consult("rules/gasrek.pl")
# >>> list(p.query("search_status(0, 0, S, M)"))
# >>> list(p.query("search_status(3, 0, S, M)"))
# >>> list(p.query("search_status(3, 2, S, M)"))
# >>> list(p.query("alternative_stop([0.4-'STP0002', 0.9-'STP0003', 1.5-'STP0004'], S)"))
# >>> list(p.query("alternative_stop([1.5-'STP0004'], S)"))


p = Prolog()
p.consult("rules/gasrek.pl")


def status(candidates, available):
    r = list(p.query(f"search_status({candidates}, {available}, S, M)"))[0]
    return r["S"], r["M"]

def alternative(candidates):
    return list(p.query(f"alternative_stop({candidates}, S)"))[0]["S"]

# R7: tidak ada jalur sama sekali - S = no_route, M = 'Tidak ada rute untuk tujuan tersebut'
def test_r7_no_route():
    assert status(0, 0) == ("no_route", "Tidak ada rute untuk tujuan tersebut")

# R6: jalur ada, tapi semua bus hari ini sudah lewat - S = ended_today, M = 'Sisa rute hari ini sudah habis, tunggu besok'
def test_r6_ended_today():
    assert status(3, 0) == ("ended_today", "Sisa rute hari ini sudah habis, tunggu besok")

# Masih ada bus: status ok, tanpa pesan - S = ok, M = none
def test_search_status_ok_when_buses_available():
    assert status(3, 2) == ("ok", "none")


# R8: halte terdekat dalam 1 km (0.4 km paling dekat) - S = 'STP0002'
def test_r8_nearest_alternative_within_1km():
    assert alternative("[0.4-'STP0002', 0.9-'STP0003', 1.5-'STP0004']") == "STP0002"

# R8: semua halte di luar 1 km - S = none
def test_r8_no_alternative_beyond_1km():
    assert alternative("[1.5-'STP0004']") == "none"