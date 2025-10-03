/* eslint-disable prefer-const */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText, MessageCircle, PhoneCall } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Header } from "../../../components/header";

type Responsable = {
  id: number;
  Responsable_email: string;
  Responsable_nom: string;
};

interface ClientInfo {
  client: string;
  prenom?: string;
  cin?: string;
  telephone?: string;
  telephone1?: string;
  telephone2?: string;
  telephone3?: string;
  telephone4?: string;
  adresse?: string;
  photo?: string;
}

interface Produit {
  id: number;
  nom: string;
  quantite: number;
  total: number;
  prix_unitaire: number;
}

interface Paiement {
  id: number;
  date: string;
  responsable: string;
  montant: number;
}

interface ClientPaiement {
  client: ClientInfo;
  date_achat: string;
  produits: Produit[];
  paiements?: Paiement[];
  prixtotalproduit: number;
  total_paye: number;
  reste_a_payer: number;
  montantchoisi: string;
  statut: "complet" | "incomplet";
  date_paiement_prochaine?: string;
  Paiement_montantchoisi?: number | string;
  nombredemois_restant?: number;
}
type DecodedToken = {
  user_id: string;
  email: string;
  nom: string;
  photo: string;
  role: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
};
export default function DetailClientPage() {
  const router = useRouter();
  const params = useParams();

  const idRaw = params?.id;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw || "";
  const dateRaw = params?.dateAchat;
  const dateAchatRaw = Array.isArray(dateRaw) ? dateRaw[0] : dateRaw || "";
  const dateAchat = decodeURIComponent(dateAchatRaw);

  const [client, setClient] = useState<ClientPaiement | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [dernierPaiementId, setDernierPaiementId] = useState<number | null>(
    null
  );
  const [montantChoisi, setMontantChoisi] = useState(0);
  const [dateChoisie, setDateChoisie] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [modePaiement, setModePaiement] = useState("cash");
  const [montant, setMontant] = useState("");
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdateModals, setShowUpdateModals] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [utilisateurId, setUtilisateurId] = useState<number | null>(null);
  const [responsable, setResponsable] = useState<Responsable | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [montantPaye, setMontantPaye] = useState("");
  const [actionType, setActionType] = useState<"call" | "sms" | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setRole(decoded.role); // 👈 ici
      fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/responsable/get?Responsable_email=${encodeURIComponent(
          decoded.email
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.id) {
            setUtilisateurId(data.id);
            setResponsable(data);
          }
        })
        .catch(() =>
          toast.error("Erreur lors de la récupération du responsable")
        );
    } catch (err) {
      console.error("Erreur décodage JWT", err);
      toast.error("Token invalide");
      router.push("/sign-in");
    }
  }, []);

  useEffect(() => {
    if (id) {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        fetchClientData(numericId);
      }
    }
  }, [id, dateAchat]);

  useEffect(() => {
    if (client) {
      const montant =
        typeof client.Paiement_montantchoisi === "string"
          ? Number(client.Paiement_montantchoisi)
          : client.Paiement_montantchoisi || 0;
      setMontantChoisi(montant);
      setDateChoisie(client.date_paiement_prochaine || "");
    }
  }, [client]);

  // Fonction utilitaire pour format nombre
  const safeNumber = (value: number | undefined | null) =>
    typeof value === "number" ? value.toLocaleString("fr-FR") : "0";

  const fetchClientData = async (clientId: number) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/paiement/get/${clientId}?ts=${Date.now()}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Erreur lors du chargement du client");

      let data = await res.json();
      console.log("📥 Backend data:", data);

      // Normalisation pour le frontend
      const normalized: ClientPaiement = {
        ...data,
        client: {
          client: data.client || "",
          prenom: data.prenom || "",
          telephone: data.telephone || "",
          telephone1: data.telephone1 || "",
          telephone2: data.telephone2 || "",
          telephone3: data.telephone3 || "",
          telephone4: data.telephone4 || "",
          adresse: data.adresse || "",
          cin: data.cin || "",
          photo: data.photo || null,
        },
        produits: data.achats_par_date?.[0]?.produits || [],
        prixtotalproduit: Number(data.prixtotalproduit) || 0,
        total_paye: Number(data.total_paye) || 0,
        reste_a_payer: Number(data.reste_a_payer) || 0,
        montantchoisi: Number(data.montantchoisi) || 0,
        statut: data.statut || "incomplet",
        date_paiement_prochaine: data.date_paiement_prochaine || "",
        nombredemois_restant: Number(data.nombredemois_restant) || 0,
        Paiement_montantchoisi: Number(data.Paiement_montantchoisi) || 0,
        paiements: data.paiements || [],
        date_achat: data.date_achat || "",
      };

      setClient(normalized);
      setClientId(data.id);
    } catch (err) {
      console.error("Erreur client :", err);
      toast.error("Erreur lors du chargement du client");
    }
  };

  // 🔹 Gérer le paiement
  const handlePaiement = async () => {
    if (!clientId) {
      console.error("ClientId non défini");
      return toast.error("Client invalide.");
    }

    const montantNumber = Number(montant);
    if (!montantNumber || montantNumber <= 0) {
      return toast.error("Montant invalide.");
    }

    setIsPaying(true);

    const payload = {
      client: clientId,
      Paiement_montant: montantNumber,
      Paiement_mode: modePaiement,
      Paiement_type: "mensuel",
    };

    console.log("Payload paiement :", payload);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/paiement/repaiement`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        toast.error("Erreur lors du paiement.");
        console.error("Erreur paiement :", errText);
        return;
      }

      const data = await res.json();
      toast.success("Paiement effectué !");
      setShowPaiementModal(false);
      setMontant("");
      setModePaiement("cash");

      // 🔄 Rafraîchir les données client
      await fetchClientData(clientId);

      // 🔹 SMS automatique
    } catch (error) {
      toast.error("Erreur réseau");
      console.error("Erreur réseau paiement :", error);
    } finally {
      setIsPaying(false);
    }
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-400/30 to-blue-600/90">
        <LoadingSpinner />
      </div>
    );
  }

  const handleUpdatePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dernierPaiementId) return toast.error("Aucun paiement à modifier.");
    if (!clientId) return toast.error("Client introuvable.");
    if (!dateChoisie) return toast.error("Veuillez choisir une nouvelle date.");
    if (!montantPaye) return toast.error("Veuillez entrer un montant.");

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/paiement/update/${dernierPaiementId}?ts=${Date.now()}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: clientId,
            Paiement_type: "mensuel",
            Paiement_datechoisi: dateChoisie,
            Paiement_montant: parseInt(montantPaye, 10),
          }),
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        toast.error("Erreur lors de la modification");
        console.error(errText);
        return;
      }
      const data = await res.json();
      toast.success("Paiement modifié avec succès");

      // 🔄 Redirige vers la facture mise à jour
      if (data.facture_id) {
        router.push(`/facture/${data.facture_id}`);
      }
      setShowUpdateModal(false);
      await fetchClientData(clientId);
    } catch (error) {
      toast.error("Erreur réseau");
      console.error("Erreur update :", error);
    }
  };
  const achatId = Number(id);
  const EnvoyerSms = async (AchatsID: number) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/paiement/sms/${AchatsID}?ts=${Date.now()}`,
        { method: "GET", cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok) toast.success("Message envoyé");
      else toast.error("Message non envoyé");
    } catch (error) {
      toast.error("Message non envoyé");
      console.error(error);
    }
  };

  const telephones: string[] = [
    client.client.telephone,
    client.client.telephone1,
    client.client.telephone2,
    client.client.telephone3,
    client.client.telephone4,
  ].filter((t): t is string => !!t && t.trim() !== "");

  const nomComplet = `${client.client.client ?? ""} ${
    client.client.prenom ?? ""
  }`.trim();
  const datePaiement = client.date_paiement_prochaine
    ? new Date(client.date_paiement_prochaine).toLocaleDateString("fr-FR")
    : "";
  const messageSMS = `Bonjour ${nomComplet}, votre prochain paiement est prévu le ${datePaiement}.`;
  const smsUrl = `sms:${client.client.telephone}?body=${encodeURIComponent(
    messageSMS
  )}`;

  const handleAction = (num: string) => {
    if (actionType === "call") {
      window.location.href = `tel:${num}`;
    } else if (actionType === "sms") {
      const messageSMS = `Bonjour ${nomComplet}, votre prochain paiement est prévu le ${datePaiement}.`;
      window.location.href = `sms:${num}?body=${encodeURIComponent(
        messageSMS
      )}`;
    }
    setShowModal(false);
  };
  const handleVoirFacture = (clientId: number) => {
    router.push(`/facture/${clientId}`);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-red-400/40 to-blue-600/90 min-h-screen">
      <Header />

      <div className="bg-white  py-4 mx-auto p-1 rounded-xl shadow-md space-y-6 mt-18">
        <div className="grid md:grid-cols-2 gap-6 ">
          {/* Informations Client */}
          <div className="bg-white p-1 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <span>
                {" "}
                <img
                  src={
                    client.client.photo
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${client.client.photo}`
                      : "/default-avatar.png"
                  }
                  alt="Client"
                  className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow cursor-pointer"
                />
              </span>{" "}
              {client.client.client} {client.client.prenom}
            </h2>

            {/* Infos */}
            <div className="space-y-1 text-gray-800">
              <p>
                <strong>Téléphone :</strong> {client.client.telephone}
              </p>
              <p>
                <strong>Adresse :</strong> {client.client.adresse}
              </p>
              <p>
                <strong>CIN :</strong> {client.client.cin}
              </p>
            </div>

            {role === "admin" && (
              <div className="flex justify-end gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    className="bg-white border border-gray-200 cursor-pointer hover:border-blue-500 rounded-lg shadow px-4 py-2 flex items-center gap-2 text-sm hover:shadow-md transition"
                    onClick={() => {
                      if (telephones.length === 0)
                        return toast.error("Aucun numéro disponible.");
                      if (telephones.length === 0)
                        return handleAction(telephones[0]);
                      setActionType("call");
                      setShowModal(true);
                    }}
                  >
                    📞 Appel
                  </button>

                  <button
                    className="bg-white border border-gray-200 cursor-pointer hover:border-blue-500 rounded-lg shadow px-4 py-2 flex items-center gap-2 text-sm hover:shadow-md transition"
                    onClick={() => {
                      if (!client.date_paiement_prochaine)
                        return toast.error("Aucune date de paiement prévue.");
                      if (telephones.length === 0)
                        return toast.error("Aucun numéro disponible.");
                      if (telephones.length === 0)
                        return handleAction(telephones[0]);
                      setActionType("sms");
                      setShowModal(true);
                    }}
                  >
                    💬 SMS
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* paiement */}
          <div className="bg-gray-50 rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <span>💳</span> Résumé des Paiements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
              <div>
                <p className="mb-6">
                  <span className="text-gray-500 font-bold">Reste :</span>{" "}
                  <span className="text-blue-600 font-bold">
                    {safeNumber(client.reste_a_payer)} Ar
                  </span>
                </p>
                <p>
                  <span className="text-gray-500 font-bold">
                    Date prochaine :
                  </span>{" "}
                  {client.date_paiement_prochaine}
                </p>
                <p>
                  <span className="text-gray-500 font-bold">
                    Montant total :
                  </span>{" "}
                  {client.prixtotalproduit} Ar
                </p>
                <p>
                  <span className="text-gray-500 font-bold">
                    Montant/mois :
                  </span>{" "}
                  {client.montantchoisi} Ar
                </p>
              </div>
              <div className="text-right">
                <p className="mb-8">
                  <span className="text-gray-500 font-bold">
                    Nombre du mois:
                  </span>{" "}
                  {client.nombredemois_restant ?? "—"}
                </p>

                <p>
                  <span className="text-gray-500 font-bold">Statut :</span>{" "}
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      client.statut === "complet"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {client.statut ? client.statut.toUpperCase() : "INCOMPLET"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Produit */}

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <span>🛒</span> Produit
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPaiementModal(true)}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-4 py-1 font-semibold flex items-center gap-2"
                title="Effectuer un paiement" // 🔹 Tooltip
              >
                💰
              </button>

              <button
                onClick={() => handleVoirFacture(clientId!)}
                className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 flex items-center gap-2 transition"
                title="Voir la facture" // 🔹 Tooltip
              >
                <FileText className="w-4 h-4" /> {/* Icône facture */}
              </button>

              {role === "admin" && (
                <button
                  onClick={() => setShowPaiementModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-4 py-1 font-semibold flex items-center gap-2"
                >
                  💰
                </button>
              )}
              {/* Bouton Modifier Achats */}
              {role === "admin" && (
                <button
                  onClick={() => setShowUpdateModals(true)}
                  className="bg-red-500 hover:bg-red-600 cursor-pointer text-white rounded-lg px-4 py-1 font-semibold flex items-center gap-2"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-3 text-center">Produit</th>
                  <th className="py-2 px-3 text-center">Quantité</th>
                  <th className="py-2 px-3 text-center">Prix Unitaire</th>
                  <th className="py-2 px-3 text-center">Total (Ar)</th>
                </tr>
              </thead>
              <tbody>
                {client.produits?.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 px-3 text-center">{p.nom}</td>
                    <td className="py-2 px-3 text-center">{p.quantite}</td>
                    <td className="py-2 px-3 text-center">
                      {safeNumber(p.prix_unitaire)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {safeNumber(p.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showUpdateModals && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
            <p className="text-1xl text-gray-700  mb-5 text-center">
              Êtes-vous sûr de vouloir supprimer cette achat de client ?
            </p>

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setShowUpdateModals(false)}
                className="bg-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-400 transition"
              >
                non
              </button>
              <button
                onClick={async () => {
                  if (!clientId || !responsable?.id)
                    return toast.error("Client ou responsable invalide");

                  try {
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/update/${clientId}/`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ResponsableID: responsable.id,
                          achats: client.produits.map((p) => ({
                            ProduitID: p.id, // ⚠️ Assure-toi que tu as l’ID du produit côté frontend
                            Achat_quantite: p.quantite,
                          })),
                        }),
                      }
                    );

                    if (!res.ok) {
                      const errorText = await res.text();
                      console.error("Erreur update achats:", errorText);
                      router.push(`/achatPro`);
                      return toast.success("supprimer avec succès");
                    }

                    toast.success("Achats mis à jour avec succès");
                    setShowUpdateModal(false);
                    await fetchClientData(clientId); // Refresh
                  } catch (err) {
                    console.error("Erreur réseau:", err);
                    toast.error("Erreur réseau");
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-600 transition"
              >
                oui
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-md">
            <form onSubmit={handleUpdatePaiement} className="space-y-4">
              {/* Montant payé */}
              <div>
                <label className="block font-medium mb-1">Montant payé</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded border-accent bg-gray-200"
                  value={montantPaye}
                  onChange={(e) => setMontantPaye(e.target.value)}
                  required
                />
              </div>

              {/* Date choisie */}
              <div>
                <label className="block font-medium mb-1">
                  Date de paiement
                </label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded border-accent bg-gray-200 cursor-pointer"
                  value={dateChoisie}
                  onChange={(e) => setDateChoisie(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-center mt-2 gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-700 cursor-pointer"
                >
                  💾
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="bg-red-400 hover:bg-red-600 px-2 py-2 rounded cursor-pointer"
                >
                  ✖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <h2 className="text-lg font-semibold mb-2">
              Choisissez un numéro pour {nomComplet} :
            </h2>
            <div className="flex flex-col gap-2">
              {telephones.map((num, i) => (
                <button
                  key={i}
                  className="px-4 py-2 bg-blue-300 text-black rounded hover:bg-blue-500 transition cursor-pointer"
                  onClick={() => handleAction(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className="px-4 py-2 bg-red-300 text-gray-800 rounded hover:bg-red-600 transition mt-2 cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaiementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="md:w-1/2 w-full max-w-lg bg-white border p-6 rounded-xl shadow-lg relative">
            <h3 className="text-lg font-bold mb-4 text-center text-blue-700">
              Paiement
            </h3>

            <button
              onClick={() => setShowPaiementModal(false)}
              className="absolute top-4 right-4 text-red-400 cursor-pointer text-3xl hover:text-red-600"
            >
              ×
            </button>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Montant</label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full border border-accent px-3 py-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Mode de paiement</label>
              <select
                className="w-full border px-3 py-2 rounded border-accent cursor-pointer"
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="carte">Carte</option>
              </select>
            </div>

            {client && (
              <button
                disabled={isPaying}
                className={`mt-4 px-4 py-2 text-white rounded w-full ${
                  isPaying
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={() => {
                  handlePaiement();
                }}
              >
                {isPaying ? "Traitement..." : "Valider Paiement"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
