# Release Notes v1.0

## Ringkasan

Rilis `v1.0` menghadirkan aplikasi Financial Tracker berbasis static web yang terhubung ke Google Apps Script + Google Sheets untuk pencatatan keuangan personal end-to-end.

## Highlight Fitur

- Single-page app mobile-first dengan tab:
  - Beranda
  - Insight
  - Pengaturan
- Bottom navigation + floating action button untuk input transaksi cepat.
- Form transaksi lengkap dengan tipe:
  - Pengeluaran
  - Pemasukan
  - Hutang
  - Pindah Kantong
  - Koreksi Saldo
- Halaman Hutang dengan:
  - pengelompokan hutang keluar/masuk
  - proses pelunasan hutang
- Dashboard Beranda:
  - kartu saldo semua kantong
  - limit harian kantong jajan/dompet
  - pie chart pengeluaran per kategori
  - 5 transaksi terakhir (pengeluaran & pemasukan)
- Tab Insight:
  - stacked bar pengeluaran harian semua kantong
  - bar + line detail kantong jajan vs limit harian
- Pengaturan:
  - set periode aktif
  - kelola kantong (nama/saldo + alasan koreksi)
  - kelola kategori (CRUD via Apps Script)
  - konfigurasi URL Web App dan Gemini key placeholder

## Integrasi Backend

- Integrasi penuh ke endpoint Apps Script (`doPost` + `action`)
- Data persisted di Google Sheets sesuai struktur database yang disepakati
- Endpoint kategori (`getKategori`, `addKategori`, `deleteKategori`) sudah aktif untuk penyimpanan permanen

## UI/UX Improvements

- Dark mode default + toggle light mode
- Animasi ringan dan micro-interactions
- Loading state dan error state lebih jelas
- Responsive layout untuk mobile dan desktop

## Catatan Scope

- Integrasi Gemini AI Insight masih ditunda (placeholder tersedia), akan dimasukkan pada rilis berikutnya.
