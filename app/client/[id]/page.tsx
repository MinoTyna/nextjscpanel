"use client";

import { useState, useEffect } from "react";
import ClientMap from "../../../components/ClientMap";
import { useParams, useRouter } from "next/navigation";

type Client = {
  id: number;
  Client_nom: string;
  Client_prenom: string;
  Client_quartier?: string | null;
  latitude: number;
  longitude: number;
};

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/client/get/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Client data:", data);
        const clientData = Array.isArray(data) ? data[0] : data;
        setClient(clientData);
      })
      .catch((err) => console.error("Erreur fetch client:", err));
  }, [id]);

  if (!client) return <p>Chargement du client...</p>;

  return (
    <div className=" bg-gradient-to-br from-red-400/30 to-blue-600/90 min-h-screen p-4">
      <div className="flex ">
        <ClientMap
          latitude={client.latitude}
          longitude={client.longitude}
          Client_nom={client.Client_nom}
          Client_prenom={client.Client_prenom}
        />
      </div>
    </div>
  );
}
