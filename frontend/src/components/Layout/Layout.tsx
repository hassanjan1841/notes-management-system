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

export interface ModalControls {
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status and redirect accordingly
  useEffect(() => {
    // Only redirect on the root path
    if (location.pathname === '/') {
      if (user) {
        // If user is logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } else if (location.pathname === '/dashboard' || location.pathname === '/profile') {
      // If trying to access protected routes without being logged in
      if (!user) {
        navigate('/', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (location.state?.openLoginModal) {
      setIsLoginModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const openLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
    setIsMobileMenuOpen(false);
  };
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-gray-800 text-white shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link to={user ? "/dashboard" : "/"} className="text-xl font-semibold hover:text-gray-300">
              NotesApp
            </Link>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive && location.pathname === "/"
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                    end
                  >
                    Public Notes
                  </NavLink>
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
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive && location.pathname === "/"
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                    end
                  >
                    Home (Public Notes)
                  </NavLink>
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
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 py-2 border-t border-gray-700">
              <div className="flex flex-col space-y-2">
                {user ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium ${
                          isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium ${
                          isActive && location.pathname === "/"
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                      }
                      end
                    >
                      Public Notes
                    </NavLink>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium ${
                          isActive && location.pathname === "/"
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                      }
                      end
                    >
                      Home (Public Notes)
                    </NavLink>
                    <button
                      onClick={openLoginModal}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
                    >
                      Login
                    </button>
                    <button
                      onClick={openRegisterModal}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
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