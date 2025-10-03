/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";

type Props = {
  latitude: number;
  longitude: number;
  Client_nom: string;
  Client_prenom: string;
};

const ClientMap = ({
  latitude,
  longitude,
  Client_nom,
  Client_prenom,
}: Props) => {
  const router = useRouter();

  // Coordonnées fixes de SCORE TULEAR
  const scoreLat = -23.356660512168702;
  const scoreLon = 43.67018088720444;

  return (
    <div className="w-full rounded overflow-hidden shadow flex flex-col gap-4">
      <div className="p-4  flex justify-center gap-8 items-center ">
        <h2 className="text-lg font-semibold text-gray-700">
          🗺️ Carte Google Maps
        </h2>
        <p className="text-sm text-gray-600">
          📍 Départ : SCORE TULEAR <br />
          📍 Destination : {Client_nom} {Client_prenom}
        </p>
      </div>
      {/* Carte unique : SCORE -> Client */}
      <div className="w-full h-[350px] rounded-lg overflow-hidden shadow">
        <iframe
          src={`https://www.google.com/maps?saddr=${scoreLat},${scoreLon}&daddr=${latitude},${longitude}&hl=fr&z=13&output=embed`}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Infos */}

      {/* Boutons */}
      <div className="flex gap-2 flex-wrap mt-2">
        <a
          href={`https://www.google.com/maps/dir/${scoreLat},${scoreLon}/${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🚗 Ouvrir l’itinéraire
        </a>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
};

export default ClientMap;
