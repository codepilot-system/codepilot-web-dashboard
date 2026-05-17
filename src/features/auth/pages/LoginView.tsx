import React from "react";
import { useAuth } from "../context/AuthContext";

export const LoginView: React.FC = () => {
  const { triggerGithubOAuth, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = "/onboarding";
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm text-center shadow-xl">
        <div className="space-y-2">
          {/* Branded Icon Asset Frame Placeholder matching Figma UI */}
          <div className="mx-auto h-12 w-12 rounded-xl bg-violet-600/10 flex items-center justify-center border border-violet-500/20 text-violet-400 font-bold text-2xl tracking-tighter">
            CP
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Welcome to CodePilot
          </h2>
          <p className="text-sm text-slate-400">
            Automate code review refactoring architecture routines and resolve
            technical debt patterns seamlessly.
          </p>
        </div>

        <button
          onClick={triggerGithubOAuth}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-950 font-medium rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-sm shadow-white/10"
        >
          {/* GitHub SVG Icon Matrix Component Structure */}
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.48.01-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.061.069-.061 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};
