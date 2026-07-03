import { useState } from 'react'
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

  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Refresh every analytics query so totals / charts reflect issue changes.
  const invalidateAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: ['repo-overview'] })
    queryClient.invalidateQueries({ queryKey: ['scans'] })
    queryClient.invalidateQueries({ queryKey: ['debtTrends'] })
    queryClient.invalidateQueries({ queryKey: ['languageBreakdown'] })
    queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] })
    queryClient.invalidateQueries({ queryKey: ['reportSummary'] })
  }

  const applyMutation = useMutation({
mutationFn: () => {
  if (!suggestion) {
    throw new Error('No AI suggestion available');
  }

  return issuesService.applySuggestion(Number(suggestion.id));
},
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['repoIssues'],
    })

    queryClient.invalidateQueries({
      queryKey: ['issue', issueId],
    })

    // Refresh analytics so totals / charts reflect the applied fix
    invalidateAnalytics()

    setShowSuccessModal(true)
  },
})

  const dismissMutation = useMutation({
    mutationFn: () =>
      issuesService.updateStatus(issueId!, 'CLOSED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repoIssues'] })
      invalidateAnalytics()
      navigate('/issues')
    },
  })

  const resolveMutation = useMutation({
    mutationFn: () =>
      issuesService.updateStatus(issueId!, 'FIXED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repoIssues'] })
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      invalidateAnalytics()
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

      {/* <h1 className="detail-title">{issue.title}</h1> */}
      <div className="detail-title-wrapper">
  <h1 className="detail-title">{issue.summary}</h1>

  <span
    className={`detail-source-badge ${
      issue.source === 'AI'
        ? 'detail-source-badge--ai'
        : 'detail-source-badge--analyzer'
    }`}
  >
    {issue.source}
  </span>
</div>

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
              {issue.source === 'AI'
                ? 'No diff available.'
                : 'This issue was detected by the analyzer. No automatic fix is available.'}
            </p>
            )}
          </div>

            <div className="detail-action-bar">
              <div className="detail-action-bar-label">
                <span>ℹ</span>
               <span>
                  {issue.source === 'AI'
                    ? 'AI suggested refactor available.'
                    : 'This issue was detected by the analyzer.'}
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
              {issue.source === 'AI' && suggestion && (
                <button
                  className="detail-btn detail-btn--primary"
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending
                    ? 'Applying...'
                    : 'Approve & Commit'}
                </button>
              )}
              </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="detail-panel">
          <div className="detail-card">
            <h3 className="detail-card-title">
              ✦ AI Explanation
            </h3>

            {/* <p className="detail-card-body">
              {suggestion?.explanation ??
                'No explanation available.'}
            </p> */}
            <p className="detail-card-body">
            {issue.explanation}
          </p>
          </div>

          <div className="detail-card">
            <h3 className="detail-card-title">
              📝 Suggestion Summary
            </h3>

           <p className="detail-card-body">
            {suggestion
              ? suggestion.summary
              : 'This issue was detected by the analyzer and has no AI suggestion.'}
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
                Source
              </span>

              <span
                className={`detail-source-badge ${
                  issue.source === 'AI'
                    ? 'detail-source-badge--ai'
                    : 'detail-source-badge--analyzer'
                }`}
              >
                {issue.source}
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
                  : new Date(issue.detectedAt).toLocaleString()}
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
      {
  showSuccessModal && (
    <div
      className="success-modal-overlay"
      onClick={() => setShowSuccessModal(false)}
    >
      <div
        className="success-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-modal-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 className="success-modal-title">
          Refactor Committed Successfully
        </h2>

        <p className="success-modal-text">
          The patch has been pushed successfully to your repository.
        </p>

        <div className="success-modal-actions">
          <button
            className="success-modal-btn success-modal-btn--primary"
            onClick={() => navigate('/issues')}
          >
            Return to Issues
          </button>

          <button
            className="success-modal-btn success-modal-btn--ghost"
            onClick={() => {
              // VS Code
            }}
          >
            View on VS Code
          </button>
        </div>
      </div>
    </div>
  )
}
    </div>
  )
}