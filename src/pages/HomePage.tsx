import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Note } from "@/services/noteService";
import { getAllNotes } from "@/services/noteService";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import type { ModalControls } from "@/components/Layout/Layout";
import RegisterModal from "@/components/Modal/RegisterModal";

interface HomePageProps extends Partial<ModalControls> {}

const HomePage: React.FC<HomePageProps> = ({
  openRegisterModal,
  openLoginModal,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const notesArray = await getAllNotes();
        setNotes(notesArray);
        setError(null);
      } catch (err) {
        setError("Failed to fetch notes. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleGetStartedClick = () => {
    if (openRegisterModal) {
      openRegisterModal();
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!user && (
        <div className="text-center py-12 bg-white shadow-md rounded-lg mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Welcome to NotesApp
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your simple and efficient solution for managing notes. Browse public
            notes below or sign up to create your own.
          </p>
          <div>
            <button
              onClick={handleGetStartedClick}
              className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out mr-4"
            >
              Get Started (Create Account)
            </button>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-8 text-gray-800">Public Notes</h2>
      {error && (
        <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-md">
          {error}
        </div>
      )}
      {notes?.length === 0 && !error && (
        <p className="text-gray-600 text-center py-10">
          No public notes available at the moment.
        </p>
      )}
      {notes?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-700 break-all">
                    {note.title}
                  </h3>
                  {note.isProtected ? (
                    <ShieldExclamationIcon
                      className="h-6 w-6 text-yellow-500 flex-shrink-0 ml-2"
                      title="Password Protected"
                    />
                  ) : (
                    <ShieldCheckIcon
                      className="h-6 w-6 text-green-500 flex-shrink-0 ml-2"
                      title="Public"
                    />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-1">
                  By: {note.user?.name || "Unknown Author"}
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                </p>
                {note.description && !note.isProtected && (
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed h-24 overflow-hidden text-ellipsis">
                    {note.description}
                  </p>
                )}
                {note.isProtected && (
                  <p className="text-sm text-yellow-600 italic mb-4">
                    This note is password protected. Full content requires
                    password to view details.
                  </p>
                )}
              </div>
              <Link
                to={`/notes/${note.id}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium self-start mt-auto pt-2"
              >
                View Note
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
