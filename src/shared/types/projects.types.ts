export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
}

export interface ProjectContext {
  activeProject: ActiveProject | null;
  setActiveProject: (project: ActiveProject) => void;
}

export interface ActiveProject {
  id: string;
  name: string;
  owner: string;
  repoName: string;
}
