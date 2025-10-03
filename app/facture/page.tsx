"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Eye } from "lucide-react";

type Facture = {
  facture_id: number;
  client_id: number;
  numero_facture: string;
  client: string;
  prenom: string;
  telephone: string;
  reste_a_payer: number;
  statut: string;
};

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // ✅ État pour la recherche

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/facture`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();

      // 🔄 Adapter les données pour ton frontend
      type BackendFacture = {
        client_id: number;
        numero_facture?: string;
        client: string;
        prenom: string;
        telephone: string;
        reste_a_payer: number;
        statut: string;
        // Ajoute ici d'autres champs si besoin, par exemple: numero_facture, id, etc.
      };

      const adaptedData: Facture[] = (data as BackendFacture[]).map(
        (item, index) => ({
          facture_id: index + 1,
          client_id: item.client_id, // <-- récupère depuis le backend
          numero_facture:
            item.numero_facture || `FACT-${String(index + 1).padStart(4, "0")}`,
          client: item.client,
          prenom: item.prenom,
          telephone: item.telephone,
          reste_a_payer: item.reste_a_payer,
          statut: item.statut,
        })
      );

      setFactures(adaptedData);
    } catch (err) {
      console.error("Erreur de chargement des factures :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const router = useRouter();
  const [choix, setChoix] = useState("facture");

  const handleClick = (type: string) => {
    setChoix(type);
    if (type === "facture") {
      router.push("/facture");
    } else if (type === "historique") {
      router.push("/historique");
    }
  };

  // ✅ Applique le filtre
  const filteredFactures = factures.filter(
    (facture) =>
      (facture.numero_facture || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (facture.prenom || "").toLowerCase().includes(search.toLowerCase()) ||
      (facture.client || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-red-400/30 to-blue-600/90">
      <div className="">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className={`flex-1 py-2 rounded cursor-pointer ${
              choix === "facture"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleClick("facture")}
          >
            Liste de factures
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded cursor-pointer ${
              choix === "historique"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleClick("historique")}
          >
            Historique paiement
          </button>
        </div>

        {/* ✅ Champ de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px] px-4 py-2 border rounded-2xl"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[300px]  rounded-lg shadow">
          <LoadingSpinner />
        </div>
      ) : filteredFactures.length === 0 ? (
        <p>Aucune facture trouvée.</p>
      ) : (
        <div>
          {/* Version desktop: tableau */}
          {/* Version desktop: tableau avec scroll vertical */}
          <div className="hidden md:block shadow rounded-lg border max-h-[400px] overflow-y-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-300 text-left sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-4 border text-center">Numéro</th>
                  <th className="py-2 px-4 border text-center">Client</th>
                  <th className="py-2 px-4 border text-center">Téléphone</th>
                  <th className="py-2 px-4 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  new Map(
                    filteredFactures.map((facture) => [
                      facture.facture_id,
                      facture,
                    ])
                  ).values()
                ).map((facture) => (
                  <tr
                    key={facture.facture_id}
                    className="bg-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 px-4 border text-center">
                      {facture.numero_facture}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {facture.client} {facture.prenom}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {facture.telephone}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      <Link
                        href={`/facture/${facture.client_id}`}
                        className="inline-flex items-center justify-center w-8 h-8 bg-blue-400 text-white rounded-full hover:bg-blue-700 transition"
                        title="Voir la facture"
                      >
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version mobile: cartes */}
          <div className="md:hidden space-y-4">
            {filteredFactures.map((facture) => (
              <div
                key={facture.facture_id}
                className="border rounded-lg shadow p-4 bg-white"
              >
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Facture :</span>{" "}
                  {facture.numero_facture}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Client :</span>{" "}
                  {facture.client} {facture.prenom}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">
                    Téléphone :
                  </span>{" "}
                  {facture.telephone}
                </div>
                <div className="text-right">
                  <Link
                    href={`/facture/${facture.facture_id}`}
                    className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
