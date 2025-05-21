import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { createNote } from "@/services/noteService";
import { noteSchema, type NoteFormData } from "@/utils/schemas";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";

const CreateNotePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // To ensure user is authenticated
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      description: "",
      password: "",
    },
  });

  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);
    try {
      // If password is empty string, it should be submitted as null or undefined
      // The schema transform handles empty string to null, so API should receive null.
      const payload = {
        ...data,
        password: data.password === "" ? null : data.password,
      };
      await createNote(payload as NoteFormData);
      toast.success("Note created successfully!");
      reset();
      navigate("/dashboard"); // Redirect to dashboard after creation
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
        errors?: { msg: string }[];
      }>;
      let errorMessage = "Failed to create note.";
      if (axiosError.response?.data) {
        errorMessage =
          axiosError.response.data.message ||
          axiosError.response.data.error ||
          (axiosError.response.data.errors &&
            axiosError.response.data.errors[0].msg) ||
          errorMessage;
      }
      toast.error(errorMessage);
      console.error("Create note error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not authenticated, though this should ideally be handled by a protected route component
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create New Note</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-xl"
      >
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            className={`shadow-sm bg-gray-50 border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5`}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={6}
            {...register("description")}
            className={`shadow-sm bg-gray-50 border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password (optional - for protected notes)
          </label>
          <input
            type="password"
            id="password"
            {...register("password")}
            className={`shadow-sm bg-gray-50 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5`}
            placeholder="Leave blank for no password"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Note"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotePage;
