import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { LoginView }      from "../../features/auth/pages/LoginView";
import { OAuthCallback }  from "../../features/auth/pages/OAuthCallback";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { DashboardLayout } from "../../shared/components/DashboardLayout";

import LandingPage        from "../../features/landing/pages/LandingPage";
import RepositoriesPage   from "../../features/projects/pages/RepositoriesPage";
import OverviewPage        from "../../features/overview/pages/OverviewPage";
import AnalyticsDashboard from "../../features/analytics/pages/AnalyticsDashboard";
import ReportsPage        from "../../features/reports/pages/ReportsPage";
import IssuesView         from "../../features/issues/pages/IssuesView";
import IssueDetail        from "../../features/issues/pages/IssueDetail";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"               element={<LandingPage />} />
      <Route path="/login"          element={<LoginView />} />
      <Route path="/auth/callback"  element={<OAuthCallback />} />

      {/* ── Protected ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Primary landing after login — shows all repos */}
          <Route path="/repositories" element={<RepositoriesPage />} />

          {/* Single-repo detail view (set activeProject then navigate here) */}
          <Route path="/dashboard"    element={<OverviewPage />} />

          {/* Cross-repo analytics */}
          <Route path="/analytics"    element={<AnalyticsDashboard />} />

          {/* Report generation */}
          <Route path="/reports"      element={<ReportsPage />} />

          {/* Issues */}
          <Route path="/issues"           element={<IssuesView />} />
          <Route path="/issues/:issueId"  element={<IssueDetail />} />
        </Route>
      </Route>

      {/* ── Fallback: unknown paths → landing page ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};