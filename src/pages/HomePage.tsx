import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { ModalControls } from "@/components/Layout/Layout";

interface HomePageProps extends Partial<ModalControls> {}

const HomePage: React.FC<HomePageProps> = ({ openRegisterModal }) => {
  const { user, isLoading: authLoading } = useAuth();

  const handleGetStartedClick = () => {
    if (openRegisterModal) {
      openRegisterModal();
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center items-center   p-6">
      <div className="text-center max-w-3xl mx-auto">
        {!user && (
          <>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight ">
              Welcome to NotesSphere
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed">
              Unlock your productivity. Capture ideas, organize thoughts, and
              access your notes anytime, anywhere. Simple, secure, and
              seamlessly synced.
            </p>
            <div>
              <button
                onClick={handleGetStartedClick}
                className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-10 py-4 rounded-lg text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300"
              >
                Get Started &rarr;
              </button>
            </div>
          </>
        )}
        {user && (
          <>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-slate-800">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed">
              Ready to dive back into your notes? Head over to your dashboard to
              manage your thoughts and ideas.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
