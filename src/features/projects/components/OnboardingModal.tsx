import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGithubRepos, useTrackRepository } from "../hooks/useGithubRepos";
import { useAuth } from "../../auth/context/AuthContext";
import { useProject } from "../context/ProjectContext";
import { api } from "../../../shared/api/axiosClient";

export const OnboardingModal: React.FC = () => {
  const navigate = useNavigate();
  const { purgeSession } = useAuth();
  const { setActiveProject } = useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUrlProcessing, setIsUrlProcessing] = useState(false);

  // Track the EXACT GitHub ID of the repository currently processing an import action
  const [processingRepoId, setProcessingRepoId] = useState<number | null>(null);

  // Consume query hook for retrieving repositories via /api/projects/discover
  const {
    data: backendResponse,
    isLoading,
    isError,
    refetch,
  } = useGithubRepos(searchTerm, page, 5);

  const repos = backendResponse?.data || [];

  const trackMutation = useTrackRepository((response, variables) => {
    const initializedProject = response?.data;
    setActiveProject({
      id: String(initializedProject?.id),
      name: initializedProject?.name || variables.name,
      owner: initializedProject?.owner || variables.owner,
      repoName: initializedProject?.repoName || variables.name,
    });
    setProcessingRepoId(null); // Clear unique item loading state on success
    navigate("/dashboard", { replace: true });
  });

  // Helper logic to capture pasted repository URLs
  const parseRepoUrl = (input: string) => {
    const urlPattern = /github\.com\/([^/]+)\/([^/]+)/;
    const match = input.match(urlPattern);
    if (match) {
      return { owner: match[1], repoName: match[2].replace(".git", "").trim() };
    }
    return null;
  };

  // Intercept the inputs to verify if user pasted a link directly
  useEffect(() => {
    const parsed = parseRepoUrl(searchTerm);
    if (parsed) {
      handleDirectUrlImport(parsed.owner, parsed.repoName);
    }
  }, [searchTerm]);

  const handleDirectUrlImport = async (owner: string, repoName: string) => {
    try {
      setIsUrlProcessing(true);
      setErrorMessage(null);

      // Hit creation endpoint directly for pasted links
      const response = await api.post("/projects", { owner, repoName });
      if (response.data?.data) {
        const p = response.data.data;
        setActiveProject({
          id: String(p.id),
          name: p.name,
          owner: p.owner,
          repoName: p.repoName,
        });
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to import pasted repository URL details.";
      setErrorMessage(errorMsg);
    } finally {
      setIsUrlProcessing(false);
    }
  };

  const handleActionClick = (repo: any) => {
    setErrorMessage(null);

    // Block non-admins from triggering imports on the client side
    if (repo.status === "IMPORT" && !repo.isAdmin) {
      setErrorMessage(
        `Only repository administrators can import "${repo.name}". Please contact your repository admin.`,
      );
      return;
    }

    // Set the specific repository's ID to lock loading state to ONLY this row
    setProcessingRepoId(repo.githubId);

    trackMutation.mutate(repo, {
      onError: () => {
        setProcessingRepoId(null); // Clear loading indicator if request crashes
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Connect Repositories
            </h1>
            <p className="text-sm text-slate-400">
              Discover and import target deployment workspaces for code quality
              analysis.
            </p>
          </div>
          <button
            onClick={purgeSession}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            Logout Session
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Input Block */}
        <div className="flex gap-4 items-center relative">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search repositories or paste a repo URL..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading || isUrlProcessing}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-all"
          >
            {isUrlProcessing ? "Processing..." : "Refresh"}
          </button>

          {/* Info Tooltip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-sm"
            >
              ℹ
            </button>

            {showTooltip && (
              <div className="absolute right-0 mt-3 w-96 p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 text-xs space-y-4 text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-bold text-white mb-1">
                    Why is my repository missing?
                  </h4>
                  <p>
                    CodePilot only shows repositories where the CodePilot GitHub
                    App has been installed. If you are the repository owner,
                    click "Adjust GitHub Permissions" below to grant access.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    I granted access, but it's still not showing up?
                  </h4>
                  <p>
                    For speed, our search looks through your 100 most recently
                    updated repositories. If your repository is older, simply
                    paste its full URL into the search bar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Repositories List View */}
        {isLoading || isUrlProcessing ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            Loading repository workspaces...
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 text-sm">
            Failed to fetch user repository indexes. Ensure your backend server
            is online.
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="divide-y divide-slate-800/60">
              {repos.map((repo: any) => {
                const isImportDisabled =
                  repo.status === "IMPORT" && !repo.isAdmin;
                // Check if THIS SPECIFIC row is currently mutating
                const isThisRepoLoading = processingRepoId === repo.githubId;

                return (
                  <div
                    key={repo.githubId}
                    className="p-4 flex items-center justify-between hover:bg-slate-900/20 transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-violet-400 transition-colors">
                          {repo.fullName}
                        </h3>
                        {repo.private && (
                          <span className="px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-400 rounded">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl truncate">
                        {repo.description ||
                          "No descriptive summary string found for this repository."}
                      </p>
                    </div>

                    <button
                      onClick={() => handleActionClick(repo)}
                      // Disable ONLY while something is loading globally OR if this specific one is disabled
                      disabled={
                        processingRepoId !== null ||
                        repo.status === "JOINED" ||
                        isImportDisabled
                      }
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                        repo.status === "JOINED"
                          ? "bg-emerald-950/40 border-emerald-800 text-emerald-400 cursor-not-allowed"
                          : repo.status === "JOIN"
                            ? "bg-violet-600 border-violet-500 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
                            : isImportDisabled
                              ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-60"
                              : "bg-slate-900 border-slate-700 hover:border-violet-500 text-slate-200 hover:bg-violet-600/10"
                      }`}
                    >
                      {isThisRepoLoading ? "Processing..." : repo.status}
                    </button>
                  </div>
                );
              })}

              {repos.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No repositories found matching current query boundaries.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-slate-400 font-mono">
                Page: {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={repos.length < 5}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Global Access Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Can't find your repository?{" "}
            <a
              href="https://github.com/apps/codepilot-system"
              target="_blank"
              rel="noreferrer"
              className="text-violet-400 hover:text-violet-300 underline transition-colors font-medium"
            >
              Adjust GitHub Permissions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
