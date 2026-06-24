// import React, { useRef, useState } from "react";
// import { useProject } from "../../projects/context/ProjectContext";
// import { useRepoOverview } from "../hooks/useRepoOverview";
// import { useDebtTrends } from "../hooks/useDebtTrends";
// import { useLanguageBreakdown } from "../hooks/useLanguageBreakdown";
// import { OverviewScorecards } from "../components/OverviewScorecards";
// import { DebtTrendsChart } from "../components/DebtTrendsChart";
// import { LanguageBreakdownChart } from "../components/LanguageBreakdownChart";
// import { SeverityDistributionChart } from "../components/SeverityDistributionChart";
// import { LanguageBreakdownTable } from "../components/LanguageBreakdownTable";
// import { RangeSelector } from "../components/RangeSelector";
// import { ExportReportButton } from "../components/ExportReportButton";
// import { AnalyticsRange } from "../../../shared/types/analytics.types";

// const Panel: React.FC<{
//   title: string;
//   subtitle?: string;
//   right?: React.ReactNode;
//   children: React.ReactNode;
// }> = ({ title, subtitle, right, children }) => (
//   <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
//     <header className="mb-4 flex items-start justify-between gap-4">
//       <div>
//         <h2 className="text-base font-bold text-slate-100">{title}</h2>
//         {subtitle && (
//           <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
//         )}
//       </div>
//       {right}
//     </header>
//     {children}
//   </section>
// );

// const InlineStatus: React.FC<{
//   loading: boolean;
//   error: unknown;
//   empty?: boolean;
//   emptyMessage?: string;
//   children: React.ReactNode;
// }> = ({ loading, error, empty, emptyMessage, children }) => {
//   if (loading) {
//     return (
//       <div className="flex h-48 items-center justify-center text-sm text-slate-500">
//         Loading…
//       </div>
//     );
//   }
//   if (error) {
//     return (
//       <div className="flex h-48 items-center justify-center text-sm text-rose-400">
//         Failed to load. Retry shortly.
//       </div>
//     );
//   }
//   if (empty) {
//     return (
//       <div className="flex h-48 items-center justify-center text-sm text-slate-500">
//         {emptyMessage ?? "No data."}
//       </div>
//     );
//   }
//   return <>{children}</>;
// };

// export const AnalyticsDashboard: React.FC = () => {
//   const { activeProject } = useProject();
//   const [range, setRange] = useState<AnalyticsRange>("30d");
//   const chartsRef = useRef<HTMLDivElement | null>(null);

//   const repoId = activeProject?.id;

//   const overviewQuery = useRepoOverview(repoId);
//   const trendsQuery = useDebtTrends(repoId, range);
//   const languageQuery = useLanguageBreakdown(repoId);

//   if (!activeProject) {
//     return (
//       <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
//         Pick a project from the top-right dropdown to load its analytics
//         workspace.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <header className="flex flex-wrap items-end justify-between gap-4">
//         <div>
//           <p className="text-xs uppercase tracking-wider text-slate-500">
//             Analytics Overview
//           </p>
//           <h1 className="mt-1 text-2xl font-black text-slate-100">
//             {activeProject.name}
//           </h1>
//           <p className="mt-1 text-xs text-slate-500">
//             {activeProject.owner}/{activeProject.repoName}
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <RangeSelector value={range} onChange={setRange} />
//           <ExportReportButton
//             overview={overviewQuery.data}
//             trends={trendsQuery.data}
//             languages={languageQuery.data}
//             chartsRef={chartsRef}
//           />
//         </div>
//       </header>

//       <InlineStatus
//         loading={overviewQuery.isLoading}
//         error={overviewQuery.error}
//       >
//         {overviewQuery.data && (
//           <OverviewScorecards metrics={overviewQuery.data.scorecards} />
//         )}
//       </InlineStatus>

//       <div ref={chartsRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//         <div className="lg:col-span-2">
//           <Panel
//             title="Technical Debt Trend"
//             subtitle="Historical debt and quality score evolution"
//           >
//             <InlineStatus
//               loading={trendsQuery.isLoading}
//               error={trendsQuery.error}
//               empty={(trendsQuery.data?.length ?? 0) === 0}
//               emptyMessage="No trend data yet — trigger an initial scan."
//             >
//               {trendsQuery.data && <DebtTrendsChart data={trendsQuery.data} />}
//             </InlineStatus>
//           </Panel>
//         </div>

//         <Panel
//           title="Severity Distribution"
//           subtitle="Share of issues by severity"
//         >
//           <InlineStatus
//             loading={overviewQuery.isLoading}
//             error={overviewQuery.error}
//           >
//             {overviewQuery.data && (
//               <SeverityDistributionChart
//                 slices={overviewQuery.data.severityDistribution}
//               />
//             )}
//           </InlineStatus>
//         </Panel>

//         <div className="lg:col-span-3">
//           <Panel
//             title="Language Breakdown"
//             subtitle="Issue counts stacked by severity per language"
//           >
//             <InlineStatus
//               loading={languageQuery.isLoading}
//               error={languageQuery.error}
//               empty={(languageQuery.data?.length ?? 0) === 0}
//               emptyMessage="No language metrics available."
//             >
//               {languageQuery.data && (
//                 <div className="space-y-6">
//                   <LanguageBreakdownChart data={languageQuery.data} />
//                   <LanguageBreakdownTable rows={languageQuery.data} />
//                 </div>
//               )}
//             </InlineStatus>
//           </Panel>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsDashboard;
import {useRepoOverview} from "../hooks/useRepoOverview";


export default function AnalyticsDashboard(){

const projectId=13; // later from ProjectContext


const {
data,
isLoading
}=useRepoOverview(projectId);



if(isLoading)
return <div>Loading...</div>;



const analytics=data?.data?.[0];


return (

<div>


<h1>
Repository Analytics
</h1>


<h2>
Technical Debt:
{analytics?.technicalDebtScore}
</h2>


<h2>
Average Complexity:
{analytics?.avgComplexity}
</h2>



<pre>
{
JSON.stringify(
analytics?.severityDistribution,
null,
2
)
}
</pre>


</div>

);

}