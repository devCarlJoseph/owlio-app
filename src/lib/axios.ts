import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:7000").replace(/\/$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default api;
