import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_KEY = "jwt_token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized (401). Possible invalid token or session:",
        error.response.data
      );
      Cookies.remove(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
