import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ProjectDropdown } from "../../features/projects/components/ProjectDropdown";

export const DashboardLayout: React.FC = () => {
  const { currentUserData } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link
            to="/dashboard"
            className="text-xl font-black tracking-tight text-white bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent"
          >
            CodePilot
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <Link
              to="/dashboard"
              className="hover:text-slate-200 transition-colors"
            >
              Overview
            </Link>
            <Link
              to="/issues"
              className="hover:text-slate-200 transition-colors"
            >
              Issues Registry
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <ProjectDropdown />

          <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
            <img
              src={currentUserData?.avatarUrl || ""}
              alt="Avatar"
              className="w-7 h-7 rounded-full border border-slate-700"
            />
            <span className="text-xs font-semibold text-slate-300 font-mono">
              @{currentUserData?.username || "user"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
