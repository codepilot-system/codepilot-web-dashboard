import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useProject } from "../../features/projects/context/ProjectContext";
import { api } from "../api/axiosClient";
import { ThemeToggle } from "./ThemeToggle";

const COLLAPSE_KEY = "codepilot-sidebar-collapsed";
const W_EXPANDED = "16rem";   // 256px
const W_COLLAPSED = "4.75rem"; // 76px

// ── Icons ──────────────────────────────────────────────────────────────────
const IconRepos: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);
const IconAnalytics: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M3 3v18h18" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
  </svg>
);
const IconReports: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

// ── Logo ─────────────────────────────────────────────────────────────────
const Logo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className="flex items-center gap-2 min-w-0">
    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-blue-600 flex-shrink-0">
      <img src="/logo.svg" alt="CP" className="w-5 h-5" />
    </div>
    {!collapsed && (
      <span className="font-black text-base tracking-tight text-slate-900 dark:text-white truncate">
        CodePilot
      </span>
    )}
  </div>
);

// ── User block (bottom of sidebar) ─────────────────────────────────────────
const UserMenu: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { currentUserData, purgeSession } = useAuth();
  const [open, setOpen] = React.useState(false);

  const avatar = currentUserData?.avatarUrl ? (
    <img
      src={currentUserData.avatarUrl}
      alt={currentUserData.username}
      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover flex-shrink-0"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {currentUserData?.username?.[0]?.toUpperCase() ?? "U"}
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title={collapsed ? currentUserData?.username ?? "user" : undefined}
        className={`w-full flex items-center gap-2.5 rounded-xl py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
          collapsed ? "justify-center px-0" : "px-2.5"
        }`}
      >
        {avatar}
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {currentUserData?.username ?? "user"}
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
              strokeWidth="1.8" className="text-slate-400 flex-shrink-0">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 z-40 min-w-[10rem] bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 overflow-hidden">
            <button
              onClick={purgeSession}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ── Nav item ────────────────────────────────────────────────────────────────
const NavItem: React.FC<{
  to: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
}> = ({ to, label, icon, collapsed }) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl text-sm transition-colors ${
        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
      } ${
        isActive
          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
          : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      }`
    }
  >
    {icon}
    {!collapsed && <span className="truncate">{label}</span>}
  </NavLink>
);

// ── Collapse toggle ──────────────────────────────────────────────────────────
const CollapseButton: React.FC<{ collapsed: boolean; onClick: () => void }> = ({
  collapsed,
  onClick,
}) => (
  <button
    onClick={onClick}
    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    title={collapsed ? "Expand" : "Collapse"}
    className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
      collapsed ? "mx-auto" : "ml-auto"
    }`}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${collapsed ? "rotate-180" : ""}`}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  </button>
);

// ── Top bar (search + active repo + logout) ────────────────────────────────
const IconSearch: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

const IconLogout: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, setActiveProject } = useProject();
  const { purgeSession } = useAuth();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["trackedProjects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const q = query.trim().toLowerCase();
  const results = (q
    ? projects.filter((p: any) =>
        [p.name, p.owner, p.repoName, `${p.owner}/${p.repoName}`]
          .filter(Boolean)
          .some((f: string) => String(f).toLowerCase().includes(q))
      )
    : projects
  ).slice(0, 8);

  const selectRepo = (p: any) => {
    setActiveProject({
      id: String(p.id),
      name: p.name,
      owner: p.owner,
      repoName: p.repoName,
    });
    setQuery("");
    setOpen(false);
    navigate("/dashboard");
  };

  return (
    <header className="sticky top-0 right-0 z-30 h-16 flex items-center gap-3 sm:gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur px-4 sm:px-6">
      {/* Repo search with dropdown */}
      <div className="relative w-full max-w-md ml-auto">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <IconSearch />
        </span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search your repositories…"
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors"
        />

        {open && (
          <>
            {/* click-away overlay */}
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-72 overflow-y-auto bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1">
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-slate-400">Loading…</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400">
                  No repositories found.
                </div>
              ) : (
                results.map((p: any) => {
                  const isActive = String(p.id) === String(activeProject?.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => selectRepo(p)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-500/10"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">
                        <IconRepos />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {p.name ?? p.repoName}
                        </span>
                        <span className="block text-xs text-slate-400 truncate">
                          {p.owner}/{p.repoName}
                        </span>
                      </span>
                      {isActive && (
                        <span className="flex-shrink-0 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Active repo name */}
      {activeProject && (
        <div className="hidden sm:flex items-center gap-2 max-w-[220px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">
            <IconRepos />
          </span>
          <span className="text-sm font-medium truncate" title={activeProject.name}>
            {activeProject.name}
          </span>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={purgeSession}
        title="Log out"
        aria-label="Log out"
        className="p-2 rounded-lg text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
      >
        <IconLogout />
      </button>
    </header>
  );
};

// ── Layout ─────────────────────────────────────────────────────────────────

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "true";
  });

  React.useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  const width = collapsed ? W_COLLAPSED : W_EXPANDED;

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#0d1117]">
      {/* ── Left vertical navbar ── */}
      <aside
        className="fixed top-0 left-0 h-screen flex flex-col bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none z-40 transition-[width] duration-200 ease-in-out"
        style={{ width }}
      >
        {/* Brand + collapse toggle */}
        <div className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800/80 ${collapsed ? "flex-col justify-center gap-1 py-2" : "px-4 gap-2"}`}>
          {!collapsed && <Logo collapsed={collapsed} />}
          <CollapseButton collapsed={collapsed} onClick={() => setCollapsed((c) => !c)} />
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          <NavItem to="/repositories" label="Repositories" icon={<IconRepos />} collapsed={collapsed} />
          <NavItem to="/analytics" label="Analytics" icon={<IconAnalytics />} collapsed={collapsed} />
          <NavItem to="/reports" label="Reports" icon={<IconReports />} collapsed={collapsed} />
        </nav>

        {/* Footer: theme toggle + user */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1">
          {collapsed ? (
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          ) : (
            <ThemeToggle withLabel />
          )}
          <UserMenu collapsed={collapsed} />
        </div>
      </aside>

      {/* ── Page content (leaves room for the left sidebar) ── */}
      <main className="min-h-screen transition-[margin] duration-200 ease-in-out" style={{ marginLeft: width }}>
        <TopBar />
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};