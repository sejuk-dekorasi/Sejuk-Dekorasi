/* ===========================================================
 *  STYLE NOTIF & POPUP (INJECT — TAMBAHAN)
 * =========================================================== */
(function () {
  const style = document.createElement("style");
  style.innerHTML = `
    .notif-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    }

    .notif-box {
      width: 90%;
      max-width: 420px;
      padding: 20px;
      border-radius: 18px;
      color: #fff;
      background: linear-gradient(
        135deg,
        rgba(128,0,255,.45),
        rgba(0,120,255,.45),
        rgba(255,0,120,.45)
      );
      box-shadow: 0 20px 50px rgba(0,0,0,.5);
      animation: notifFade .25s ease;
    }

    .notif-box h3 {
      margin-top: 0;
    }

    .notif-box pre {
      background: rgba(0,0,0,.25);
      padding: 12px;
      border-radius: 12px;
      font-size: 13px;
      white-space: pre-wrap;
    }

    .notif-actions {
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }

    .notif-actions button {
      flex: 1;
      padding: 10px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      font-weight: bold;
      color: #fff;
      background: linear-gradient(
        135deg,
        rgba(0,120,255,.9),
        rgba(255,0,120,.9)
      );
    }

    .notif-actions .cancel {
      background: rgba(255,255,255,.25);
    }

    #tanggalAcara,
    #lokasiAcara {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      outline: none;
      color: #fff;
      background: linear-gradient(
        135deg,
        rgba(128,0,255,.4),
        rgba(0,120,255,.4),
        rgba(255,0,120,.4)
      );
      box-shadow: 0 8px 20px rgba(128,0,255,.35);
      margin-top: 6px;
    }

    @keyframes notifFade {
      from { opacity:0; transform:scale(.9); }
      to { opacity:1; transform:scale(1); }
    }
  `;
  document.head.appendChild(style);
})();

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

function parseHarga(h) {
  return parseInt(String(h || "0").replace(/\D/g, ""), 10) || 0;
}

/* ===========================================================
 *  POPUP & NOTIF
 * =========================================================== */
function showNotif(message) {
  const o = document.createElement("div");
  o.className = "notif-overlay";
  o.innerHTML = `
    <div class="notif-box">
      <h3>Perhatian</h3>
      <p>${message}</p>
      <div class="notif-actions">
        <button onclick="this.closest('.notif-overlay').remove()">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(o);
}

function showConfirm(text, onYes) {
  const o = document.createElement("div");
  o.className = "notif-overlay";
  o.innerHTML = `
    <div class="notif-box">
      <h3>Konfirmasi Pesan</h3>
      <pre>${escapeHtml(text)}</pre>
      <div class="notif-actions">
        <button id="ya">Kirim WhatsApp</button>
        <button class="cancel">Batal</button>
      </div>
    </div>
  `;
  document.body.appendChild(o);

  o.querySelector("#ya").onclick = () => {
    o.remove();
    onYes();
  };
  o.querySelector(".cancel").onclick = () => o.remove();
}

/* ===========================================================
 *  DATA PRODUK
 * =========================================================== */
const DEFAULT_PRODUCTS = [
  {
    id: "D000",
    kode: "D000",
    nama: "Custom",
    kategori: "lainnya",
    harga: "0",
    img: "custom.png",
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

    return (!keyword || nama.includes(keyword) || kode.includes(keyword)) &&
           (!kategori || kat === kategori);
  });
}

/* ===========================================================
 *  RENDER PREVIEW
 * =========================================================== */
function renderPreview() {
  const target = document.getElementById("previewGrid");
  if (!target) return;

  target.innerHTML = DEFAULT_PRODUCTS.map(p => `
    <div class="card">
      <img src="${p.img}" class="card-img">
      <div class="card-body">
        <h4>${escapeHtml(p.nama)}</h4>
        <p>${escapeHtml(p.kode)}</p>
        <div class="btn-wrap">
          <a href="detail.html?id=${p.id}" class="btn btn-primary">Detail</a>
          <a target="_blank"
            href="https://wa.me/6281390708425?text=Halo%20Admin,%20saya%20ingin%20bertanya%20tentang%20produk%20${encodeURIComponent(p.nama)}%20(${p.kode})"
            class="btn btn-primary">💬 Chat Admin</a>
        </div>
      </div>
    </div>
  `).join("");
}

/* ===========================================================
 *  RENDER LIST
 * =========================================================== */
function renderProducts() {
  const target = document.getElementById("produkGrid");
  if (!target) return;

  const list = getFilteredProducts();
  if (!list.length) {
    target.innerHTML = "<p>Tidak ada produk.</p>";
    return;
  }

  target.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.img}" class="card-img">
      <div class="card-body">
        <h4>${escapeHtml(p.nama)}</h4>
        <p>${escapeHtml(p.kode)}</p>
        <div class="btn-wrap">
          <a href="detail.html?id=${p.id}" class="btn btn-primary">Detail</a>
          <a target="_blank"
            href="https://wa.me/6281390708425?text=Halo%20Admin,%20saya%20ingin%20bertanya%20tentang%20produk%20${encodeURIComponent(p.nama)}%20(${p.kode})"
            class="btn btn-primary">💬 Chat Admin</a>
        </div>
      </div>
    </div>
  `).join("");
}

