import { api } from '../../../shared/api/axiosClient'
export type IssueStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'FIXED'

export type IssueSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export type IssueSource =
  | 'ANALYZER'
  | 'AI'
export interface IssueFilters {
  projectId: string
  page?: number
  limit?: number
  status?: IssueStatus
  severity?: IssueSeverity
  category?: string
  search?: string
}
export interface Issue {
  id: number
  projectId: number
  scanId: number

  filePath: string
  lineNumber: number

  severity: IssueSeverity
  category: string
  status: IssueStatus
  source: IssueSource

  summary: string
  explanation: string
  codeSnippet: string | null
  detectedAt: string

  suggestions: Suggestion[]
}

export interface Suggestion {
  id: string
  summary: string
  explanation: string
  diffPatch: string
  status: IssueStatus
  generatedAt: string
}
export interface PaginatedIssues {
  data: Issue[]
  pagination: { page: number; limit: number; total: number }
}

export const issuesService = {
  async getAll(filters: IssueFilters): Promise<PaginatedIssues> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    )
    const { data } = await api.get('/issues', { params })
    return data
  },

  async getById(issueId: string): Promise<Issue> {
    const { data } = await api.get(`/issues/${issueId}`)
    return data.data
  },

  async updateStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    const { data } = await api.patch(`/issues/${issueId}`, { status })
    return data.data
  },

 async applySuggestion(suggestionId: number): Promise<void> {
  await api.post(`/suggestions/${suggestionId}/apply`)
}
}