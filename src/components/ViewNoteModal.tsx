import React, { useState, useEffect, useCallback } from "react";
import {
  getNoteById,
  getNoteVersionHistory,
  revertNoteToVersion,
  type Note,
  type NoteVersion,
  type UnlockNotePayload,
} from "@/services/noteService";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  LockClosedIcon,
  LockOpenIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import DeleteNoteModal from "@/components/DeleteNoteModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import EditNoteModal from "@/components/EditNoteModal";

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string | null;
  onEditClick?: (noteId: string) => void;
  onDeleteSuccess?: () => void;
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  isOpen,
  onClose,
  noteId,
  onEditClick,
  onDeleteSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [note, setNote] = useState<Note | null>(null);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [isReverting, setIsReverting] = useState(false);

  // Reset the state when the modal closes
  useEffect(() => {
    if (!isOpen) {
      setNote(null);
      setVersions([]);
      setError(null);
      setPasswordInput("");
      setIsPasswordProtected(false);
      setIsUnlocked(false);
      setShowVersionHistory(false);
      setIsEditModalOpen(false);
    }
  }, [isOpen]);

  const fetchNoteDetails = useCallback(
    async (unlockPassword?: string) => {
      if (!noteId || !isOpen) return;

      setIsLoading(true);
      setError(null);
      try {
        const payload: UnlockNotePayload = {};
        if (unlockPassword) {
          payload.password = unlockPassword;
        }
        const fetchedNote = await getNoteById(noteId, payload);
        setNote(fetchedNote);

        if (
          fetchedNote.isProtected &&
          fetchedNote.description.startsWith("Description is protected")
        ) {
          setIsPasswordProtected(true);
          setIsUnlocked(false);
          if (unlockPassword) toast.error("Incorrect password.");
        } else if (fetchedNote.isProtected && unlockPassword) {
          setIsPasswordProtected(true);
          setIsUnlocked(true);
          toast.success("Note unlocked!");
        } else {
          setIsPasswordProtected(fetchedNote.isProtected);
          setIsUnlocked(!fetchedNote.isProtected);
        }

        if (fetchedNote.versions) {
          setVersions(fetchedNote.versions);
        } else if (isUnlocked || !fetchedNote.isProtected) {
          fetchVersions(noteId);
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Failed to fetch note:", axiosError);
        let msg = "Failed to load note details.";
        if (axiosError.response?.status === 401 && unlockPassword) {
          msg = "Incorrect password for protected note.";
        } else if (axiosError.response?.status === 404) {
          msg = "Note not found.";
        }
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [noteId, isOpen]
  );

  const fetchVersions = async (currentNoteId: string) => {
    if (!currentNoteId) return;
    try {
      const history = await getNoteVersionHistory(currentNoteId);
      setVersions(history);
    } catch (err) {
      console.error("Failed to fetch version history:", err);
      toast.error("Could not load version history.");
    }
  };

  useEffect(() => {
    if (isOpen && noteId) {
      fetchNoteDetails();
    }
  }, [fetchNoteDetails, isOpen, noteId]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNoteDetails(passwordInput);
  };

  const handleRevertClick = (versionId: string) => {
    setSelectedVersionId(versionId);
    setIsRevertModalOpen(true);
  };

  const handleRevertConfirm = async () => {
    if (!noteId || !selectedVersionId) return;

    setIsReverting(true);
    try {
      const revertedNote = await revertNoteToVersion(noteId, selectedVersionId);
      setNote(revertedNote);
      setIsUnlocked(true);
      toast.success("Note reverted successfully to a new version!");
      fetchVersions(noteId);
    } catch (err) {
      toast.error("Failed to revert note.");
      console.error("Revert error:", err);
    } finally {
      setIsReverting(false);
      setIsRevertModalOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    onClose();
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  const handleEditClick = () => {
    if (onEditClick && noteId) {
      onEditClick(noteId);
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleEditSuccess = () => {
    if (noteId) {
      fetchNoteDetails();
    }
    setIsEditModalOpen(false);
    toast.success("Note updated successfully!");
  };

  const isOwner = isAuthenticated && user && note && user.id === note.userId;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-6 flex justify-center items-center h-40">
            <p className="text-lg text-gray-700">Loading note...</p>
          </div>
        ) : error && !note ? (
          <div className="p-6 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : !note ? (
          <div className="p-6 flex justify-center items-center h-40">
            <p className="text-lg text-red-500">Note not found.</p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  {note.title}
                  {note.isProtected && (
                    <span className="ml-3">
                      {isUnlocked ? (
                        <LockOpenIcon
                          className="h-6 w-6 text-green-500"
                          title="Unlocked"
                        />
                      ) : (
                        <LockClosedIcon
                          className="h-6 w-6 text-red-500"
                          title="Protected"
                        />
                      )}
                    </span>
                  )}
                </h2>
                <div className="flex space-x-2">
                  {isOwner && (
                    <>
                      <button
                        onClick={handleEditClick}
                        className="p-2 text-gray-500 hover:text-blue-600"
                        title="Edit Note"
                      >
                        <PencilSquareIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="p-2 text-gray-500 hover:text-red-600"
                        title="Delete Note"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {error && !isUnlocked && isPasswordProtected && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              )}

              {isPasswordProtected && !isUnlocked && (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="mb-6 p-4 border border-yellow-300 rounded-md bg-yellow-50"
                >
                  <p className="text-sm text-yellow-700 mb-2">
                    This note is password protected. Please enter the password
                    to view its content and history.
                  </p>
                  <div className="flex items-center">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Note Password"
                      className="shadow-sm bg-white border border-gray-300 text-gray-900 sm:text-sm rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-yellow-500 text-white font-medium rounded-r-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
                    >
                      Unlock
                    </button>
                  </div>
                </form>
              )}

              {(isUnlocked || !note.isProtected) && (
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                  {note.description}
                </div>
              )}
            </div>

            {(isUnlocked || !note.isProtected) && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowVersionHistory(!showVersionHistory);
                    if (!showVersionHistory && versions.length === 0 && noteId)
                      fetchVersions(noteId);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center mb-3"
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {showVersionHistory ? "Hide" : "Show"} Version History (
                  {versions.length})
                </button>
                {showVersionHistory && versions.length > 0 && (
                  <ul className="space-y-3">
                    {versions
                      .sort((a, b) => b.version - a.version)
                      .map((version) => (
                        <li
                          key={version.id}
                          className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                Version {version.version}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Created:{" "}
                                {new Date(version.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {isOwner &&
                              note.versions &&
                              version.id !==
                                note.versions[note.versions.length - 1].id &&
                              version.version !==
                                note.versions.find((v) => v.id === note.id)
                                  ?.version && (
                                <button
                                  onClick={() => handleRevertClick(version.id)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50"
                                  disabled={
                                    version.version ===
                                    note.versions.reduce(
                                      (max, v) => Math.max(max, v.version),
                                      0
                                    )
                                  }
                                >
                                  <ArrowPathIcon className="h-4 w-4 mr-1 inline" />{" "}
                                  Revert to this version
                                </button>
                              )}
                          </div>
                          <details className="mt-2 text-sm">
                            <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                              View content
                            </summary>
                            <div className="mt-2 p-2 bg-white border rounded whitespace-pre-wrap">
                              <h5 className="font-semibold">{version.title}</h5>
                              <p>{version.description}</p>
                            </div>
                          </details>
                        </li>
                      ))}
                  </ul>
                )}
                {showVersionHistory && versions.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No older versions found.
                  </p>
                )}
              </div>
            )}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              <p>Note ID: {note.id}</p>
              <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
              <p>Last Updated: {new Date(note.updatedAt).toLocaleString()}</p>
              {note.user && <p>Author: {note.user.name}</p>}
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {noteId && note && (
        <>
          <DeleteNoteModal
            noteId={noteId}
            noteTitle={note.title}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onSuccess={handleDeleteSuccess}
          />

          <ConfirmationModal
            isOpen={isRevertModalOpen}
            onClose={() => setIsRevertModalOpen(false)}
            onConfirm={handleRevertConfirm}
            title="Revert Note Version"
            message="Are you sure you want to revert to this version? A new version will be created based on this old state."
            confirmLabel="Revert"
            cancelLabel="Cancel"
            confirmButtonClass="bg-green-600 hover:bg-green-700"
            isLoading={isReverting}
          />

          <EditNoteModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleEditSuccess}
            note={note}
          />
        </>
      )}
    </div>
  );
};

export default ViewNoteModal;
