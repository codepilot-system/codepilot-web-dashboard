// src/features/landing/pages/LandingPage.tsx
//
// Public marketing landing page — the first page that introduces the product.
// Matches "body.bg-background-light (1)" (dark) and "(2)" (light) from the
// UI design folder. Keeps a TOP navbar (Features / Research / Pricing / Log in)
// and supports both light and dark themes via the global theme toggle.

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ThemeToggle } from "../../../shared/components/ThemeToggle";

// ── Brand mark ───────────────────────────────────────────────────────────────
const BrandMark: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7l4 5-4 5" />
        <path d="M12 17h8" />
      </svg>
    </div>
    <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
      CodePilot
    </span>
  </div>
);

const GitHubIcon: React.FC = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.48.01-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.061.069-.061 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
    />
  </svg>
);

// ── Feature icons ────────────────────────────────────────────────────────────
const iconProps = {
  width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const FEATURES = [
  {
    title: "AI-Powered Analysis",
    desc: "Advanced machine learning models detect complex code patterns, anti-patterns, and opportunities for improvement.",
    icon: (
      <svg {...iconProps}>
        <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0012 2z" />
      </svg>
    ),
  },
  {
    title: "Smart Refactoring",
    desc: "Get context-aware code suggestions that maintain functionality while improving readability and performance.",
    icon: (
      <svg {...iconProps}>
        <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
      </svg>
    ),
  },
  {
    title: "Git Integration",
    desc: "Seamless GitHub integration with automatic PR creation and VS Code extension support for your research workflow.",
    icon: (
      <svg {...iconProps}>
        <circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="9" r="2.5" />
        <path d="M6 8.5v7M18 11.5c0 3-3 3.5-6 3.5" />
      </svg>
    ),
  },
  {
    title: "Code Smell Detection",
    desc: "Identify code smells, duplications, and complexity issues before they become technical debt in your codebase.",
    icon: (
      <svg {...iconProps}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  {
    title: "Health Metrics",
    desc: "Track your codebase health over time with comprehensive analytics and peer-reviewed complexity metrics.",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Instant Feedback",
    desc: "Real-time analysis as you code, with actionable insights delivered in seconds directly to your development environment.",
    icon: (
      <svg {...iconProps}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

// ── Code preview card ────────────────────────────────────────────────────────
const CodePreview: React.FC = () => (
  <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur shadow-2xl shadow-blue-900/10 overflow-hidden">
    <div className="flex">
      {/* Gutter icons */}
      <div className="hidden sm:flex flex-col items-center gap-4 py-4 px-3 border-r border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 4V2M15 22v-2M8 12H2M22 12h-6M12 8V2M9.5 9.5l9-9"/></svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4"/></svg>
      </div>

      {/* Code */}
      <div className="flex-1 p-4 font-mono text-[13px] leading-6 overflow-x-auto">
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-400 dark:text-slate-500 font-sans">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>
          <span className="font-semibold">main.py — Refactoring Preview</span>
        </div>
        <pre className="text-slate-700 dark:text-slate-300">
          <div><span className="text-slate-400 dark:text-slate-600 select-none mr-4">12</span><span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-blue-600 dark:text-blue-400">process_data</span>(data):</div>
          <div className="-mx-4 px-4 bg-rose-500/10"><span className="text-slate-400 dark:text-slate-600 select-none mr-4">13</span>    temp_list = []</div>
          <div className="-mx-4 px-4 bg-blue-500/10"><span className="text-slate-400 dark:text-slate-600 select-none mr-4">14</span>    <span className="text-blue-600 dark:text-blue-400"># AI: Converted to list comprehension for efficiency</span></div>
          <div className="-mx-4 px-4 bg-blue-500/10"><span className="text-slate-400 dark:text-slate-600 select-none mr-4">15</span>    results = [clean(x) <span className="text-pink-600 dark:text-pink-400">for</span> x <span className="text-pink-600 dark:text-pink-400">in</span> data <span className="text-pink-600 dark:text-pink-400">if</span> valid(x)]</div>
          <div><span className="text-slate-400 dark:text-slate-600 select-none mr-4">16</span>    <span className="text-pink-600 dark:text-pink-400">return</span> results</div>
        </pre>
      </div>
    </div>
  </div>
);

// ── Landing page ─────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, triggerGithubOAuth } = useAuth();

  const goDashboard = () => navigate("/repositories");
  const handlePrimary = () => {
    if (isAuthenticated) goDashboard();
    else triggerGithubOAuth();
  };

  const navLink =
    "text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0e17] text-slate-900 dark:text-white">
      {/* ── Top navbar (kept on top, as in the design) ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0a0e17]/80 border-b border-slate-200/70 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandMark />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className={navLink}>Features</a>
            <a href="#research" className={navLink}>Research</a>
            <a href="#pricing" className={navLink}>Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handlePrimary}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              {isAuthenticated ? "Dashboard" : "Log in"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Themed background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200 dark:from-[#0b1220] dark:via-[#0a0e17] dark:to-[#0b1220]" />
        <div className="absolute inset-0 -z-10 opacity-[0.15] dark:opacity-[0.08] [background-image:linear-gradient(#3b82f6_1px,transparent_1px),linear-gradient(90deg,#3b82f6_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-8">
            <span>✦</span> AI-Powered Code Intelligence
          </span>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            AI-Powered <span className="text-blue-600 dark:text-blue-500">Code Intelligence</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Detect code smells, eliminate technical debt, and apply AI-suggested
            improvements automatically. Your code, evolved.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handlePrimary}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/25 transition-colors"
            >
              <GitHubIcon /> Sign in with GitHub
            </button>
            <a
              href="#extension"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold transition-colors"
            >
              Go to VS Extention
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M12 2l8 3v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>
              SOC 2 Compliant
            </span>
            <span className="inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              10,000+ Repos Analyzed
            </span>
          </div>

          <div className="mt-14">
            <CodePreview />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-slate-50 dark:bg-[#0a0e17] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center tracking-tight">
            Everything you need for <span className="text-blue-600 dark:text-blue-500">clean code</span>
          </h2>
          <p className="mt-4 text-center text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            A complete toolkit for maintaining code quality, reducing technical
            debt, and accelerating development.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f1526] p-7 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-100 dark:bg-[#080b12] border-t border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2 max-w-sm">
              <BrandMark />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enterprise-grade code analysis and automated refactoring for
                research teams and technical innovators.
              </p>
              <div className="mt-5 flex items-center gap-3 text-slate-400 dark:text-slate-500">
                <a href="#" aria-label="Website" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z"/></svg>
                </a>
                <a href="#" aria-label="Email" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>
                </a>
                <a href="#" aria-label="Terminal" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 9l3 3-3 3M13 15h4"/></svg>
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold mb-4">Product</p>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Analyzer</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Refactor Engine</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Extension</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API Access</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold mb-4">Resources</p>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Papers</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-500">
            <span>© 2024 AcademicCode AI. All rights reserved.</span>
            <span>Built for Researchers &amp; Engineers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
