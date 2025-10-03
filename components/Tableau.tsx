/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FiEdit, FiTrash2 } from "react-icons/fi";

interface TableauProps {
  headers: string[];
  rows: any[];
  colonnesAffichees: string[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  showActions?: boolean;
}

const getNestedValue = (obj: any, path: string) => {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const Tableau: React.FC<TableauProps> = ({
  headers,
  rows,
  colonnesAffichees,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <div className="overflow-auto rounded-lg shadow bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-center font-semibold text-gray-700"
              >
                {header}
              </th>
            ))}
            {showActions && (
              <th className="px-4 py-2 text-center font-semibold text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
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
              {showActions && (
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Pour éviter la redirection lors du clic sur le bouton
                      onEdit?.(row);
                    }}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    title="Modifier"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(row);
                    }}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                    title="Supprimer"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tableau;
