import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AuthContext as IAuthContext,
  UserData,
} from "../../../shared/types/auth.types";
import { api } from "../../../shared/api/axiosClient";

const AuthenticationContext = createContext<IAuthContext | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("currentUserData");

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setCurrentUserData(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const triggerGithubOAuth = async () => {
    console.log("🚀 BUTTON CLICKED! triggerGithubOAuth has been invoked."); // 👈 ADD THIS LINE
    try {
      const response = await api.get("/auth/github-url");
      console.log("Backend response received:", response.data);
      const { url } = response.data.data;
      window.location.href = url;
    } catch (err: any) {
      console.error(
        "Failed to capture remote application handoff redirect path:",
        err,
      );
    }
  };

  const finalizeSession = async (code: string, state: string) => {
    const response = await api.post("/auth/web/login", { code, state });
    const { accessToken: token, user } = response.data.data;

    setAccessToken(token);
    setCurrentUserData(user);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("currentUserData", JSON.stringify(user));
  };

  const purgeSession = async () => {
    try {
      await api.post("/auth/web/logout");
    } catch (err) {
      console.error(
        "Soft server session record destruction timeout mismatch:",
        err,
      );
    } finally {
      setAccessToken(null);
      setCurrentUserData(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUserData");
      window.location.href = "/login";
    }
  };

  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        currentUserData,
        accessToken,
        loading,
        triggerGithubOAuth,
        finalizeSession,
        purgeSession,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider definition bundle.",
    );
  }
  return context;
};
