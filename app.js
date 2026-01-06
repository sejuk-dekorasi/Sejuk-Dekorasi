function getNamaUser() {
  return localStorage.getItem("namaUser") || "";
}

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
    id: "SJ00",
    kode: "SJ00",
    nama: "Custom",
    kategori: "lainnya",
    harga: "0",
    img: "custom.png",
    deskripsi: `
<b>Anda dapat memberikan gambar dekorasi kepada admin</b><br>
<br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ01",
    kode: "SJ01",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj01.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ02",
    kode: "SJ012",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj02.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ03",
    kode: "SJ03",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj03.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ04",
    kode: "SJ04",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj04.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ04",
    kode: "SJ04",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj04.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ05",
    kode: "SJ05",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj05.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ06",
    kode: "SJ06",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj06.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ07",
    kode: "SJ07",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj07.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
  {
    id: "SJ08",
    kode: "SJ08",
    nama: "Dekorasi Pernikahan",
    kategori: "pernikahan",
    harga: "0",
    img: "sj08.png",
    deskripsi: `
<b>ITEM :</b>
<ol>
  <li>Backdrop pelaminan 6m</li>
  <li>Set kursi pelaminan</li>
  <li>Welcome gate</li>
  <li>Welcome sign</li>
  <li>Mini garden</li>
  <li>Standing flower</li>
  <li>Karpet jalan</li>
  <li>Lighting standar dekor</li>
  <li>Fresh flower + artificial</li>
</ol>

<b><strong>FREE</strong> :</b>
<ol>
  <li>Kain backdrop pelaminan</li>
  <li>Karpet pelaminan</li>
  <li>Kain cover meja kado</li>
</ol>

<b>DEKORASI MODERN</b><br>
<b>Price List :</b><br>
Dekorasi Akad + Resepsi<br>
di RUMAH<br><br>
<b>NOTED :<b>
<ol>
<li>Pemesanan wajib DP.
<li>Pembatalan pemesanan sepihak dari customer,dp dianggap hangus.</li>
<li>Bersedia di up di socialmedia.</li>
<li>Tambahan biaya jika jarak lebih dari 3km</li>
</ol>`
  },
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
            href="https://wa.me/6285229128758?text=Halo%20Admin,%20saya%20ingin%20bertanya%20tentang%20produk%20${encodeURIComponent(p.nama)}%20(${p.kode})"
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
            href="https://wa.me/6285229128758?text=Halo%20Admin,%20saya%20ingin%20bertanya%20tentang%20produk%20${encodeURIComponent(p.nama)}%20(${p.kode})"
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
  if (!id) {
    target.innerHTML = "<p>Produk tidak ditemukan</p>";
    return;
  }

  const p = DEFAULT_PRODUCTS.find(x => x.id === id);
  if (!p) {
    target.innerHTML = "<p>Produk tidak ditemukan</p>";
    return;
  }

  target.innerHTML = `
    <img src="${p.img}" class="detail-img">
    <h2>${escapeHtml(p.nama)}</h2>

    <div class="deskripsi-produk">${p.deskripsi}</div>

    <div class="tipe-bunga">
      <b>Pilih Tipe Bunga</b><br>
      <label><input type="radio" name="tipe" value="Bunga Asli" checked> Bunga Asli</label><br>
      <label><input type="radio" name="tipe" value="Bunga Palsu"> Bunga Palsu</label><br>
      <label><input type="radio" name="tipe" value="Campuran"> Campuran</label>
    </div>

    <div class="item-tambahan">
      <b>Item Tambahan</b><br>
      <label class="item-box">
        <input type="checkbox" name="itemTambahan" value="Kembar Mayang - Rp 250.000">
        <span>Kembar Mayang</span>
      </label><br>
      <label class="item-box">
        <input type="checkbox" name="itemTambahan" value="Meja & Kursi Ijab - Rp 150.000">
        <span>Meja & Kursi Ijab</span>
      </label><br>
      <label class="item-box">
        <input type="checkbox" name="itemTambahan" value="Kain Cover Backdrop - Rp 20.000/m">
        <span>Kain Cover Backdrop</span>
      </label><br>
      <label class="item-box">
        <input type="checkbox" name="itemTambahan" value="Plafon Pelaminan - Tergantung Model">
        <span>Plafon Pelaminan</span>
      </label>
    </div>

    <b>Tanggal Acara</b>
    <input type="date" id="tanggalAcara">

    <b>Lokasi Acara</b>
    <input type="text" id="lokasiAcara" placeholder="Klik peta untuk menentukan lokasi atau letakkan link GMAPS anda">

    <div id="map" style="height:300px;margin-top:10px;border-radius:12px"></div>

    <textarea id="reqInput" placeholder="Request tambahan (opsional)"></textarea><br>

    <button id="pesanBtn" class="btn btn-primary">Sepakati Harga</button>
  `;

  // batas tanggal hari ini
  document.getElementById("tanggalAcara").min =
    new Date().toISOString().split("T")[0];

  /* ================= MAP PICKER ================= */
  const map = L.map("map").setView([-6.2, 106.8], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  let marker = null;

  map.on("click", e => {
    const { lat, lng } = e.latlng;

    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
    }

    document.getElementById("lokasiAcara").value =
      `https://www.google.com/maps?q=${lat},${lng}`;
  });

  /* ================= KIRIM WA ================= */
  document.getElementById("pesanBtn").onclick = () => {
    const tipe = document.querySelector('input[name="tipe"]:checked');
    if (!tipe) return showNotif("Pilih tipe bunga");

    const tanggal = document.getElementById("tanggalAcara").value;
    if (!tanggal) return showNotif("Pilih tanggal acara");

    const lokasi = document.getElementById("lokasiAcara").value.trim();
    if (!lokasi) return showNotif("Tentukan lokasi di peta");

    const req = document.getElementById("reqInput").value.trim();

    const items = [...document.querySelectorAll('input[name="itemTambahan"]:checked')]
      .map(i => i.value);

    const pesan = encodeURIComponent(
`Halo Admin,

Nama Pelanggan : ${getNamaUser()}

Produk  : ${p.nama}
Kode    : ${p.kode}
Tipe    : ${tipe.value}
Tanggal : ${tanggal}
Lokasi  : ${lokasi}

${items.length ? "Item Tambahan:\n- " + items.join("\n- ") + "\n" : ""}
${req ? "Request: " + req + "\n" : ""}
Mohon harga terbaik agar bisa kita sepakati.
Terima kasih`
    );


window.open(`https://wa.me/6285229128758?text=${pesan}`, "_blank");
    };
  };


/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  renderPreview();
  renderProducts();
  loadDetail();
});
