# Tugas Fathiya Nayla Husna Wibowo (5025241204)

**Peran:** penanggung jawab **aturan (rules)** dan **antarmuka web**.
**Batas waktu:** Jumat, 4 Desember 2026.

Kamu memegang "otak pengambil keputusan" dan "wajah" sistem. Aturanmu menentukan jam, tarif, dan pesan yang dilihat pengguna, dan antarmukamu yang menampilkannya.

---

## 1. Tanggung jawab

1. **Data Trans Semanggi:** mengumpulkan semua rute Trans Semanggi Suroboyo.
2. **Aturan tarif:** mengumpulkan aturan tarif ketiga operator dari sumber resmi.
3. **Mesin aturan:** menulis aturan waktu, tarif, filter, pesan, dan alternatif.
4. **Antarmuka web:** form pencarian, tampilan hasil, peta, dan panel chat.
5. **Uji antarmuka:** memastikan tampilan benar di laptop dan HP.

## 2. Spesifikasi

### 2.1 Data Trans Semanggi dan tarif

- Format mengikuti [`data/README.md`](../../data/README.md), simpan di `data/raw/trans-semanggi/`.
- Aturan tarif ditulis di `data/raw/fares.md` beserta sumbernya:
  - tarif umum dan pelajar,
  - penumpang gratis (lansia, anak, disabilitas),
  - aturan pindah bus tanpa bayar lagi, berapa lama berlaku, dan antar-operator mana saja.
- Aturan pindah bus **wajib dicek di aplikasi GOBIS atau sumber Dishub**, jangan hanya dari satu artikel berita.

### 2.2 Aturan

Tulis di SWI-Prolog 9 (`rules/gasrek.pl`), dipanggil dari Python lewat PySwip. Coba PySwip paling lambat **Senin 23 Nov**. Kalau sampai hari itu tetap tidak jalan di Windows, langsung pindah: tulis aturan yang sama di `rules/engine_fallback.py` (Python), dan file `.pl` tetap disimpan sebagai dokumentasi basis aturan. Tidak perlu menunggu persetujuan.

| Kode | Aturan |
| --- | --- |
| R1 | Tarif satu perjalanan sesuai operator dan jenis penumpang |
| R2 | Pindah bus dalam batas waktu tertentu tidak bayar lagi (sesuai hasil cek tarif) |
| R3 | Penumpang gratis membayar Rp0 |
| R4 | Jam berangkat tiap bus = jam berangkat pertama + kelipatan headway + waktu tempuh sampai halte itu |
| R5 | Bus yang sudah lewat dari jam pencarian disembunyikan |
| R6 | Kalau rute ada tapi semua bus hari ini sudah habis → pesan "Sisa rute hari ini sudah habis, tunggu besok" |
| R7 | Kalau tidak ada rute sama sekali → pesan "Tidak ada rute untuk tujuan tersebut" |
| R8 | Pada R6 dan R7, sarankan halte alternatif terdekat yang punya rute (dalam radius 1 km); kalau tidak ada → "tidak ada" |
| R9 | Filter tercepat → 1 rute dengan durasi terkecil |
| R10 | Filter termurah → 1 rute dengan tarif terkecil; kalau sama, pilih yang lebih cepat |
| R11 | Kalau durasi sama, pilih yang lebih sedikit pindah bus |
| R12 | Waktu tunggu di halte pindah dihitung dari jadwal bus berikutnya |

- Masukan dan keluaran modul aturan mengikuti [`docs/api-contract.md`](../api-contract.md) bagian *Rules module*.
- Setiap aturan punya minimal satu contoh uji di `tests/`.
- Saat presentasi, aturan ini yang menunjukkan bagian "rules" dari representasi pengetahuan, jadi tulis dengan rapi dan beri komentar.

### 2.3 Antarmuka web

React (Vite) + Leaflet untuk peta. Tampilan berbahasa Indonesia.

