# Tugas Naura Taqiyya Mazi (5025241119)

**Peran:** ketua proyek, penanggung jawab **graf (Neo4j)**, **backend API**, dan **chatbot**.
**Batas waktu:** Jumat, 4 Desember 2026.

Kamu memegang "jalan raya" sistem: graf yang mencari rute, dan backend yang menyatukan ontologi, graf, aturan, antarmuka, dan chatbot. Karena itu kamu juga yang memastikan semua bagian tersambung.

---

## 1. Tanggung jawab

1. **Koordinasi tim:** membuat repo, mengatur check-in tiap 2 hari, memantau checklist semua anggota, dan memimpin integrasi.
2. **Data Suroboyo Bus:** mengumpulkan semua rute Suroboyo Bus di seluruh Surabaya.
3. **Graf (Neo4j):** merancang model graf, mengimpor data, dan menulis query pencarian rute.
4. **Backend API:** membuat API yang dipakai antarmuka dan chatbot, sesuai [`docs/api-contract.md`](../api-contract.md).
5. **Chatbot:** mengubah kalimat pengguna menjadi parameter pencarian dan menjelaskan hasilnya dengan bahasa sehari-hari.
6. **Integrasi dan demo:** menyambungkan semua komponen dan menyiapkan skenario demo.

## 2. Spesifikasi

### 2.1 Data Suroboyo Bus

- Format mengikuti [`data/README.md`](../../data/README.md) (kolom, ID halte, nama arah).
- Setiap rute punya: daftar halte **dua arah** berurutan, jam operasi, headway, sumber data, dan tanggal pengambilan.
- Simpan hasil mentah di `data/raw/suroboyo-bus/`, lalu serahkan ke Nashwa untuk digabung.

### 2.2 Model graf

| Jenis | Isi |
| --- | --- |
| Node `Stop` | `stop_id`, `name`, `location` (point lat/lon), `group_id` |
| Node `Route` | `route_id`, `operator`, `name`, `first_departure`, `last_departure`, `headway_min` |
| Node `Operator` | `name` |
| Relasi `NEXT` | Stop → Stop pada satu rute dan arah: `route_id`, `direction`, `seq`, `distance_km`, `travel_min` |
| Relasi `SERVES` | Route → Stop, dengan `direction` dan `seq` |
| Relasi `TRANSFER` | Stop ↔ Stop dalam satu grup halte (hasil ontologi), dengan `walk_min` |
| Relasi `OPERATED_BY` | Route → Operator |

- Halte penghubung dan grup halte **diambil dari hasil inferensi ontologi** (kerja Nashwa), bukan dihitung ulang manual. Ini yang membuat ontologi benar-benar terpakai.
- Waktu tempuh antarhalte diestimasi dari durasi rute dibagi jarak. Tulis asumsinya di `graph/README.md`.

### 2.3 Query pencarian

- **Rute kandidat** dari halte asal ke tujuan, maksimal **2 kali pindah bus**, diurutkan berdasarkan waktu tempuh.
- Mengembalikan, untuk tiap kandidat: urutan halte, rute yang dinaiki per segmen, titik pindah, jarak total, waktu tempuh di bus.
- **Halte terdekat** dari sebuah halte atau titik, berdasarkan koordinat (`point.distance`), dalam radius yang ditetapkan aturan (usulan: 1 km).
- Pencarian nama halte (autocomplete) yang tahan salah ketik ringan dan memakai alias dari data.
- Simpan semua query di `graph/queries/` dengan komentar singkat tujuan tiap query.

### 2.4 Backend API

- Python + FastAPI. Endpoint mengikuti [`docs/api-contract.md`](../api-contract.md):
  - `GET /stops?q=` untuk mencari halte,
  - `POST /routes/search` untuk mencari rute,
  - `POST /chat` untuk chatbot,
  - `GET /health` untuk cek status.
- Urutan kerja satu pencarian: graf mencari kandidat → aturan (modul Fathiya) menghitung jam, tarif, filter, pesan → backend menyusun jawaban.
- Pengaturan koneksi (Neo4j, kunci API LLM) dibaca dari `.env`, tidak pernah ditulis di kode.
- Pesan galat jelas, misalnya halte tidak ditemukan atau jam tidak valid.

