/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";

interface AchatParDate {
  date: string;
  total_produits_achetes: number;
  total_depense: number;
}

interface ClientFidele {
  client_nom: string;
  client_prenom: string;
  achats_par_date: AchatParDate[];
  total_montant: number;
}

interface Props {
  data: ClientFidele[];
}

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
};

const formatTooltipValue = (value: number) => {
  return `${value.toLocaleString("fr-FR")} Ar`;
};

// 🆕 Formatage abrégé (R Maho Christine)
const formatShortName = (nom: string, prenom: string) => {
  const initialNom = nom ? nom.charAt(0).toUpperCase() : "";
  const prenomsFormates = prenom
    ? prenom
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ")
    : "";

  return `${initialNom} ${prenomsFormates}`.trim();
};

// 🆕 Formatage complet (Rasoanambinina Maho Christine)
const formatFullName = (nom: string, prenom: string) => {
  const nomMaj = nom
    ? nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase()
    : "";
  const prenomsFormates = prenom
    ? prenom
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ")
    : "";

  return `${nomMaj} ${prenomsFormates}`.trim();
};

const ClientFideleBarChart = ({ data }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);

  const pageSize = 20; // nombre de clients par page en mode "Afficher Tous"

  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.total_montant - a.total_montant),
    [data]
  );

  const chartData = useMemo(() => {
    if (showAll) {
      // Pagination
      const start = page * pageSize;
      const end = start + pageSize;

      return sortedData.slice(start, end).map((c) => ({
        shortName: formatShortName(c.client_nom, c.client_prenom),
        fullName: formatFullName(c.client_nom, c.client_prenom),
        montant: c.total_montant,
      }));
    } else {
      // Top N + Autres
      const topN = 10;
      const topClients = sortedData.slice(0, topN);
      const autres = sortedData.slice(topN);
      const autresTotal = autres.reduce((sum, c) => sum + c.total_montant, 0);

      const finalData = topClients.map((c) => ({
        shortName: formatShortName(c.client_nom, c.client_prenom),
        fullName: formatFullName(c.client_nom, c.client_prenom),
        montant: c.total_montant,
      }));

      if (autresTotal > 0) {
        finalData.push({
          shortName: "Autres",
          fullName: "Autres",
          montant: autresTotal,
        });
      }

      return finalData;
    }
  }, [sortedData, showAll, page]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="w-full">
      {/* Bouton toggle */}
      <div className="flex justify-between items-center mb-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => {
            setShowAll((prev) => !prev);
            setPage(0); // reset pagination
          }}
        >
          {showAll ? "Top 10" : "Tous"}
        </button>

        {/* Pagination seulement si "Afficher Tous" */}
        {showAll && (
          <div className="flex gap-2 items-center">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={`px-3 py-1 rounded-lg shadow ${
                page === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
              }`}
            >
              ⬅
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className={`px-3 py-1 rounded-lg shadow  ${
                page + 1 >= totalPages
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed "
                  : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
              }`}
            >
              ➡
            </button>
          </div>
        )}
      </div>

      {/* Graphique */}
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatNumber} />
            <YAxis type="category" dataKey="shortName" width={150} />
            <Tooltip
              formatter={(value: any, _: any, props: any) => [
                formatTooltipValue(Number(value)),
                props.payload.fullName, // 🆕 Nom complet dans tooltip
              ]}
            />
            <Bar
              dataKey="montant"
              fill="#3b82f6"
              barSize={25}
              radius={[4, 4, 4, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClientFideleBarChart;
