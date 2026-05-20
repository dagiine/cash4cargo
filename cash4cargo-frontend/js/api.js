// API base URL — production-д өөрчилнө
export const API_BASE = "http://localhost:3001/api";

/**
 * Fetch wrapper — Authorization header автоматаар нэмнэ
 */
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  login: (phone, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),

  register: (name, phone, password) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, password }),
    }),

  me: () => apiFetch("/auth/me"),

  updatePassword: (currentPassword, newPassword) =>
    apiFetch("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── Shipments ───────────────────────────────────────────────
export const shipmentAPI = {
  // Нэвтэрсэн хэрэглэгчийн БҮГД ачаа (утасны дугаараар автомат)
  myShipments: () => apiFetch("/shipments/my"),

  // Tracking code-оор нэг ачаа хайх (хэн ч хандана)
  trackByCode: (code) => apiFetch(`/shipments/track/${encodeURIComponent(code)}`),

  // Утасны дугаараар хайх (зочин хэрэглэгч)
  trackByPhone: (phone) => apiFetch(`/shipments/by-phone/${encodeURIComponent(phone)}`),

  // Захиалга үүсгэх — token байхгүй бол зочноор, token байвал тухайн хэрэглэгчээр хадгална
  create: (payload) =>
    apiFetch("/shipments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── Session helpers ─────────────────────────────────────────
export function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getSession() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  if (!token || !userStr) return null;
  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSession();
}
