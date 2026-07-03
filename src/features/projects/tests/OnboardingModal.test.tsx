import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useGithubRepos, useTrackRepository } from "../hooks/useGithubRepos";
import { OnboardingModal } from "../components/OnboardingModal";
import { useProject } from "../context/ProjectContext";

// Mock the custom operational hooks
vi.mock("../hooks/useGithubRepos", () => ({
  useGithubRepos: vi.fn(),
  useTrackRepository: vi.fn(),
}));

vi.mock("../../auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../context/ProjectContext", () => ({
  useProject: vi.fn(),
}));

describe("OnboardingModal UI Component", () => {
  const mockSetActiveProject = vi.fn();
  const mockPurgeSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Now this will work perfectly across all versions of Vitest!
    (useAuth as any).mockReturnValue({
      purgeSession: mockPurgeSession,
      isAuthenticated: true,
      loading: false,
      currentUserData: null,
      accessToken: "token",
      triggerGithubOAuth: vi.fn(),
      finalizeSession: vi.fn(),
    });

    (useProject as any).mockReturnValue({
      activeProject: null,
      setActiveProject: mockSetActiveProject,
    });
  });

  it("should render correct labels and repository lists matching incoming query payloads", () => {
    (useGithubRepos as any).mockReturnValue({
      data: {
        data: [
          {
            githubId: 101,
            fullName: "Nada125/E-Commerce",
            private: false,
            description: "Shop app",
            status: "JOIN",
          },
          {
            githubId: 102,
            fullName: "Nada125/Staff-System",
            private: true,
            description: "Admin app",
            status: "JOINED",
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    (useTrackRepository as any).mockReturnValue({ mutate: vi.fn() });

    render(
      <MemoryRouter>
        <OnboardingModal />
      </MemoryRouter>,
    );

    expect(screen.getByText("Nada125/E-Commerce")).toBeInTheDocument();
    expect(screen.getByText("Nada125/Staff-System")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("should trigger mutation handler when user selects the Join button on an active element row", () => {
    const mockMutate = vi.fn();
    const mockRepo = {
      githubId: 101,
      fullName: "Nada125/E-Commerce",
      private: false,
      status: "JOIN",
    };

    (useGithubRepos as any).mockReturnValue({
      data: { data: [mockRepo] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    (useTrackRepository as any).mockReturnValue({
      mutate: mockMutate,
    });

    render(
      <MemoryRouter>
        <OnboardingModal />
      </MemoryRouter>,
    );

    const joinButton = screen.getByRole("button", { name: "JOIN" });
    fireEvent.click(joinButton);

    expect(mockMutate).toHaveBeenCalledWith(mockRepo, expect.any(Object));
  });
});
