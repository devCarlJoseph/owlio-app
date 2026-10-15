import axios from "axios";

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL || "http://localhost:7000";
  const testHost = /^127\.0\.0\.[1-5]$/.test(window.location.hostname);
  if (!testHost) return configuredUrl.replace(/\/$/, "");

  const apiUrl = new URL(configuredUrl);
  if (apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1") {
    apiUrl.hostname = window.location.hostname;
  }
  return apiUrl.toString().replace(/\/$/, "");
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default api;
