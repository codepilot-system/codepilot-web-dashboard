
export interface DiffLine {
  lineNumber: number
  content: string
  type: 'added' | 'removed' | 'context'
}

/**
 * Parses a unified diff patch string into structured DiffLine objects.
 * Strips the +/- prefix and tracks line numbers for both panes.
 */
export class SyntaxHighlightParser {
  static parse(diffPatch: string): DiffLine[] {
    const lines = diffPatch.split('\n')
    const result: DiffLine[] = []
    let lineNum = 1

    // Parse @@ -start,count +start,count @@ header
    const hunkHeader = /^@@\s-(\d+)(?:,\d+)?\s\+(\d+)/

    for (const line of lines) {
      const hunkMatch = line.match(hunkHeader)
      if (hunkMatch) {
        lineNum = parseInt(hunkMatch[1], 10)
        continue
      }
      if (line.startsWith('---') || line.startsWith('+++')) continue

      if (line.startsWith('-')) {
        result.push({ lineNumber: lineNum, content: line.slice(1), type: 'removed' })
        lineNum++
      } else if (line.startsWith('+')) {
        result.push({ lineNumber: lineNum, content: line.slice(1), type: 'added' })
        // added lines don't advance the original line counter
      } else {
        result.push({ lineNumber: lineNum, content: line.slice(1), type: 'context' })
        lineNum++
      }
    }
    return result
  }

  /** Split parsed lines into [originalSide, refactoredSide] for split-pane display */
  static toSplitPanes(lines: DiffLine[]): [DiffLine[], DiffLine[]] {
    const left  = lines.filter(l => l.type !== 'added')
    const right = lines.filter(l => l.type !== 'removed')
    return [left, right]
  }
}
