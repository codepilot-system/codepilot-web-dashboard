import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useIssuesSync } from "../hooks/useIssuesSync"; // Adjust path
import { io } from "socket.io-client";

// Mock the socket.io-client library completely
vi.mock("socket.io-client", () => {
  const mockSocket = {
    on: vi.fn(),
    disconnect: vi.fn(),
  };
  return {
    io: vi.fn(() => mockSocket),
  };
});

describe("useIssuesSync Custom React Hook", () => {
  let mockSocketInstance: any;
  const mockOnScanComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocketInstance = io("http://localhost:5000");
  });

  it("should initialize with syncing state turned off", () => {
    const { result } = renderHook(() => useIssuesSync(mockOnScanComplete));
    expect(result.current.isSyncing).toBe(false);
  });

  it("should set syncing true when a scan:started event payload fires", () => {
    // Extract the event listener registry map registered inside the hook
    const registeredListeners: Record<string, Function> = {};
    mockSocketInstance.on.mockImplementation(
      (event: string, callback: Function) => {
        registeredListeners[event] = callback;
      },
    );

    const { result } = renderHook(() => useIssuesSync(mockOnScanComplete));

    // Manually trigger the listener callback registered for scan:started
    act(() => {
      registeredListeners["scan:started"]();
    });
    expect(result.current.isSyncing).toBe(true);

    // Manually trigger scan:completed to turn it off and fire callback wrapper
    act(() => {
      registeredListeners["scan:completed"]();
    });
    expect(result.current.isSyncing).toBe(false);
    expect(mockOnScanComplete).toHaveBeenCalledTimes(1);
  });

  it("should invoke disconnect cleanly when the hosting view unmounts", () => {
    const { unmount } = renderHook(() => useIssuesSync(mockOnScanComplete));

    unmount();
    expect(mockSocketInstance.disconnect).toHaveBeenCalledTimes(1);
  });
});
