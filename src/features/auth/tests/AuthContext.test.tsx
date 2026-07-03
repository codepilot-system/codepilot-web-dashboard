import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { api } from "../../../shared/api/axiosClient";

vi.mock("../../../shared/api/axiosClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const TestConsumer = () => {
  const { isAuthenticated, purgeSession } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">
        {isAuthenticated ? "LOGGED_IN" : "LOGGED_OUT"}
      </span>
      <button onClick={purgeSession}>Logout</button>
    </div>
  );
};

describe("AuthProvider Context Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should bootstrap session authentication states from localStorage on initialization", () => {
    localStorage.setItem("accessToken", "mock-jwt-token");
    localStorage.setItem(
      "currentUserData",
      JSON.stringify({ id: 1, name: "Nada Ali" }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth-state").textContent).toBe("LOGGED_IN");
  });

  it("should clear session variables upon invoking purgeSession execution tracks", async () => {
    localStorage.setItem("accessToken", "mock-jwt-token");
    localStorage.setItem("currentUserData", JSON.stringify({ id: 1 }));
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });

    // Mock window.location redirect path mutation
    const mockLocation = { href: "" };
    vi.spyOn(window, "window", "get").mockImplementation(
      () =>
        ({
          location: mockLocation,
        }) as any,
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(mockLocation.href).toBe("/");
  });
});
