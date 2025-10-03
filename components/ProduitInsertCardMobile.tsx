/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function ProduitCardMobile({
  insertion,
  onEdit,
  onDelete,
}: any) {
  return (
    <div className="flex items-start gap-4 border p-4 rounded shadow-sm mb-4 bg-white dark:bg-gray-900">
      {/* Placeholder image car pas d'image dans l'insertion */}
      <img
        src="/placeholder.png"
        alt="Produit"
        className="w-16 h-16 object-cover rounded"
      />

      {/* Infos à droite */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="font-bold text-gray-800 dark:text-white">
            {insertion.produit_nom}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Quantité : {insertion.quantite}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Par : {insertion.utilisateur_nom}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(insertion.date_insertion).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => onEdit(insertion)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => onDelete(insertion)}
            className="text-red-600 hover:text-red-800"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}
