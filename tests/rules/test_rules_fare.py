from pyswip import Prolog

# 22/11/2026: Test R1-R3

p = Prolog()
p.consult("rules/gasrek.pl")

def fare(type_, board_times):
    result = list(p.query(f"trip_fare({type_}, {board_times}, F)"))
    return result[0]["F"] if result else None

# R1: tarif satu tiket sesuai jenis penumpang
def test_r1_general():
    assert fare("general", [900]) == 5000

def test_r1_student():
    assert fare("student", [900]) == 2500

# R2: pindah bus dalam 2 jam tidak bayar lagi
def test_r2_transfer_within_2_hours():
    assert fare("general", [900, 1000]) == 5000   # naik 15:00 dan 16:40

def test_r2_transfer_after_2_hours():
    assert fare("general", [900, 1040]) == 10000  # naik 15:00 dan 17:20

# R3: penumpang gratis membayar Rp0
def test_r3_elderly_free():
    assert fare("elderly", [900]) == 0