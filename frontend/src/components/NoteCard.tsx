import React, { useState } from "react";
import type { Note } from "@/services/noteService";
import ViewNoteModal from "./ViewNoteModal";

interface NoteCardProps {
  note: Note;
  onDelete?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const cardBg = note.isProtected
    ? "bg-yellow-100 border-yellow-400"
    : "bg-white border-gray-200";
  const textColor = note.isProtected ? "text-yellow-700" : "text-gray-700";

  const handleDeleteSuccess = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <>
      <div className={`p-4 rounded-lg shadow-md border ${cardBg}`}>
        <h3
          className={`text-xl font-semibold mb-2 ${
            note.isProtected ? "text-yellow-800" : "text-gray-800"
          }`}
        >
          <button
            onClick={() => setIsViewModalOpen(true)}
            className="hover:underline text-left w-full"
          >
            {note.title}
          </button>
        </h3>
        <p className={`text-sm mb-3 ${textColor}`}>
          {note.description}
          {note.isProtected &&
            note.description.startsWith("Description is protected") && (
              <span className="text-xs ml-1">
                {" "}
                (Password required to view full content)
              </span>
            )}
        </p>
        <div className="text-xs text-gray-500 mb-2">
          <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
          <span className="ml-2">
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>
        {note.isProtected && (
          <div className="mt-2">
            <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
              Protected
            </span>
          </div>
        )}
        <button
          onClick={() => setIsViewModalOpen(true)}
          className="mt-3 inline-block text-blue-600 hover:text-blue-800 hover:underline text-sm"
        >
          View Details
        </button>
      </div>

      <ViewNoteModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        noteId={note.id}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default NoteCard;
