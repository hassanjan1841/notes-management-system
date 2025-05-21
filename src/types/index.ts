export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user-specific fields if needed, but not password
}

export interface Note {
  id: string;
  title: string;
  description?: string; // Optional as it might be hidden
  isPasswordProtected?: boolean;
  authorId?: string; // Or use a nested Author object
  author?: {
    // Assuming author's name might be useful
    name: string;
  };
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  // Add any other fields that your Note model has and are safe to expose
}

// You can also define other shared types here, for example:
// export interface NoteVersion { ... }
// export interface AuthResponse { ... }
