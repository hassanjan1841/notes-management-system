import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie

const TOKEN_KEY = "jwt_token"; // Must be the same key used in authService

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api", // Use Vite env var
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // Not strictly needed if sending token via Authorization header
});

// Request interceptor to add the token to headers
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

// Response interceptor for global error handling (e.g., 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized (401). Possible invalid token or session:",
        error.response.data
      );
      // If a 401 occurs, it might mean the token is invalid or expired.
      // The AuthContext's fetchCurrentUser will handle user state updates (setting user to null).
      // We could also explicitly remove the cookie here if the 401 implies the token is definitely bad.
      // Cookies.remove(TOKEN_KEY);
      // However, AuthContext.logout() also calls Cookies.remove.
      // Global logout navigation or specific 401 handling can be done in AuthContext or ProtectedRoute.
    }
    return Promise.reject(error);
  }
);

export default apiClient;
