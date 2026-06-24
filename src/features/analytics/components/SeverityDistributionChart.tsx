import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SeveritySlice } from "../../../shared/types/analytics.types";

interface Props {
  slices: SeveritySlice[];
}

export const SeverityDistributionChart: React.FC<Props> = ({ slices }) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500">
        No issues detected — clean codebase 🎉
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            stroke="#0f172a"
          >
            {slices.map((slice) => (
              <Cell key={slice.severity} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              color: "#e2e8f0",
            }}
            formatter={(value: number, name: string) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