**Halaman dan komponen**
1. **Form pencarian:** halte asal dan tujuan (dengan saran nama saat mengetik, dari `GET /stops`), jam berangkat (default jam sekarang), jenis penumpang, pilihan filter (semua / tercepat / termurah), tombol cari.
2. **Hasil:** daftar kartu rute. Setiap kartu berisi jam berangkat, jam tiba, durasi, jumlah pindah bus, tarif total.
3. **Detail rute:** langkah perjalanan ("Naik FD.. dari .. → turun di .. → pindah ke .."), daftar halte yang dilewati, jarak total, dan peta jalur.
4. **Pesan khusus:** tampilan jelas untuk "rute habis" dan "tidak ada rute", beserta halte alternatif.
5. **Panel chat:** kotak percakapan yang memanggil `POST /chat`, menampilkan jawaban chatbot dan tombol "lihat detail" ke hasil rute.

**Ketentuan**
- Bisa dipakai di layar HP (lebar 360 px) dan laptop.
- Ada tanda sedang memuat dan pesan galat yang ramah kalau server tidak merespons.
- Selama backend belum siap, pakai **data tiruan (mock)** sesuai kontrak API supaya pekerjaan tidak menunggu.
- Nama aplikasi yang tampil: **GasRek!**

## 3. Checklist

### Fase 1 — Setup (20–22 Nov)
- [x] Clone repo lewat GitHub Desktop, buat branch `fathiya/rules` dan `fathiya/frontend`
- [x] Instal SWI-Prolog 9 dan Node.js 20, coba PySwip (keputusan Prolog atau Python paling lambat Senin 23 Nov)
- [x] Baca kontrak API di `docs/api-contract.md` (sudah final)
- [x] Buat sketsa tampilan (form, hasil, detail, chat)

### Fase 2 — Data (selesai 21 Nov)
Dataset sudah lengkap di `data/processed/` (lihat `data/README.md`). Tidak ada lagi yang perlu dikumpulkan.
- [x] Kumpulkan semua rute Trans Semanggi, dua arah, dengan jam dan headway
- [x] Tulis aturan tarif tiga operator di `data/raw/fares.md`, cek di GOBIS
- [x] Serahkan ke Nashwa paling lambat Selasa 24 Nov

### Fase 3 — Build (23–28 Nov)
- [ ] Aturan R1–R3 (tarif)
- [ ] Aturan R4–R5 dan R12 (jam)
- [ ] Aturan R6–R8 (pesan dan alternatif)
- [ ] Aturan R9–R11 (filter)
- [ ] Modul aturan bisa dipanggil dari Python, serahkan ke Naura paling lambat Jumat 27 Nov
- [ ] Form pencarian dengan saran nama halte
- [ ] Daftar hasil dan detail rute (dengan data tiruan)
- [ ] Peta jalur dengan Leaflet
- [ ] Tampilan pesan khusus
- [ ] Panel chat

### Fase 4 — Integrasi (28 Nov – 1 Des)
- [ ] Ganti data tiruan dengan backend sungguhan
- [ ] Cek hasil aturan sama dengan hitungan manual untuk 3 contoh rute

### Fase 5 — Uji (1–3 Des)
- [ ] Uji tampilan di HP dan laptop
- [ ] Ikut menjalankan Q1–Q7, perbaiki tampilan atau aturan yang salah
- [ ] Lengkapi `rules/README.md` dan `frontend/README.md`

### Fase 6 — Final (4 Des)
- [ ] Tangkapan layar semua halaman untuk laporan dan presentasi

## 4. Definisi selesai

- Semua aturan R1–R12 berjalan dan punya contoh uji.
- Dari antarmuka, pengguna bisa mencari rute, melihat detail dan peta, memakai filter, melihat pesan khusus, dan bertanya lewat chat.

## 5. Ketergantungan

| Butuh dari | Apa | Kapan |
| --- | --- | --- |
| Naura | Backend yang bisa dipanggil | Sabtu 28 Nov |
| — | Data bersih untuk contoh uji aturan | Sudah tersedia (21 Nov) |
