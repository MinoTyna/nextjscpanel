/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface TableauProps {
  headers: string[];
  rows: any[];
  colonnesAffichees: string[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  showActions?: boolean;
  loading?: boolean;
}

const getNestedValue = (obj: any, path: string) => {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const ROWS_PER_PAGE = 6;

const Tableau: React.FC<TableauProps> = ({
  headers,
  rows,
  colonnesAffichees,
  onEdit,
  onDelete,
  showActions = true,
  loading = false,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Fonction pour trier dynamiquement
  const sortedRows = rows
    .slice() // ne pas modifier l'original
    .sort((a, b) => {
      const nameA =
        getNestedValue(a, "Client_nom")?.toString().toLowerCase() || "";
      const nameB =
        getNestedValue(b, "Client_nom")?.toString().toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });

  const totalPages = Math.ceil(sortedRows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const visibleRows = sortedRows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Revenir à la première page après tri
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] rounded-lg shadow">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg shadow bg-white max-h-[500px]">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-center font-semibold text-gray-700 cursor-pointer select-none"
                onClick={() => requestSort(colonnesAffichees[index])}
              >
                <div className="flex items-center justify-center gap-1">
                  {header}
                  {sortConfig?.key === colonnesAffichees[index] &&
                    (sortConfig.direction === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </div>
              </th>
            ))}
            {showActions && (onEdit || onDelete) && (
              <th className="px-4 py-2 text-center font-semibold text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {visibleRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => router.push(`/client/${row.id}`)}
              className="cursor-pointer hover:bg-gray-100 transition"
            >
              {colonnesAffichees.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2 text-center text-gray-800"
                >
                  {(() => {
                    const value = getNestedValue(row, col);

                    if (col.endsWith("photo") && value) {
                      return (
                        <img
                          src={
                            value.startsWith("http")
                              ? value
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${value}`
                          }
                          alt="Client"
                          className="w-10 h-10 object-cover mx-auto rounded"
                        />
                      );
                    }

                    if (
                      typeof value === "number" &&
                      col.toLowerCase().includes("prix")
                    ) {
                      return value.toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      });
                    }

                    if (
                      typeof value === "string" &&
                      value.includes("T") &&
                      !isNaN(Date.parse(value))
                    ) {
                      return value.slice(0, 10);
                    }

                    return value ?? "";
                  })()}
                </td>
              ))}
              {showActions && (onEdit || onDelete) && (
                <td className="px-4 py-2 text-center space-x-2">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                      }}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      title="Modifier"
                    >
                      <FiEdit size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row);
                      }}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      title="Supprimer"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer hover:bg-gray-200 hover:text-blue-600"
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
                    className={`px-3 py-1 border rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                        : "hover:bg-gray-200 cursor-pointer hover:text-blue-600"
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
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer hover:bg-gray-200 hover:text-blue-600"
          >
            ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default Tableau;
