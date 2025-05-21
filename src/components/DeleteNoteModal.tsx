import React, { useState } from "react";
import { deleteNote } from "@/services/noteService";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

interface DeleteNoteModalProps {
  noteId: string;
  noteTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
  noteId,
  noteTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(noteId);
      onSuccess();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note. Please try again.");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Note"
      message={`Are you sure you want to delete the note "${noteTitle}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      confirmButtonClass="bg-red-600 hover:bg-red-700"
      isLoading={isDeleting}
    />
  );
};

export default DeleteNoteModal;
