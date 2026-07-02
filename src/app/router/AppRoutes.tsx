// // // src/app/router/AppRoutes.tsx
// // import React from "react";
// // import { Routes, Route, Navigate } from "react-router-dom";

// // // Feature imports
// // import { LoginView } from "../../features/auth/pages/LoginView";
// // import { OAuthCallback } from "../../features/auth/pages/OAuthCallback";
// // import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
// // import { OnboardingModal } from "../../features/projects/components/OnboardingModal";
// // import  AnalyticsDashboard  from "../../features/analytics/pages/AnalyticsDashboard";

// // // Shared Layout Wrapper
// // import { DashboardLayout } from "../../shared/components/DashboardLayout";
// // import IssueDetail from "../../features/issues/pages/IssueDetail";
// // import IssuesView from "../../features/issues/pages/IssuesView";

// // export const AppRoutes: React.FC = () => {
// //   return (
// //     <Routes>
// //       {/* 1. Public Authentication Routes */}
// //       <Route path="/login" element={<LoginView />} />
// //       <Route path="/auth/callback" element={<OAuthCallback />} />

// //       {/* 2. Security Shielded Subtree Navigation Paths */}
// //       <Route element={<ProtectedRoute />}>
// //         {/* Onboarding sits outside the main shell layout because it doesn't need the sidebar/topbar navigation framework yet */}
// //         <Route path="/onboarding" element={<OnboardingModal />} />

// //         {/* Main Dashboard UI frame layout structure shell wrapper */}
// //         <Route element={<DashboardLayout />}>
// //           {/* Member 2 Analytics Workspace */}
// //           <Route path="/dashboard" element={<AnalyticsDashboard />} />

// //           {/* Member 3 will inject their refactoring issues component matrix grid right here */}
// //           {/* Member 3 — Issues */}
// //           <Route path="/issues" element={<IssuesView />} />
// //           <Route path="/issues/:issueId" element={<IssueDetail />} />
// //         </Route>
// //       </Route>

// //       {/* 3. Global Redirection Fallback Catch-All */}
// //       <Route path="*" element={<Navigate to="/onboarding" replace />} />
// //     </Routes>
// //   );
// // };
// // src/app/router/AppRoutes.tsx
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// // Auth
// import { LoginView } from "../../features/auth/pages/LoginView";
// import { OAuthCallback } from "../../features/auth/pages/OAuthCallback";
// import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";

// // Onboarding
// import { OnboardingModal } from "../../features/projects/components/OnboardingModal";

// // Pages
// import OverviewPage from "../../features/overview/pages/OverviewPage";
// import AnalyticsDashboard from "../../features/analytics/pages/AnalyticsDashboard";
// import ReportsPage from "../../features/reports/pages/ReportsPage";
// import IssuesView from "../../features/issues/pages/IssuesView";
// import IssueDetail from "../../features/issues/pages/IssueDetail";

// // Layout
// import { DashboardLayout } from "../../shared/components/DashboardLayout";

// export const AppRoutes: React.FC = () => {
//   return (
//     <Routes>
//       {/* ── Public ── */}
//       <Route path="/login" element={<LoginView />} />
//       <Route path="/auth/callback" element={<OAuthCallback />} />

//       {/* ── Protected ── */}
//       <Route element={<ProtectedRoute />}>
//         {/* Onboarding: no sidebar, shown right after first login / when no project exists */}
//         <Route path="/onboarding" element={<OnboardingModal />} />

//         {/* Main shell: sidebar + topbar */}
//         <Route element={<DashboardLayout />}>
//           {/* Repo overview (the react-dashboard detail page) */}
//           <Route path="/dashboard" element={<OverviewPage />} />

//           {/* Analytics cross-scan summary */}
//           <Route path="/analytics" element={<AnalyticsDashboard />} />

//           {/* Reports + PDF export */}
//           <Route path="/reports" element={<ReportsPage />} />

//           {/* Issues */}
//           <Route path="/issues" element={<IssuesView />} />
//           <Route path="/issues/:issueId" element={<IssueDetail />} />
//         </Route>
//       </Route>

//       {/* ── Fallback ── */}
//       {/* 
//         After login → /onboarding (import a repo) → /dashboard
//         If user already has a project (activeProject in localStorage) the
//         onboarding page redirects them straight to /dashboard automatically.
//         Unknown paths go to /onboarding so they always pick a project first.
//       */}
//       <Route path="*" element={<Navigate to="/onboarding" replace />} />
//     </Routes>
//   );
// };
// src/app/router/AppRoutes.tsx
//
// Route map:
//   /login             → LoginView           (public)
//   /auth/callback     → OAuthCallback       (public)
//   /repositories      → RepositoriesPage    (protected, DEFAULT after login)
//   /dashboard         → OverviewPage        (protected, single repo view)
//   /analytics         → AnalyticsDashboard  (protected)
//   /reports           → ReportsPage         (protected)
//   /issues            → IssuesView          (protected)
//   /issues/:id        → IssueDetail         (protected)
//   *                  → redirect /repositories

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