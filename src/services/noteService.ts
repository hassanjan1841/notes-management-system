import apiClient from "./api";
import type { NoteFormData } from "@/utils/schemas";

export interface NoteVersion {
  id: string;
  noteId: string;
  title: string;
  description: string;
  version: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  isProtected: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  versions?: NoteVersion[];
  user?: { name: string; email: string };
}

export interface CreateNoteResponse extends Note {}

export interface UnlockNotePayload {
  password?: string;
}

export interface UpdateNoteResponse extends Note {}

export interface BasicMessageResponse {
  message: string;
}

export const createNote = async (
  data: NoteFormData
): Promise<CreateNoteResponse> => {
  const response = await apiClient.post<CreateNoteResponse>(
    "/notes/create",
    data
  );
  return response.data;
};

export const getAllNotes = async (): Promise<Note[]> => {
  const response = await apiClient.get<Note[]>("/notes");
  return response.data;
};

export const getNoteById = async (
  noteId: string,
  payload?: UnlockNotePayload
): Promise<Note> => {
  const response = await apiClient.post<Note>(
    `/notes/${noteId}/view`,
    payload || {}
  );
  return response.data;
};

export const updateNote = async (
  noteId: string,
  data: NoteFormData
): Promise<UpdateNoteResponse> => {
  const response = await apiClient.put<UpdateNoteResponse>(
    `/notes/${noteId}/update`,
    data
  );
  return response.data;
};

export const deleteNote = async (
  noteId: string
): Promise<BasicMessageResponse> => {
  const response = await apiClient.delete<BasicMessageResponse>(
    `/notes/${noteId}/delete`
  );
  return response.data;
};

export const getNoteVersionHistory = async (
  noteId: string
): Promise<NoteVersion[]> => {
  const response = await apiClient.get<NoteVersion[]>(
    `/notes/${noteId}/versions`
  );
  return response.data;
};

export const revertNoteToVersion = async (
  noteId: string,
  versionId: string
): Promise<Note> => {
  const response = await apiClient.post<Note>(
    `/notes/${noteId}/versions/${versionId}/revert`
  );
  return response.data;
};
