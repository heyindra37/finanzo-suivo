# Financial Tracker (Static + GAS + Google Sheets)

Aplikasi pencatat keuangan pribadi berbasis:

- Frontend: HTML, CSS, Vanilla JavaScript (static file)
- Backend: Google Apps Script Web App
- Database: Google Sheets
- Hosting: GitHub Pages

## Struktur File Frontend

- `index.html` — shell aplikasi, tab, modal, dan section utama
- `styles.css` — style mobile-first, dark/light mode, layout responsive
- `app.js` — logika UI, API calls, chart, form, dan state aplikasi
- `APPS_SCRIPT_KATEGORI_PATCH.md` — patch endpoint kategori untuk Apps Script

## Endpoint Apps Script yang Dipakai

Semua lewat `doPost` dengan `action`:

- `getKantong`
- `getTransaksi`
- `addTransaksi`
- `getHutang`
- `addHutang`
- `lunasHutang`
- `getPeriode`
- `setPeriode`
- `updateKantong`
- `getChartData`
- `getKategori`
- `addKategori`
- `deleteKategori`

## Konfigurasi Sebelum Deploy

1. Pastikan Apps Script sudah di-deploy sebagai Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
2. Copy URL Web App Apps Script (`.../exec`)
3. Di aplikasi frontend, masuk tab `Pengaturan`:
   - Isi `Google Apps Script Web App URL`
   - (Opsional) isi `Gemini API Key`
   - Klik `Simpan URL & API Key`
   - Klik `Tes Koneksi`

## Testing End-to-End (Checklist)

Gunakan checklist ini sebelum publish:

- [ ] **Koneksi API**
  - [ ] `Tes Koneksi` sukses
  - [ ] Beranda menampilkan data kantong
- [ ] **Periode**
  - [ ] Set periode baru dari tab Pengaturan
  - [ ] Periode aktif dan sisa hari berubah
- [ ] **Transaksi**
  - [ ] Tambah Pengeluaran
  - [ ] Tambah Pemasukan
  - [ ] Tambah Pindah Kantong
  - [ ] Tambah Koreksi Saldo (dengan alasan)
  - [ ] Tambah Hutang (mode kantong)
  - [ ] Tambah Hutang (mode orang lain + deadline)
- [ ] **Hutang**
  - [ ] Halaman Hutang tampil grouped
  - [ ] Proses `Lunasi` berhasil
  - [ ] Status hutang dan saldo kantong ikut berubah
- [ ] **Insight**
  - [ ] Chart stacked tampil
  - [ ] Chart jajan + limit line tampil
- [ ] **Pengaturan**
  - [ ] Edit nama/saldo kantong berhasil
  - [ ] Tambah kategori berhasil (masuk dropdown form transaksi)
  - [ ] Hapus kategori yang belum dipakai berhasil
- [ ] **UI/UX**
  - [ ] Dark/light toggle berjalan
  - [ ] Responsive mobile + desktop baik
  - [ ] Loading/error message tampil jelas saat request gagal

## Deploy ke GitHub Pages

### 1) Push project ke GitHub

Di folder project frontend (`Finance Tracker trial kedua`), commit dan push:

```bash
git add .
git commit -m "feat: complete financial tracker static frontend"
git push
```

### 2) Aktifkan GitHub Pages

1. Buka repository di GitHub
2. Masuk `Settings` -> `Pages`
3. Bagian `Build and deployment`:
   - Source: `Deploy from a branch`
   - Branch: pilih branch utama (mis. `main`)
   - Folder: `/ (root)`
4. Klik Save

### 3) Akses URL GitHub Pages

Tunggu 1-2 menit, lalu buka URL:

- `https://<username>.github.io/<repo>/`

## Post-Deploy Sanity Check

Setelah live:

1. Buka URL GitHub Pages
2. Isi URL Apps Script di tab `Pengaturan`
3. Tes tambah transaksi sederhana
4. Pastikan data masuk ke Google Sheets
5. Pastikan chart dan list transaksi ikut update

## Catatan Operasional

- Jika Apps Script berubah (kode baru), lakukan deploy ulang Web App.
- Jika frontend berubah, push ke GitHub dan tunggu Pages rebuild.
- Gemini insight masih di-skip sementara sesuai scope saat ini.
