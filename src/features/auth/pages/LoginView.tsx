import React from "react";
import { useAuth } from "../context/AuthContext";

// ── Geometric background SVG (the lattice/wireframe look from screenshots) ──
const GeoBg: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a1628" />
        <stop offset="50%" stopColor="#0d1f3c" />
        <stop offset="100%" stopColor="#0a1628" />
      </linearGradient>
      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e40af" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bgGrad)" />
    {/* Geometric lattice lines */}
    {[...Array(8)].map((_, i) => (
      <g key={i}>
        <line
          x1={`${i * 14}%`} y1="0%" x2={`${i * 14 + 30}%`} y2="100%"
          stroke="url(#lineGrad)" strokeWidth="0.5"
        />
        <line
          x1="0%" y1={`${i * 14}%`} x2="100%" y2={`${i * 14 + 30}%`}
          stroke="url(#lineGrad)" strokeWidth="0.5"
        />
      </g>
    ))}
    {/* Bright nodes at intersections */}
    {[
      [15, 20], [45, 10], [75, 35], [25, 65], [60, 75], [85, 55],
      [35, 88], [70, 88], [10, 45], [90, 25],
    ].map(([x, y], i) => (
      <circle key={i} cx={`${x}%`} cy={`${y}%`} r="2.5"
        fill="#2563eb" fillOpacity="0.5"
      />
    ))}
    {/* Connecting edges between nodes */}
    <line x1="15%" y1="20%" x2="45%" y2="10%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="45%" y1="10%" x2="75%" y2="35%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="75%" y1="35%" x2="85%" y2="55%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="15%" y1="20%" x2="25%" y2="65%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="25%" y1="65%" x2="60%" y2="75%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="60%" y1="75%" x2="85%" y2="55%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="10%" y1="45%" x2="25%" y2="65%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="35%" y1="88%" x2="60%" y2="75%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="70%" y1="88%" x2="60%" y2="75%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
    <line x1="90%" y1="25%" x2="75%" y2="35%" stroke="#2563eb" strokeWidth="0.6" strokeOpacity="0.3"/>
  </svg>
);

// ── GitHub SVG icon ─────────────────────────────────────────────────────────
const GitHubIcon: React.FC = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.48.01-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.061.069-.061 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
    />
  </svg>
);

// ── Main component ──────────────────────────────────────────────────────────
export const LoginView: React.FC = () => {
  const { triggerGithubOAuth, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = "/onboarding";
    return null;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <GeoBg />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <img src="/logo.svg" alt="CodePilot" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">CodePilot</h1>
          <p className="text-blue-300/80 text-sm font-medium tracking-wide">
            Transform Your Code with AI
          </p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-sm bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-2xl shadow-black/40">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to your engineering workspace</p>
          </div>

          <button
            onClick={triggerGithubOAuth}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#111827]"
          >
            <GitHubIcon />
            Continue with GitHub
          </button>

          {/* Security layer */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase">
                AI Security Layer
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-400 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5L2 4v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V4L8 1.5z"
                      fill="#2563eb" stroke="#60a5fa" strokeWidth="1"/>
                    <path d="M5.5 8l2 2 3-3" stroke="#fff" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Verified GitHub Application</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    CodePilot is an officially registered integration adhering to enterprise-grade security protocols.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="5" width="10" height="7" rx="1.5" stroke="#64748b" strokeWidth="1.2"/>
                <path d="M3.5 5V3.5a2.5 2.5 0 015 0V5" stroke="#64748b" strokeWidth="1.2"/>
              </svg>
              Secure authentication via GitHub OAuth
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-slate-500 text-center max-w-xs">
          By continuing, you agree to our{" "}
          <span className="text-white font-semibold cursor-pointer hover:underline">Terms of Service</span>
          {" "}and{" "}
          <span className="text-white font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};