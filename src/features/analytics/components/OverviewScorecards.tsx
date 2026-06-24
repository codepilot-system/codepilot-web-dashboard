import React from "react";
import { ScorecardMetric } from "../../../shared/types/analytics.types";

interface Props {
  metrics: ScorecardMetric[];
}

const toneStyles: Record<NonNullable<ScorecardMetric["tone"]>, string> = {
  neutral: "border-slate-800 text-slate-100",
  positive: "border-emerald-500/40 text-emerald-300",
  warning: "border-amber-500/40 text-amber-300",
  danger: "border-rose-500/40 text-rose-300",
};

export const OverviewScorecards: React.FC<Props> = ({ metrics }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const tone = metric.tone ?? "neutral";
        return (
          <div
            key={metric.id}
            className={`rounded-2xl border bg-slate-900/40 backdrop-blur p-5 shadow-inner ${toneStyles[tone]}`}
          >
            <p className="text-xs uppercase tracking-wider text-slate-400">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-black leading-none">
              {metric.value}
            </p>
            {metric.hint && (
              <p className="mt-2 text-xs text-slate-400">{metric.hint}</p>
            )}
          </div>
        );
      })}
    </section>
  );
};
