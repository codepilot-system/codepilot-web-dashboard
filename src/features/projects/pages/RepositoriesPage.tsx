import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/api/axiosClient";
import { useProject } from "../context/ProjectContext";
import { useAuth } from "../../auth/context/AuthContext";

// ── API calls ──────────────────────────────────────────────────────────────

const fetchUserProjects = async () => {
  const res = await api.get("/projects");
  return res.data; // { status, data: Project[], pagination }
};

const fetchDiscoverRepos = async (search: string) => {
  // The backend caps each page, so walk every page and collect them all —
  // otherwise repos beyond the first page never show up in the cards.
  const limit = 100;
  const all: any[] = [];
  let page = 1;
  let total = Infinity;

  while (all.length < total && page <= 50) {
    const res = await api.get("/projects/discover", {
      params: { search, page, limit },
    });
    const data: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
    all.push(...data);
    total = res.data?.pagination?.total ?? all.length;
    if (data.length === 0) break;
    page += 1;
  }

  return {
    data: all,
    pagination: { page: 1, limit: all.length, total: all.length },
  };
};

const trackRepo = async (repo: any) => {
  const res = await api.post("/projects", {
    owner: repo.owner,
    repoName: repo.name,
  });
  return res.data;
};

const joinProject = async (projectId: number) => {
  const res = await api.post("/projects", {
    projectId,
  });
  return res.data;
};

const startScan = async (projectId: number) => {
  const res = await api.post("/scans", { projectId, branchName: "main" });
  return res.data;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  JavaScript: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Python:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Go:         "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Rust:       "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Java:       "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const langBadge = (lang: string | null) => {
  if (!lang) return null;
  const cls = LANG_COLORS[lang] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>{lang}</span>
  );
};

const debtColor = (score: number) => {
  if (score >= 80) return { color: "text-emerald-500", label: "Healthy" };
  if (score >= 60) return { color: "text-yellow-500", label: "Moderate" };
  if (score >= 40) return { color: "text-orange-500", label: "At Risk" };
  return { color: "text-rose-500", label: "Critical" };
};

