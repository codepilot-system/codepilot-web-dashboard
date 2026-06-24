// src/app/router/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Feature imports
import { LoginView } from "../../features/auth/pages/LoginView";
import { OAuthCallback } from "../../features/auth/pages/OAuthCallback";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { OnboardingModal } from "../../features/projects/components/OnboardingModal";
import  AnalyticsDashboard  from "../../features/analytics/pages/AnalyticsDashboard";

// Shared Layout Wrapper
import { DashboardLayout } from "../../shared/components/DashboardLayout";
import IssueDetail from "../../features/issues/pages/IssueDetail";
import IssuesView from "../../features/issues/pages/IssuesView";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Authentication Routes */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* 2. Security Shielded Subtree Navigation Paths */}
      <Route element={<ProtectedRoute />}>
        {/* Onboarding sits outside the main shell layout because it doesn't need the sidebar/topbar navigation framework yet */}
        <Route path="/onboarding" element={<OnboardingModal />} />

        {/* Main Dashboard UI frame layout structure shell wrapper */}
        <Route element={<DashboardLayout />}>
          {/* Member 2 Analytics Workspace */}
          <Route path="/dashboard" element={<AnalyticsDashboard />} />

          {/* Member 3 will inject their refactoring issues component matrix grid right here */}
          {/* Member 3 — Issues */}
          <Route path="/issues" element={<IssuesView />} />
          <Route path="/issues/:issueId" element={<IssueDetail />} />
        </Route>
      </Route>

      {/* 3. Global Redirection Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
};
