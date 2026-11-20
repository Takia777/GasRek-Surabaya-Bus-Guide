# Tugas Nashwa Aulia Putri Diansyah (5025241064)

**Peran:** penanggung jawab **data**, **ontologi (Protégé)**, **skenario uji**, dan **dokumentasi akhir**.
**Batas waktu:** Jumat, 4 Desember 2026.

Kamu memegang "kamus" dan "bahan baku" sistem. Semua komponen lain bergantung pada data yang kamu satukan dan istilah yang kamu definisikan di ontologi.

---

## 1. Tanggung jawab

1. **Data Wira Wiri:** mengumpulkan semua rute Wira Wiri Suroboyo di seluruh Surabaya.
2. **Penggabungan data:** menyatukan data tiga operator, menyeragamkan nama halte, memberi ID, dan mengecek kesalahan.
3. **Koordinat halte:** mengisi koordinat semua halte.
4. **Ontologi:** membangun ontologi di Protégé dan menghasilkan fakta hasil inferensi.
5. **Skenario uji:** menulis dan menjalankan Q1–Q7.
6. **Dokumentasi akhir:** merapikan README dan dokumen di `docs/`.

## 2. Spesifikasi

### 2.1 Data

- Format dan kolom mengikuti [`data/README.md`](../../data/README.md), sudah final. Kalau ada kolom yang benar-benar perlu ditambah, lapor ke Naura dulu.
- Setiap halte punya `stop_id` unik (format `STP0001`) dan, kalau ada, `group_id` untuk halte yang berada di lokasi sama tapi namanya berbeda (misalnya sisi A/B jalan, atau nama berbeda antar-rute).
- Simpan data mentah per sumber di `data/raw/<operator>/`, data bersih di `data/processed/`.
- Tulis sumber dan tanggal pengambilan untuk setiap rute.
- **Wira Wiri punya rute paling banyak.** Kalau terlalu berat, minta bantuan untuk sebagian rute FD di check-in Minggu 22 Nov.

**Pengecekan data wajib:**
- tidak ada `stop_id` ganda,
- setiap rute punya dua arah (kalau satu arah tidak tersedia, tulis alasannya di catatan),
- urutan halte tidak loncat atau terulang tanpa alasan,
- setiap halte punya koordinat, atau ditandai "cek manual",
- koordinat masuk akal: berada di Surabaya dan dekat dengan halte sebelum dan sesudahnya.

### 2.2 Ontologi

**Kelas minimal**

| Kelas | Keterangan |
| --- | --- |
| `Operator` | Suroboyo Bus, Wira Wiri, Trans Semanggi |
| `Route` | Satu rute bus |
| `Stop` | Satu halte |
| `StopGroup` | Kumpulan halte di lokasi yang sama |
| `TransferStop` | Halte tempat pindah bus (**hasil inferensi**) |
| `Area` | Kecamatan atau wilayah |
| `PassengerType` | Umum, pelajar, gratis (lansia, anak, disabilitas) |
| `Fare` | Tarif per operator dan jenis penumpang |

**Properti minimal**
- Objek: `operatedBy`, `servesStop`, `isServedBy` (kebalikan `servesStop`), `partOfGroup`, `locatedIn`, `hasFare`.
- Data: `name`, `latitude`, `longitude`, `firstDeparture`, `lastDeparture`, `headwayMinutes`, `fareAmount`.

**Inferensi yang harus terlihat hasilnya**
1. `TransferStop` ≡ halte yang dilayani **minimal 2 rute**. Supaya reasoner bisa menghitung "minimal 2", semua individu rute harus dinyatakan **berbeda** (`AllDifferent` / *Different Individuals*).
2. Halte dalam satu `StopGroup` dianggap satu tempat untuk perpindahan.
3. (Opsional) Rute yang beroperasi sampai malam, misalnya `lastDeparture` ≥ 21.00, menjadi `NightRoute`.

**Keluaran**
- File ontologi di `ontology/gasrek.owl` (format RDF/XML atau Turtle).
- Hasil inferensi diekspor ke CSV di `ontology/inferred/` (daftar halte penghubung dan grup halte) untuk diimpor Naura ke graf.
- Tangkapan layar hierarki kelas dan hasil reasoner untuk presentasi.

### 2.3 Skenario uji

- Tulis Q1–Q7 di [`docs/test-scenarios.md`](../test-scenarios.md) dengan **halte nyata** dari data, jam masukan, dan hasil yang diharapkan.
- Jalankan bersama Naura saat integrasi dan catat hasilnya: lulus, gagal, atau lulus dengan catatan.

## 3. Checklist

### Fase 1 — Setup (20–22 Nov)
- [ ] Clone repo lewat GitHub Desktop, buat branch `nashwa/data`
- [ ] Instal Protégé 5.6
- [ ] Baca format data di `data/README.md` dan bagikan ke Naura dan Fathiya sebelum mereka mulai mengumpulkan data

### Fase 2 — Data (21–24 Nov)
- [ ] Kumpulkan semua rute Wira Wiri, dua arah, dengan jam dan headway
- [ ] Terima data Suroboyo Bus (Naura) dan Trans Semanggi (Fathiya)
- [ ] Gabungkan, seragamkan nama, beri `stop_id` dan `group_id`
- [ ] Isi koordinat halte (OpenStreetMap, lalu cek manual yang tidak ketemu)
- [ ] Jalankan pengecekan data wajib
- [ ] Unggah `data/processed/` paling lambat Selasa 24 Nov

### Fase 3 — Build (23–28 Nov)
- [ ] Buat kelas dan properti di Protégé
- [ ] Isi individu dari data (bisa dibantu skrip Owlready2)
- [ ] Nyatakan semua rute sebagai individu berbeda
- [ ] Jalankan reasoner (HermiT), pastikan `TransferStop` terisi otomatis
- [ ] Ekspor hasil inferensi ke `ontology/inferred/`, serahkan ke Naura paling lambat Kamis 26 Nov
- [ ] Tulis `docs/test-scenarios.md` dengan halte nyata

### Fase 4 — Integrasi (28 Nov – 1 Des)
- [ ] Cek hasil graf sesuai hasil ontologi (jumlah halte penghubung sama)
- [ ] Perbaiki data yang ketahuan salah saat integrasi

### Fase 5 — Uji dan dokumentasi (1–3 Des)
- [ ] Jalankan Q1–Q7, catat hasil dan tangkapan layar
- [ ] Lengkapi `data/README.md`: sumber, jumlah rute dan halte, keterbatasan data
- [ ] Lengkapi `ontology/README.md`: diagram kelas, contoh inferensi
- [ ] Rapikan README utama

### Fase 6 — Final (4 Des)
- [ ] Cek ulang semua dokumen dan tautan di repo

## 4. Definisi selesai

- `data/processed/` lengkap untuk tiga operator dan lolos semua pengecekan.
- Reasoner menghasilkan daftar halte penghubung tanpa diketik manual, dan daftar itu dipakai di graf.
- Q1–Q7 sudah dijalankan dan hasilnya tercatat.

## 5. Ketergantungan

| Butuh dari | Apa | Kapan |
| --- | --- | --- |
| Naura | Data Suroboyo Bus | Selasa 24 Nov |
| Fathiya | Data Trans Semanggi dan aturan tarif | Selasa 24 Nov |
| Naura | Sistem terintegrasi untuk menjalankan Q1–Q7 | Selasa 1 Des |
