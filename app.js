/* ===========================================================
 *  app.js - Sejuk Dekorasi (FULL RAW + FILTER/SEARCH/SORT BARU)
 *  - Mengandung: utility, localStorage handler, produk, promo,
 *    modal order, render preview, render products (baru),
 *    detail produk, admin auth.
 * =========================================================== */

/* ===========================================================
 *  UTILITAS DASAR + TIMER + MODAL ORDER (VERSI PERBAIKAN)
 * =========================================================== */
let promoCountdownInterval = null; // untuk menyimpan interval timer (satu interval karena halaman detail hanya 1)

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRp(num) {
  if (!num) num = 0;
  num = parseInt(num, 10);
  return num.toLocaleString("id-ID");
}

function parseHarga(h) {
  if (!h) return 0;
  return parseInt(String(h).replace(/\D/g, ""), 10) || 0;
}

/* ===========================================================
 *  LOCALSTORAGE HANDLER
 * =========================================================== */
function getProducts() {
  return JSON.parse(localStorage.getItem("products") || "[]");
}

function saveProducts(list) {
  localStorage.setItem("products", JSON.stringify(list));
}

function getPromos() {
  return JSON.parse(localStorage.getItem("promos") || "[]");
}

function savePromos(list) {
  localStorage.setItem("promos", JSON.stringify(list));
}

/* ===========================================================
 *  PRODUK FUNCTIONS
 * =========================================================== */
function findProductById(id) {
  const list = getProducts();
  return list.find(p => p.id === id);
}

function removeProduct(id) {
  let list = getProducts();
  list = list.filter(p => p.id !== id);
  saveProducts(list);
}

function addOrUpdateProduct(p) {
  if (!p.id) return false;
  let list = getProducts();
  const exist = list.find(x => x.id === p.id);
  if (exist) Object.assign(exist, p);
  else list.push(p);
  saveProducts(list);
  return true;
}

/* ===========================================================
 *  PROMO FUNCTIONS
 * =========================================================== */
function findPromoByCode(code) {
  const promos = getPromos();
  return promos.find(p => p.code === code);
}

function removePromo(code) {
  let list = getPromos();
  list = list.filter(p => p.code !== code);
  savePromos(list);
}

function addOrUpdatePromo(data) {
  let list = getPromos();
  const exist = list.find(p => p.code === data.code);
  if (exist) Object.assign(exist, data);
  else list.push(data);
  savePromos(list);
  return true;
}

/* ===========================================================
 *  PROMO VALIDATION (DIPERKETAT LIMIT)
 * =========================================================== */
function validatePromoForProduct(promo, product) {
  const now = new Date();

  // expired
  if (promo.expired) {
    const exp = new Date(promo.expired + " 23:59:59");
    if (now > exp) return { valid: false, msg: "Promo sudah kedaluwarsa" };
  }

  // batas limit penggunaan
  if (promo.usageLimit > 0 && (promo.used || 0) >= promo.usageLimit)
    return { valid: false, msg: "Promo sudah mencapai batas penggunaan" };

  if (parseHarga(product.hargaFinal) < (promo.minHarga || 0))
    return { valid: false, msg: "Harga belum memenuhi minimal promo" };

  if (promo.scope === "category") {
    if ((promo.scopeValue || "").toLowerCase() !== (product.kategori || "").toLowerCase())
      return { valid: false, msg: "Promo hanya untuk kategori: " + promo.scopeValue };
  }

  if (promo.scope === "product") {
    if ((promo.scopeValue || "").toUpperCase() !== (product.id || "").toUpperCase())
      return { valid: false, msg: "Promo hanya untuk produk: " + promo.scopeValue };
  }

  return { valid: true };
}

/* ===========================================================
 *  PROMO MENGURANGI LIMIT (BARU)
 * =========================================================== */
function usePromoOnce(promoCode) {
  const promos = getPromos();
  const p = promos.find(x => x.code === promoCode);
  if (p) {
    p.used = (p.used || 0) + 1;
    savePromos(promos);
    return p;
  }
  return null;
}