### 2.5 Chatbot

- Memakai Gemini API (paket gratis) dengan *function calling* untuk mengambil: halte asal, halte tujuan, jam berangkat, jenis penumpang, preferensi (tercepat/termurah).
- Kalau nama halte ambigu, chatbot bertanya balik dengan pilihan dari `GET /stops`.
- **Chatbot tidak boleh mengarang rute, jam, atau tarif.** Semua angka diambil dari hasil `POST /routes/search`.
- Menjawab dalam bahasa Indonesia, singkat, dan menyebut langkah perjalanan secara berurutan.
- Ada mode cadangan tanpa LLM (pola kalimat sederhana) supaya demo tetap jalan kalau API LLM bermasalah.

## 3. Checklist

### Fase 1 — Setup (20–22 Nov)
- [ ] Buat repo `GasRek-Surabaya-Bus-Guide`, unggah struktur awal, undang Nashwa dan Fathiya
- [ ] Aktifkan proteksi branch `main` (wajib lewat pull request)
- [ ] Instal Neo4j Desktop 5, Python 3.11, Node.js 20; cek semua anggota sudah bisa menjalankan alatnya
- [ ] Buat API key Gemini (gratis) dan simpan di `.env`
- [ ] Pastikan Nashwa sudah membaca `data/README.md` dan Fathiya sudah membaca `docs/api-contract.md` (keduanya sudah final)

### Fase 2 — Data (21–24 Nov)
- [ ] Kumpulkan semua rute Suroboyo Bus, dua arah
- [ ] Catat jam operasi, headway, sumber, tanggal pengambilan
- [ ] Serahkan ke Nashwa paling lambat Selasa 24 Nov

### Fase 3 — Build (23–28 Nov)
- [ ] Skrip impor CSV ke Neo4j (bisa diulang dari nol)
- [ ] Impor grup halte dan halte penghubung dari ontologi
- [ ] Query rute kandidat (0, 1, 2 kali pindah)
- [ ] Query halte terdekat
- [ ] Query pencarian nama halte
- [ ] Backend: `GET /health`, `GET /stops`, `POST /routes/search` dengan data contoh
- [ ] Chatbot: ekstraksi parameter dari kalimat, uji dengan 10 contoh kalimat
- [ ] Mode cadangan chatbot tanpa LLM

### Fase 4 — Integrasi (28 Nov – 1 Des)
- [ ] Sambungkan modul aturan Fathiya ke backend
- [ ] Sambungkan antarmuka ke backend
- [ ] Sambungkan chatbot ke `POST /routes/search`
- [ ] Satu pencarian berjalan penuh dari antarmuka sampai hasil tampil

### Fase 5 — Uji dan perbaikan (1–3 Des)
- [ ] Jalankan Q1–Q7 bersama Nashwa, perbaiki yang gagal
- [ ] Tulis cara menjalankan proyek di README (bagian Getting started)
- [ ] Gladi demo Kamis 3 Des

### Fase 6 — Final (4 Des)
- [ ] Merge semua branch ke `main`, pastikan `main` bisa dijalankan dari nol
- [ ] Siapkan data cadangan dan tangkapan layar kalau demo gagal

## 4. Definisi selesai

- Dari antarmuka dan dari chatbot, pencarian ITS → Tunjungan (atau pasangan halte lain) menghasilkan rute lengkap dengan jam, tarif, halte, dan jarak.
- Proyek bisa dijalankan orang lain hanya dengan mengikuti README.

## 5. Ketergantungan

| Butuh dari | Apa | Kapan |
| --- | --- | --- |
| Nashwa | Data bersih `data/processed/` | Selasa 24 Nov |
| Nashwa | Hasil inferensi ontologi (grup halte, halte penghubung) | Kamis 26 Nov |
| Fathiya | Modul aturan yang bisa dipanggil dari Python | Jumat 27 Nov |
| Fathiya | Antarmuka yang siap disambungkan | Sabtu 28 Nov |
