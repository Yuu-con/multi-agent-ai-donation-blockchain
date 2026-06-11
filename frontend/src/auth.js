const USERS = {
  admin: { password: "admin123", role: "admin", name: "Admin" },
  customer: { password: "customer123", role: "customer", name: "Customer" },
};

const STORAGE_KEY = "donation_ai_user";

export function authenticate(username, password) {
  const normalized = username.trim().toLowerCase();
  const user = USERS[normalized];
  if (!user || user.password !== password) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng.");
  }
  return { username: normalized, role: user.role, name: user.name };
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}
