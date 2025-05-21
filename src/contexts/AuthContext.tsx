import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import apiClient from "../services/api"; // Import your configured apiClient
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getToken,
} from "../services/authService"; // Assuming logoutUser exists or will be created
import { disconnectSocket, useSocket } from "../services/socketService";
import { io } from "socket.io-client";

interface User {
  id: string;
  name: string;
  email: string;
  // Add any other user properties you expect from the backend
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  socketConnected: boolean;
  login: (loginData: any) => Promise<void>; // Changed signature
  logout: () => Promise<void>; // Changed to async
  fetchCurrentUser: () => Promise<void>; // New function to get user on load
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { isConnected } = useSocket(user?.id);
  console.log("isConnected", isConnected);
  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      // This endpoint should be protected and return the user if cookie is valid
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const response = await apiClient.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        disconnectSocket();
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null);
      disconnectSocket();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    return () => {
      disconnectSocket();
    };
  }, []);

  const login = async (loginData: any) => {
    try {
      const { user: loggedInUser } = await apiLoginUser(loginData);
      setUser(loggedInUser);

      toast.success("Logged in successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error; // Re-throw to allow component to handle
    }
  };

  const logout = async () => {
    try {
      await apiLogoutUser(); // Call the backend logout to clear the cookie

      // Disconnect socket connection on logout
      disconnectSocket(); // Explicitly disconnect socket

      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/"); // Navigate to home page after logout
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout failed");
      // Still attempt to clear client-side state
      setUser(null);
      // Disconnect socket even if logout API fails
      disconnectSocket();
      navigate("/"); // Ensure redirection to home page even if API call fails
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Based on user object presence
        isLoading,
        socketConnected: isConnected,
        login,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
