import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGithubRepos, useTrackRepository } from "../hooks/useGithubRepos";
import { useAuth } from "../../auth/context/AuthContext";
import { useProject } from "../context/ProjectContext";
import { GitHubRepository } from "../../../shared/types/projects.types";

export const OnboardingModal: React.FC = () => {
  const navigate = useNavigate();
  const { purgeSession } = useAuth();
  const { setActiveProject } = useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Consume your dynamic pagination hook
  const { data, isLoading, isError, refetch } = useGithubRepos(
    searchTerm,
    page,
    5,
  );

  const trackMutation = useTrackRepository((response, variables) => {
    const initializedProject = response?.data?.data || response?.data;

    setActiveProject({
      id: String(initializedProject?.id || variables.id),
      name: variables.name,
      owner: variables.full_name
        ? variables.full_name.split("/")[0]
        : variables.owner,
      repoName: variables.name,
    });

    navigate("/dashboard", { replace: true });
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Connect Repositories
            </h1>
            <p className="text-sm text-slate-400">
              Select active target deployment workspaces for scanning.
            </p>
          </div>
          <button
            onClick={purgeSession}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            Logout Session
          </button>
        </div>

        {/* Action Controls Frame UI Block */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search specific owner/repo path names..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-violet-600/20"
          >
            Refresh
          </button>
        </div>

        {/* Content Render Framework Management Execution Block */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            Loading portfolio options matrix setup components...
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 text-sm">
            Failed to connect directly to the account gateway. Ensure the App
            installation token is authenticated.
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="divide-y divide-slate-800/60">
              {data?.githubRepos.map((repo: GitHubRepository) => (
                <div
                  key={repo.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-900/20 transition-all group"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-violet-400 transition-colors">
                      {repo.full_name}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl truncate">
                      {repo.description ||
                        "No descriptive summary metrics context strings entries uploaded."}
                    </p>
                  </div>
                  <button
                    onClick={() => trackMutation.mutate(repo)}
                    disabled={trackMutation.isPending}
                    className="px-4 py-1.5 bg-slate-900 border border-slate-700 hover:border-violet-500 hover:bg-violet-600/10 text-slate-200 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {trackMutation.isPending ? "Connecting..." : "Track Engine"}
                  </button>
                </div>
              ))}
              {data?.githubRepos.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No repositories matching configuration query bounds profiles
                  arrays found.
                </div>
              )}
            </div>

            {/* Direct Context Simple Pagination Footprint Block */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-400 font-mono">
                Current Evaluation Viewport Page: {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(data?.githubRepos.length || 0) < 5}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
