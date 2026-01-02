/* ===========================================================
 *  app.js - Sejuk Dekorasi (FULL FINAL + DEFAULT PRODUCTS)
 * =========================================================== */

/* ===========================================================
 *  UTILITAS
 * =========================================================== */
let promoCountdownInterval = null;

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
  return parseInt(num, 10).toLocaleString("id-ID");
}

function parseHarga(h) {
  return parseInt(String(h || "0").replace(/\D/g, ""), 10) || 0;
}

/* ===========================================================
 *  LOCAL STORAGE
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
 *  DEFAULT PRODUCTS (ADMIN TAMBAH DI SINI)
 * =========================================================== */
const DEFAULT_PRODUCTS = [
  {
    id: "D000",
    kode: "D000",
    nama: "Custom",
    kategori: "lainnya",
    harga: "0",
    diskon: 0,
    img: "",
    deskripsi: "Anda dapat mengirim gambar dekor yang anda mau ke admin whatsapp."
  },
];

/* ===========================================================
 *  INIT PRODUCTS (ANTI HILANG)
 * =========================================================== */
function initProducts() {
  const saved = getProducts();

  if (!saved || saved.length === 0) {
    saveProducts(DEFAULT_PRODUCTS);
    return;
  }

  DEFAULT_PRODUCTS.forEach(p => {
    if (!saved.find(x => x.id === p.id)) {
      saved.push(p);
    }
  });

  saveProducts(saved);
}

/* ===========================================================
 *  PRODUCT FUNCTIONS
 * =========================================================== */
function findProductById(id) {
  return getProducts().find(p => p.id === id);
}

function addOrUpdateProduct(p) {
  const list = getProducts();
  const exist = list.find(x => x.id === p.id);
  if (exist) Object.assign(exist, p);
  else list.push(p);
  saveProducts(list);
}

function removeProduct(id) {
  saveProducts(getProducts().filter(p => p.id !== id));
}

/* ===========================================================
 *  PROMO (SINGKAT – TETAP KOMPATIBEL)
 * =========================================================== */
function findPromoByCode(code) {
  return getPromos().find(p => p.code === code);
}

/* ===========================================================
 *  RENDER PREVIEW
 * =========================================================== */
function renderPreview() {
  const target = document.getElementById("previewGrid");
  if (!target) return;

  target.innerHTML = getProducts()
    .slice(0, 6)
    .map(p => {
      const harga = parseHarga(p.harga);
      const diskon = p.diskon > 0 ? harga - harga * p.diskon / 100 : harga;

      return `
      <div class="card">
        ${p.diskon ? `<span class="tag-diskon">-${p.diskon}%</span>` : ""}
        <img src="${p.img}" class="card-img">
        <div class="card-body">
          <h4>${p.nama}</h4>
          <p>${p.kode}</p>
          <div class="price">Rp ${formatRp(diskon)}</div>
          <a href="detail.html?id=${p.id}" class="btn btn-primary">Detail</a>
        </div>
      </div>`;
    })
    .join("");
}

/* ===========================================================
 *  RENDER PRODUCT LIST
 * =========================================================== */
function renderProducts() {
  const target = document.getElementById("produkGrid");
  if (!target) return;

  const list = getProducts();
  if (list.length === 0) {
    target.innerHTML = "<p>Tidak ada produk.</p>";
    return;
  }

  target.innerHTML = list.map(p => {
    const harga = parseHarga(p.harga);
    const diskon = p.diskon > 0 ? harga - harga * p.diskon / 100 : harga;

    return `
    <div class="card">
      ${p.diskon ? `<span class="tag-diskon">-${p.diskon}%</span>` : ""}
      <img src="${p.img}" class="card-img">
      <div class="card-body">
        <h4>${p.nama}</h4>
        <p>${p.kode}</p>
        <div class="price">Rp ${formatRp(diskon)}</div>
        <a href="detail.html?id=${p.id}" class="btn btn-primary">Detail</a>
      </div>
    </div>`;
  }).join("");
}

/* ===========================================================
 *  DETAIL PAGE
 * =========================================================== */
function loadDetail() {
  const target = document.getElementById("detailContainer");
  if (!target) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const p = findProductById(id);

  if (!p) {
    target.innerHTML = "<p>Produk tidak ditemukan.</p>";
    return;
  }

  const harga = parseHarga(p.harga);
  const diskon = p.diskon > 0 ? harga - harga * p.diskon / 100 : harga;

  target.innerHTML = `
    <img src="${p.img}" class="detail-img">
    <h2>${p.nama}</h2>
    <div class="price">Rp ${formatRp(diskon)}</div>
    <p>${p.deskripsi}</p>

    <div class="tipe-box" style="margin-top:12px;">
      <b>Pilih Tipe Bunga</b><br>
      <label><input type="radio" name="tipeBunga" value="Bunga Asli"> Bunga Asli (+harga)</label><br>
      <label><input type="radio" name="tipeBunga" value="Bunga Palsu"> Bunga Palsu</label><br>
      <label><input type="radio" name="tipeBunga" value="Campuran"> Campuran (+harga)</label>
    </div>

    <div class="reqBox" style="margin-top:10px;">
      <b>Request Tambahan</b>
      <textarea id="reqInput" placeholder="Tulis request tambahan (opsional)"></textarea>
    </div>

    <button id="pesanBtn" class="btn btn-primary" style="margin-top:12px;">
      Pesan via WhatsApp
    </button>
  `;

  document.getElementById("pesanBtn").onclick = () => {
    const tipe = document.querySelector('input[name="tipeBunga"]:checked');
    const req = document.getElementById("reqInput").value.trim();

    const pesan = `
Halo, saya ingin memesan:
- Produk: ${p.nama}
- Kode: ${p.id}
- Harga: Rp ${formatRp(diskon)}
${tipe ? `- Tipe bunga: ${tipe.value}` : ""}
${req ? `- Request tambahan: ${req}` : ""}
`.trim();

    window.open(
      `https://wa.me/6281390708425?text=${encodeURIComponent(pesan)}`,
      "_blank"
    );
  };
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
function isAdminLoggedIn() {
  return localStorage.getItem("adminLogin") === "1";
}

/* ===========================================================
 *  INIT APP
 * =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initProducts();
  renderPreview();
  renderProducts();
  loadDetail();
});
