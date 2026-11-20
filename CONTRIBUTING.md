# Cara Kerja Tim

Panduan singkat supaya kita bertiga bisa bekerja bersamaan tanpa saling menimpa pekerjaan.

## Alat

Pakai **GitHub Desktop** (Windows). Semua langkah di bawah bisa dilakukan lewat tombol, tanpa mengetik perintah.

## Branch

- `main` adalah versi yang selalu bisa dijalankan. Jangan bekerja langsung di `main`.
- Setiap orang bekerja di branch sendiri, dengan nama `nama/bagian`:

| Anggota | Contoh branch |
| --- | --- |
| Naura | `naura/graph`, `naura/backend`, `naura/chatbot` |
| Nashwa | `nashwa/data`, `nashwa/ontology`, `nashwa/docs` |
| Fathiya | `fathiya/rules`, `fathiya/frontend` |

## Alur kerja

1. **Fetch origin**, lalu pindah ke branch-mu (atau buat baru dari `main`).
2. Kerjakan bagianmu. Simpan perubahan kecil-kecil dengan **commit**.
3. **Push origin** minimal sekali sehari, supaya pekerjaan aman dan terlihat tim.
4. Kalau satu bagian sudah selesai, buat **Pull Request** ke `main` dan isi templatenya.
5. Minta satu anggota lain memeriksa. Setelah disetujui, baru di-merge.
6. Sebelum mulai kerja hari berikutnya, ambil perubahan terbaru dari `main` (**Branch → Update from main**).

## Pesan commit

Singkat dan jelas, diawali jenis perubahan:

| Awalan | Untuk | Contoh |
| --- | --- | --- |
| `data:` | Data | `data: tambah rute Wira Wiri FD1–FD5` |
| `onto:` | Ontologi | `onto: kelas TransferStop dan aturan inferensi` |
| `graph:` | Graf | `graph: query rute dengan 2 kali pindah` |
| `rules:` | Aturan | `rules: aturan tarif pelajar` |
| `api:` | Backend | `api: endpoint pencarian rute` |
| `chat:` | Chatbot | `chat: tanya balik untuk nama halte ambigu` |
| `ui:` | Antarmuka | `ui: tampilan detail rute dan peta` |
| `docs:` | Dokumen | `docs: lengkapi skenario uji Q1–Q7` |
| `fix:` | Perbaikan | `fix: jam tiba salah saat pindah bus` |

## Aturan penting

- **Jangan pernah commit file `.env`**, kata sandi, atau kunci API. Pakai `.env.example` sebagai contoh.
- Jangan ubah folder milik anggota lain tanpa memberi tahu.
- Keputusan teknis (alat, format data, kontrak API, pembagian tugas, jadwal) sudah final dan tercatat di README serta `docs/`. Kalau ada yang benar-benar perlu diubah, lapor ke Naura dulu, jangan langsung diubah.
- Tandai checklist di `docs/tasks/<nama>.md` setiap ada tugas yang selesai.
- Ada kendala lebih dari setengah hari: langsung sampaikan di grup.