/* ===========================================================
 *  START / STOP COUNTDOWN PROMO
 * =========================================================== */
function clearPromoCountdown() {
  if (promoCountdownInterval) {
    clearInterval(promoCountdownInterval);
    promoCountdownInterval = null;
  }
}

function startPromoCountdown(expiredDateStr, product) {
  clearPromoCountdown();
  const msgBox = document.getElementById("promoMsg");
  if (!msgBox) return;

  // buat atau cari elemen timer
  let timerEl = msgBox.querySelector(".promo-timer");
  if (!timerEl) {
    // jika saat ini ada pesan valid, sisipkan timer; kalau tidak, buat container
    const wrapper = document.createElement("div");
    wrapper.className = "promo-valid";
    wrapper.innerHTML = `<div><div class="promo-timer" style="color:#ffeb3b; font-weight:bold;"></div></div>`;
    msgBox.appendChild(wrapper);
    timerEl = msgBox.querySelector(".promo-timer");
  }

  function updateTimer() {
    const now = new Date().getTime();
    const exp = new Date(expiredDateStr + " 23:59:59").getTime();
    const distance = exp - now;

    if (distance <= 0) {
      clearPromoCountdown();
      product.appliedPromo = null;
      const msgBox2 = document.getElementById("promoMsg");
      if (msgBox2) msgBox2.innerHTML = `<div class="promo-invalid">Promo sudah kedaluwarsa.</div>`;
      updateWAButton(product);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerEl.innerText = `Berakhir dalam: ${days}d ${hours}j ${minutes}m ${seconds}s`;
  }

  updateTimer();
  promoCountdownInterval = setInterval(updateTimer, 1000);
}

/* ===========================================================
 *  MODAL (CREATE / OPEN / CLOSE) - PERBAIKAN
 * =========================================================== */
function createOrderModalIfNeeded() {
  if (document.getElementById("orderModal")) return;

  const modalHtml = `
  <div id="orderModal" class="modal-overlay" style="display:none;">
    <div class="modal-card">
      <button class="modal-close" id="orderModalClose" aria-label="Tutup">&times;</button>
      <h3 style="margin:0 0 8px 0; font-size:18px;">Rincian Pesanan</h3>
      <div id="orderContent" style="font-size:14px; min-height:120px;">
        <!-- konten diisi lewat JS -->
      </div>
      <div class="modal-actions" style="margin-top:12px;">
        <button id="modalPesanWA" class="btn btn-primary">Pesan via WA</button>
        <button id="modalCloseBtn" class="btn">Tutup</button>
      </div>
    </div>
  </div>
  `;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper);

  // Pasang event close / overlay
  const orderModal = document.getElementById("orderModal");
  document.getElementById("orderModalClose").addEventListener("click", closeOrderModal);
  document.getElementById("modalCloseBtn").addEventListener("click", closeOrderModal);

  // klik di area overlay (di luar modal-card) akan menutup
  orderModal.addEventListener("click", function (e) {
    if (e.target && e.target.id === "orderModal") closeOrderModal();
  });
}

