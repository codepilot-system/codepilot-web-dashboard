import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issuesService } from '../api/issues.service'
import DiffViewer from '../components/DiffViewer'
import { SyntaxHighlightParser } from '../utils/SyntaxHighlightParser'
import './IssueDetail.css'

export default function IssueDetail() {
  const { issueId } = useParams<{ issueId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: issue, isLoading, isError } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issuesService.getById(issueId!),
    enabled: !!issueId,
  })

  const applyMutation = useMutation({
    mutationFn: () => issuesService.applyPatch(issueId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repoIssues'] })
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      navigate('/issues')
    },
  })

  const dismissMutation = useMutation({
    mutationFn: () =>
      issuesService.updateStatus(issueId!, 'CLOSED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repoIssues'] })
      navigate('/issues')
    },
  })

  const resolveMutation = useMutation({
    mutationFn: () =>
      issuesService.updateStatus(issueId!, 'FIXED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repoIssues'] })
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      navigate('/issues')
    },
  })

  if (isLoading) {
    return <div className="issues-loading">Loading…</div>
  }

  if (isError || !issue) {
    return (
      <div className="issues-error">
        Issue not found or failed to load.
      </div>
    )
  }

  const suggestion = issue.suggestions?.[0]

  const parsedDiff = suggestion
    ? SyntaxHighlightParser.parse(suggestion.diffPatch)
    : null

  return (
    <div className="detail-page">
      <button
        className="detail-back-btn"
        onClick={() => navigate('/issues')}
      >
        ← Back to Issues
      </button>

      <h1 className="detail-title">{issue.title}</h1>

      <div className="detail-grid">
        {/* LEFT COLUMN */}
        <div>
          <div className="detail-code-block">
            <div className="detail-code-header">
              <span>{issue.filePath ?? 'Unknown file'}</span>
              <span className="detail-code-lang">
                TypeScript
              </span>
            </div>

            {parsedDiff ? (
              <DiffViewer lines={parsedDiff} />
            ) : (
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '13px',
                }}
              >
                No diff available for this issue.
              </p>
            )}
          </div>

          {suggestion && (
            <div className="detail-action-bar">
              <div className="detail-action-bar-label">
                <span>ℹ</span>
                <span>
                  AI suggested refactor available for this
                  issue
                </span>
              </div>

              <div className="detail-action-bar-buttons">
                <button
                  className="detail-btn detail-btn--ghost"
                  onClick={() => dismissMutation.mutate()}
                  disabled={dismissMutation.isPending}
                >
                  Dismiss
                </button>

                <button
                  className="detail-btn"
                  onClick={() => resolveMutation.mutate()}
                  disabled={resolveMutation.isPending}
                >
                  {resolveMutation.isPending
                    ? 'Updating...'
                    : 'Mark Fixed'}
                </button>

                <button
                  className="detail-btn detail-btn--primary"
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending
                    ? 'Applying...'
                    : 'Approve & Commit'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="detail-panel">
          <div className="detail-card">
            <h3 className="detail-card-title">
              ✦ AI Explanation
            </h3>

            <p className="detail-card-body">
              {suggestion?.explanation ??
                'No explanation available.'}
            </p>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">
              📝 Suggestion Summary
            </h3>

            <p className="detail-card-body">
              {suggestion?.summary ??
                'No suggestion summary available.'}
            </p>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">
              Metadata
            </h3>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                Severity
              </span>
              <span
                className={`detail-badge detail-badge--${issue.severity}`}
              >
                {issue.severity}
              </span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                Category
              </span>
              <span className="detail-meta-value">
                {issue.category}
              </span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                Status
              </span>
              <span className="detail-meta-value">
                {issue.status}
              </span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                Generated At
              </span>
              <span className="detail-meta-value">
                {suggestion?.generatedAt
                  ? new Date(
                      suggestion.generatedAt
                    ).toLocaleString()
                  : '—'}
              </span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                File
              </span>
              <span className="detail-meta-value">
                {issue.filePath ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}