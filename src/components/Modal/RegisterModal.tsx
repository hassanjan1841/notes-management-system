import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerSchema, type RegisterFormData } from "@/utils/schemas";
import { registerUser as apiRegisterUser } from "@/services/authService";
import { AxiosError } from "axios";
import Modal from "./Modal"; // Assuming Modal.tsx is in the same directory or adjust path

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(); // Reset form on successful submission and modal close
      onClose();
    }
  }, [isSubmitSuccessful, reset, onClose]);

  useEffect(() => {
    // Reset server error when modal is opened/closed or form is reset
    setServerError(null);
  }, [isOpen, reset]);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await apiRegisterUser(data);
      toast.success("Registration successful! Please log in.");
      onClose(); // Close register modal
      onSwitchToLogin(); // Open login modal
    } catch (error) {
      console.error("Registration failed:", error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setServerError(error.response.data.message);
        toast.error(`Registration failed: ${error.response.data.message}`);
      } else if (error instanceof Error) {
        setServerError(error.message);
        toast.error(`Registration failed: ${error.message}`);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Your Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{serverError}</span>
          </div>
        )}
        <div>
          <label
            htmlFor="name-register"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            id="name-register"
            type="text"
            {...register("name")}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email-register"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email-register"
            type="email"
            {...register("email")}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password-register"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password-register"
            type="password"
            {...register("password")}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword-register"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword-register"
            type="password"
            {...register("confirmPassword")}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={() => {
            onClose(); // Close register modal first
            onSwitchToLogin(); // Then open login modal
          }}
          className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          Login here
        </button>
      </p>
    </Modal>
  );
};

export default RegisterModal;
