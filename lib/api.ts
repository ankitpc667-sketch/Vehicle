/**
 * Centralized API helper for the Car Rental frontend.
 * Automatically attaches the JWT token from localStorage to every request.
 * Also manages cookies so Next.js middleware can do route protection.
 */

const API_BASE = ""; // same domain when deployed

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",   // always send cookies alongside the Authorization header
  });

  return response;
}

/**
 * Call after a successful login / register.
 * Stores token + role in both localStorage and an HTTP cookie
 * so that Next.js middleware can read them for route protection.
 */
export function setAuthCookies(token: string, role: string, user: object) {
  localStorage.setItem("token", token);
  localStorage.setItem("userRole", role);
  localStorage.setItem("user", JSON.stringify(user));

  // 7-day expiry to match JWT
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `token=${token}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `userRole=${role}; path=/; expires=${expires}; SameSite=Lax`;
}

/**
 * Call on logout — clears both localStorage and cookies.
 */
export function clearAuthCookies() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("user");

  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export const api = {
  get: (path: string) => apiFetch(path, { method: "GET" }),
  post: (path: string, body: unknown) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) =>
    apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: "DELETE" }),
  patch: (path: string, body: unknown) =>
    apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
};
