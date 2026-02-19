import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export default API;
