import z from "zod";
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters long" })
      .optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
  })
  .refine((data) => !!data.name || !!data.email, {
    message: "At least one field (name or email) must be provided to update.",
    path: ["name"],
  });

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Old password is required" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long" }),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const noteSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }).trim(),
    description: z
      .string()
      .min(1, { message: "Description is required" })
      .trim(),
    password: z
      .union([
        z
          .string()
          .length(0)
          .transform(() => null),
        z.literal("none").transform(() => "none"),
        z.null(),
        z.string().min(4, {
          message: "Password must be at least 4 characters if provided",
        }),
      ])
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.password &&
        data.password !== "" &&
        data.password !== "none" &&
        data.password !== data.confirmPassword
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      if (
        data.password &&
        data.password !== "none" &&
        data.password.length > 0 &&
        data.password.length < 4
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Password must be at least 4 characters long",
      path: ["password"],
    }
  );

export type NoteFormData = z.infer<typeof noteSchema>;

export const unlockNoteSchema = z.object({
  password: z
    .string()
    .min(1, { message: "Password is required to unlock this note" }),
});
export type UnlockNoteFormData = z.infer<typeof unlockNoteSchema>;
