// api.js

// ====== CONFIGURATION ======
// Change this when moving between local dev and production
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/auth"


// ====== ENDPOINTS ======
export const endpoints = {
  auth: `${BASE_URL}/auth`,
  dashboard: `${BASE_URL}/dashboard`,
  sales: `${BASE_URL}/sales`,
  inventory: `${BASE_URL}/inventory`,
  customers: `${BASE_URL}/customers`,
  deliveries: `${BASE_URL}/deliveries`,
  suppliers: `${BASE_URL}/suppliers`,
  settings: `${BASE_URL}/settings`,
};

// ====== HELPER: GENERIC API CALL ======
export async function apiRequest(url, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important if you’re handling cookies/auth
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "API request failed");
  }

  return res.json();
}
