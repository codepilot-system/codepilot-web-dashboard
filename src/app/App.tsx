// src/app/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "../features/auth/context/AuthContext";
import { ProjectProvider } from "../features/projects/context/ProjectContext";
import { ThemeProvider } from "../shared/context/ThemeContext";
import { AppRoutes } from "./router/AppRoutes";

// Central instance for TanStack Server-State Cache Management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ProjectProvider>
              {/* Handing off routing configuration to its own specialized map file */}
              <AppRoutes />
            </ProjectProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
