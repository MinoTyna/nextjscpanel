"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../components/ui/button";

type ProduitData = {
  produit: string;
  sortie: number;
  stock: number;
  entrer: number;
};

export default function ProduitEntreeSortieBarChart({
  data,
}: {
  data: ProduitData[];
}) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  // Pagination
  const paginatedData = data.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* BarChart */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={paginatedData}>
          <XAxis dataKey="produit" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="entrer" fill="#3b82f6" name="Produits entrés" />
          <Bar dataKey="stock" fill="#10b981" name="Stock restant" />
          <Bar dataKey="sortie" fill="#f59e0b" name="Produits sortis" />
        </BarChart>
      </ResponsiveContainer>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          ⬅
        </Button>
        <span>
          {page + 1} / {totalPages}
        </span>
        <Button
          className="curspor-pointer"
          variant="outline"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page === totalPages - 1}
        >
          ➡
        </Button>
      </div>
    </div>
  );
}
