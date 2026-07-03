import { useState } from 'react'
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { issuesService, IssueFilters } from '../api/issues.service'
import { useProject } from '../../../features/projects/context/ProjectContext'
import { useIssuesSync } from '../hooks/useIssuesSync'
import './IssuesView.css'

export default function IssuesView() {
  const navigate    = useNavigate()
  const { activeProject } = useProject()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState(searchParams.get('search') ?? '')
  const [severity, setSeverity] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus]     = useState('')

  // Sync the search box when arriving from the top-bar search (?search=…).
  const urlSearch = searchParams.get('search') ?? ''
  useEffect(() => {
    setSearch(urlSearch)
    setPage(1)
  }, [urlSearch])

  const { isSyncing } = useIssuesSync(() => {
    queryClient.invalidateQueries({ queryKey: ['repoIssues'] })
  })

  const filters: IssueFilters = {
    projectId: activeProject?.id ?? '',
    page,
    limit: 5,
    search:   search   || undefined,
    severity: (severity || undefined) as any,
    category: category || undefined,
    status:   (status  || undefined) as any,
  }

  const { data, isLoading, isError } = useQuery({
   queryKey: [
  'repoIssues',
  activeProject?.id,
  page,
  search,
  severity,
  category,
  status,
],
    queryFn:  () => issuesService.getAll(filters),
    placeholderData: (prev) => prev,
    enabled: !!activeProject?.id,
  })

  const dismissMutation = useMutation({
    mutationFn: (issueId: string) => issuesService.updateStatus(issueId, 'CLOSED'),
    onMutate: async (issueId) => {
      await queryClient.cancelQueries({ queryKey: ['repoIssues'] })
      const prev = queryClient.getQueryData(['repoIssues',
  activeProject?.id,
  page,
  search,
  severity,
  category,
  status,])
      queryClient.setQueryData(['repoIssues', filters], (old: any) => ({
        ...old,
        data: old?.data?.filter((i: any) => i.id !== issueId),
      }))
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['repoIssues', filters], ctx?.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['repoIssues'] })
    },
  })

const totalPages = Math.max(
  1,
  Math.ceil((data?.pagination.total ?? 0) / 5)
)

// Windowed page numbers so the control never overflows on narrow screens.
const getPageWindow = (current: number, total: number): (number | 'gap')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | 'gap')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('gap')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push('gap')
  pages.push(total)
  return pages
}
  if (!activeProject?.id) {
    return (
      <div className="issues-empty-state">
        <p>No project selected</p>
        <p>Select a repository from the dropdown to view its issues.</p>
      </div>
    )
  }

  return (
    <div className="issues-page">

      {isSyncing && (
        <div className="issues-sync-banner">
          ⟳ Scan in progress — results will refresh automatically
        </div>
      )}

      <h1 className="issues-heading">Issues</h1>
      <p className="issues-subheading">{activeProject.name}</p>

      {/* Filter row */}
      <div className="issues-filters">
        <input
          className="issues-search"
          placeholder="Search issues…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select
          className="issues-select"
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1) }}
        >
          <option value="">All Severities</option>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="issues-select"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
        >
          <option value="">All Categories</option>
          {['Complexity', 'Security', 'Performance', 'Duplication', 'Code Smell'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="issues-select"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="">All Statuses</option>
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* States */}
      {isLoading && <div className="issues-loading">Loading…</div>}
      {isError   && <div className="issues-error">Failed to load issues. Please try again.</div>}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="issues-table-wrapper">
          <table className="issues-table">
            <thead>
              <tr>
                {['Issue', 'Title & Path', 'Severity', 'Category', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="issues-table-empty">No issues found.</td>
                </tr>
              )}
              {data?.data.map((issue) => (
                <tr key={issue.id} onClick={() => navigate(`/issues/${issue.id}`)}>
                  <td>
                    <svg className="issues-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </td>
                  <td>
                    <div className="issues-title">{issue.title}</div>
                    <div className="issues-path">{issue.filePath}:{issue.lineNumber}</div>
                  </td>
                  <td>
                    <span className={`issues-badge issues-badge--${issue.severity}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="issues-category">{issue.category}</td>
                  <td>
                    <span className={`issues-status ${issue.status === 'CLOSED' ? 'issues-status--dismissed' : ''}`}>
                      {issue.status === 'CLOSED'
                        ? 'Dismissed'
                        : issue.status.charAt(0) + issue.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="issues-action-btn"
                      onClick={() => dismissMutation.mutate(issue.id)}
                      title="Dismiss issue"
                    >
                      ···
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && (
        <div className="issues-pagination">
          <span>
            Showing {((page - 1) * 5) + 1} – {Math.min(page * 5, data?.pagination.total ?? 0)} of {data?.pagination.total ?? 0} issues
          </span>
          <div className="issues-pagination-controls">
            <button
              className="issues-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >‹</button>
            {getPageWindow(page, totalPages).map((p, idx) =>
              p === 'gap' ? (
                <span key={`gap-${idx}`} className="issues-page-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  className={`issues-page-btn ${p === page ? 'issues-page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              )
            )}
            <button
              className="issues-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >›</button>
          </div>
        </div>
      )}

    </div>
  )
}