from pyswip import Prolog

# 14:50 22/11/2026: Test R4, R5, R12 

p = Prolog()
p.consult("rules/gasrek.pl")

def departures(query):
    return [r["D"] for r in p.query(query)]

# R4: jam tiap bus di halte
def test_r4_bus_departures():
    assert departures("bus_departure(360, 480, 30, 10, D)") == [370, 400, 430, 460, 490]

# R5: bus yang sudah lewat disembunyikan
def test_r5_hides_departed_buses():
    assert departures("available_departure(360, 480, 30, 10, 420, D)") == [430, 460, 490]

# R12: waktu tunggu di halte pindah
def test_r12_transfer_wait():
    result = list(p.query("transfer_wait(360, 480, 30, 10, 425, W, D)"))
    assert result[0]["W"] == 5
    assert result[0]["D"] == 430