// isi dan buka modal untuk product tertentu
function openOrderModal(product) {
  createOrderModalIfNeeded();
  const modal = document.getElementById("orderModal");
  const content = document.getElementById("orderContent");
  if (!modal || !content) return;

  // ambil input request dan tipe bunga yang dipilih di halaman (jika ada)
  const reqText = document.getElementById("reqInput") ? document.getElementById("reqInput").value.trim() : "";
  const tipeSel = document.querySelector('input[name="tipeBunga"]:checked');
  const tipeText = tipeSel ? tipeSel.value : "";

  const hargaAsli = parseHarga(product.harga);
  const hargaDiskon = product.diskon > 0 ? hargaAsli - Math.floor(hargaAsli * product.diskon / 100) : hargaAsli;
  const pakaiDiskon = (document.querySelector('input[name="useDiskon"]:checked') || {}).value !== "no" && product.diskon > 0;
  const baseHarga = pakaiDiskon ? hargaDiskon : hargaAsli;

  let promoLine = `<div>(Tidak ada promo)</div>`;
  if (product.appliedPromo) {
    promoLine = `<div>Promo: <b>${escapeHtml(product.appliedPromo.code)}</b> — Potongan: Rp ${formatRp(product.appliedPromo.potongan)}</div>`;
  }

  const diskonAdminLine = pakaiDiskon ? `<div>Diskon Admin: ${product.diskon}%</div>` : `<div>Diskon Admin: -</div>`;
  const hargaFinal = product.appliedPromo ? product.appliedPromo.hargaAkhir : baseHarga;

  // isi konten modal (rapi dan padat)
  content.innerHTML = `
    <div style="display:flex; gap:12px; align-items:center;">
      <img src="${escapeHtml(product.img)}" style="width:110px; height:80px; object-fit:cover; border-radius:8px;" alt="produk"/>
      <div style="flex:1;">
        <div style="font-weight:700; font-size:15px;">${escapeHtml(product.nama)}</div>
        <div style="color:#777; font-size:13px;">Kode: ${escapeHtml(product.id)}</div>
      </div>
    </div>

    <hr style="margin:10px 0; border-color:rgba(0,0,0,0.06)"/>

    <div style="font-size:14px; color:#222;">
      <div>Harga dasar: <b>Rp ${formatRp(hargaAsli)}</b></div>
      <div style="margin-top:6px;">${diskonAdminLine}</div>
      <div style="margin-top:6px;">${promoLine}</div>
      <div style="margin-top:10px; font-size:16px;">Harga akhir: <b>Rp ${formatRp(hargaFinal)}</b></div>

      <div style="margin-top:12px;">
        <div style="font-weight:600; margin-bottom:6px;">Tipe bunga</div>
        <div>${escapeHtml(tipeText || '-')}</div>
      </div>

      <div style="margin-top:8px;">
        <div style="font-weight:600; margin-bottom:6px;">Request tambahan</div>
        <div style="white-space:pre-wrap; color:#333;">${escapeHtml(reqText || '-')}</div>
      </div>

      <div id="modalPromoNote" style="margin-top:8px; color:#c62828; font-weight:600;"></div>
    </div>
  `;

  // setup tombol Pesan via WA di modal
  let modalPesanBtn = document.getElementById("modalPesanWA");
  if (!modalPesanBtn) return;

  // hapus semua listener lama dengan cara simple: replace node
  const newBtn = modalPesanBtn.cloneNode(true);
  modalPesanBtn.parentNode.replaceChild(newBtn, modalPesanBtn);
  modalPesanBtn = document.getElementById("modalPesanWA");

  newBtn.addEventListener("click", function () {
    // jika ada promo, catat used +1
    if (product.appliedPromo) {
      const updatedPromo = usePromoOnce(product.appliedPromo.code);
      // jika limit habis setelah penggunaan, batalkan promo dan beri catatan
      if (updatedPromo && updatedPromo.usageLimit > 0 && (updatedPromo.used || 0) >= updatedPromo.usageLimit) {
        product.appliedPromo = null;
        const note = document.getElementById("modalPromoNote");
        if (note) note.innerText = "Promo telah mencapai batas penggunaan dan dibatalkan.";
      }
    }

    // buat pesan WA berdasarkan kondisi terkini (harga akhir dan request/tipe)
    const finalPriceNow = product.appliedPromo ? product.appliedPromo.hargaAkhir : (pakaiDiskon ? hargaDiskon : hargaAsli);
    const tipeTextNow = document.querySelector('input[name="tipeBunga"]:checked') ? document.querySelector('input[name="tipeBunga"]:checked').value : "";
    const reqNow = document.getElementById("reqInput") ? document.getElementById("reqInput").value.trim() : "";

    const pesan = `Halo, saya ingin memesan:
- Produk: ${product.nama}
- Kode: ${product.id}
- Harga: Rp ${formatRp(finalPriceNow)}
${product.appliedPromo ? `- Promo: ${product.appliedPromo.code} (potongan Rp ${formatRp(product.appliedPromo.potongan)})` : ""}
${tipeTextNow ? `- Tipe bunga: ${tipeTextNow}` : ""}
${reqNow ? `- Request tambahan: ${reqNow}` : ""}`;

    // update tampilan promo di halaman detail
    const msgBox = document.getElementById("promoMsg");
    if (product.appliedPromo) {
      if (msgBox) msgBox.innerHTML = `
        <div class="promo-valid">
          Promo diterapkan: <b>${product.appliedPromo.code}</b><br>
          Potongan: Rp ${formatRp(product.appliedPromo.potongan)}<br>
          Harga akhir: <span class="final-price">Rp ${formatRp(product.appliedPromo.hargaAkhir)}</span><br>
          <span class="promo-timer" style="color:#ffeb3b; font-weight:bold;"></span>
        </div>`;
      // jika promo punya expired, restart timer
      const promoObj = findPromoByCode(product.appliedPromo.code);
      if (promoObj && promoObj.expired) startPromoCountdown(promoObj.expired, product);
    } else {
      if (msgBox) msgBox.innerHTML = `<div class="promo-invalid">Promo telah dibatalkan karena mencapai limit.</div>`;
      clearPromoCountdown();
    }

    closeOrderModal(); // tutup modal sebelum buka WA
    // buka WA di tab baru
    const waUrl = `https://wa.me/6281390708425?text=${encodeURIComponent(pesan)}`;
    window.open(waUrl, '_blank');
  });

  // tampilkan modal
  modal.style.display = "flex";
  // beri sedikit delay untuk animasi (jika ada)
  setTimeout(()=> modal.classList.add('open'), 10);
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(()=> {
    modal.style.display = "none";
  }, 180);
}

