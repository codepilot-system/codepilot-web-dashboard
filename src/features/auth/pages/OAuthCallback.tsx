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