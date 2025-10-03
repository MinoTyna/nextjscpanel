/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";

const MOIS_CHOICES = [1, 2, 3, 4, 5];

type Client = { id: number; nom: string };
type Produit = {
  id: number;
  nom: string;
  prix: number;
  total: number;
  quantite: number;
};
type ClientPaiement = {
  client_id: number;
  client: string;
  prenom: string;
  telephone: string;
  statut: "complet" | "incomplet";
  produits: any[];
  paiements_detail: any[];
  dates_achat: string[];
  prixtotalproduit: number;
  total_paye: number;
  reste_a_payer: number;
};

type Facture = {
  facture_id: number;
  client_id: number;
  client: string;
  prenom: string;
  telephone: string;
  statut: string;
  date_achat: string;
  produits: any[];
  paiements_detail: any[];
  prixtotalproduit: number;
  total_paye: number;
  reste_a_payer: number;
  prochaine_date_paiement?: string;
};

export default function AchatEtPaiementPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const router = useRouter();

  // Fetch factures
  const fetchFactures = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/achats/facture?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setFactures(data);
    } catch (err) {
      console.error("Erreur de chargement des factures :", err);
      toast.error("Erreur chargement factures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  // Filtrage des factures selon recherche et date
  const filteredFactures = useMemo(() => {
    return factures.filter((facture) => {
      const matchSearch =
        facture.client?.toLowerCase().includes(search.toLowerCase()) ||
        facture.prenom?.toLowerCase().includes(search.toLowerCase()) ||
        facture.telephone?.includes(search);

      let matchDate = true;
      if (filterDate) {
        if (facture.prochaine_date_paiement) {
          const dateFacture = new Date(facture.prochaine_date_paiement);
          const dateInput = new Date(filterDate);
          matchDate =
            dateFacture.getFullYear() === dateInput.getFullYear() &&
            dateFacture.getMonth() === dateInput.getMonth() &&
            dateFacture.getDate() === dateInput.getDate();
        } else {
          matchDate = false;
        }
      }
      return matchSearch && matchDate;
    });
  }, [factures, search, filterDate]);

  // Regroupement des factures par client
  const facturesParClient: ClientPaiement[] = useMemo(() => {
    const grouped: Record<number, ClientPaiement> = {};

    filteredFactures.forEach((facture) => {
      const id = facture.client_id;
      if (!grouped[id]) {
        grouped[id] = {
          client_id: id,
          client: facture.client,
          prenom: facture.prenom,
          telephone: facture.telephone,
          statut:
            facture.statut.toLowerCase() === "complet"
              ? "complet"
              : "incomplet",
          produits: [...(facture.produits || [])],
          paiements_detail: [...(facture.paiements_detail || [])],
          dates_achat: [facture.date_achat],
          prixtotalproduit: facture.prixtotalproduit,
          total_paye: facture.total_paye,
          reste_a_payer: facture.reste_a_payer,
        };
      } else {
        // Fusion produits
        facture.produits?.forEach((p) => {
          const exist = grouped[id].produits.find((x) => x.nom === p.nom);
          if (exist) {
            exist.quantite += p.quantite;
            exist.total += p.total;
          } else {
            grouped[id].produits.push({ ...p });
          }
        });
        // Fusion paiements
        grouped[id].paiements_detail.push(...(facture.paiements_detail || []));
        // Fusion dates et totaux
        grouped[id].dates_achat.push(facture.date_achat);
        grouped[id].prixtotalproduit += facture.prixtotalproduit;
        grouped[id].total_paye += facture.total_paye;
        grouped[id].reste_a_payer += facture.reste_a_payer;
      }
    });

    return Object.values(grouped);
  }, [filteredFactures]);

  return (
    <div className="p-4 bg-gradient-to-br from-red-400/30 to-blue-600/90 h-full">
      <div className="flex flex-col sm:flex-row justify-between text-white mb-2 gap-3">
        <input
          type="text"
          placeholder="🔍 Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 px-2 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-400"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-full sm:w-1/3 px-2 py-2 border rounded shadow-sm text-black"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[300px] rounded-lg shadow">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[473px] overflow-y-auto">
          {facturesParClient.map((client) => {
            const isComplet = client.statut === "complet";

            return (
              <div
                key={client.client_id}
                onClick={() =>
                  router.push(
                    `/achatPro/${client.client_id}/${encodeURIComponent(
                      client.dates_achat[0]
                    )}`
                  )
                }
                className={`transition transform duration-200 rounded-2xl border p-4 shadow-md bg-white cursor-pointer
                ${
                  isComplet
                    ? "hover:scale-[1.01] hover:shadow-lg border-green-400"
                    : "hover:scale-[1.01] hover:shadow-lg border-red-400"
                }`}
              >
                <div className="text-xs text-gray-500 mb-2">
                  📅{" "}
                  {client.dates_achat
                    .map((d) => new Date(d).toLocaleDateString())
                    .join(", ")}
                </div>

                <div className="font-semibold text-blue-800">
                  {client.client} {client.prenom}
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  📞 {client.telephone}
                </div>

                {/* <div className="mt-2">
                  <div className="font-medium">Produits:</div>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {client.produits.map((p, idx) => (
                      <li key={idx}>
                        {p.nom} x {p.quantite} = {p.total.toLocaleString()} Ar
                      </li>
                    ))}
                  </ul>
                </div> */}

                <div className="mt-2 text-sm">
                  <div>
                    Total produit: {client.prixtotalproduit.toLocaleString()} Ar
                  </div>
                  <div>Total payé: {client.total_paye.toLocaleString()} Ar</div>
                  <div>
                    Reste à payer: {client.reste_a_payer.toLocaleString()} Ar
                  </div>
                </div>

                <div className="mt-3 text-sm">
                  {isComplet ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      ✅ Paiement complété
                    </div>
                  ) : (
                    <div className="text-red-600">⏳ Paiement en attente</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
