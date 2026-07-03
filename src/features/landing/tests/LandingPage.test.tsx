import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { useAuth } from "../../auth/context/AuthContext";

// Navigation + auth are the only stateful dependencies of this page.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// ThemeToggle pulls from a theme context that isn't relevant here.
vi.mock("../../../shared/components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

const mockTriggerGithubOAuth = vi.fn();

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );

describe("LandingPage Public Marketing Interface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the hero headline and feature section content", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      triggerGithubOAuth: mockTriggerGithubOAuth,
    });

    renderPage();

    expect(
      screen.getByRole("heading", { name: /AI-Powered/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Smart Refactoring")).toBeInTheDocument();
    expect(screen.getByText("Code Smell Detection")).toBeInTheDocument();
  });

  it("should show a Log in call-to-action and trigger GitHub OAuth for guests", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      triggerGithubOAuth: mockTriggerGithubOAuth,
    });

    renderPage();

    const loginButton = screen.getByRole("button", { name: /^Log in$/i });
    fireEvent.click(loginButton);

    expect(mockTriggerGithubOAuth).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should show a Dashboard shortcut and route authenticated users to /repositories", () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      triggerGithubOAuth: mockTriggerGithubOAuth,
    });

    renderPage();

    const dashboardButton = screen.getByRole("button", { name: /Dashboard/i });
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith("/repositories");
    expect(mockTriggerGithubOAuth).not.toHaveBeenCalled();
  });
});
