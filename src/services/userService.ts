import apiClient from "./api";
import type {
  UpdateProfileFormData,
  ChangePasswordFormData,
} from "@/utils/schemas";

interface User {
  id: string;
  name: string;
  email: string;
  // other fields if your backend returns them
}

interface ProfileResponse {
  message?: string; // Optional success message
  user: User;
}

interface BasicMessageResponse {
  message: string;
}

export const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>("/users/me");
  return response.data;
};

export const updateMyProfile = async (
  data: UpdateProfileFormData
): Promise<ProfileResponse> => {
  const response = await apiClient.put<ProfileResponse>(
    "/users/me/update",
    data
  );
  return response.data;
};

export const changeMyPassword = async (
  data: ChangePasswordFormData
): Promise<BasicMessageResponse> => {
  const response = await apiClient.put<BasicMessageResponse>(
    "/users/me/change-password",
    data
  );
  return response.data;
};
