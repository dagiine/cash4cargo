// js/auth.js
// Нэвтрэх / гарах / хэрэглэгч хадгалах логик

const USERS_KEY   = "c4c_users";
const SESSION_KEY = "c4c_session";
const ORDERS_KEY  = "c4c_orders";

// ── Бүх хэрэглэгч ──
export function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

// ── Session авах ──
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

// ── Session хадгалах ──
export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// ── Session устгах ──
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Хэрэглэгч шинэчлэх ──
export function updateUser(updatedUser) {
  var users = getUsers().map(function(u) {
    return u.id === updatedUser.id ? updatedUser : u;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Session-г ч шинэчлэнэ
  var session = getSession();
  if (session && session.id === updatedUser.id) {
    setSession(updatedUser);
  }
}

// ── Нэвтрэх ──
export function login(identifier, password) {
  var users = getUsers();
  var user  = users.find(function(u) {
    return (u.phone === identifier || u.email === identifier) && u.password === password;
  });

  if (user) { setSession(user); return { ok: true, user: user }; }
  return { ok: false, error: "Нууц үг эсвэл дугаар буруу байна" };
}

// ── Бүртгэх ──
export function register(name, identifier, password) {
  var users = getUsers();

  var exists = users.find(function(u) {
    return u.phone === identifier || u.email === identifier;
  });
  if (exists) return { ok: false, error: "Энэ дугаар/имэйлээр аль хэдийн бүртгэлтэй" };

  var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  var newUser = {
    id:        Date.now(),
    name:      name,
    phone:     isEmail ? "" : identifier,
    email:     isEmail ? identifier : "",
    password:  password,
    address:   "",
    createdAt: new Date().toLocaleDateString("mn-MN"),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  setSession(newUser);
  return { ok: true, user: newUser };
}

// ── Захиалга хадгалах ──
// status: "Захиалга үүсгэсэн" — анхны статус
export function saveOrder(userId, order) {
  var all = [];
  try { all = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); } catch {}

  var newOrder = Object.assign({}, order, {
    userId:    userId,
    id:        Date.now(),
    status:    "Захиалга үүсгэсэн",
    statusHistory: [
      { status: "Захиалга үүсгэсэн", date: new Date().toLocaleString("mn-MN") }
    ],
    createdAt: new Date().toLocaleDateString("mn-MN"),
  });

  all.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  return newOrder;
}

// ── Нэг хэрэглэгчийн захиалгууд ──
export function getUserOrders(userId) {
  try {
    var all = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return all.filter(function(o) { return o.userId === userId; });
  } catch { return []; }
}