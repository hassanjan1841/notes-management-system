import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import apiClient from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getToken,
} from "../services/authService";
import { disconnectSocket, useSocket } from "../services/socketService";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  socketConnected: boolean;
  login: (loginData: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
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
  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
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
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogoutUser();

      disconnectSocket();

      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout failed");
      setUser(null);
      disconnectSocket();
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
