import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { loginSchema, type LoginFormData } from "@/utils/schemas";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosError } from "axios";
import Modal from "./Modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isSubmitSuccessful && isOpen) {
      reset();
      onClose();
      navigate(from, { replace: true });
    }
  }, [isSubmitSuccessful, isOpen, reset, onClose, navigate, from]);

  useEffect(() => {
    if (!isOpen) {
      setServerError(null); // Clear server error when modal is closed
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data);
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Login failed:", error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setServerError(error.response.data.message);
        // Toast for login error is handled globally in AuthContext or here if specific message needed
      } else if (error instanceof Error) {
        setServerError(error.message);
        toast.error(`Login failed: ${error.message}`);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login to Your Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            htmlFor="email-login"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email-login"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password-login"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password-login"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button
          type="button" // Ensure it's not a submit button
          onClick={() => {
            // onClose(); // Let Layout handle closing this modal
            onSwitchToRegister();
          }}
          className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          Register here
        </button>
      </p>
    </Modal>
  );
};

export default LoginModal;
