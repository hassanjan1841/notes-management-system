export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Note {
  id: string;
  title: string;
  description?: string;
  isPasswordProtected?: boolean;
  authorId?: string;
  author?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
