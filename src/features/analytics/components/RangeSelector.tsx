import React from "react";
import { AnalyticsRange } from "../../../shared/types/analytics.types";

interface Props {
  value: AnalyticsRange;
  onChange: (next: AnalyticsRange) => void;
}

const OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

export const RangeSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/40 p-0.5 text-xs font-semibold">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              active
                ? "bg-violet-500/20 text-violet-200"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
