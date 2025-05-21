import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="text-center py-10">Authenticating...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/"
        state={{ from: location, openLoginModal: true }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
