/* ============================================================
   AUTH SYSTEM – Sejuk Dekorasi
   CLEAN VERSION (NO FUNCTION COLLISION)
   =====================================
   Berisi:
   1. Sistem Login User (email/username)
   2. Sistem Login Admin Versi 1 (Admin#1234)
   3. Sistem Login Admin Versi 2 (admin / 123)
   ============================================================ */


/* ============================================================
   ==========  SYSTEM A – USER AUTH + ADMIN V1  =================
   ============================================================ */

const ADMIN_CREDENTIALS = { 
  username: "Hanifan Abhinaya", 
  password: "Admin#1234", 
  role: "admin" 
};

function _getUsers(){
  try { 
    return JSON.parse(localStorage.getItem('sd_users') || '[]'); 
  }
  catch(e){ 
    return []; 
  }
}

function _setUsers(u){ 
  localStorage.setItem('sd_users', JSON.stringify(u)); 
}

// Pastikan admin exists
(function ensureAdmin(){
  const users = _getUsers();
  const found = users.find(x => x.username === ADMIN_CREDENTIALS.username && x.role === 'admin');
  if(!found){
    users.push(ADMIN_CREDENTIALS);
    _setUsers(users);
  }
})();

// Daftar user
function signUp(name, email, password){
  if(!name || !email || !password) return 'Isi semua field';

  const users = _getUsers();
  if(users.find(u => u.username === email)) 
    return 'Email sudah terdaftar';

  users.push({ username: email, password, name, role: 'user' });
  _setUsers(users);
  return true;
}

// Login user / admin V1
function signIn(username, password){
  const users = _getUsers();
  const u = users.find(x =>
    (x.username === username || x.email === username) &&
     x.password === password
  );
  if(!u) return 'Username atau password salah';

  // Simpan session
  localStorage.setItem(
    'sd_session',
    JSON.stringify({ username: u.username, role: u.role, name: u.name || u.username })
  );

  return u.role === 'admin' ? 'admin' : 'user';
}

function signOut(){
  localStorage.removeItem('sd_session');
}

function getSession(){
  return JSON.parse(localStorage.getItem('sd_session') || 'null');
}

// Admin V1 (Admin#1234)
function isAdminLoggedIn_v1(){
  const s = getSession();
  return s && s.role === 'admin' && s.username === ADMIN_CREDENTIALS.username;
}



/* ============================================================
   ==========  SYSTEM B – SEJUK ADMIN AUTH V2  ==================
   ============================================================ */

const ADMIN_USER_V2 = "admin";
const ADMIN_PASS_V2 = "123";

// Login Admin v2
function loginAdmin_v2(u, p) {
  if (u === ADMIN_USER_V2 && p === ADMIN_PASS_V2) {
    localStorage.setItem("sejuk_isAdmin", "1");
    return true;
  }
  return false;
}

// Cek Admin v2
function isAdminLoggedIn_v2() {
  return localStorage.getItem("sejuk_isAdmin") === "1";
}

// Logout Admin v2
function logoutAdmin_v2() {
  localStorage.removeItem("sejuk_isAdmin");
}



/* ============================================================
   EXPORT (untuk dipanggil dari halaman lain)
   ============================================================ */

window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.getSession = getSession;

window.isAdminLoggedIn_v1 = isAdminLoggedIn_v1;

window.loginAdmin_v2 = loginAdmin_v2;
window.isAdminLoggedIn_v2 = isAdminLoggedIn_v2;
window.logoutAdmin_v2 = logoutAdmin_v2;