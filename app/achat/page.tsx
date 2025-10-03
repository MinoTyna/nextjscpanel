/* eslint-disable prefer-const */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
// import Layout from "../../components/layout/Layouts";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import LoadingSpinner from "../../components/LoadingSpinner";

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

type Achat = {
  id: number;
  client: string;
  produit: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  date: string;
};

type Client = {
  id: number;
  Client_nom: string;
  Client_prenom: string;
  Client_telephone: string;
};

type Produit = {
  id: number;
  Produit_nom: string;
  Produit_photo: string;
  Produit_prix: number;
  Produit_quantite: number;
};

type Responsable = {
  id: number;
  Responsable_email: string;
  Responsable_nom: string;
};

const MOIS_CHOICES = [1, 2, 3, 4, 5];

export default function AchatPage() {
  const [achats, setAchats] = useState<Achat[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  const [utilisateurId, setUtilisateurId] = useState<number | null>(null);
  const [responsable, setResponsable] = useState<Responsable | null>(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [achatsList, setAchatsList] = useState<
    { produitId: number; quantite: number }[]
  >([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone: "",
    adresse: "",
    latitude: "",
    longitude: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [openPanier, setOpenPanier] = useState(false);
  const totalQuantite = achatsList.reduce(
    (sum, item) => sum + item.quantite,
    0
  );
  const selectedClient = clients.find((c) => c.id === clientId);

  const [modePaiement, setModePaiement] = useState("cash");
  const [nombremois, setNombremois] = useState<number>(1);
  const [montant, setMontant] = useState("");
  const [montantchoisi, setMontantchoisi] = useState("");
  const [datePaiement, setDatePaiement] = useState("");
  const [datePaiementChoisi, setDatePaiementChoisi] = useState("");
  const [typePaiement, setTypePaiement] = useState("comptant"); // ou "mensuel"
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [achatIds, setAchatIds] = useState<number[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Charge les achats déjà existants (optionnel)
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchAllData = async () => {
      setLoading(true);
      setLoadingTable(true);
      try {
        const [achatsRes, clientsRes, produitsRes] = await Promise.all([
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/achats/get?ts=${Date.now()}`,
            { cache: "no-store", signal }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/client/get?ts=${Date.now()}`,
            { cache: "no-store", signal }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/produit/get?ts=${Date.now()}`,
            { cache: "no-store", signal }
          ),
        ]);

        if (!achatsRes.ok || !clientsRes.ok || !produitsRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const [achatsData, clientsData, produitsData] = await Promise.all([
          achatsRes.json(),
          clientsRes.json(),
          produitsRes.json(),
        ]);

        setAchats(achatsData);
        setClients(clientsData);
        setProduits(produitsData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          toast.error("Erreur lors du chargement des données");
        }
      } finally {
        setLoading(false);
        setLoadingTable(false);
      }
    };

    fetchAllData();

    return () => controller.abort(); // annuler fetch si le composant se démonte
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
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

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("Client_nom", form.nom);
    formData.append("Client_prenom", form.prenom);
    formData.append("Client_cin", form.cin);
    formData.append("Client_telephone", form.telephone);
    formData.append("Client_adresse", form.adresse);
    formData.append("latitude", form.latitude); // <-- important
    formData.append("longitude", form.longitude); // <-- important

    if (photoFile) {
      formData.append("Client_photo", photoFile);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/post`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const newClient = await res.json();
        setClients((prev) => [...prev, newClient]);
        toast.success("Client ajouté avec succès !");
        setShowAddModal(false);
        setForm({
          nom: "",
          prenom: "",
          cin: "",
          telephone: "",
          adresse: "",
          latitude: "",
          longitude: "",
        });
        setPhotoFile(null);
      } else {
        const error = await res.json();
        console.log(error);

        if (error.detail && error.detail.toLowerCase().includes("cin")) {
          toast.error("Ce CIN existe déjà.");
        } else {
          toast.error("L'information existe déjà.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau");
    }
  };
  // Enregistre les achats et récupère leurs IDs pour paiement
  const handleAddAchat = async () => {
    if (!utilisateurId || !clientId || achatsList.length === 0) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }

    const achatsPayload = achatsList
      .filter((a) => a.produitId && a.quantite)
      .map((a) => ({
        ProduitID: a.produitId,
        Achat_quantite: a.quantite,
      }));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ResponsableID: utilisateurId,
            ClientID: clientId,
            achats: achatsPayload,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur ajout achat");
        return;
      }

      const data = await res.json();
      const ids = data.achats.map((a: any) => a.id);
      setAchatIds(ids);
      toast.success("Achats enregistrés");
      setShowPaiementModal(true); // Affiche le formulaire paiement
      // setOpenPanier(false);
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handlePaiement = async () => {
    if (!clientId) {
      toast.error("Client non sélectionné.");
      return;
    }

    if (typePaiement === "mensuel") {
      if (!montantchoisi || Number(montantchoisi) <= 0) {
        toast.error("Montant mensuel choisi invalide.");
        return;
      }

      if (!datePaiementChoisi) {
        toast.error("Veuillez choisir la date du premier paiement.");
        return;
      }
    }

    setIsPaying(true);

    // Création du payload
    let payload: any = {
      client: clientId,
      Paiement_montant: montant,
      Paiement_mode: modePaiement,
      Paiement_type: typePaiement,
    };

    if (typePaiement === "mensuel") {
      payload.Paiement_montantchoisi = montantchoisi;
      payload.Paiement_datechoisi = datePaiementChoisi;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/paiement/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        toast.error("Erreur lors du paiement");
        console.error("Erreur paiement :", errorText);
        return;
      }

      const data = await res.json();
      console.log(data);

      toast.success("Paiement effectué avec succès !");

      // Exemple : récupérer les infos facture de la réponse
      if (data.client_id) {
        // Redirige vers la page facture du client
        router.push(`/facture/${data.client_id}`);
      }

      // Réinitialisation des champs
      setShowPaiementModal(false);
      setOpenPanier(false);
      setMontant("");
      setMontantchoisi("");
      setDatePaiementChoisi("");
      setModePaiement("cash");
      setAchatsList([]);
      setClientId(null);
      setAchatIds([]);
    } catch (error) {
      toast.error("Erreur réseau");
      console.error("Erreur réseau paiement :", error);
    } finally {
      setIsPaying(false);
    }
  };
  const [choix, setChoix] = useState("achat");

  const handleClick = (type: string) => {
    setChoix(type);
    if (type === "client") {
      router.push("/client");
    } else if (type === "achat") {
      router.push("/achat");
    }
  };
  // Gestion des inputs texte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gestion du fichier photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setForm((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lon.toString(),
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
          );
          const data = await res.json();

          if (data?.address) {
            const address = data.address;

            const route = address.road || address.pedestrian || address.path;
            const quartier = address.suburb || address.neighbourhood;
            const ville = address.city || address.town || address.village;

            const adresseFormatee = [route, quartier, ville]
              .filter(
                (part, index, self) => part && self.indexOf(part) === index
              )
              .join(", ");

            setForm((prev) => ({
              ...prev,
              adresse: adresseFormatee || "Adresse inconnue",
            }));
          } else {
            alert("Adresse introuvable.");
          }
        } catch (error) {
          alert("Erreur lors de la récupération de l'adresse.");
        }
      },
      (error) => {
        alert("Erreur de géolocalisation : " + error.message);
      }
    );
  };
  if (
    !responsable || // responsable pas chargé
    loading || // données en train de charger
    !Array.isArray(produits) ||
    produits.length === 0 || // produits pas prêts
    !Array.isArray(clients) ||
    clients.length === 0 // clients pas prêts
  ) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-400/30 to-blue-600/90">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <>
      <div className="h-full  flex flex-col gap-6   bg-gradient-to-br from-red-400/30 to-blue-600/90">
        {/* Section ajout achat */}
        <div className="border rounded-xl p-4 shadow-sm bg-white m-4">
          <h2 className="text-xl font-bold mb-4 text-center text-blue-600 bg-white">
            🛒Achat
          </h2>

          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Client :</CardTitle>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="hover:underline text-sm cursor-pointer p-2 bg-blue-500 text-white rounded"
                    >
                      ➕
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nouveau client</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              // 🌀 Loader si données pas encore prêtes
              <div className="flex items-center justify-center h-[300px] rounded-lg shadow">
                <LoadingSpinner />
              </div>
            ) : (
              // ✅ Le Select quand les clients sont chargés
              <Select
                value={clientId?.toString() ?? ""}
                onValueChange={(value) => setClientId(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Sélectionner un client --" />
                </SelectTrigger>
                <SelectContent>
                  {clients
                    .slice() // pour ne pas modifier l'original
                    .sort((a, b) => {
                      const nameA =
                        `${a.Client_nom} ${a.Client_prenom}`.toLowerCase();
                      const nameB =
                        `${b.Client_nom} ${b.Client_prenom}`.toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    .map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.Client_nom} {client.Client_prenom}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>

          {/* Produits à gauche */}
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-4">Produit :</h3>

              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
                style={{ maxHeight: "55vh" }}
              >
                {produits
                  .slice() // pour ne pas modifier l'original
                  .sort((a, b) => a.Produit_nom.localeCompare(b.Produit_nom))
                  .map((produit) => {
                    const stock = produit.Produit_quantite;
                    const isOutOfStock = stock === 0;

                    return (
                      <div
                        key={produit.id}
                        className={`border rounded shadow text-center p-2 aspect-square flex flex-col justify-between transition-transform duration-200 ease-in-out ${
                          isOutOfStock
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:scale-105 active:scale-110"
                        }`}
                        onClick={() => {
                          if (isOutOfStock) return;
                          const exist = achatsList.find(
                            (a) => a.produitId === produit.id
                          );
                          if (exist) {
                            setAchatsList((prev) =>
                              prev.map((a) =>
                                a.produitId === produit.id
                                  ? { ...a, quantite: a.quantite + 1 }
                                  : a
                              )
                            );
                          } else {
                            setAchatsList((prev) => [
                              ...prev,
                              { produitId: produit.id, quantite: 1 },
                            ]);
                          }
                        }}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${produit.Produit_photo}`}
                          alt={produit.Produit_nom}
                          className="w-full h-3/5 object-cover rounded"
                        />

                        {isOutOfStock && (
                          <div className="text-xs text-red-600 font-semibold">
                            Épuisé
                          </div>
                        )}

                        <div className="text-sm mt-auto">
                          <h4 className="font-semibold text-blue-700 truncate">
                            {produit.Produit_nom}
                          </h4>
                          <p className="text-gray-600">
                            {produit.Produit_prix.toLocaleString()} Ar
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Panier (drawer) */}
            {openPanier && (
              <div className="fixed inset-0 bg-black/50 z-40 flex justify-end bottom-14 md:bottom-0">
                <div className="w-full max-w-md h-full bg-white p-4 shadow-lg relative flex flex-col">
                  {/* Bouton de fermeture */}
                  <button
                    className="absolute top-4 right-4 text-red-600 hover:text-red-700 cursor-pointer"
                    onClick={() => setOpenPanier(false)}
                  >
                    ✕
                  </button>
                  {/* Titre panier */}
                  <h2 className="text-xl font-bold mb-4 text-center text-blue-700 mt-6">
                    🛒 Votre Panier
                  </h2>
                  {/* Contenu scrollable */}
                  <div
                    className="flex-1 overflow-y-auto pr-2 space-y-3"
                    style={{ maxHeight: "50vh" }}
                  >
                    {achatsList.map((achat, index) => {
                      const produit = produits.find(
                        (p) => p.id === achat.produitId
                      );
                      if (!produit) return null;
                      const total = produit.Produit_prix * achat.quantite;

                      return (
                        <div
                          key={produit.id}
                          className="flex justify-between items-center border-b py-2"
                        >
                          <div>
                            <p className="font-medium">{produit.Produit_nom}</p>
                            <p className="text-sm text-gray-600">
                              {produit.Produit_prix.toLocaleString()} Ar x{" "}
                              <input
                                type="number"
                                min={1}
                                value={achat.quantite}
                                onChange={(e) => {
                                  const updated = [...achatsList];
                                  updated[index].quantite = Number(
                                    e.target.value
                                  );
                                  setAchatsList(updated);
                                }}
                                className="w-16 border rounded px-2 py-1 ml-1"
                              />
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {total.toLocaleString()} Ar
                            </span>
                            <button
                              onClick={() => {
                                const updated = achatsList.filter(
                                  (_, i) => i !== index
                                );
                                setAchatsList(updated);
                                if (updated.length === 0) {
                                  setOpenPanier(false);

                                  toast("Le panier est maintenant vide.", {
                                    icon: "🛒",
                                  });
                                }
                              }}
                              className="text-red-500 hover:underline text-sm cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total et bouton */}
                  <div className="mt-4 text-right font-bold text-lg">
                    Total :{" "}
                    {achatsList
                      .reduce((sum, achat) => {
                        const p = produits.find(
                          (pr) => pr.id === achat.produitId
                        );
                        return sum + (p ? p.Produit_prix * achat.quantite : 0);
                      }, 0)
                      .toLocaleString()}{" "}
                    Ar
                  </div>
                  <button
                    disabled={!clientId || achatsList.length === 0}
                    onClick={handleAddAchat}
                    className={`w-full mt-6 py-2 rounded text-white cursor-pointer ${
                      !clientId || achatsList.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    ✅ Enregistrer l’achat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal paiement */}
        {showPaiementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="md:w-1/2 w-full max-w-lg bg-white border p-6 rounded-xl shadow-lg relative">
              <h3 className="text-lg font-bold mb-4 text-center text-blue-700">
                Paiement
              </h3>

              {/* Bouton fermer */}
              <button
                onClick={() => setShowPaiementModal(false)}
                className="absolute top-4 right-4 text-red-400 cursor-pointer text-3xl hover:text-red-600"
              >
                ×
              </button>

              {/* Boutons de type de paiement */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Type de paiement
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded ${
                      typePaiement === "comptant"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => setTypePaiement("comptant")}
                  >
                    Comptant
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded ${
                      typePaiement === "mensuel"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => setTypePaiement("mensuel")}
                  >
                    Mensuel
                  </button>
                </div>
              </div>

              {/* Mode de paiement */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Mode de paiement
                </label>
                <select
                  className="w-full border px-3 py-2 rounded bg-gray-200"
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="carte">Carte</option>
                </select>
              </div>

              {/* Champs selon typePaiement */}
              {typePaiement === "mensuel" ? (
                <>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Montant total
                    </label>
                    <input
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      className="w-full border px-3 py-2 rounded bg-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Montant mensuel
                    </label>
                    <input
                      type="number"
                      value={montantchoisi}
                      onChange={(e) => setMontantchoisi(e.target.value)}
                      className="w-full border px-3 py-2 rounded bg-gray-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={datePaiementChoisi}
                      onChange={(e) => setDatePaiementChoisi(e.target.value)}
                      className="w-full border px-3 py-2 rounded bg-gray-200"
                    />
                  </div>
                </>
              ) : (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Montant</label>
                  <input
                    type="number"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    className="w-full border px-3 py-2 rounded bg-gray-200"
                  />
                </div>
              )}

              {/* Bouton valider */}
              <button
                className="bg-green-600 hover:bg-green-700 cursor-pointer px-4 py-2 rounded text-white"
                onClick={() => {
                  if (!selectedClient) {
                    toast.error("Aucun client sélectionné.");
                    return;
                  }

                  handlePaiement();

                  const nomComplet = `${selectedClient.Client_nom} ${selectedClient.Client_prenom}`;
                  const message = `Bonjour ${nomComplet}, votre paiement est effectué.`;
                  const smsUrl = `sms:${
                    selectedClient.Client_telephone
                  }?body=${encodeURIComponent(message)}`;
                  window.location.href = smsUrl;
                }}
              >
                Valider le paiement
              </button>
            </div>
          </div>
        )}

        {!openPanier && (
          <button
            onClick={() => {
              if (totalQuantite > 0) {
                setOpenPanier(true);
              } else {
                toast.error("Votre panier est vide !");
              }
            }}
            className="fixed lg:bottom-4 bottom-16 right-6 z-50 cursor-pointer bg-gray-200 text-blue-600 px-4 py-3 rounded-full shadow-lg hover:bg-blue-200 transition"
          >
            🛒
            {totalQuantite > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-ping-fast">
                {totalQuantite}
              </span>
            )}
          </button>
        )}

        {/* Modal Ajouter client */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="w-full max-w-lg rounded-lg shadow-md p-5"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#ffffff", // force fond blanc
                color: "#1f2937", // texte gris foncé (gray-800)
              }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">
                Information d&#39;un client
              </h2>
              <form onSubmit={handleAddClient} className="flex flex-col gap-4">
                {/* Ligne 1 : Nom + Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="nom"
                    placeholder="Nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="prenom"
                    placeholder="Prénom"
                    value={form.prenom}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Ligne 2 : CIN + Téléphone + Adresse */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="cin"
                    placeholder="CIN"
                    value={form.cin}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="telephone"
                    placeholder="Téléphone"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Ligne 3 : Photo */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Adresse + Bouton de localisation */}
                <input
                  type="text"
                  name="adresse"
                  placeholder="Adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Champs cachés pour lat/lon */}
                <input type="hidden" name="latitude" value={form.latitude} />
                <input type="hidden" name="longitude" value={form.longitude} />
                {/* Boutons */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-full sm:w-auto px-4 py-2 cursor-pointer bg-red-400 text-white rounded hover:bg-red-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 cursor-pointer bg-blue-400 text-white rounded hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
