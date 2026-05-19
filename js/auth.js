// js/auth.js
// Нэвтрэх / гарах / хэрэглэгч хадгалах логик

// ── Хэрэглэгчийн өгөгдөл (localStorage) ──
const USERS_KEY   = "c4c_users";    // бүртгэлтэй хэрэглэгчид
const SESSION_KEY = "c4c_session";  // одоогийн нэвтэрсэн хэрэглэгч

// ── Бүх хэрэглэгчийг авах ──
export function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Нэг хэрэглэгч хадгалах (шинэ бүртгэл) ──
export function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Хэрэглэгч шинэчлэх (профайл засах) ──
export function updateUser(updatedUser) {
  const users = getUsers().map(function(u) {
    return u.id === updatedUser.id ? updatedUser : u;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Session-г ч шинэчлэнэ
  const session = getSession();
  if (session && session.id === updatedUser.id) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  }
}

// ── Одоогийн session авах ──
export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── Session хадгалах (нэвтрэх) ──
export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// ── Session устгах (гарах) ──
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Нэвтрэх шалгалт ──
export function login(identifier, password) {
  const users = getUsers();

  // identifier = утасны дугаар эсвэл имэйл
  const user = users.find(function(u) {
    return (u.phone === identifier || u.email === identifier) && u.password === password;
  });

  if (user) {
    setSession(user);
    return { ok: true, user };
  }
  return { ok: false, error: "Нууц үг эсвэл дугаар буруу байна" };
}

// ── Бүртгэх ──
export function register(name, identifier, password) {
  const users = getUsers();

  // Давхардал шалгах
  const exists = users.find(function(u) {
    return u.phone === identifier || u.email === identifier;
  });

  if (exists) {
    return { ok: false, error: "Энэ дугаар/имэйлээр аль хэдийн бүртгэлтэй байна" };
  }

  // Шинэ хэрэглэгч үүсгэх
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const newUser = {
    id:       Date.now(),
    name:     name,
    phone:    isEmail ? "" : identifier,
    email:    isEmail ? identifier : "",
    password: password,
    address:  "",
    createdAt: new Date().toLocaleDateString("mn-MN"),
  };

  saveUser(newUser);
  setSession(newUser);
  return { ok: true, user: newUser };
}

// ── Захиалгын history хадгалах ──
const ORDERS_KEY = "c4c_orders";

export function getUserOrders(userId) {
  const raw = localStorage.getItem(ORDERS_KEY);
  const all  = raw ? JSON.parse(raw) : [];
  return all.filter(function(o) { return o.userId === userId; });
}

export function saveOrder(userId, order) {
  const raw = localStorage.getItem(ORDERS_KEY);
  const all = raw ? JSON.parse(raw) : [];
  all.push({ ...order, userId, id: Date.now(), createdAt: new Date().toLocaleDateString("mn-MN") });
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
}