const relativeTime = (iso: string | null) => {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `about ${m} min${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `about ${h} hour${h !== 1 ? "s" : ""} ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) !== 1 ? "s" : ""} ago`;
};

// Windowed page numbers so the pager never overflows.
const getPageWindow = (current: number, total: number): (number | "gap")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("gap");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("gap");
  pages.push(total);
  return pages;
};

// ── Repo Card ──────────────────────────────────────────────────────────────

interface RepoCardProps {
  repo: any;
  onView: () => void;
  onScan: () => void;
  onImport: () => void;
  onJoin: () => void;
  isScanning: boolean;
  isImporting: boolean;
}


interface UserProject {
  id: number;
  name: string;
  lastScanDate: string | null;

  _count: {
    members: number;
    scans: number;
  };
}

const RepoCard: React.FC<RepoCardProps> = ({
  repo, onView, onScan, onImport, onJoin, isScanning, isImporting,
}) => {
  const debt = repo.latestDebtScore ?? null;
  const { color: debtCol, label: debtLabel } = debt !== null ? debtColor(debt) : { color: "text-slate-400", label: "—" };
  const isJoined  = repo.status === "JOINED";
  const canJoin   = repo.status === "JOIN";
  const canImport = repo.status === "IMPORT";
  // GitHub returns permissions.admin; only admins can import a repo.
  const isAdmin =
    repo.permissions?.admin ?? repo.isAdmin ?? repo.admin ?? true;
  const totalIssues   = repo.totalIssues   ?? 0;
  const criticalIssues = repo.criticalIssues ?? 0;

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Language icon avatar */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-lg">
            {repo.language === "TypeScript" ? "🔷"
              : repo.language === "JavaScript" ? "🟨"
              : repo.language === "Python" ? "🐍"
              : repo.language === "Go" ? "🔵"
              : "📦"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-base truncate">{repo.name ?? repo.repoName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{repo.owner ?? repo.fullName}</p>
          </div>
        </div>
        {langBadge(repo.language)}
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {repo.description}
        </p>
      )}

      {/* Issues + scan time */}
      {isJoined && (
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L1 12h11L6.5 1z" fill="#f97316" fillOpacity=".2" stroke="#f97316" strokeWidth="1.2"/>
              <line x1="6.5" y1="5" x2="6.5" y2="8.5" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <strong>{totalIssues}</strong> issues
          </span>
          {criticalIssues > 0 && (
            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {criticalIssues} critical
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-slate-400 text-xs">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1.5"/>
            </svg>
            {relativeTime(repo.lastScanDate ?? null)}
          </span>
        </div>
      )}

      {/* Debt score + actions row (always shown for joined repos) */}
      {isJoined && (
        <div className="flex items-center justify-between mt-auto">
          <div>
            {debt !== null ? (
              <>
                <span className={`text-2xl font-black ${debtCol}`}>{debt}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1.5">Debt Score</span>
                <p className={`text-xs font-semibold mt-0.5 ${debtCol}`}>{debtLabel}</p>
              </>
            ) : (
              <span className="text-xs text-slate-400">Not scanned yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <span className={isScanning ? "animate-spin" : ""}>↺</span>
              {isScanning ? "Scanning…" : "Scan"}
            </button>
            <button
              onClick={onView}
              className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              View →
            </button>
          </div>
        </div>
      )}

      {/* Not-yet-joined actions */}
      {!isJoined && (
        <div className="flex gap-2 mt-1">
          {canJoin && (
            <button
              onClick={onJoin}
              disabled={isImporting}
              className="flex-1 border border-[#2563eb] text-[#2563eb] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isImporting ? "Joining…" : "Join"}
            </button>
          )}
          {canImport && (
            isAdmin ? (
              <button
                onClick={onImport}
                disabled={isImporting}
                className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl py-2 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isImporting ? "Importing…" : "Import"}
              </button>
            ) : (
              <button
                disabled
                title="You need admin access on this repository to import it"
                className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl py-2 text-sm font-semibold cursor-not-allowed"
              >
                Admin access required
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: React.ReactNode; sub?: React.ReactNode; icon: string; iconBg: string;
}> = ({ label, value, sub, icon, iconBg }) => (
  <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start justify-between">
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-2">{sub}</p>}
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>
      {icon}
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────

export const RepositoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveProject } = useProject();
  const { currentUserData } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [repoPage, setRepoPage] = useState(1);
  const [scanningId, setScanningId]   = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Fetch user's joined projects (with analytics data)
  const { data: projectsData } = useQuery({
    queryKey: ["userProjects"],
    queryFn: fetchUserProjects,
  });

  // Discover / search all GitHub repos
  const { data: discoverData, isLoading } = useQuery({
    queryKey: ["discoverRepos", search],
    queryFn: () => fetchDiscoverRepos(search),
    staleTime: 2 * 60 * 1000,
  });

  const importMutation = useMutation({
    mutationFn: trackRepo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discoverRepos"] });
      queryClient.invalidateQueries({ queryKey: ["userProjects"] });
    },
  });

  const joinMutation = useMutation({
    mutationFn: ({ projectId }: { projectId: number }) => joinProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discoverRepos"] });
      queryClient.invalidateQueries({ queryKey: ["userProjects"] });
    },
  });

  const scanMutation = useMutation({
    mutationFn: (projectId: number) => startScan(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProjects"] });
    },
  });

  // Aggregate issues / critical / debt across ALL imported (joined) repos,
  // and expose a per-project map so each card shows its real numbers.
  const joinedIds = (projectsData?.data ?? []).map((p: any) => p.id);
  const { data: analytics } = useQuery({
    queryKey: ["reposAggregateAnalytics", joinedIds],
    enabled: joinedIds.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        joinedIds.map(async (id: number) => {
          try {
            const res = await api.get("/analytics", { params: { projectId: id } });
            const records: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
            if (records.length === 0) return [id, null] as const;
            // Use the most recent analytics record for each repo.
            const latest = [...records].sort(
              (a, b) =>
                new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
            )[0];
            const sd = latest.severityDistribution ?? {};
            const total = Object.values(sd).reduce(
              (s: number, n: any) => s + (Number(n) || 0),
              0
            );
            return [
              id,
              {
                totalIssues: total,
                criticalIssues: Number(sd.CRITICAL ?? 0),
                debtScore:
                  typeof latest.technicalDebtScore === "number"
                    ? latest.technicalDebtScore
                    : null,
              },
            ] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );

      const byProject: Record<
        number,
        { totalIssues: number; criticalIssues: number; debtScore: number | null }
      > = {};
      let totalIssues = 0;
      let criticalIssues = 0;
      let debtSum = 0;
      let debtCount = 0;

      for (const [id, v] of entries) {
        if (!v) continue;
        byProject[id] = v;
        totalIssues += v.totalIssues;
        criticalIssues += v.criticalIssues;
        if (v.debtScore !== null) {
          debtSum += v.debtScore;
          debtCount += 1;
        }
      }

      return {
        byProject,
        totals: {
          totalIssues,
          criticalIssues,
          avgDebt: debtCount > 0 ? Math.round(debtSum / debtCount) : 0,
        },
      };
    },
  });

  const repos: any[] = discoverData?.data ?? [];

  // Merge analytics from userProjects into discover list
  const projectsMap = new Map(
    (projectsData?.data ?? []).map((p: any) => [p.id, p])
  );

  const enrichedRepos = repos.map((r) => {
    if (r.status === "JOINED" && r.projectId) {
      const proj: any = projectsMap.get(r.projectId);
      const a = analytics?.byProject?.[r.projectId];
      return {
        ...r,
        lastScanDate:    proj?.lastScanDate ?? r.lastScanDate ?? null,
        totalIssues:     a?.totalIssues ?? 0,
        criticalIssues:  a?.criticalIssues ?? 0,
        latestDebtScore: a?.debtScore ?? null,
      };
    }
    return r;
  });

  // Stats aggregated from joined projects
  const joinedProjects = (projectsData?.data ?? []);
  const totalRepos     = joinedProjects.length;
  const totalIssues    = joinedProjects.reduce((s: number, p: any) => s + (p._count?.issues ?? 0), 0);

  // Client-side pagination — 4 repos per page.
  const REPOS_PER_PAGE = 4;
  const totalRepoPages = Math.max(1, Math.ceil(enrichedRepos.length / REPOS_PER_PAGE));
  const pagedRepos = enrichedRepos.slice(
    (repoPage - 1) * REPOS_PER_PAGE,
    repoPage * REPOS_PER_PAGE
  );

  // Reset to first page when the search changes.
  useEffect(() => {
    setRepoPage(1);
  }, [search]);

  // Keep the current page within bounds when the result count changes.
  useEffect(() => {
    if (repoPage > totalRepoPages) setRepoPage(totalRepoPages);
  }, [repoPage, totalRepoPages]);

  const handleView = (repo: any) => {
    setActiveProject({
      id:       String(repo.projectId),
      name:     repo.name ?? repo.repoName,
      owner:    repo.owner,
      repoName: repo.name ?? repo.repoName,
    });
    navigate("/dashboard");
  };

  const handleScan = async (repo: any) => {
    if (!repo.projectId) return;
    setScanningId(String(repo.projectId));
    try { await scanMutation.mutateAsync(repo.projectId); }
    finally { setScanningId(null); }
  };

  const handleImport = async (repo: any) => {
    setImportingId(String(repo.githubId ?? repo.id));
    try { await importMutation.mutateAsync(repo); }
    finally { setImportingId(null); }
  };

  const handleJoin = async (repo: any) => {
    if (!repo.projectId) return;
    setImportingId(String(repo.githubId ?? repo.id));
    try { await joinMutation.mutateAsync({ projectId: repo.projectId }); }
    finally { setImportingId(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Repositories</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage and analyze your connected repositories
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Repositories" value={totalRepos}
          icon="🔀" iconBg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          label="Total Issues" value={analytics?.totals.totalIssues ?? totalIssues}
          sub="Across all repositories"
          icon="⚠️" iconBg="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          label="Critical Issues" value={analytics?.totals.criticalIssues ?? 0}
          sub="Across all repositories"
          icon="🔴" iconBg="bg-rose-50 dark:bg-rose-900/20"
        />
        <StatCard
          label="Avg. Debt Score" value={analytics?.totals.avgDebt ?? 0}
          sub="Health Score"
          icon="📈" iconBg="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repositories…"
          className="w-full max-w-sm bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Repo grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : enrichedRepos.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No repositories found</p>
          <p className="text-sm mt-1">
            {search ? `No results for "${search}"` : "Install the CodePilot GitHub App to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pagedRepos.map((repo) => (
            <RepoCard
              key={String(repo.githubId ?? repo.id ?? repo.projectId)}
              repo={repo}
              onView={() => handleView(repo)}
              onScan={() => handleScan(repo)}
              onImport={() => handleImport(repo)}
              onJoin={() => handleJoin(repo)}
              isScanning={scanningId === String(repo.projectId)}
              isImporting={importingId === String(repo.githubId ?? repo.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && enrichedRepos.length > REPOS_PER_PAGE && (
        <div className="flex items-center justify-between flex-wrap gap-3 mt-6">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {(repoPage - 1) * REPOS_PER_PAGE + 1}–
            {Math.min(repoPage * REPOS_PER_PAGE, enrichedRepos.length)} of{" "}
            {enrichedRepos.length} repositories
          </span>
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => setRepoPage((p) => Math.max(1, p - 1))}
              disabled={repoPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              ‹
            </button>
            {getPageWindow(repoPage, totalRepoPages).map((p, idx) =>
              p === "gap" ? (
                <span key={`gap-${idx}`} className="px-2 text-slate-400 select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setRepoPage(p)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    p === repoPage
                      ? "bg-[#2563eb] border-[#2563eb] text-white"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setRepoPage((p) => Math.min(totalRepoPages, p + 1))}
              disabled={repoPage === totalRepoPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoriesPage;