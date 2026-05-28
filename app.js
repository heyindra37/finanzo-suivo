const STORAGE_KEYS = {
  GAS_URL: "ft_gas_web_app_url",
  THEME: "ft_theme",
  GEMINI_KEY: "ft_gemini_key",
  CUSTOM_KATEGORI: "ft_custom_kategori"
};

const state = {
  activeTab: "beranda",
  pieChartInstance: null,
  insightStackedInstance: null,
  insightJajanInstance: null,
  kantongList: [],
  kategoriList: [],
  hutangList: []
};

const DEFAULT_KATEGORI = [
  { nama_kategori: "Makan & Minum", ikon_emoji: "🍽️", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Transportasi/Ojol", ikon_emoji: "🛵", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Jajan Pribadi", ikon_emoji: "☕", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Item Game", ikon_emoji: "🎮", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Rekreasi", ikon_emoji: "🎬", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Jajanin Istri", ikon_emoji: "💝", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Sedekah", ikon_emoji: "🤲", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Langganan AI/Tools", ikon_emoji: "🤖", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Seminar & Edukasi", ikon_emoji: "📚", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Tagihan Bulanan", ikon_emoji: "🏠", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Belanja Lainnya", ikon_emoji: "🛒", tipe_kategori: "pengeluaran" },
  { nama_kategori: "Gaji", ikon_emoji: "💼", tipe_kategori: "pemasukan" },
  { nama_kategori: "Transfer Masuk", ikon_emoji: "📥", tipe_kategori: "pemasukan" },
  { nama_kategori: "Lainnya", ikon_emoji: "✨", tipe_kategori: "pemasukan" }
];

function initApp() {
  bindNavigation();
  bindSettingsActions();
  bindGeneralActions();
  bindTransactionFormActions();
  restoreSettings();
  applySavedTheme();
  bindSettingsManagementActions();
  maybeLoadBeranda();
}

function bindSettingsManagementActions() {
  const savePeriodeBtn = document.getElementById("savePeriodeBtn");
  const reloadKantongBtn = document.getElementById("reloadKantongSettingsBtn");
  const addKategoriBtn = document.getElementById("addKategoriBtn");

  savePeriodeBtn.addEventListener("click", onSavePeriode);
  reloadKantongBtn.addEventListener("click", renderKantongSettingsList);
  addKategoriBtn.addEventListener("click", onAddKategori);
}

function bindNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.target;
      if (!target) return;
      state.activeTab = target;
      setActiveTab(target);
    });
  });
}

function setActiveTab(tabName) {
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.target === tabName);
  });
  state.activeTab = tabName;
  if (tabName === "insight") {
    loadInsightData();
  }
}

function bindSettingsActions() {
  const gasInput = document.getElementById("gasUrlInput");
  const saveBtn = document.getElementById("saveGASUrlBtn");
  const testBtn = document.getElementById("testConnectionBtn");
  const geminiInput = document.getElementById("geminiApiKeyInput");

  saveBtn.addEventListener("click", () => {
    const url = (gasInput.value || "").trim();
    if (!url) {
      setStatus("URL Apps Script tidak boleh kosong.", "error");
      return;
    }
    localStorage.setItem(STORAGE_KEYS.GAS_URL, url);
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, (geminiInput.value || "").trim());
    setStatus("URL Apps Script berhasil disimpan.", "success");
    maybeLoadBeranda(true);
  });

  testBtn.addEventListener("click", async () => {
    const url = (gasInput.value || "").trim();
    if (!url) {
      setStatus("Isi URL Apps Script dulu sebelum tes koneksi.", "error");
      return;
    }
    await testConnection(url);
  });
}

function bindGeneralActions() {
  const fabBtn = document.getElementById("fabTambah");
  const themeBtn = document.getElementById("themeToggleBtn");
  const refreshBtn = document.getElementById("refreshBerandaBtn");
  const openHutangBtn = document.getElementById("openHutangPageBtn");
  const backHutangBtn = document.getElementById("backFromHutangBtn");
  const refreshInsightBtn = document.getElementById("refreshInsightBtn");

  fabBtn.addEventListener("click", () => {
    openTrxModal();
  });

  refreshBtn.addEventListener("click", () => {
    maybeLoadBeranda(true);
  });
  openHutangBtn.addEventListener("click", async () => {
    setActiveTab("hutang");
    await loadHutangPage();
  });
  backHutangBtn.addEventListener("click", () => {
    setActiveTab("beranda");
  });
  refreshInsightBtn.addEventListener("click", async () => {
    await loadInsightData();
  });

  themeBtn.addEventListener("click", () => {
    const currentTheme = document.body.classList.contains("theme-light") ? "light" : "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
  });
}

function bindTransactionFormActions() {
  const closeBtn = document.getElementById("closeTrxModalBtn");
  const backdrop = document.getElementById("trxBackdrop");
  const trxType = document.getElementById("trxTipe");
  const hutangMode = document.getElementById("trxHutangTujuanMode");
  const form = document.getElementById("trxForm");
  const closeLunasBtn = document.getElementById("closeLunasModalBtn");
  const lunasBackdrop = document.getElementById("lunasBackdrop");
  const lunasForm = document.getElementById("lunasForm");

  closeBtn.addEventListener("click", closeTrxModal);
  backdrop.addEventListener("click", closeTrxModal);
  trxType.addEventListener("change", updateConditionalFields);
  hutangMode.addEventListener("change", updateHutangTujuanFields);
  form.addEventListener("submit", onSubmitTrxForm);
  closeLunasBtn.addEventListener("click", closeLunasModal);
  lunasBackdrop.addEventListener("click", closeLunasModal);
  lunasForm.addEventListener("submit", onSubmitLunasForm);
}

function restoreSettings() {
  const savedUrl = localStorage.getItem(STORAGE_KEYS.GAS_URL);
  const savedGemini = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
  if (savedUrl) {
    document.getElementById("gasUrlInput").value = savedUrl;
  }
  if (savedGemini) {
    document.getElementById("geminiApiKeyInput").value = savedGemini;
  }
  state.kategoriList = DEFAULT_KATEGORI.slice();
}

function applySavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  applyTheme(saved);
}

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);
  document.body.classList.toggle("theme-dark", !isLight);
  const themeBtn = document.getElementById("themeToggleBtn");
  themeBtn.textContent = isLight ? "☀️ Light" : "🌙 Dark";
}

async function testConnection(baseUrl) {
  try {
    setStatus("Sedang mengetes koneksi...", "info");
    const result = await callApi(baseUrl, { action: "getKantong" });
    if (!result.success) {
      throw new Error(result.message || "Respons API tidak valid");
    }
    setStatus("Koneksi berhasil. API terhubung dengan baik.", "success");
    await maybeLoadBeranda(true);
  } catch (error) {
    setStatus(`Gagal konek ke Apps Script: ${error.message}`, "error");
  }
}

async function callApi(baseUrl, payload) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

function setStatus(message, type) {
  const el = document.getElementById("connectionStatus");
  el.textContent = message;
  el.classList.add("status-chip");
  el.classList.toggle("status-loading", type === "info");
  if (type === "success") el.style.color = "var(--success)";
  else if (type === "error") el.style.color = "var(--danger)";
  else el.style.color = "var(--muted)";
}

function setButtonLoading(btn, isLoading, loadingText) {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText || "Memproses...";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
  }
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDateDisplay(dateStr, timeStr) {
  if (!dateStr) return "-";
  const dt = new Date(`${dateStr}T${timeStr || "00:00:00"}`);
  const datePart = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(dt);
  const timePart = timeStr ? ` ${timeStr.slice(0, 5)}` : "";
  return `${datePart}${timePart}`;
}

function getChartColors(count) {
  const palette = [
    "#14b8a6", "#0ea5e9", "#6366f1", "#a855f7", "#ec4899",
    "#f97316", "#eab308", "#22c55e", "#f43f5e", "#3b82f6",
    "#84cc16", "#06b6d4"
  ];
  const colors = [];
  for (let i = 0; i < count; i += 1) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

function getChartColorsByLabel(labels) {
  const palette = getChartColors(labels.length);
  const mapped = {};
  labels.forEach((label, idx) => {
    mapped[label] = palette[idx];
  });
  return mapped;
}

function getGASUrl() {
  return (localStorage.getItem(STORAGE_KEYS.GAS_URL) || "").trim();
}

async function maybeLoadBeranda(force = false) {
  const url = getGASUrl();
  if (!url) {
    if (force) {
      setStatus("Simpan URL Apps Script dulu untuk memuat Beranda.", "error");
    }
    return;
  }
  await loadBerandaData(url);
}

async function loadBerandaData(baseUrl) {
  const cardsContainer = document.getElementById("kantongCards");
  const expenseListEl = document.getElementById("lastExpenseList");
  const incomeListEl = document.getElementById("lastIncomeList");

  cardsContainer.innerHTML = `<p class="placeholder">Memuat data kantong...</p>`;
  expenseListEl.innerHTML = `<p class="placeholder">Memuat transaksi...</p>`;
  incomeListEl.innerHTML = `<p class="placeholder">Memuat transaksi...</p>`;

  try {
    const [kantongRes, trxRes, periodeRes] = await Promise.all([
      callApi(baseUrl, { action: "getKantong" }),
      callApi(baseUrl, { action: "getTransaksi" }),
      callApi(baseUrl, { action: "getPeriode" })
    ]);

    if (!kantongRes.success) throw new Error(kantongRes.message || "getKantong gagal");
    if (!trxRes.success) throw new Error(trxRes.message || "getTransaksi gagal");
    if (!periodeRes.success) throw new Error(periodeRes.message || "getPeriode gagal");

    state.kantongList = kantongRes.data.kantong || [];
    await loadKategoriFromApi(baseUrl);
    renderKantongCards(state.kantongList);
    renderLatestTransactions(trxRes.data.transaksi || [], state.kantongList);
    renderPieCategoryByPeriod(trxRes.data.transaksi || [], periodeRes.data.periode_aktif);
    populateTransactionFormOptions();
    renderSettingsPeriodeInfo(periodeRes.data.periode_aktif);
    renderKantongSettingsList();
    renderKategoriSettingsList();
    if (state.activeTab === "hutang") {
      await loadHutangPage();
    }
  } catch (error) {
    cardsContainer.innerHTML = `<p class="placeholder">Gagal memuat kantong: ${error.message}</p>`;
    expenseListEl.innerHTML = `<p class="placeholder">Gagal memuat transaksi.</p>`;
    incomeListEl.innerHTML = `<p class="placeholder">Gagal memuat transaksi.</p>`;
  }
}

function renderKantongCards(kantongList) {
  const el = document.getElementById("kantongCards");
  if (!kantongList.length) {
    el.innerHTML = `<p class="placeholder">Belum ada data kantong.</p>`;
    return;
  }

  el.innerHTML = kantongList
    .map((k) => {
      const showLimit = k.adalah_kantong_jajan || k.adalah_uang_dompet;
      return `
        <article class="kantong-card">
          <p class="kantong-name">${k.nama_kantong}</p>
          <p class="kantong-saldo">${formatRupiah(k.saldo_saat_ini)}</p>
          ${showLimit ? `<span class="limit-badge">Limit hari ini: ${formatRupiah(k.limit_hari_ini || 0)}</span>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderLatestTransactions(transaksi) {
  const expenseEl = document.getElementById("lastExpenseList");
  const incomeEl = document.getElementById("lastIncomeList");

  const expenses = transaksi
    .filter((t) => String(t.tipe).toLowerCase() === "pengeluaran")
    .slice(0, 5);
  const incomes = transaksi
    .filter((t) => String(t.tipe).toLowerCase() === "pemasukan")
    .slice(0, 5);

  expenseEl.innerHTML = expenses.length ? expenses.map((t) => trxCardHtml(t, "expense", state.kantongList)).join("") : `<p class="placeholder">Belum ada transaksi pengeluaran.</p>`;
  incomeEl.innerHTML = incomes.length ? incomes.map((t) => trxCardHtml(t, "income", state.kantongList)).join("") : `<p class="placeholder">Belum ada transaksi pemasukan.</p>`;
}

function trxCardHtml(t, typeClass, kantongList) {
  const isExpense = typeClass === "expense";
  const sign = isExpense ? "-" : "+";
  const pocketId = isExpense ? (t.kantong_asal || "-") : (t.kantong_tujuan || "-");
  const pocketName = findKantongNameById(pocketId, kantongList);
  return `
    <article class="trx-card">
      <div class="trx-meta">
        <p class="trx-date">${formatDateDisplay(t.tanggal, t.jam)}</p>
        <p class="trx-title">${t.kategori || "Tanpa kategori"} · ${pocketName}</p>
      </div>
      <div class="trx-amount ${typeClass}">${sign}${formatRupiah(t.nominal)}</div>
    </article>
  `;
}

function renderPieCategoryByPeriod(transaksi, periodeAktif) {
  const canvas = document.getElementById("kategoriPieChart");
  const legendEl = document.getElementById("kategoriLegend");

  if (state.pieChartInstance) {
    state.pieChartInstance.destroy();
    state.pieChartInstance = null;
  }

  if (!periodeAktif) {
    legendEl.innerHTML = `<p class="placeholder">Belum ada periode aktif.</p>`;
    return;
  }

  const start = new Date(`${periodeAktif.tanggal_mulai}T00:00:00`);
  const end = new Date(`${periodeAktif.tanggal_selesai}T23:59:59`);

  const filtered = transaksi.filter((t) => {
    if (String(t.tipe).toLowerCase() !== "pengeluaran") return false;
    const dt = new Date(`${t.tanggal}T${t.jam || "00:00:00"}`);
    return dt >= start && dt <= end;
  });

  const categoryTotals = {};
  filtered.forEach((t) => {
    const key = t.kategori || "Tanpa kategori";
    categoryTotals[key] = (categoryTotals[key] || 0) + Number(t.nominal || 0) + Number(t.biaya_transaksi || 0);
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (!labels.length) {
    legendEl.innerHTML = `<p class="placeholder">Belum ada pengeluaran pada periode aktif.</p>`;
    return;
  }

  const colors = getChartColors(labels.length);

  state.pieChartInstance = new Chart(canvas, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });

  legendEl.innerHTML = labels
    .map((label, idx) => {
      return `
        <div class="legend-item">
          <span class="legend-dot" style="background:${colors[idx]}"></span>
          <span>${label} (${formatRupiah(values[idx])})</span>
        </div>
      `;
    })
    .join("");
}

function findKantongNameById(id, kantongList) {
  const found = (kantongList || []).find((k) => String(k.id_kantong) === String(id));
  return found ? found.nama_kantong : id || "-";
}

function openTrxModal() {
  const modal = document.getElementById("trxModal");
  modal.classList.remove("hidden");
  resetTrxFormToDefault();
}

function closeTrxModal() {
  const modal = document.getElementById("trxModal");
  modal.classList.add("hidden");
}

function resetTrxFormToDefault() {
  const now = new Date();
  document.getElementById("trxTanggal").value = now.toISOString().slice(0, 10);
  document.getElementById("trxJam").value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  document.getElementById("trxTipe").value = "pengeluaran";
  document.getElementById("trxNominal").value = "";
  document.getElementById("trxCatatan").value = "";
  document.getElementById("trxBiaya").value = "0";
  document.getElementById("trxFormStatus").textContent = "Isi form lalu simpan.";
  updateConditionalFields();
}

function updateConditionalFields() {
  const tipe = document.getElementById("trxTipe").value;
  toggleField("pengeluaranFields", tipe === "pengeluaran");
  toggleField("pemasukanFields", tipe === "pemasukan");
  toggleField("hutangFields", tipe === "hutang");
  toggleField("pindahFields", tipe === "pindah_kantong");
  toggleField("koreksiFields", tipe === "koreksi_saldo");
  toggleField("universalNominalBlock", tipe !== "koreksi_saldo");
  document.getElementById("trxNominal").required = tipe !== "koreksi_saldo";
  updateHutangTujuanFields();
}

function updateHutangTujuanFields() {
  const mode = document.getElementById("trxHutangTujuanMode").value;
  toggleField("hutangKantongTujuanBlock", mode === "kantong");
  toggleField("hutangOrangBlock", mode === "orang");
}

function toggleField(id, shouldShow) {
  const el = document.getElementById(id);
  el.classList.toggle("hidden", !shouldShow);
}

function populateTransactionFormOptions() {
  if (!state.kantongList.length) return;
  if (!state.kategoriList.length) {
    state.kategoriList = DEFAULT_KATEGORI.slice();
  }

  const kantongOptions = state.kantongList.map((k) => ({
    value: k.id_kantong,
    label: k.nama_kantong
  }));

  setSelectOptions("trxKantongAsalPengeluaran", kantongOptions);
  setSelectOptions("trxKantongTujuanPemasukan", kantongOptions);
  setSelectOptions("trxKantongAsalHutang", kantongOptions);
  setSelectOptions("trxKantongTujuanHutang", kantongOptions);
  setSelectOptions("trxKantongAsalPindah", kantongOptions);
  setSelectOptions("trxKantongTujuanPindah", kantongOptions);
  setSelectOptions("trxKantongKoreksi", kantongOptions);

  const kategoriPengeluaran = state.kategoriList
    .filter((k) => ["pengeluaran", "keduanya"].includes(String(k.tipe_kategori).toLowerCase()))
    .map((k) => ({ value: k.nama_kategori, label: `${k.ikon_emoji || ""} ${k.nama_kategori}`.trim() }));
  const kategoriPemasukan = state.kategoriList
    .filter((k) => ["pemasukan", "keduanya"].includes(String(k.tipe_kategori).toLowerCase()))
    .map((k) => ({ value: k.nama_kategori, label: `${k.ikon_emoji || ""} ${k.nama_kategori}`.trim() }));

  setSelectOptions("trxKategoriPengeluaran", kategoriPengeluaran);
  setSelectOptions("trxKategoriPemasukan", kategoriPemasukan);
}

function setSelectOptions(selectId, options) {
  const el = document.getElementById(selectId);
  el.innerHTML = options
    .map((o) => `<option value="${o.value}">${o.label}</option>`)
    .join("");
}

async function onSubmitTrxForm(event) {
  event.preventDefault();
  const baseUrl = getGASUrl();
  if (!baseUrl) {
    setTrxFormStatus("URL Apps Script belum diatur.", "error");
    return;
  }

  const tipe = document.getElementById("trxTipe").value;
  const common = {
    tanggal: document.getElementById("trxTanggal").value,
    jam: `${document.getElementById("trxJam").value}:00`,
    catatan: document.getElementById("trxCatatan").value.trim(),
    biaya_transaksi: Number(document.getElementById("trxBiaya").value || 0)
  };

  try {
    setTrxFormStatus("Menyimpan transaksi...", "info");
    if (tipe === "pengeluaran") {
      await submitPengeluaran(baseUrl, common);
    } else if (tipe === "pemasukan") {
      await submitPemasukan(baseUrl, common);
    } else if (tipe === "hutang") {
      await submitHutang(baseUrl, common);
    } else if (tipe === "pindah_kantong") {
      await submitPindahKantong(baseUrl, common);
    } else if (tipe === "koreksi_saldo") {
      await submitKoreksiSaldo(baseUrl, common);
    }

    setTrxFormStatus("Transaksi berhasil disimpan.", "success");
    await maybeLoadBeranda(true);
    closeTrxModal();
  } catch (error) {
    setTrxFormStatus(`Gagal simpan: ${error.message}`, "error");
  }
}

async function submitPengeluaran(baseUrl, common) {
  const payload = {
    action: "addTransaksi",
    tipe: "pengeluaran",
    nominal: Number(document.getElementById("trxNominal").value || 0),
    kantong_asal: document.getElementById("trxKantongAsalPengeluaran").value,
    kategori: document.getElementById("trxKategoriPengeluaran").value,
    ...common
  };
  if (payload.nominal <= 0) throw new Error("Nominal wajib lebih dari 0.");
  const res = await callApi(baseUrl, payload);
  if (!res.success) throw new Error(res.message || "addTransaksi pengeluaran gagal");
}

async function submitPemasukan(baseUrl, common) {
  const payload = {
    action: "addTransaksi",
    tipe: "pemasukan",
    nominal: Number(document.getElementById("trxNominal").value || 0),
    kantong_tujuan: document.getElementById("trxKantongTujuanPemasukan").value,
    kategori: document.getElementById("trxKategoriPemasukan").value,
    ...common
  };
  if (payload.nominal <= 0) throw new Error("Nominal wajib lebih dari 0.");
  const res = await callApi(baseUrl, payload);
  if (!res.success) throw new Error(res.message || "addTransaksi pemasukan gagal");
}

async function submitHutang(baseUrl, common) {
  const tujuanMode = document.getElementById("trxHutangTujuanMode").value;
  const payload = {
    action: "addHutang",
    tipe: document.getElementById("trxTipeHutang").value,
    nominal: Number(document.getElementById("trxNominal").value || 0),
    kantong_asal: document.getElementById("trxKantongAsalHutang").value,
    ...common
  };
  if (payload.nominal <= 0) throw new Error("Nominal wajib lebih dari 0.");

  if (tujuanMode === "kantong") {
    payload.kantong_tujuan = document.getElementById("trxKantongTujuanHutang").value;
  } else {
    payload.nama_orang = document.getElementById("trxNamaOrangHutang").value.trim();
    payload.alasan = document.getElementById("trxAlasanHutang").value.trim();
    payload.deadline = document.getElementById("trxDeadlineHutang").value;
    if (!payload.nama_orang || !payload.alasan || !payload.deadline) {
      throw new Error("Nama orang, alasan, dan deadline wajib untuk mode Orang Lain.");
    }
  }

  const res = await callApi(baseUrl, payload);
  if (!res.success) throw new Error(res.message || "addHutang gagal");
}

async function submitPindahKantong(baseUrl, common) {
  const payload = {
    action: "addTransaksi",
    tipe: "pindah_kantong",
    nominal: Number(document.getElementById("trxNominal").value || 0),
    kantong_asal: document.getElementById("trxKantongAsalPindah").value,
    kantong_tujuan: document.getElementById("trxKantongTujuanPindah").value,
    kategori: "Pindah Kantong",
    ...common
  };
  if (payload.nominal <= 0) throw new Error("Nominal wajib lebih dari 0.");
  if (payload.kantong_asal === payload.kantong_tujuan) throw new Error("Kantong asal dan tujuan tidak boleh sama.");
  const res = await callApi(baseUrl, payload);
  if (!res.success) throw new Error(res.message || "addTransaksi pindah gagal");
}

async function submitKoreksiSaldo(baseUrl, common) {
  const saldoBaru = Number(document.getElementById("trxSaldoBaruKoreksi").value || 0);
  const alasan = document.getElementById("trxAlasanKoreksi").value.trim();
  if (!alasan) throw new Error("Alasan koreksi wajib diisi.");

  const payload = {
    action: "addTransaksi",
    tipe: "koreksi_saldo",
    nominal: saldoBaru,
    saldo_baru: saldoBaru,
    kantong_asal: document.getElementById("trxKantongKoreksi").value,
    kategori: "Koreksi Saldo",
    alasan,
    ...common
  };
  const res = await callApi(baseUrl, payload);
  if (!res.success) throw new Error(res.message || "addTransaksi koreksi gagal");
}

function setTrxFormStatus(message, type) {
  const el = document.getElementById("trxFormStatus");
  el.textContent = message;
  if (type === "success") el.style.color = "var(--success)";
  else if (type === "error") el.style.color = "var(--danger)";
  else el.style.color = "var(--muted)";
}

async function loadHutangPage() {
  const keluarEl = document.getElementById("hutangKeluarList");
  const masukEl = document.getElementById("hutangMasukList");
  const baseUrl = getGASUrl();
  if (!baseUrl || !keluarEl || !masukEl) return;
  keluarEl.innerHTML = `<p class="placeholder">Memuat hutang...</p>`;
  masukEl.innerHTML = `<p class="placeholder">Memuat hutang...</p>`;
  try {
    const res = await callApi(baseUrl, { action: "getHutang", status: "belum_lunas" });
    if (!res.success) throw new Error(res.message || "getHutang gagal");
    state.hutangList = res.data.hutang || [];
    renderHutangLists(state.hutangList);
  } catch (e) {
    keluarEl.innerHTML = `<p class="placeholder">Gagal memuat hutang.</p>`;
    masukEl.innerHTML = `<p class="placeholder">Gagal memuat hutang.</p>`;
  }
}

function renderHutangLists(list) {
  const keluar = list.filter((h) => String(h.tipe).toLowerCase() === "hutang_keluar");
  const masuk = list.filter((h) => String(h.tipe).toLowerCase() === "hutang_masuk");
  document.getElementById("hutangKeluarList").innerHTML = keluar.length
    ? keluar.map((h) => hutangCardHtml(h)).join("")
    : `<p class="placeholder">Tidak ada hutang aktif.</p>`;
  document.getElementById("hutangMasukList").innerHTML = masuk.length
    ? masuk.map((h) => hutangCardHtml(h)).join("")
    : `<p class="placeholder">Tidak ada hutang aktif.</p>`;

  document.querySelectorAll("[data-lunas-id]").forEach((btn) => {
    btn.addEventListener("click", () => openLunasModal(btn.dataset.lunasId));
  });
}

function hutangCardHtml(h) {
  const deadline = h.deadline || "-";
  const sisa = daysLeft(deadline);
  const nama = h.nama_orang || findKantongNameById(h.kantong_terlibat, state.kantongList);
  return `
    <article class="hutang-card">
      <div class="hutang-topline">
        <strong>${nama}</strong>
        <span class="trx-amount expense">${formatRupiah(h.nominal)}</span>
      </div>
      <div class="hutang-meta">Alasan: ${h.alasan || "-"} · Deadline: ${deadline} · Sisa: ${sisa}</div>
      <button class="secondary-btn" data-lunas-id="${h.id_hutang}" type="button">Lunasi</button>
    </article>
  `;
}

function daysLeft(deadline) {
  if (!deadline) return "-";
  const now = new Date();
  const d = new Date(`${deadline}T00:00:00`);
  const ms = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return `${Math.ceil(ms / 86400000)} hari`;
}

function openLunasModal(hutangId) {
  const hutang = state.hutangList.find((h) => String(h.id_hutang) === String(hutangId));
  if (!hutang) return;
  document.getElementById("lunasModal").classList.remove("hidden");
  document.getElementById("lunasHutangId").value = hutang.id_hutang;
  document.getElementById("lunasNominal").value = Number(hutang.nominal || 0);
  document.getElementById("lunasBiaya").value = "0";
  setSelectOptions("lunasKantongPembayar", state.kantongList.map((k) => ({ value: k.id_kantong, label: k.nama_kantong })));
  setLunasStatus("Pilih data lalu simpan.", "info");
}

function closeLunasModal() {
  document.getElementById("lunasModal").classList.add("hidden");
}

async function onSubmitLunasForm(event) {
  event.preventDefault();
  const baseUrl = getGASUrl();
  if (!baseUrl) return;
  const payload = {
    action: "lunasHutang",
    id_hutang: document.getElementById("lunasHutangId").value,
    nominal_pelunasan: Number(document.getElementById("lunasNominal").value || 0),
    biaya_transfer: Number(document.getElementById("lunasBiaya").value || 0),
    kantong_pembayar: document.getElementById("lunasKantongPembayar").value
  };
  try {
    setLunasStatus("Memproses pelunasan...", "info");
    const res = await callApi(baseUrl, payload);
    if (!res.success) throw new Error(res.message || "lunasHutang gagal");
    setLunasStatus("Hutang berhasil dilunasi.", "success");
    closeLunasModal();
    await maybeLoadBeranda(true);
    await loadHutangPage();
  } catch (e) {
    setLunasStatus(`Gagal: ${e.message}`, "error");
  }
}

function setLunasStatus(message, type) {
  const el = document.getElementById("lunasStatus");
  el.textContent = message;
  if (type === "success") el.style.color = "var(--success)";
  else if (type === "error") el.style.color = "var(--danger)";
  else el.style.color = "var(--muted)";
}

function renderSettingsPeriodeInfo(periodeAktif) {
  const infoEl = document.getElementById("activePeriodeInfo");
  if (!periodeAktif) {
    infoEl.textContent = "Belum ada periode aktif.";
    return;
  }
  const sisaHari = daysLeft(periodeAktif.tanggal_selesai);
  infoEl.textContent = `Periode aktif: ${periodeAktif.tanggal_mulai} s/d ${periodeAktif.tanggal_selesai} (sisa ${sisaHari})`;
}

async function onSavePeriode() {
  const btn = document.getElementById("savePeriodeBtn");
  setButtonLoading(btn, true, "Menyimpan...");
  try {
    const baseUrl = getGASUrl();
    if (!baseUrl) {
      setStatus("Isi URL Apps Script dulu.", "error");
      return;
    }
    const tanggal_mulai = document.getElementById("periodeMulaiInput").value;
    const tanggal_selesai = document.getElementById("periodeSelesaiInput").value;
    if (!tanggal_mulai || !tanggal_selesai) {
      setStatus("Tanggal mulai/selesai wajib diisi.", "error");
      return;
    }
    const res = await callApi(baseUrl, { action: "setPeriode", tanggal_mulai, tanggal_selesai });
    if (!res.success) {
      setStatus(`Gagal set periode: ${res.message}`, "error");
      return;
    }
    setStatus("Periode baru berhasil diset.", "success");
    await maybeLoadBeranda(true);
  } catch (e) {
    setStatus(`Koneksi gagal saat set periode: ${e.message}`, "error");
  } finally {
    setButtonLoading(btn, false);
  }
}

function renderKantongSettingsList() {
  const wrap = document.getElementById("kantongSettingsList");
  if (!wrap) return;
  if (!state.kantongList.length) {
    wrap.innerHTML = `<p class="placeholder">Belum ada data kantong.</p>`;
    return;
  }
  wrap.innerHTML = state.kantongList.map((k) => `
    <article class="settings-item">
      <h4>${k.nama_kantong}</h4>
      <div class="status-text">Saldo saat ini: ${formatRupiah(k.saldo_saat_ini)}</div>
      <div class="form-row two-col">
        <input id="editNama-${k.id_kantong}" type="text" value="${k.nama_kantong}" />
        <input id="editSaldo-${k.id_kantong}" type="number" min="0" step="1" value="${k.saldo_saat_ini}" />
      </div>
      <input id="editAlasan-${k.id_kantong}" type="text" placeholder="Alasan (wajib jika ubah saldo)" />
      <button type="button" data-save-kantong="${k.id_kantong}">Simpan Perubahan</button>
    </article>
  `).join("");
  document.querySelectorAll("[data-save-kantong]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.saveKantong;
      await onSaveKantong(id);
    });
  });
}

async function onSaveKantong(idKantong) {
  const baseUrl = getGASUrl();
  if (!baseUrl) return;
  const nama_kantong = document.getElementById(`editNama-${idKantong}`).value.trim();
  const saldo_saat_ini = document.getElementById(`editSaldo-${idKantong}`).value;
  const alasan = document.getElementById(`editAlasan-${idKantong}`).value.trim();
  const payload = { action: "updateKantong", id_kantong: idKantong, nama_kantong };
  if (saldo_saat_ini !== "") {
    payload.saldo_saat_ini = Number(saldo_saat_ini);
    payload.alasan = alasan;
  }
  try {
    const res = await callApi(baseUrl, payload);
    if (!res.success) {
      setStatus(`Gagal update kantong: ${res.message}`, "error");
      return;
    }
    setStatus("Kantong berhasil diupdate.", "success");
    await maybeLoadBeranda(true);
  } catch (e) {
    setStatus(`Koneksi gagal saat update kantong: ${e.message}`, "error");
  }
}

function renderKategoriSettingsList() {
  const wrap = document.getElementById("kategoriSettingsList");
  if (!wrap) return;
  wrap.innerHTML = state.kategoriList.map((k, idx) => `
    <article class="settings-item">
      <div><strong>${k.ikon_emoji || ""} ${k.nama_kategori}</strong> <span class="status-text">(${k.tipe_kategori})</span></div>
      <button class="secondary-btn" type="button" data-delete-kategori="${idx}">Hapus</button>
    </article>
  `).join("");
  document.querySelectorAll("[data-delete-kategori]").forEach((btn) => {
    btn.addEventListener("click", () => onDeleteKategori(Number(btn.dataset.deleteKategori)));
  });
}

async function onAddKategori() {
  const btn = document.getElementById("addKategoriBtn");
  setButtonLoading(btn, true, "Menambah...");
  try {
    const baseUrl = getGASUrl();
    if (!baseUrl) {
      setStatus("Isi URL Apps Script dulu.", "error");
      return;
    }
    const nama = document.getElementById("newKategoriNama").value.trim();
    const emoji = document.getElementById("newKategoriEmoji").value.trim();
    const tipe = document.getElementById("newKategoriTipe").value;
    if (!nama) {
      setStatus("Nama kategori wajib diisi.", "error");
      return;
    }
    const res = await callApi(baseUrl, {
      action: "addKategori",
      nama_kategori: nama,
      ikon_emoji: emoji,
      tipe_kategori: tipe
    });
    if (!res.success) {
      setStatus(`Gagal tambah kategori: ${res.message}`, "error");
      return;
    }
    setStatus("Kategori berhasil ditambahkan.", "success");
    await loadKategoriFromApi(baseUrl);
    populateTransactionFormOptions();
    renderKategoriSettingsList();
    document.getElementById("newKategoriNama").value = "";
    document.getElementById("newKategoriEmoji").value = "";
  } catch (e) {
    setStatus(`Koneksi gagal saat tambah kategori: ${e.message}`, "error");
  } finally {
    setButtonLoading(btn, false);
  }
}

async function onDeleteKategori(index) {
  const baseUrl = getGASUrl();
  if (!baseUrl) {
    setStatus("Isi URL Apps Script dulu.", "error");
    return;
  }
  const target = state.kategoriList[index];
  if (!target) return;
  const res = await callApi(baseUrl, {
    action: "deleteKategori",
    id_kategori: target.id_kategori || "",
    nama_kategori: target.nama_kategori
  });
  if (!res.success) {
    setStatus(`Gagal hapus kategori: ${res.message}`, "error");
    return;
  }
  setStatus("Kategori berhasil dihapus.", "success");
  await loadKategoriFromApi(baseUrl);
  populateTransactionFormOptions();
  renderKategoriSettingsList();
}

async function loadKategoriFromApi(baseUrl) {
  try {
    const res = await callApi(baseUrl, { action: "getKategori" });
    if (!res.success) throw new Error(res.message || "getKategori gagal");
    const kategori = (res.data && res.data.kategori) ? res.data.kategori : [];
    state.kategoriList = kategori.length ? kategori : DEFAULT_KATEGORI.slice();
  } catch (_e) {
    state.kategoriList = DEFAULT_KATEGORI.slice();
  }
}

async function loadInsightData() {
  const baseUrl = getGASUrl();
  if (!baseUrl) return;
  const stackedCanvas = document.getElementById("insightStackedChart");
  const jajanCanvas = document.getElementById("insightJajanChart");
  if (!stackedCanvas || !jajanCanvas) return;
  try {
    const res = await callApi(baseUrl, { action: "getChartData" });
    if (!res.success) throw new Error(res.message || "getChartData gagal");
    const data = res.data || {};
    renderInsightStackedChart(data.allPocketDailyExpenses || []);
    renderInsightJajanChart(data.jajanDetail || []);
  } catch (_e) {
    destroyInsightCharts();
  }
}

function destroyInsightCharts() {
  if (state.insightStackedInstance) {
    state.insightStackedInstance.destroy();
    state.insightStackedInstance = null;
  }
  if (state.insightJajanInstance) {
    state.insightJajanInstance.destroy();
    state.insightJajanInstance = null;
  }
}

function renderInsightStackedChart(allPocketDailyExpenses) {
  const canvas = document.getElementById("insightStackedChart");
  if (state.insightStackedInstance) {
    state.insightStackedInstance.destroy();
    state.insightStackedInstance = null;
  }
  if (!allPocketDailyExpenses.length) return;

  const labels = allPocketDailyExpenses.map((x) => x.tanggal);
  const pocketSet = new Set();
  allPocketDailyExpenses.forEach((x) => {
    Object.keys(x.per_kantong || {}).forEach((k) => pocketSet.add(k));
  });
  const pocketKeys = Array.from(pocketSet);
  const colorMap = getChartColorsByLabel(pocketKeys);
  const datasets = pocketKeys.map((pocketId) => ({
    label: findKantongNameById(pocketId, state.kantongList),
    data: allPocketDailyExpenses.map((x) => Number((x.per_kantong || {})[pocketId] || 0)),
    backgroundColor: colorMap[pocketId],
    stack: "total"
  }));

  state.insightStackedInstance = new Chart(canvas, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  });
}

function renderInsightJajanChart(jajanDetail) {
  const canvas = document.getElementById("insightJajanChart");
  if (state.insightJajanInstance) {
    state.insightJajanInstance.destroy();
    state.insightJajanInstance = null;
  }
  if (!jajanDetail.length) return;

  const labels = jajanDetail.map((x) => x.tanggal);
  const barData = jajanDetail.map((x) => Number(x.pengeluaran || 0));
  const limitData = jajanDetail.map((x) => Number(x.limit_harian || 0));
  const barColors = jajanDetail.map((x) => (x.melebihi_limit ? "#ef4444" : "#22c55e"));

  state.insightJajanInstance = new Chart(canvas, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Pengeluaran Kantong Jajan",
          data: barData,
          backgroundColor: barColors
        },
        {
          type: "line",
          label: "Limit Harian",
          data: limitData,
          borderColor: "#f59e0b",
          borderDash: [6, 5],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

document.addEventListener("DOMContentLoaded", initApp);
