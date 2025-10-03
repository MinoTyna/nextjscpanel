"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface GlobalStat {
  mois: string;
  montant_total: number;
}

interface Props {
  data: GlobalStat[];
}

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
};

const formatTooltip = (value: number) => `${value.toLocaleString("fr-FR")} Ar`;

const GlobalStatsChart = ({ data }: Props) => {
  return (
    <div className="w-full space-y-4">
      <div className="h-[300px] bg-white p-4 rounded-2xl shadow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip formatter={(val) => formatTooltip(Number(val))} />
            <Line
              type="monotone"
              dataKey="montant_total"
              name="Montant total"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlobalStatsChart;
