/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface StatParTemps {
  date?: string; // pour stats_par_jour
  mois?: string; // pour stats_par_mois
  montant_total: number;
}

interface Responsable {
  responsable: string;
  stats_par_jour: StatParTemps[];
  stats_par_mois: StatParTemps[];
}

interface Props {
  data: Responsable[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
};

const formatTooltip = (value: number) => `${value.toLocaleString("fr-FR")} Ar`;

const ResponsableStatsBarChart = ({ data }: Props) => {
  const [viewBy, setViewBy] = useState<"jour" | "mois">("jour");

  const merged: Record<string, any> = {};

  data.forEach((resp) => {
    const stats = viewBy === "jour" ? resp.stats_par_jour : resp.stats_par_mois;

    stats.forEach((stat) => {
      const key = viewBy === "jour" ? stat.date! : stat.mois!;
      if (!merged[key]) merged[key] = { [viewBy]: key };
      merged[key][resp.responsable] = stat.montant_total;
    });
  });

  const chartData = Object.values(merged);
  const responsables = data.map((r) => r.responsable);

  return (
    <div className="w-full space-y-4">
      {/* Toggle bouton par jour / par mois */}
      <div className="flex justify-end gap-2">
        <button
          className={`px-3 py-1 rounded text-sm cursor-pointer ${
            viewBy === "jour" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewBy("jour")}
        >
          Par jour
        </button>
        <button
          className={`px-3 py-1 rounded text-sm cursor-pointer ${
            viewBy === "mois" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewBy("mois")}
        >
          Par mois
        </button>
      </div>

      <div className="h-[350px] bg-white p-4 rounded-2xl shadow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={viewBy} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip formatter={(val) => formatTooltip(Number(val))} />
            <Legend />
            {responsables.map((resp, i) => (
              <Line
                key={resp}
                type="monotone"
                dataKey={resp}
                stroke={COLORS[i % COLORS.length]}
                name={resp}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResponsableStatsBarChart;