/* ===========================================================
 *  DETAIL PAGE + TANGGAL + LOKASI
 * =========================================================== */
function loadDetail() {
  const target = document.getElementById("detailContainer");
  if (!target) return;

  const id = new URLSearchParams(location.search).get("id");
  const p = DEFAULT_PRODUCTS.find(x => x.id === id);
  if (!p) return;

  target.innerHTML = `
    <img src="${p.img}" class="detail-img">
    <h2>${escapeHtml(p.nama)}</h2>
    <p>${escapeHtml(p.deskripsi)}</p>

    <b>Pilih Tipe Bunga</b><br>
    <label><input type="radio" name="tipe" value="Bunga Asli"> Bunga Asli</label><br>
    <label><input type="radio" name="tipe" value="Bunga Palsu"> Bunga Palsu</label><br>
    <label><input type="radio" name="tipe" value="Campuran"> Campuran</label><br><br>

    <b>Tanggal Acara</b>
    <input type="date" id="tanggalAcara">

    <b>Lokasi Acara</b>
    <input type="text" id="lokasiAcara" placeholder="Contoh: Bekasi – Gedung Serbaguna">

    <textarea id="reqInput" placeholder="Request tambahan (opsional)"></textarea><br>

    <button id="pesanBtn" class="btn btn-primary">Sepakati Harga</button>
  `;

  document.getElementById("pesanBtn").onclick = () => {
    const tipe = document.querySelector('input[name="tipe"]:checked');
    if (!tipe) return showNotif("Pilih tipe bunga dulu");

    const tanggal = document.getElementById("tanggalAcara").value;
    if (!tanggal) return showNotif("Pilih tanggal acara dulu");

    const lokasi = document.getElementById("lokasiAcara").value.trim();
    if (!lokasi) return showNotif("Isi lokasi acara dulu");

    const req = document.getElementById("reqInput").value.trim();

    const preview = `
Produk   : ${p.nama}
Kode     : ${p.kode}
Tipe     : ${tipe.value}
Tanggal  : ${tanggal}
Lokasi   : ${lokasi}
${req ? `Request : ${req}` : ""}

Mohon untuk memberikan harga terbaik,
agar bisa kita sepakati bersama.
    `.trim();

    showConfirm(preview, () => {
      let pesan = "Halo Admin,%0A";
      pesan += `Saya menginginkan:%0A`;
      pesan += `Produk: ${p.nama}%0A`;
      pesan += `Kode: ${p.kode}%0A`;
      pesan += `Tipe: ${tipe.value}%0A`;
      pesan += `Tanggal: ${tanggal}%0A`;
      pesan += `Lokasi: ${lokasi}%0A`;
      if (req) pesan += `Request: ${req}%0A`;
      pesan += `%0AMohon harga terbaik agar bisa kita sepakati.%0ATerima kasih`;
      window.open(`https://wa.me/6281390708425?text=${pesan}`, "_blank");
    });
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
