import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "@/services/userService";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/utils/schemas";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const ProfilePage: React.FC = () => {
  const { user, fetchCurrentUser, isLoading: authLoading } = useAuth();
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    setValue: setProfileValue,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (user && !authLoading) {
      setProfileValue("name", user.name);
      setProfileValue("email", user.email);
      setIsFetchingProfile(false);
    } else if (!authLoading) {
      const fetchProfile = async () => {
        setIsFetchingProfile(true);
        try {
          const profileData = await getMyProfile();
          setProfileValue("name", profileData.name);
          setProfileValue("email", profileData.email);
        } catch (error) {
          toast.error("Could not fetch profile information.");
          console.error("Fetch profile error:", error);
        } finally {
          setIsFetchingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [user, authLoading, setProfileValue, fetchCurrentUser]);

  const onProfileUpdateSubmit = async (data: UpdateProfileFormData) => {
    const filteredData: Partial<UpdateProfileFormData> = {};
    if (data.name && data.name !== user?.name) filteredData.name = data.name;
    if (data.email && data.email !== user?.email)
      filteredData.email = data.email;

    if (Object.keys(filteredData).length === 0) {
      toast("No changes detected to update.");
      return;
    }

    try {
      const response = await updateMyProfile(filteredData);
      toast.success(response.message || "Profile updated successfully!");
      await fetchCurrentUser();
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
        errors?: { msg: string }[];
      }>;
      let errorMessage = "Failed to update profile.";
      if (axiosError.response?.data) {
        errorMessage =
          axiosError.response.data.message ||
          axiosError.response.data.error ||
          (axiosError.response.data.errors &&
            axiosError.response.data.errors[0].msg) ||
          errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const onPasswordChangeSubmit = async (data: ChangePasswordFormData) => {
    try {
      const response = await changeMyPassword(data);
      toast.success(response.message || "Password changed successfully!");
      resetPasswordForm();
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
        errors?: { msg: string }[];
      }>;
      let errorMessage = "Failed to change password.";
      if (axiosError.response?.data) {
        errorMessage =
          axiosError.response.data.message ||
          axiosError.response.data.error ||
          (axiosError.response.data.errors &&
            axiosError.response.data.errors[0].msg) ||
          errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  if (authLoading || isFetchingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-500">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Update Information
        </h2>
        <form onSubmit={handleSubmitProfile(onProfileUpdateSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="profile-name"
            >
              Name
            </label>
            <input
              {...registerProfile("name")}
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                profileErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              id="profile-name"
              type="text"
              placeholder="Your Name"
              disabled={isSubmittingProfile}
            />
            {profileErrors.name && (
              <p className="text-red-500 text-xs italic mt-1">
                {profileErrors.name.message
                  ? String(profileErrors.name.message)
                  : "Invalid input"}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="profile-email"
            >
              Email
            </label>
            <input
              {...registerProfile("email")}
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                profileErrors.email ? "border-red-500" : "border-gray-300"
              }`}
              id="profile-email"
              type="email"
              placeholder="your@email.com"
              disabled={isSubmittingProfile}
            />
            {profileErrors.email && (
              <p className="text-red-500 text-xs italic mt-1">
                {profileErrors.email.message
                  ? String(profileErrors.email.message)
                  : "Invalid input"}
              </p>
            )}
          </div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
            type="submit"
            disabled={isSubmittingProfile}
          >
            {isSubmittingProfile ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Change Password
        </h2>
        <form onSubmit={handleSubmitPassword(onPasswordChangeSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="old-password"
            >
              Old Password
            </label>
            <input
              {...registerPassword("oldPassword")}
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                passwordErrors.oldPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              id="old-password"
              type="password"
              placeholder="Current Password"
              disabled={isSubmittingPassword}
            />
            {passwordErrors.oldPassword && (
              <p className="text-red-500 text-xs italic mt-1">
                {passwordErrors.oldPassword.message
                  ? String(passwordErrors.oldPassword.message)
                  : "Invalid input"}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              {...registerPassword("newPassword")}
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                passwordErrors.newPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              id="new-password"
              type="password"
              placeholder="New Password (min. 6 characters)"
              disabled={isSubmittingPassword}
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-xs italic mt-1">
                {passwordErrors.newPassword.message
                  ? String(passwordErrors.newPassword.message)
                  : "Invalid input"}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirm-new-password"
            >
              Confirm New Password
            </label>
            <input
              {...registerPassword("newPassword")}
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                passwordErrors.newPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              id="confirm-new-password"
              type="password"
              placeholder="Confirm New Password"
              disabled={isSubmittingPassword}
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-xs italic mt-1">
                {passwordErrors.newPassword.message
                  ? String(passwordErrors.newPassword.message)
                  : "Invalid input"}
              </p>
            )}
          </div>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
            type="submit"
            disabled={isSubmittingPassword}
          >
            {isSubmittingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
