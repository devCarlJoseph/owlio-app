import axios from "axios";
import { API_INTEGRATION_ENABLED } from "./api-mode";

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

api.interceptors.request.use((config) => {
  if (!API_INTEGRATION_ENABLED) {
    return Promise.reject(new Error("API integrations are paused while the UI is being built."));
  }
  return config;
});

export default api;
