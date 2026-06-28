import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Mock the useAuth hook explicitly
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("ProtectedRoute Component", () => {
  it("should display loading state during credential validation runtime", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: true,
      currentUserData: null,
      accessToken: null,
      triggerGithubOAuth: vi.fn(),
      finalizeSession: vi.fn(),
      purgeSession: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Authenticating runtime context structures.../i),
    ).toBeInTheDocument();
  });

  it("should redirect unauthenticated users cleanly back to the login route", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      currentUserData: null,
      accessToken: null,
      triggerGithubOAuth: vi.fn(),
      finalizeSession: vi.fn(),
      purgeSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Mock Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Mock Login Page")).toBeInTheDocument();
  });
});
