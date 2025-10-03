"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

type DataItem = {
  name: string;
  value: number;
  color: string;
};

export default function PieChartComponent({ data }: { data: DataItem[] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, 7);
  const autresTotal = sorted.slice(7).reduce((sum, d) => sum + d.value, 0);

  if (autresTotal > 0) {
    top.push({ name: "Autres", value: autresTotal, color: "#d1d5db" });
  }

  const total = top.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Pie Chart */}
      <PieChart width={320} height={260}>
        <Pie
          data={top}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label={({ name, percent, index }) =>
            index < 3 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
          }
          labelLine={false}
        >
          {top.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            `${value} (${((value / total) * 100).toFixed(0)}%)`
          }
        />
      </PieChart>

      {/* Légende responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4 w-full px-4">
        {top.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-700 truncate">
              {entry.name} ({((entry.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
