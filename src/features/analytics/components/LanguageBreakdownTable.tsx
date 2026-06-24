import React from "react";
import { LanguageRow } from "../../../shared/types/analytics.types";

interface Props {
  rows: LanguageRow[];
}

export const LanguageBreakdownTable: React.FC<Props> = ({ rows }) => {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Language</th>
            <th className="px-4 py-3 text-right">Files</th>
            <th className="px-4 py-3 text-right">LOC</th>
            <th className="px-4 py-3 text-right">Issues</th>
            <th className="px-4 py-3 text-right">Density / 1k LOC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {rows.map((row) => (
            <tr key={row.language} className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 font-semibold text-slate-100">
                {row.language}
              </td>
              <td className="px-4 py-2.5 text-right font-mono">
                {row.files.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right font-mono">
                {row.loc.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right font-mono">
                {row.totalIssues.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right font-mono">
                {row.density.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
