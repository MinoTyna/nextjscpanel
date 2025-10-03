/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useState } from "react";

interface ProduitGridProps {
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const ProduitGrid: React.FC<ProduitGridProps> = ({
  rows,
  onEdit,
  onDelete,
}) => {
  // Trier les produits par nom alphabétique
  const sortedRows = rows
    .slice() // pour ne pas modifier l'original
    .sort((a, b) => {
      const nameA = a.Produit_nom?.toString().toLowerCase() || "";
      const nameB = b.Produit_nom?.toString().toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });

  // Pagination
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedRows.map((produit, index) => (
          <div
            key={index}
            className="border rounded-xl shadow bg-white transition-transform hover:-translate-y-2 hover:shadow-lg duration-300 flex flex-col"
            style={{ aspectRatio: "3 / 2" }}
          >
            {/* image */}
            <div className="w-full h-full relative">
              {produit.Produit_photo ? (
                <img
                  src={
                    produit.Produit_photo.startsWith("http")
                      ? produit.Produit_photo
                      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${produit.Produit_photo}`
                  }
                  alt={produit.Produit_nom}
                  className="object-cover rounded-t-xl w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                  🛒
                </div>
              )}
            </div>

            {/* contenu */}
            <div className="p-2 flex flex-col flex-1">
              <h3 className="text-lg font-semibold mb-1">
                {produit.Produit_nom}
              </h3>
              <span className="text-xs mb-2 text-gray-500">
                Réf: {produit.Produit_reference}
              </span>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {produit.Produit_description}
              </p>
              <div className="text-xl font-bold text-black mb-1">
                {produit.Produit_prix.toLocaleString("fr-FR")} Ar
              </div>
              <div className="text-xs text-gray-500 mb-2 font-bold">
                Stock: {produit.Produit_quantite}
              </div>
              <div className="flex justify-between mt-auto gap-2">
                <button
                  onClick={() => onEdit?.(produit)}
                  className="flex-1 flex justify-center items-center py-2 cursor-pointer rounded border text-gray-700 hover:bg-gray-100"
                >
                  <FiEdit className="mr-1" /> Modifier
                </button>
                <button
                  onClick={() => onDelete?.(produit)}
                  className="p-2 rounded bg-red-200 text-red-600 hover:bg-red-400 cursor-pointer"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* pagination */}
      {/* Pagination améliorée */}
      {/* Pagination améliorée */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded cursor-pointer bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ⬅
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (page === 1 || page === totalPages) return true;
              if (Math.abs(currentPage - page) <= 2) return true;
              return false;
            })
            .map((page, index, filtered) => {
              const prevPage = filtered[index - 1];
              return (
                <span key={page} className="flex">
                  {prevPage && page - prevPage > 1 && (
                    <span className="px-2">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-600 text-white cursor-pointer"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-blue-600 cursor-pointer"
                    }`}
                  >
                    {page}
                  </button>
                </span>
              );
            })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded cursor-pointer bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default ProduitGrid;
