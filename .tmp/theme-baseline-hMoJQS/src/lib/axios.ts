import axios from "axios";

function getApiBaseUrl() {
  // Production cookies stay on the website's origin, including on iOS.
  // vercel.json forwards /api to Render before the SPA fallback.
  const configuredUrl = import.meta.env.PROD
    ? window.location.origin
    : import.meta.env.VITE_API_URL || "http://localhost:7000";
  const apiUrl = new URL(configuredUrl);
  if (!["http:", "https:"].includes(apiUrl.protocol) || apiUrl.username || apiUrl.password
    || apiUrl.pathname !== "/" || apiUrl.search || apiUrl.hash) {
    throw new Error("VITE_API_URL must be the public HTTP(S) API origin, without /api/v1 or credentials.");
  }
  return apiUrl.origin;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default api;
