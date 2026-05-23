// ===============================================
// API HELPER ФАЙЛ
// Энэ файл frontend-ээс backend рүү request явуулахад ашиглагдана.
// Бусад JS файлууд fetch() шууд бичихийн оронд энд байгаа function-уудыг дуудна.
// ===============================================

// Backend API-ийн үндсэн зам.
// Жишээ: /api/auth/login, /api/shipments гэх мэт.
const API_BASE = window.API_BASE || "/api";

// ===============================================
// НЭГДСЭН API REQUEST FUNCTION
// path    -> API-ийн зам. Жишээ: "/shipments"
// options -> method, body, auth зэрэг тохиргоо.
// ===============================================
async function apiFetch(path, options = {}) {
  // auth = true бол token явуулна.
  // auth = false бол guest/public request болно.
  const { auth = true, ...fetchOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  // Login хийсэн user/admin-ийн token browser-ийн localStorage-д хадгалагддаг.
  // Guest захиалга, FAQ, tracking дээр token явуулахгүй байж болно.
  const token = localStorage.getItem("c4c_token");

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  // Backend JSON буцаавал уншина. JSON биш бол null гэж үзнэ.
  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  // response.ok биш бол алдааг frontend дээр харуулахын тулд Error үүсгэнэ.
  if (!response.ok) {
    throw new Error(data?.message || `API алдаа: ${response.status}`);
  }

  return data;
}

// ===============================================
// SESSION буюу login хийсэн хэрэглэгчийн мэдээлэл авах
// token + user object хоёрыг localStorage-оос уншина.
// ===============================================
export function getSession() {
  const token = localStorage.getItem("c4c_token");
  const userText = localStorage.getItem("c4c_user");

  if (!token || !userText) return null;

  try {
    return {
      token,
      user: JSON.parse(userText),
    };
  } catch (_) {
    // Хэрвээ localStorage дотор эвдэрсэн data байвал цэвэрлэнэ.
    clearSession();
    return null;
  }
}

// Login амжилттай үед token болон user мэдээллийг browser дээр хадгална.
export function saveSession(token, user) {
  localStorage.setItem("c4c_token", token);
  localStorage.setItem("c4c_user", JSON.stringify(user));
}

// Logout хийх эсвэл token эвдэрсэн үед session цэвэрлэнэ.
export function clearSession() {
  localStorage.removeItem("c4c_token");
  localStorage.removeItem("c4c_user");
  localStorage.removeItem("cash4cargo_admin_token");
}

// User login хийсэн эсэхийг true/false-аар буцаана.
export function isLoggedIn() {
  return !!getSession();
}

// ===============================================
// AUTH API
// Login, register, profile, password update гэх мэт.
// ===============================================
export const authAPI = {
  // Нэвтрэх. Public request учраас auth:false.
  login(phone, password) {
    return apiFetch("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ phone, password }),
    });
  },

  // Шинэ хэрэглэгч бүртгүүлэх.
  register(name, phone, password) {
    return apiFetch("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ name, phone, password }),
    });
  },

  // Одоогийн login хийсэн user-ийн мэдээлэл авах.
  me() {
    return apiFetch("/auth/me");
  },

  // Profile дээр password солих.
  updatePassword(currentPassword, newPassword) {
    return apiFetch("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ===============================================
// SHIPMENT API
// Захиалга үүсгэх, хайх, цуцлах, миний захиалгууд авах.
// ===============================================
export const shipmentAPI = {
  // Guest хэрэглэгч нэвтрэхгүйгээр захиалга үүсгэж болно.
  // Тиймээс auth:false. Ингэснээр 401 Unauthorized гарахгүй.
  create(payload) {
    return apiFetch("/shipments", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });
  },

  // Login хийсэн user өөрийн утсан дээрх захиалгуудыг харна.
  myShipments(sort = "newest") {
    return apiFetch(`/shipments/my?sort=${encodeURIComponent(sort)}`);
  },

  // Login хийсэн user зөвшөөрөгдсөн төлөв дээр захиалгаа цуцална.
  cancel(id) {
    return apiFetch(`/shipments/${encodeURIComponent(id)}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ description: "Хэрэглэгч захиалгаа цуцалсан" }),
    });
  },

  // Guest tracking: track code-оор хайна.
  trackByCode(code) {
    return apiFetch(`/shipments/track/${encodeURIComponent(code)}`, {
      auth: false,
    });
  },

  // Guest tracking: утасны дугаараар хайна.
  trackByPhone(phone) {
    return apiFetch(`/shipments/by-phone/${encodeURIComponent(phone)}`, {
      auth: false,
    });
  },
};

// ===============================================
// FAQ API
// User талд public байдлаар FAQ уншина.
// ===============================================
export const faqAPI = {
  list() {
    return apiFetch("/faqs", { auth: false });
  },

  // FAQ ангиллуудыг public байдлаар уншина.
  categories() {
    return apiFetch("/faqs/categories", { auth: false });
  },
};
