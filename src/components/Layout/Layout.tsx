import React, { useState, useEffect } from "react";
import {
  Outlet,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../Modal/LoginModal";
import RegisterModal from "../Modal/RegisterModal";
import HomePage from "@/pages/HomePage";

export interface ModalControls {
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we were redirected from a protected route with a request to open login modal
    if (location.state?.openLoginModal) {
      setIsLoginModalOpen(true);
      // Clear the state to prevent modal from reopening on navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const openLoginModal = () => {
    setIsRegisterModalOpen(false); // Ensure register modal is closed
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openRegisterModal = () => {
    setIsLoginModalOpen(false); // Ensure login modal is closed
    setIsRegisterModalOpen(true);
  };
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const outlet = <Outlet />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-gray-800 text-white shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-gray-300">
            NotesApp
          </Link>
          <div className="flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive && location.pathname === "/"
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
              end // Ensure exact match for Home link
            >
              Home (Public Notes)
            </NavLink>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLoginModal}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
                >
                  Login
                </button>
                <button
                  onClick={openRegisterModal}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-6 py-8">
        <Outlet context={{ openRegisterModal, openLoginModal }} />
      </main>
      <footer className="bg-gray-100 text-center p-4 text-sm text-gray-600 border-t">
        &copy; {new Date().getFullYear()} Notes Management System. All rights
        reserved.
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={() => {
          closeLoginModal();
          openRegisterModal();
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onSwitchToLogin={() => {
          closeRegisterModal();
          openLoginModal();
        }}
      />
    </div>
  );
};

export default Layout;
