/* ===========================================================
 *  UTILITAS
 * =========================================================== */
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
  return parseInt(num || 0, 10).toLocaleString("id-ID");
}

function parseHarga(h) {
  return parseInt(String(h || "0").replace(/\D/g, ""), 10) || 0;
}

/* ===========================================================
 *  DEFAULT PRODUCTS (SATU-SATUNYA SUMBER DATA)
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
  }
];

/* ===========================================================
 *  SEARCH & FILTER
 * =========================================================== */
function getFilteredProducts() {
  const keyword =
    (document.getElementById("searchBox")?.value || "")
      .toLowerCase()
      .trim();

  const kategori =
    (document.getElementById("categoryFilter")?.value || "")
      .toLowerCase();

  return DEFAULT_PRODUCTS.filter(p => {
    const nama = String(p.nama || "").toLowerCase();
    const kode = String(p.kode || "").toLowerCase();
    const kat  = String(p.kategori || "").toLowerCase();

    const matchKeyword =
      !keyword || nama.includes(keyword) || kode.includes(keyword);

    const matchKategori =
      !kategori || kat === kategori;

    return matchKeyword && matchKategori;
  });
}

/* ===========================================================
 *  RENDER PREVIEW (HOME)
 * =========================================================== */
function renderPreview() {
  const target = document.getElementById("previewGrid");
  if (!target) return;

  target.innerHTML = DEFAULT_PRODUCTS.slice(0, 6).map(p => {
    const harga = parseHarga(p.harga);
    const finalHarga = p.diskon
      ? Math.round(harga - harga * p.diskon / 100)
      : harga;

    return `
    <div class="card">

      <img src="${p.img || "img/no-image.png"}" class="card-img">

      <div class="card-body">
        <h4>${escapeHtml(p.nama)}</h4>
        <p>${escapeHtml(p.kode)}</p>
        <div class="price">Rp ${formatRp(finalHarga)}</div>

        <div class="btn-wrap">
          <a href="detail.html?id=${p.id}" class="btn btn-primary">Detail</a>
          <a
            href="https://wa.me/6281390708425?text=Halo%20Admin,%20saya%20ingin%20bertanya%20tentang%20produk%20${encodeURIComponent(p.nama)}%20(${p.kode})"
            target="_blank"
            class="btn btn-primary"
          >
            💬 Chat Admin
          </a>
        </div>
      </div>
    </div>`;
  }).join("");
}

/* ===========================================================
 *  RENDER PRODUCT LIST
 * =========================================================== */
function renderProducts() {
  const target = document.getElementById("produkGrid");
  if (!target) return;

  const list = getFilteredProducts();

  if (list.length === 0) {
    target.innerHTML = "<p>Tidak ada produk.</p>";
    return;
  }

  target.innerHTML = list.map(p => {
    const harga = parseHarga(p.harga);
    const finalHarga = p.diskon
      ? Math.round(harga - harga * p.diskon / 100)
      : harga;

    return `
    <div class="card">
      <img src="${p.img || "img/no-image.png"}" class="card-img">

      <div class="card-body">
        <h4>${escapeHtml(p.nama)}</h4>
        <p>${escapeHtml(p.kode)}</p>
        <div class="price">Rp ${formatRp(finalHarga)}</div>

        <div class="btn-wrap">
          <a href="detail.html?id=${p.id}" class="btn btn-primary">Detail</a>

          <a
            href="https://wa.me/6281390708425?text=Halo%20Admin,%20saya%20ingin%20bertanya%20tentang%20produk%20${encodeURIComponent(p.nama)}%20(${p.kode})"
            target="_blank"
            class="btn btn-primary"
          >
            💬 Chat Admin
          </a>
        </div>
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
  const p = DEFAULT_PRODUCTS.find(x => x.id === id);

  if (!p) {
    target.innerHTML = "<p>Produk tidak ditemukan.</p>";
    return;
  }

  const harga = parseHarga(p.harga);
  const hargaFinal = p.diskon
    ? Math.round(harga - harga * p.diskon / 100)
    : harga;

  target.innerHTML = `
    <img src="${p.img || "img/no-image.png"}" class="detail-img">
    <h2>${escapeHtml(p.nama)}</h2>
    <div class="price">Rp ${formatRp(hargaFinal)}</div>
    <p>${escapeHtml(p.deskripsi)}</p>

    <b>Pilih Tipe Bunga</b><br>
    <label><input type="radio" name="tipe" value="Bunga Asli"> Bunga Asli (+harga)</label><br>
    <label><input type="radio" name="tipe" value="Bunga Palsu"> Bunga Palsu </label><br>
    <label><input type="radio" name="tipe" value="Campuran"> Campuran (+harga)</label><br><br>

    <textarea id="reqInput" placeholder="Request tambahan (opsional)"></textarea><br><br>

    <button id="pesanBtn" class="btn btn-primary">Pesan via WhatsApp</button>
  `;

  document.getElementById("pesanBtn").onclick = () => {
    const tipe = document.querySelector('input[name="tipe"]:checked');
    if (!tipe) return alert("Pilih tipe bunga dulu");

    const req = document.getElementById("reqInput").value.trim();

    let pesan = "Halo, saya ingin memesan:%0A";
    pesan += `- Produk: ${p.nama}%0A`;
    pesan += `- Kode: ${p.kode}%0A`;
    pesan += `- Harga: Rp ${formatRp(hargaFinal)}%0A`;
    pesan += `- Tipe: ${tipe.value}`;
    if (req) pesan += `%0A- Request: ${req}`;

    window.open(
      `https://wa.me/6281390708425?text=${pesan}`,
      "_blank"
    );
  };
}

/* ===========================================================
 *  INIT
 * =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderPreview();
  renderProducts();
  loadDetail();

  document.getElementById("searchBox")?.addEventListener("input", renderProducts);
  document.getElementById("categoryFilter")?.addEventListener("change", renderProducts);
});
