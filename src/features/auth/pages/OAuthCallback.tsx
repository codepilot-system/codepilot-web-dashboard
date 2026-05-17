import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { finalizeSession } = useAuth();
  const activationDispatched = useRef(false); // Prevents duplicate triggers in React 18 strict mode

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      navigate("/login", { replace: true });
      return;
    }

    if (!activationDispatched.current) {
      activationDispatched.current = true;
      finalizeSession(code, state)
        .then(() => {
          navigate("/onboarding", { replace: true });
        })
        .catch((error) => {
          console.error("Session handoff handshake failed:", error);
          navigate("/login", { replace: true });
        });
    }
  }, [searchParams, finalizeSession, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent mx-auto" />
        <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          Exchanging authorization credentials code blocks...
        </p>
      </div>
    </div>
  );
};
