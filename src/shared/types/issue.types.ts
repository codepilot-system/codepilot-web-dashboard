export interface Issue {
  id: string;
  title: string;
  description?: string;
  severity: string;
  category: string;
  status: string;
  filePath?: string;
  createdAt: string;
}

export interface IssuesResponse {
  status: string;
  data: Issue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface IssueFilters {
  status?: string;
  severity?: string;
  category?: string;
}
