import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LanguageRow } from "../../../shared/types/analytics.types";
import { severityPalette } from "../utils/dataTransformer";

interface Props {
  data: LanguageRow[];
}

export const LanguageBreakdownChart: React.FC<Props> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500">
        No language breakdown available.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="language" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              color: "#e2e8f0",
            }}
          />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          <Bar
            stackId="severity"
            dataKey="blocker"
            name="Blocker"
            fill={severityPalette.blocker}
          />
          <Bar
            stackId="severity"
            dataKey="critical"
            name="Critical"
            fill={severityPalette.critical}
          />
          <Bar
            stackId="severity"
            dataKey="major"
            name="Major"
            fill={severityPalette.major}
          />
          <Bar
            stackId="severity"
            dataKey="minor"
            name="Minor"
            fill={severityPalette.minor}
          />
          <Bar
            stackId="severity"
            dataKey="info"
            name="Info"
            fill={severityPalette.info}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
