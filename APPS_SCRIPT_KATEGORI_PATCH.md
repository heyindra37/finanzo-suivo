# Patch Endpoint Kategori (Google Apps Script)

Tambahkan fungsi berikut ke file `Services.gs`:

```javascript
function action_getKategori() {
  var rows = getRowsAsObjects_(CONFIG.SHEETS.KATEGORI);
  return { kategori: rows };
}

function action_addKategori(payload) {
  var nama = String(payload.nama_kategori || "").trim();
  var emoji = String(payload.ikon_emoji || "").trim();
  var tipe = String(payload.tipe_kategori || "").trim().toLowerCase();

  if (!nama) throw new Error("nama_kategori wajib diisi");
  if (!["pengeluaran", "pemasukan", "keduanya"].includes(tipe)) {
    throw new Error("tipe_kategori harus pengeluaran/pemasukan/keduanya");
  }

  var all = getRowsAsObjects_(CONFIG.SHEETS.KATEGORI);
  var exists = all.some(function(k) {
    return String(k.nama_kategori || "").toLowerCase() === nama.toLowerCase();
  });
  if (exists) throw new Error("Kategori dengan nama tersebut sudah ada");

  var row = {
    id_kategori: generateId_("KAT", CONFIG.SHEETS.KATEGORI, "id_kategori"),
    nama_kategori: nama,
    ikon_emoji: emoji,
    tipe_kategori: tipe
  };
  appendRowByObject_(CONFIG.SHEETS.KATEGORI, row);
  return { kategori: row };
}

function action_deleteKategori(payload) {
  var id = String(payload.id_kategori || "").trim();
  var nama = String(payload.nama_kategori || "").trim();
  if (!id && !nama) throw new Error("id_kategori atau nama_kategori wajib diisi");

  var kategoriRows = getRowsAsObjects_(CONFIG.SHEETS.KATEGORI);
  var target = kategoriRows.find(function(k) {
    if (id) return String(k.id_kategori) === id;
    return String(k.nama_kategori || "").toLowerCase() === nama.toLowerCase();
  });
  if (!target) throw new Error("Kategori tidak ditemukan");

  var trxRows = getRowsAsObjects_(CONFIG.SHEETS.TRANSAKSI);
  var used = trxRows.some(function(t) {
    return String(t.kategori || "").toLowerCase() === String(target.nama_kategori || "").toLowerCase();
  });
  if (used) throw new Error("Kategori sudah dipakai di transaksi dan tidak bisa dihapus");

  getSheetByName_(CONFIG.SHEETS.KATEGORI).deleteRow(target.__rowNumber);
  return { deleted: true, id_kategori: target.id_kategori, nama_kategori: target.nama_kategori };
}
```

Tambahkan routing di file `Api.gs` pada `doPost` switch:

```javascript
      case "getKategori":
        data = action_getKategori();
        break;
      case "addKategori":
        data = action_addKategori(payload);
        break;
      case "deleteKategori":
        data = action_deleteKategori(payload);
        break;
```

Setelah itu:

1. Save semua file Apps Script
2. Deploy ulang Web App (`Manage deployments` -> `Edit` -> `Deploy`)
3. Kembali ke frontend, klik `Tes Koneksi`, lalu coba tambah/hapus kategori dari tab Pengaturan

