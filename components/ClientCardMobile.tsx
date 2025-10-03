/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function ClientCardMobile({
  client,
  onEdit,
  onDelete,
  canDelete = true,
}: any) {
  return (
    <div className="flex items-start gap-4 border p-4 rounded shadow-sm mb-4 bg-white">
      {/* Photo à gauche */}
      <img
        src={
          client.Client_photo?.startsWith("http")
            ? client.Client_photo
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${client.Client_photo}`
        }
        alt="Photo"
        className="w-16 h-16 object-cover rounded"
      />

      {/* Infos à droite */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="font-bold text-gray-800">
            {client.Client_nom} {client.Client_prenom}
          </p>
          <p className="text-sm text-gray-600 ">{client.Client_cin}</p>
          <p className="text-sm text-gray-600 ">{client.Client_telephone}</p>
          <p className="text-sm text-gray-600 ">{client.Client_adresse}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => onEdit(client)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiEdit />
          </button>

          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(client)}
              className="text-red-600 hover:text-red-800"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
