/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface ProduitCardMobileProps {
  produit: any;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

const ProduitCardMobile: React.FC<ProduitCardMobileProps> = ({
  produit,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border rounded-xl shadow bg-white mb-2 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* image */}
      <div className="w-full h-30 relative rounded-t-xl overflow-hidden">
        {produit.Produit_photo ? (
          <img
            src={
              produit.Produit_photo.startsWith("http")
                ? produit.Produit_photo
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${produit.Produit_photo}`
            }
            alt={produit.Produit_nom}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
            🛒
          </div>
        )}
        {/* {produit.Produit_quantite > 0 && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-green-600 text-white">
            En stock
          </span>
        )} */}
      </div>

      {/* infos */}
      <div className="p-3 flex flex-col">
        <h3 className="text-base font-semibold mb-1">{produit.Produit_nom}</h3>
        <span className="text-xs mb-1 text-gray-500">
          Réf: {produit.Produit_reference}
        </span>
        <p className="text-xs text-gray-600 line-clamp-1 mb-1">
          {produit.Produit_description}
        </p>
        <div className="text-lg font-bold text-black mb-1">
          {produit.Produit_prix.toLocaleString("fr-FR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}{" "}
          Ar
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Stock: {produit.Produit_quantite}
        </div>
        <div className="flex justify-between gap-2 mt-auto">
          <button
            onClick={() => onEdit?.(produit)}
            className="flex-1 flex justify-center items-center py-2 rounded border text-gray-700 hover:bg-gray-100"
          >
            <FiEdit className="mr-1" /> Modifier
          </button>
          <button
            onClick={() => onDelete?.(produit)}
            className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProduitCardMobile;
