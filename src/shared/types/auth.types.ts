export interface AuthContext {
  isAuthenticated: boolean;
  currentUserData: UserData | null;
  accessToken: string | null;
  loading: boolean;
  triggerGithubOAuth: () => Promise<void>;
  finalizeSession: (code: string, state: string) => Promise<void>;
  purgeSession: () => Promise<void>;
}

export interface UserData {
  id: number;
  githubId: number;
  username: string;
  avatarUrl: string;
}
