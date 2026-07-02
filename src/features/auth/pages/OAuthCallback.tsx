// import React, { useEffect, useRef } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export const OAuthCallback: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { finalizeSession } = useAuth();
//   const activationDispatched = useRef(false); // Prevents duplicate triggers in React 18 strict mode

//   useEffect(() => {
//     const code = searchParams.get("code");
//     const state = searchParams.get("state");

//     if (!code || !state) {
//       navigate("/login", { replace: true });
//       return;
//     }

//     if (!activationDispatched.current) {
//       activationDispatched.current = true;
//       finalizeSession(code, state)
//         .then(() => {
//           navigate("/onboarding", { replace: true });
//         })
//         .catch((error) => {
//           console.error("Session handoff handshake failed:", error);
//           navigate("/login", { replace: true });
//         });
//     }
//   }, [searchParams, finalizeSession, navigate]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
//       <div className="space-y-4 text-center">
//         <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent mx-auto" />
//         <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
//           Exchanging authorization credentials code blocks...
//         </p>
//       </div>
//     </div>
//   );
// };
// src/features/auth/pages/OAuthCallback.tsx
//
// Handles GitHub OAuth redirect: /auth/callback?code=...&state=...
// After finalizing the session, sends user to /repositories (not /onboarding).
// /repositories shows all their GitHub repos with Import/Join/View buttons —
// no separate onboarding step needed.

import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { finalizeSession } = useAuth();
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code  = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      navigate("/login", { replace: true });
      return;
    }

    finalizeSession(code, state)
      .then(() => {
        // Go straight to repositories — no separate onboarding needed
        navigate("/repositories", { replace: true });
      })
      .catch((err) => {
        console.error("[OAuthCallback] Session finalization failed:", err);
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Signing you in…</p>
      </div>
    </div>
  );
};