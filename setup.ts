import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";

// Automatically reset all API mocks between individual test cycles
beforeEach(() => {
  vi.clearAllMocks();
});
