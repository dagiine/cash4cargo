const API_BASE = window.API_BASE || "/api";

async function apiFetch(path, options = {}) {
  const { auth = true, ...fetchOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  // Guest actions must not send old/broken tokens.
  const token = localStorage.getItem("c4c_token");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `API алдаа: ${response.status}`);
  }

  return data;
}

export function getSession() {
  const token = localStorage.getItem("c4c_token");
  const userText = localStorage.getItem("c4c_user");
  if (!token || !userText) return null;

  try {
    return { token, user: JSON.parse(userText) };
  } catch (_) {
    clearSession();
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem("c4c_token", token);
  localStorage.setItem("c4c_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("c4c_token");
  localStorage.removeItem("c4c_user");
  localStorage.removeItem("cash4cargo_admin_token");
}

export function isLoggedIn() {
  return !!getSession();
}

export const authAPI = {
  login(phone, password) {
    return apiFetch("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ phone, password }),
    });
  },

  register(name, phone, password) {
    return apiFetch("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ name, phone, password }),
    });
  },

  me() {
    return apiFetch("/auth/me");
  },

  updatePassword(currentPassword, newPassword) {
    return apiFetch("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

export const shipmentAPI = {
  create(payload) {
    // Guest order must stay public. Backend optionalAuth will still accept logged-in info if needed,
    // but frontend intentionally does not send token to avoid 401 for guest order creation.
    return apiFetch("/shipments", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });
  },

  myShipments(sort = "newest") {
    return apiFetch(`/shipments/my?sort=${encodeURIComponent(sort)}`);
  },

  trackByCode(code) {
    return apiFetch(`/shipments/track/${encodeURIComponent(code)}`, { auth: false });
  },

  trackByPhone(phone) {
    return apiFetch(`/shipments/by-phone/${encodeURIComponent(phone)}`, { auth: false });
  },
};

export const faqAPI = {
  list() {
    return apiFetch("/faqs", { auth: false });
  },
};
