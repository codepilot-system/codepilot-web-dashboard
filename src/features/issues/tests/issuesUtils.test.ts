import { describe, it, expect } from "vitest";
import { SyntaxHighlightParser } from "../utils/SyntaxHighlightParser"; // Adjust path

describe("SyntaxHighlightParser", () => {
  const mockDiffPatch = `
@@ -42,7 +42,7 @@
-const value = 'old';
+const value = 'new';
 context line
  `.trim();

  describe("parse()", () => {
    it("should parse hunk headers and set the correct starting line number", () => {
      const parsed = SyntaxHighlightParser.parse(mockDiffPatch);
      expect(parsed[0].lineNumber).toBe(42);
    });

    it("should correctly classify lines as added, removed, or context", () => {
      const parsed = SyntaxHighlightParser.parse(mockDiffPatch);

      expect(parsed[0]).toEqual({
        lineNumber: 42,
        content: "const value = 'old';",
        type: "removed",
      });

      // ✨ FIXED: The previous step incremented lineNum to 43
      expect(parsed[1]).toEqual({
        lineNumber: 43,
        content: "const value = 'new';",
        type: "added",
      });

      expect(parsed[2]).toEqual({
        lineNumber: 43,
        content: "context line",
        type: "context",
      });
    });
  });

  describe("toSplitPanes()", () => {
    it("should cleanly divide lines between left (original) and right (refactored) windows", () => {
      const parsed = SyntaxHighlightParser.parse(mockDiffPatch);
      const [leftPane, rightPane] = SyntaxHighlightParser.toSplitPanes(parsed);

      expect(leftPane.some((l) => l.type === "added")).toBe(false);
      expect(leftPane.length).toBe(2);

      expect(rightPane.some((l) => l.type === "removed")).toBe(false);
      expect(rightPane.length).toBe(2);
    });
  });
});