/* ===========================================================
 *  RENDER PREVIEW (BERANDA)
 * =========================================================== */
function renderPreview() {
  const list = getProducts();
  const target = document.getElementById("previewGrid");
  if (!target) return;
  let show = list.slice(0, 6);
  target.innerHTML = show
    .map(p => {
      const hargaAsli = parseHarga(p.harga);
      const hargaDiskon = p.diskon > 0 ? hargaAsli - Math.floor(hargaAsli * p.diskon / 100) : hargaAsli;
      return `
      <div class="card" style="position:relative;">
        ${p.diskon > 0 ? `<span class="tag-diskon">-${escapeHtml(String(p.diskon))}%</span>` : ""}
        <img src="${escapeHtml(p.img)}" class="card-img" />
        <div class="card-body">
          <h4>${escapeHtml(p.nama)}</h4>
          <p>${escapeHtml(p.kode || p.id || "")}</p>
          ${
            p.diskon > 0
              ? `<div class="old-price">Rp ${formatRp(hargaAsli)}</div>
                 <div class="price">
                   Rp ${formatRp(hargaDiskon)} 
                   <span class="discount-tag">${p.diskon}%</span>
                 </div>`
              : `<div class="price">Rp ${formatRp(hargaAsli)}</div>`
          }
          <div style="text-align:center; margin-top:10px;">
            <a class="btn btn-primary" href="detail.html?id=${encodeURIComponent(p.id)}">Detail</a>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

/* ===========================================================
 *  PRODUK LIST (SEARCH + FILTER + SORTIR BARU)
 * =========================================================== */
function renderProducts() {
  const target = document.getElementById("produkGrid");
  if (!target) return;

  let list = getProducts();
  if (!list || list.length === 0) {
    target.innerHTML = "<p>Tidak ada produk.</p>";
    return;
  }

  // --- ambil input user ---
  const q = (document.getElementById("searchBox").value || "").toLowerCase();
  const cat = (document.getElementById("categoryFilter").value || "").toLowerCase();
  const minP = parseInt(document.getElementById("minPrice").value || "0");
  const maxP = parseInt(document.getElementById("maxPrice").value || "0");
  const sort = document.getElementById("sortPrice")
    ? document.getElementById("sortPrice").value
    : "";

  let filtered = list;

  // ================== SEARCH BARU ==================
  if (q.trim() !== "") {
    filtered = filtered.filter(p =>
      (p.nama || "").toLowerCase().includes(q) ||
      (p.id || "").toLowerCase().includes(q)
    );
  }

  // ================== FILTER KATEGORI ==================
  if (cat.trim() !== "") {
    filtered = filtered.filter(p =>
      (p.kategori || "").toLowerCase() === cat
    );
  }

  // ================== FILTER HARGA BARU ==================
  filtered = filtered.filter(p => {
    const harga = parseHarga(p.harga);
    if (minP > 0 && harga < minP) return false;
    if (maxP > 0 && harga > maxP) return false;
    return true;
  });

  // ================== SORTIR HARGA (FITUR BARU) ==================
  if (sort === "asc") {
    filtered = filtered.sort((a, b) => parseHarga(a.harga) - parseHarga(b.harga));
  } else if (sort === "desc") {
    filtered = filtered.sort((a, b) => parseHarga(b.harga) - parseHarga(a.harga));
  }

  // jika kosong setelah filter
  if (filtered.length === 0) {
    target.innerHTML = "<p>Tidak ada produk yang cocok.</p>";
    return;
  }

  // ================== RENDER GRID PRODUK ==================
  target.innerHTML = filtered
    .map(p => {
      const hargaAsli = parseHarga(p.harga);
      const hargaDiskon =
        p.diskon > 0
          ? hargaAsli - Math.floor(hargaAsli * p.diskon / 100)
          : hargaAsli;

      return `
        <div class="card" style="position:relative;">
          ${p.diskon > 0 ? `<span class="tag-diskon">-${p.diskon}%</span>` : ""}
          <img src="${escapeHtml(p.img)}" class="card-img"/>

          <div class="card-body">
            <h4>${escapeHtml(p.nama)}</h4>

            ${
              p.diskon > 0
                ? `
                <span class="old-price">Rp ${formatRp(hargaAsli)}</span><br>
                <span class="price">
                  Rp ${formatRp(hargaDiskon)}
                  <span class="discount-tag">${p.diskon}%</span>
                </span>
              `
                : `<span class="price">Rp ${formatRp(hargaAsli)}</span>`
            }

            <div style="text-align:center; margin-top:10px;">
              <a class="btn btn-primary" href="detail.html?id=${encodeURIComponent(p.id)}">Detail</a>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

/* ===========================================================
 *  DETAIL PRODUK + PROMO + DISKON + MODAL (GANTI WA LINK DENGAN BUTTON "Pesan")
 * =========================================================== */
function loadDetail() {
  const target = document.getElementById("detailContainer");
  if (!target) return;
  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");
  const p = findProductById(id);
  if (!p) {
    target.innerHTML = "<p>Produk tidak ditemukan.</p>";
    return;
  }

  const hargaAsli = parseHarga(p.harga);
  const hargaDiskon = p.diskon > 0 ? hargaAsli - Math.floor(hargaAsli * p.diskon / 100) : hargaAsli;
  p.hargaFinal = hargaDiskon;

  target.innerHTML = `
    <div class="detail" style="position:relative;">
      ${p.diskon > 0 ? `<span class="tag-diskon" style="position:absolute; top:12px; left:12px;">-${p.diskon}%</span>` : ""}
      <img src="${escapeHtml(p.img)}" class="detail-img"/>
      <div class="detail-info">
        <h2>${escapeHtml(p.nama)}</h2>
        ${
          p.diskon > 0
            ? `<div class="old-price">Rp ${formatRp(hargaAsli)}</div>
               <div class="price">
                 Rp ${formatRp(hargaDiskon)}
                 <span class="discount-tag">${p.diskon}%</span>
               </div>`
            : `<div class="price">Rp ${formatRp(hargaAsli)}</div>`
        }

        ${p.diskon > 0 ? `
        <div class="diskon-box" style="margin-top:12px;">
          <label><b>Gunakan Promo?</b></label><br>
          <label><input type="radio" name="useDiskon" value="yes" checked> Ya, pakai promo (${p.diskon}%)</label><br>
          <label><input type="radio" name="useDiskon" value="no"> Tidak pakai promo</label>
        </div>` : ""}

        <p>${escapeHtml(p.deskripsi)}</p>

        <div class="promo-box">
          <div class="promo-title">Kode Promo</div>
          <div class="promo-input">
            <input id="promoInput" placeholder="Masukkan kode promo..." />
            <button id="applyPromo" class="btn">Terapkan</button>
          </div>
          <div id="promoMsg"></div>
        </div>

        <div class="tipe-box" style="margin-top:12px;">
          <label class="label-bold">Pilih Tipe Bunga</label><br>
          <label><input type="radio" name="tipeBunga" value="Asli"> Bunga Asli +Harga</label><br>
          <label><input type="radio" name="tipeBunga" value="Palsu"> Bunga Palsu</label><br>
          <label><input type="radio" name="tipeBunga" value="Campuran"> Bunga Campuran +Harga</label>
        </div>

        <div class="reqBox">
          <div class="req-title">Request Tambahan</div>
          <textarea id="reqInput" placeholder="Tulis request tambahan (opsional)..."></textarea>
        </div>

        <div style="text-align:center; margin-top:12px;">
          <button id="pesanBtn" class="btn btn-primary">Pesan</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("applyPromo").onclick = function () {
    validateAndApplyPromoToProduct(p);
  };

  const reqEl = document.getElementById("reqInput");
  if (reqEl) reqEl.addEventListener("input", () => updateWAButton(p));

  const tipeRadios = document.querySelectorAll('input[name="tipeBunga"]');
  tipeRadios.forEach(r => r.addEventListener("change", () => updateWAButton(p)));

  const diskonRadios = document.querySelectorAll('input[name="useDiskon"]');
  diskonRadios.forEach(r => r.addEventListener("change", () => {
    toggleDiskonAdmin(p);
    clearPromoCountdown();
  }));

  // tombol Pesan -> buka modal
  const pesanBtn = document.getElementById("pesanBtn");
  pesanBtn.addEventListener("click", () => {
    openOrderModal(p);
  });

  updateWAButton(p);
}

/* ===========================================================
 *  TOGGLE DISKON ADMIN + VALIDASI ULANG PROMO
 * =========================================================== */
function toggleDiskonAdmin(product) {
  const use = document.querySelector('input[name="useDiskon"]:checked');
  if (!use) return;

  const hargaAsli = parseHarga(product.harga);
  const hargaDiskon = product.diskon > 0 ? hargaAsli - Math.floor(hargaAsli * product.diskon / 100) : hargaAsli;
  product.hargaFinal = use.value === "yes" ? hargaDiskon : hargaAsli;

  const badge = document.querySelector(".tag-diskon");
  if (badge) badge.style.display = (use.value === "yes" && product.diskon > 0) ? "inline-block" : "none";

  const oldPriceEl = document.querySelector(".old-price");
  if (oldPriceEl) oldPriceEl.style.display = (use.value === "yes" && product.diskon > 0) ? "inline-block" : "none";

  const priceEl = document.querySelector(".price");
  if (priceEl) {
    if (use.value === "yes" && product.diskon > 0)
      priceEl.innerHTML = `Rp ${formatRp(hargaDiskon)} <span class="discount-tag">${product.diskon}%</span>`;
    else
      priceEl.innerHTML = `Rp ${formatRp(hargaAsli)}`;
  }

  if (product.appliedPromo) {
    const promo = findPromoByCode(product.appliedPromo.code);
    const check = validatePromoForProduct(promo, product);
    const msgBox = document.getElementById("promoMsg");
    if (!check.valid) {
      product.appliedPromo = null;
      if (msgBox) msgBox.innerHTML = `<div class="promo-invalid">Promo tidak berlaku untuk harga sekarang.</div>`;
      clearPromoCountdown();
    } else {
      let pot = promo.type === "percent"
        ? Math.floor(product.hargaFinal * promo.value / 100)
        : promo.value;
      if (pot > product.hargaFinal) pot = product.hargaFinal;
      product.appliedPromo.potongan = pot;
      product.appliedPromo.hargaAkhir = product.hargaFinal - pot;
      if (msgBox) msgBox.innerHTML = `
        <div class="promo-valid">
          Promo diterapkan: <b>${promo.code}</b><br>
          Potongan: Rp ${formatRp(pot)}<br>
          Harga akhir: <span class="final-price">Rp ${formatRp(product.appliedPromo.hargaAkhir)}</span>
        </div>`;
      if (promo.expired) startPromoCountdown(promo.expired, product);
    }
  }

  updateWAButton(product);
}

/* ===========================================================
 *  VALIDATE & APPLY PROMO (DENGAN LIMIT & TIMER)
 * =========================================================== */
function validateAndApplyPromoToProduct(product) {
  const input = document.getElementById("promoInput").value.trim().toUpperCase();
  const msgBox = document.getElementById("promoMsg");
  if (!input) {
    if (msgBox) msgBox.innerHTML = `<div class="promo-invalid">Masukkan kode promo.</div>`;
    return;
  }

  const promo = findPromoByCode(input);
  if (!promo) {
    if (msgBox) msgBox.innerHTML = `<div class="promo-invalid">Kode promo tidak ditemukan.</div>`;
    return;
  }

  const check = validatePromoForProduct(promo, product);
  if (!check.valid) {
    if (msgBox) msgBox.innerHTML = `<div class="promo-invalid">${check.msg}</div>`;
    return;
  }

  let pot = promo.type === "percent" ? Math.floor(product.hargaFinal * promo.value / 100) : promo.value;
  if (pot > product.hargaFinal) pot = product.hargaFinal;
  const final = product.hargaFinal - pot;

  product.appliedPromo = { code: promo.code, potongan: pot, hargaAkhir: final };

  if (msgBox) msgBox.innerHTML = `
    <div class="promo-valid">
      Promo diterapkan: <b>${promo.code}</b><br>
      Potongan: Rp ${formatRp(pot)}<br>
      Harga akhir: <span class="final-price">Rp ${formatRp(final)}</span><br>
      <span class="promo-timer" style="color:#ffeb3b; font-weight:bold;"></span>
    </div>
  `;

  // jika promo punya expired, mulai timer
  if (promo.expired) {
    startPromoCountdown(promo.expired, product);
  } else {
    clearPromoCountdown();
  }

  updateWAButton(product);
}

/* ===========================================================
 *  UPDATE WA BUTTON (tetap untuk kompatibilitas; link WA digunakan jika perlu)
 * =========================================================== */
function updateWAButton(product) {
  // tetap update internal WA URL (tidak dipakai langsung di halaman, tetapi aman untuk kompatibilitas)
  const base = product.appliedPromo ? product.appliedPromo.hargaAkhir : product.hargaFinal;
  const reqText = document.getElementById("reqInput") ? document.getElementById("reqInput").value.trim() : "";
  const tipeSel = document.querySelector('input[name="tipeBunga"]:checked');
  const tipeText = tipeSel ? tipeSel.value : "";

  const pesan = `Halo, saya ingin memesan:
- Produk: ${product.nama}
- Kode: ${product.id}
- Harga: Rp ${formatRp(base)}
${product.appliedPromo ? `- Promo: ${product.appliedPromo.code} (potongan Rp ${formatRp(product.appliedPromo.potongan)})` : ""}
${tipeText ? `- Tipe bunga: ${tipeText}` : ""}
${reqText ? `- Request tambahan: ${reqText}` : ""}`;

  // untuk kemudahan debugging kita bisa menyimpan di attribute tombol Pesan (tidak wajib)
  const pesanBtn = document.getElementById("pesanBtn");
  if (pesanBtn) pesanBtn.setAttribute("data-wa-text", pesan);
}

/* ===========================================================
 *  ADMIN AUTH
 * =========================================================== */
function loginAdmin(u, p) {
  if (u === "admin" && p === "admin") {
    localStorage.setItem("adminLogin", "1");
    return true;
  }
  return false;
}
function logoutAdmin() {
  localStorage.removeItem("adminLogin");
}
function isAdminLoggedIn() {
  return localStorage.getItem("adminLogin") === "1";
}

/* ===========================================================
 *  END OF FILE
 * =========================================================== */