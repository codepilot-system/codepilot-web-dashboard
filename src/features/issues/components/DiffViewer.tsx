import { DiffLine, SyntaxHighlightParser } from '../utils/SyntaxHighlightParser'
import './DiffViewer.css'

interface Props { lines: DiffLine[] }

export default function DiffViewer({ lines }: Props) {
  const [left, right] = SyntaxHighlightParser.toSplitPanes(lines)

  const renderPane = (
    paneLines: DiffLine[],
    label: string,
    side: 'original' | 'refactored'
  ) => (
    <div className="diff-pane">
      <div className={`diff-pane-label diff-pane-label--${side}`}>{label}</div>
      {paneLines.map((line, i) => (
        <div key={i} className={`diff-line diff-line--${line.type}`}>
          <span className="diff-line-number">{line.lineNumber}</span>
          <span className={`diff-marker diff-marker--${line.type}`}>
            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
          </span>
          <code className="diff-content">{line.content}</code>
        </div>
      ))}
    </div>
  )

  return (
    <div className="diff-viewer">
      {renderPane(left,  'Original',   'original')}
      {renderPane(right, 'Refactored', 'refactored')}
    </div>
  )
}