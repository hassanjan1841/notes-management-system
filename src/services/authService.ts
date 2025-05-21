import apiClient from "./api";
import Cookies from "js-cookie"; // Import js-cookie
import type { LoginFormData, RegisterFormData } from "@/utils/schemas";
import type { User } from "@/types";
// import type { RegisterFormData, LoginFormData } from "../utils/schemas";

// Define a type for the login response that includes the token
interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  user: User; // Or just a success message
  message: string;
}

const TOKEN_KEY = "jwt_token"; // Key for storing the token in cookies

export const registerUser = async (
  userData: RegisterFormData
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    "/auth/register",
    userData
  );
  return response.data;
};

export const loginUser = async (
  credentials: LoginFormData
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials
  );
  if (response.data.token) {
    Cookies.set(TOKEN_KEY, response.data.token, {
      secure: import.meta.env.PROD, // Use secure cookies in production
      sameSite: "Lax", // Mitigate CSRF
    });
    console.log("loginUser", response.data);
  }
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  Cookies.remove(TOKEN_KEY);
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};
