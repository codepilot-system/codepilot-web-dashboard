import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Authenticating runtime context structures...
      </div>
    );
  }

  // Fallback structural rendering block tracking context configurations patterns bounds mappings
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
