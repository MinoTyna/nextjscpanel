/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useState } from "react";
import { Bell, ShoppingCart, X } from "lucide-react";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ correction ici

type Client = {
  id: number;
  Client_email: string | null;
  Client_nom: string;
  Client_prenom: string;
  Client_cin: string;
  Client_photo: string;
  Client_adresse?: string;
};

type Facture = {
  client_id: number;
  client: string;
  prenom: string;
  telephone: string;
  date_achat: string;
  adresse: string;
  produits: {
    nom: string;
    quantite: number;
    prix_unitaire: number;
    total: number;
  }[];
  prixtotalproduit: number;
};

type Notification = {
  id: number;
  message: string;
  created_at: string;
  vue_client: boolean;
  mode_reception: "magasin" | "livraison";
  client: {
    id: number;
    nom: string;
    prenom: string;
    email: string | null;
    telephone: string;
    adresse: string;
    photo: string | null;
  };
  produits: {
    id: number;
    nom: string;
    prix: number;
    quantite: number;
    photo: string | null;
  }[];
};

export function Header() {
  const [photo, setPhoto] = useState<string>("/default-client.png");
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modeReception, setModeReception] = useState("magasin");
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [selectedNotifs, setSelectedNotifs] = useState<Notification | null>(
    null
  );
  const [showPaiementModal, setShowPaiementModal] = useState(false);

  const [typePaiement, setTypePaiement] = useState("comptant");
  const [modePaiement, setModePaiement] = useState("cash");
  const [montant, setMontant] = useState("");
  const [montantchoisi, setMontantchoisi] = useState("");
  const [datePaiementChoisi, setDatePaiementChoisi] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [achatIds, setAchatIds] = useState<number[]>([]);
  const [openPanier, setOpenPanier] = useState(false);

  const formatNumberWithSpaces = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
  // Fetch client info
  const fetchClient = async () => {
    const storedId = localStorage.getItem("clientId");
    if (!storedId) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/client/get/${storedId}?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);
      const data: Client = await res.json();
      setClient(data);
      if (data.Client_photo) {
        setPhoto(
          data.Client_photo.startsWith("http")
            ? data.Client_photo
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.Client_photo}`
        );
      }
    } catch (err) {
      console.error("Erreur fetch client :", err);
    }
  };
  // ?ts=${Date.now()}`,

  // Fetch notifications
  const fetchNotifications = async () => {
    const clientId = localStorage.getItem("clientId");
    if (!clientId) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/achats/notifications/${clientId}/acceptes/?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Erreur fetch notifications :", err);
    }
  };
  useEffect(() => {
    // Charger au démarrage
    fetchNotifications();

    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Récupérer notification spécifique par ID
  const fetchNotificationById = async (notifId: number) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/achats/notifications/${notifId}/?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Erreur fetch notification :", err);
      toast.error("Impossible de récupérer la notification.");
      return null;
    }
  };

  // Génération PDF
  // Génération PDF avec logo et responsable
  const generatePDF = (facture: Facture) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/logo.jpeg"; // Logo UNICSTAT
    logo.onload = () => {
      const logoSize = 25;
      doc.addImage(logo, "JPEG", 14, 10, logoSize, logoSize);
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(14, 10, logoSize, logoSize);

      // Infos société
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("NIF : 4005620968", 50, 15);
      doc.text("STAT : 46492 51 2021 0 00651", 50, 22);

      // Titre Facture centré
      doc.setFontSize(16);
      doc.setTextColor(0, 74, 153);
      doc.setFont("helvetica", "bold");
      doc.text("Facture", 105, 40, { align: "center" });

      // Date en haut à droite
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const dateStr = new Date(facture.date_achat).toLocaleDateString();
      doc.text(`Date: ${dateStr}`, 200, 20, { align: "right" }); // 200 mm = marge droite

      // Infos client
      doc.text(`Client: ${facture.client} ${facture.prenom}`, 14, 45);
      doc.text(`Téléphone: ${facture.telephone}`, 14, 51);
      if (facture.adresse) doc.text(`Adresse: ${facture.adresse}`, 14, 57);

      // Responsable par défaut
      doc.text("Responsable: M. Rakoto", 140, 45);
      doc.text("Contact: 0341234567", 140, 51);

      // Table produits
      const tableData = facture.produits.map((p) => [
        p.nom,
        p.quantite.toString(),
        formatNumberWithSpaces(p.prix_unitaire),
        formatNumberWithSpaces(p.total),
      ]);

      autoTable(doc, {
        head: [["Produit", "Quantité", "Prix Unitaire", "Total"]],
        body: tableData,
        startY: 65,
      });

      // Total
      const finalY = (doc as any).lastAutoTable?.finalY;
      doc.text(
        `Total : ${formatNumberWithSpaces(facture.prixtotalproduit)} Ar`,
        14,
        finalY ? finalY + 10 : 75
      );

      doc.save(`Facture_${facture.client}_${facture.prenom}.pdf`);
    };

    logo.onerror = () => {
      console.error("Impossible de charger le logo UNICSTAT");
    };
  };

  useEffect(() => {
    fetchClient();
    fetchNotifications();
    const clientRole = localStorage.getItem("Client_role");
    if (clientRole === "client") setIsClient(true);

    const updateCart = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(storedCart);
      setCartCount(
        storedCart.reduce((acc: number, item: any) => acc + item.quantity, 0)
      );
    };

    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartCount(updated.reduce((acc, item) => acc + item.quantity, 0));
  };

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartCount(updated.reduce((acc, item) => acc + item.quantity, 0));
    if (!updated.length) toast("Le panier est vide.", { icon: "🛒" });
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.Produit_prix * item.quantity,
    0
  );
  // const handleAddAchatFromNotif = async () => {
  //   if (!selectedNotif) {
  //     toast.error("Aucune notification sélectionnée");
  //     return;
  //   }

  //   const clientId = selectedNotif.client.id;
  //   const responsableId = 1; // ✅ ID responsable par défaut

  //   if (!clientId || !responsableId) {
  //     toast.error("ClientID et ResponsableID sont requis");
  //     return;
  //   }

  //   const achatsPayload = selectedNotif.produits.map((p) => ({
  //     ProduitID: p.id,
  //     Achat_quantite: p.quantite,
  //   }));

  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/post`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           ResponsableID: responsableId,
  //           ClientID: clientId,
  //           achats: achatsPayload,
  //         }),
  //       }
  //     );

  //     if (!res.ok) {
  //       const err = await res.json();
  //       toast.error(err.error || "Erreur ajout achat");
  //       return;
  //     }

  //     const data = await res.json();
  //     toast.success("Enregistrés avec succès !");
  //     setSelectedNotif(null); // fermer le modal
  //     setShowPaiementModal(true);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Erreur réseau");
  //   }
  // };

  // const handlePaiement = async () => {
  //   if (!selectedClient) {
  //     toast.error("Aucun client sélectionné.");
  //     return;
  //   }

  //   const clientId = selectedClient.id;
  //   setIsPaying(true);

  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/paiement/post`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (!res.ok) {
  //       const errorText = await res.text();
  //       toast.error("Erreur lors du paiement");
  //       console.error("Erreur paiement :", errorText);
  //       return;
  //     }

  //     const data = await res.json();
  //     toast.success("Paiement effectué avec succès !");

  //     // ✅ Envoi du SMS après succès
  //     const nomComplet = `${selectedClient.Client_nom} ${selectedClient.Client_prenom}`;
  //     const message = `Bonjour ${nomComplet}, votre paiement est effectué.`;
  //     const smsUrl = `sms:${
  //       selectedClient.Client_telephone
  //     }?body=${encodeURIComponent(message)}`;
  //     window.location.href = smsUrl;

  //     // Redirection facture
  //     if (data.client_id) {
  //       router.push(`/facture/${data.client_id}`);
  //     }

  //     // Réinitialisation
  //     setShowPaiementModal(false);
  //     setMontant("");
  //     setMontantchoisi("");
  //     setDatePaiementChoisi("");
  //     setModePaiement("cash");

  //     setAchatIds([]);
  //   } catch (error) {
  //     toast.error("Erreur réseau");
  //     console.error("Erreur réseau paiement :", error);
  //   } finally {
  //     setIsPaying(false);
  //   }
  // };

  const handleAddAchatFromNotif = async () => {
    if (!selectedNotif) {
      toast.error("Aucune notification sélectionnée");
      return;
    }

    const clientId = selectedNotif.client.id;
    const responsableId = 1; // ID responsable par défaut

    if (!clientId || !responsableId) {
      toast.error("ClientID et ResponsableID sont requis");
      return;
    }

    const achatsPayload = selectedNotif.produits.map((p) => ({
      ProduitID: p.id,
      Achat_quantite: p.quantite,
    }));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ResponsableID: responsableId,
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

      // ✅ Récupération des IDs achats
      if (data.achat_ids) {
        setAchatIds(data.achat_ids);
      }

      toast.success("Achats enregistrés avec succès !");
      setSelectedNotif(null);
      setSelectedClient(selectedNotif.client);
      setShowPaiementModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau");
    }
  };

  /**
   * ✅ Étape 2 : Paiement
   */
  const handlePaiement = async () => {
    if (!selectedClient) {
      toast.error("Aucun client sélectionné.");
      return;
    }

    const clientId = selectedClient.id;

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

    // Payload complet
    let payload: any = {
      client: clientId,
      Paiement_montant: montant,
      Paiement_mode: modePaiement,
      Paiement_type: typePaiement,
      AchatIDs: achatIds, // ✅ lien paiement <-> achats
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
      toast.success("Paiement effectué avec succès !");

      // ✅ SMS après succès
      const nomComplet = `${selectedClient.Client_nom} ${selectedClient.Client_prenom}`;
      const message = `Bonjour ${nomComplet}, votre paiement est effectué.`;
      const smsUrl = `sms:${
        selectedClient.Client_telephone
      }?body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;

      // ✅ Redirection facture
      if (data.client_id) {
        router.push(`/facture/${data.client_id}`);
      }

      // Réinitialisation
      setShowPaiementModal(false);
      setOpenPanier(false);
      setMontant("");
      setMontantchoisi("");
      setDatePaiementChoisi("");
      setModePaiement("cash");
      setAchatIds([]);
    } catch (error) {
      toast.error("Erreur réseau");
      console.error("Erreur réseau paiement :", error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      {/* Header */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <a href="/" aria-label="AUF-SARL Logo">
              <img
                src="/logo.jpeg"
                alt="AUF-SARL"
                className="w-10 h-10 rounded-full"
              />
            </a>
            <span className="font-bold text-lg text-gray-800">AUF-SARL</span>
          </div>

          {/* Menu */}
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <a
              href="#accueil"
              className="hover:text-white hover:bg-blue-900 p-2 rounded-2xl transition"
            >
              Accueil
            </a>
            <a
              href="#produits"
              className="hover:text-white hover:bg-blue-900 p-2 rounded-2xl transition"
            >
              Produits
            </a>
            <a
              href="#a-propos"
              className="hover:text-white hover:bg-blue-900 p-2 rounded-2xl transition"
            >
              Mission
            </a>
            <a
              href="#contact"
              className="hover:text-white hover:bg-blue-900 p-2 rounded-2xl transition"
            >
              Contact
            </a>
          </div>

          {/* Client */}
          <div className="flex space-x-4 text-sm relative items-center">
            {isClient ? (
              <>
                {/* Panier */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                >
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                <button
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                >
                  <Bell className="w-5 h-5 text-blue-600" />
                  {notifications.filter((n) => !n.vue_client).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter((n) => !n.vue_client).length}
                    </span>
                  )}
                </button>

                {/* Photo client */}
                <div className="relative">
                  {client && (
                    <img
                      src={
                        client.Client_photo
                          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${client.Client_photo}`
                          : "images.jpg"
                      }
                      alt={`${client.Client_nom} ${client.Client_prenom}`}
                      className="w-12 h-12 object-cover rounded-full cursor-pointer border bg-gray-200"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "images.jpg";
                      }}
                    />
                  )}

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                      <a
                        href={`/profile/${client?.id}`}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profil
                      </a>
                      <a
                        href={`/paiement/${client?.id}`}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Mon compte
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a
                  href="/connexion"
                  className="px-4 py-2 border text-gray-800 rounded-lg hover:bg-blue-950 font-bold hover:text-orange-600 transition"
                >
                  Connexion
                </a>
                <a
                  href="/registre"
                  className="px-4 py-2 bg-blue-950 text-white font-bold rounded-lg hover:bg-orange-500 hover:text-white transition"
                >
                  Registre
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Dropdown notifications */}

      {/* {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border p-4 z-50">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="font-bold text-lg">Notifications</h2>
            <button onClick={() => setNotifOpen(false)}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune notification.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2 rounded transition ${
                    !notif.vue_client ? "bg-blue-50 font-medium" : "bg-gray-50"
                  }`}
                >
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>

                  {notif.mode_reception === "magasin" ? (
                    <button
                      className="mt-2 w-full bg-green-600 text-white py-1 rounded hover:bg-green-700"
                      onClick={async () => {
                        if (!notif.vue_client) {
                          try {
                            await fetch(
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/notifications/${notif.id}/mark-read/`,
                              { method: "POST" }
                            );
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id
                                  ? { ...n, vue_client: true }
                                  : n
                              )
                            );
                          } catch (err) {
                            console.error(
                              "Erreur mise à jour notification :",
                              err
                            );
                          }
                        }

                        const fullNotif = await fetchNotificationById(notif.id);
                        if (!fullNotif) return;

                        const facture: Facture = {
                          client_id: fullNotif.client.id,
                          client: fullNotif.client.nom,
                          prenom: fullNotif.client.prenom,
                          adresse: fullNotif.client.adresse,
                          telephone: fullNotif.client.telephone,
                          date_achat: new Date(
                            fullNotif.created_at
                          ).toISOString(),
                          produits: fullNotif.produits.map((p) => ({
                            nom: p.nom,
                            quantite: p.quantite, // 👈 récupère la vraie quantité depuis l'API
                            prix_unitaire: p.prix,
                            total: p.prix * p.quantite, // 👈 calcule le total par produit
                          })),
                          prixtotalproduit: fullNotif.produits.reduce(
                            (acc, p) => acc + p.prix * p.quantite, // 👈 somme des totaux
                            0
                          ),
                        };

                        generatePDF(facture);
                      }}
                    >
                      Voir la facture
                    </button>
                  ) : notif.mode_reception === "livraison" ? (
                    <button
                      className="mt-2 w-full bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600"
                      onClick={async () => {
                        // 1️⃣ Marquer comme lu côté client
                        if (!notif.vue_client) {
                          try {
                            await fetch(
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/notifications/${notif.id}/mark-read/`,
                              { method: "POST" }
                            );
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id
                                  ? { ...n, vue_client: true }
                                  : n
                              )
                            );
                          } catch (err) {
                            console.error(
                              "Erreur mise à jour notification :",
                              err
                            );
                          }
                        }

                        // 2️⃣ Ouvrir le modal Livraison
                        setSelectedNotif(notif);
                      }}
                    >
                      Livraison à domicile
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )} */}

      {/* Notifications */}
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border p-4 z-50">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="font-bold text-lg">Notifications</h2>
            <button onClick={() => setNotifOpen(false)}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune notification.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2 rounded transition ${
                    !notif.vue_client ? "bg-blue-50 font-medium" : "bg-gray-50"
                  }`}
                >
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>

                  {notif.mode_reception === "magasin" ? (
                    <button
                      className="mt-2 w-full bg-green-600 text-white py-1 rounded hover:bg-green-700"
                      onClick={async () => {
                        if (!notif.vue_client) {
                          try {
                            await fetch(
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/notifications/${notif.id}/mark-read/`,
                              { method: "POST" }
                            );
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id
                                  ? { ...n, vue_client: true }
                                  : n
                              )
                            );
                          } catch (err) {
                            console.error(
                              "Erreur mise à jour notification :",
                              err
                            );
                          }
                        }

                        const fullNotif = await fetchNotificationById(notif.id);
                        if (!fullNotif) return;

                        setSelectedNotifs(fullNotif); // ouvre le modal facture
                      }}
                    >
                      Voir la facture
                    </button>
                  ) : notif.mode_reception === "livraison" ? (
                    <button
                      className="mt-2 w-full bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600"
                      onClick={async () => {
                        if (!notif.vue_client) {
                          try {
                            await fetch(
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/notifications/${notif.id}/mark-read/`,
                              { method: "POST" }
                            );
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id
                                  ? { ...n, vue_client: true }
                                  : n
                              )
                            );
                          } catch (err) {
                            console.error(
                              "Erreur mise à jour notification :",
                              err
                            );
                          }
                        }

                        setSelectedNotif(notif); // ouvre modal livraison
                      }}
                    >
                      Livraison à domicile
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Facture */}
      {selectedNotifs && selectedNotifs.mode_reception === "magasin" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedNotifs(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Facture - {selectedNotifs.client.nom}{" "}
              {selectedNotifs.client.prenom}
            </h2>

            {/* Infos client */}
            <div className="mb-4 grid grid-cols-2 gap-4 bg-gray-100 p-3 rounded">
              <div>
                <p>
                  <strong>Client :</strong> {selectedNotifs.client.nom}{" "}
                  {selectedNotifs.client.prenom}
                </p>
                <p>
                  <strong>Téléphone :</strong> {selectedNotifs.client.telephone}
                </p>
                <p>
                  <strong>Adresse :</strong>{" "}
                  {selectedNotifs.client.adresse || "Non renseignée"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Responsable :</strong> M. Rakoto
                </p>
                <p>
                  <strong>Téléphone :</strong> 0341234567
                </p>
              </div>
            </div>

            {/* Produits */}
            <table className="w-full border border-gray-200 mt-4">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Produit</th>
                  <th className="border px-2 py-1">Quantité</th>
                  <th className="border px-2 py-1">Prix</th>
                  <th className="border px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedNotifs.produits.map((p) => (
                  <tr key={p.id}>
                    <td className="border px-2 py-1">{p.nom}</td>
                    <td className="border px-2 py-1 text-center">
                      {p.quantite}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {p.prix.toLocaleString()} Ar
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {(p.prix * p.quantite).toLocaleString()} Ar
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="mt-4 text-right font-bold">
              Total :{" "}
              {selectedNotifs.produits
                .reduce((acc, p) => acc + p.prix * p.quantite, 0)
                .toLocaleString()}{" "}
              Ar
            </div>

            {/* Boutons */}
            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() =>
                  generatePDF({
                    client_id: selectedNotifs.client.id,
                    client: selectedNotifs.client.nom,
                    prenom: selectedNotifs.client.prenom,
                    adresse: selectedNotifs.client.adresse || "",
                    telephone: selectedNotifs.client.telephone,
                    date_achat: selectedNotifs.created_at,
                    produits: selectedNotifs.produits.map((p) => ({
                      nom: p.nom,
                      quantite: p.quantite,
                      prix_unitaire: p.prix,
                      total: p.prix * p.quantite,
                    })),
                    prixtotalproduit: selectedNotifs.produits.reduce(
                      (acc, p) => acc + p.prix * p.quantite,
                      0
                    ),
                  })
                }
              >
                Télécharger PDF
              </button>
              <button
                className="flex-1 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
                onClick={() => setSelectedNotifs(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal détails livraison */}
      {selectedNotif && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedNotif(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Livraison à domicile</h2>

            {/* Infos client */}
            <div className="mb-4">
              <p>
                <span className="font-semibold">Client :</span>{" "}
                {selectedNotif.client.nom} {selectedNotif.client.prenom} (ID:{" "}
                {selectedNotif.client.id})
              </p>
              <p>
                <span className="font-semibold">Adresse :</span>{" "}
                {selectedNotif.client.adresse || "Non renseignée"}
              </p>
              <p>
                <span className="font-semibold">Téléphone :</span>{" "}
                {selectedNotif.client.telephone || "Non renseigné"}
              </p>
            </div>

            {/* Produits */}
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Produit (ID)</th>
                  <th className="border px-2 py-1">Quantité</th>
                  <th className="border px-2 py-1">Prix</th>
                  <th className="border px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedNotif.produits.map((p) => (
                  <tr key={p.id}>
                    <td className="border px-2 py-1">{p.nom}</td>
                    <td className="border px-2 py-1 text-center">
                      {p.quantite}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {p.prix} Ar
                    </td>{" "}
                    <td className="border px-2 py-1 text-center">
                      {p.prix * p.quantite} Ar
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total général */}
            <div className="mt-4 text-right font-bold">
              Total :{" "}
              {selectedNotif.produits.reduce(
                (acc, p) => acc + p.prix * p.quantite,
                0
              )}{" "}
              Ar
            </div>
            <button
              className="mt-4 w-full bg-green-600 text-white py-1 rounded hover:bg-green-700"
              onClick={handleAddAchatFromNotif}
            >
              Confirmer et enregistrer l'achat
            </button>
          </div>
        </div>
      )}

      {/* Panier */}
      {/* Drawer Panier */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fond semi-transparent */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer DROIT */}
          <div className="relative bg-white w-110 h-full shadow-lg p-4 ml-auto animate-slideInRight flex flex-col">
            {/* Bouton fermer */}
            <button
              onClick={() => setCartOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-lg font-bold text-center text-blue-700 mt-6 mb-4">
              🛒 Votre Panier
            </h2>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center">
                Votre panier est vide.
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {cartItems.map((item, index) => {
                  const totalItem = item.Produit_prix * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b py-2"
                    >
                      {/* Infos produit */}
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            item.Produit_photo?.startsWith("http")
                              ? item.Produit_photo
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.Produit_photo}`
                          }
                          alt={item.Produit_nom}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.Produit_nom}</p>
                          <p className="text-sm text-gray-600">
                            {item.Produit_prix.toLocaleString()} Ar x{" "}
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(index, Number(e.target.value))
                              }
                              className="w-16 border rounded px-2 py-1 ml-1"
                            />
                          </p>
                        </div>
                      </div>

                      {/* Prix + bouton supprimer */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {totalItem.toLocaleString()} Ar
                        </span>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:underline text-sm cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer panier */}
            {cartItems.length > 0 && (
              <>
                {/* Choix du mode de réception */}
                <div className="mt-4">
                  <label className="block font-semibold mb-2">
                    Mode de réception :
                  </label>
                  <select
                    value={modeReception}
                    onChange={(e) => setModeReception(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="magasin">🏬 Récupération au magasin</option>
                    <option value="livraison">🚚 Livraison à domicile</option>
                  </select>
                </div>

                <div className="mt-4 text-right font-bold text-lg">
                  Total : {total.toLocaleString()} Ar
                </div>
              </>
            )}

            <Button
              disabled={cartItems.length === 0}
              className={`w-full mt-4 py-2 rounded text-white ${
                cartItems.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={async () => {
                if (!client || cartItems.length === 0) return;

                try {
                  const produits_data = cartItems.map((item) => ({
                    id: item.id,
                    quantite: item.quantity || 1,
                  }));

                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/commande/`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        client_id: client.id,
                        produits: produits_data,
                        mode_reception: modeReception,
                      }),
                    }
                  );

                  // Essaye de parser JSON, sinon affiche brut
                  let data: any = null;
                  try {
                    data = await res.json();
                  } catch {
                    const text = await res.text();
                    console.error("Réponse brute du serveur :", text);
                  }

                  if (!res.ok) {
                    console.error(
                      "Erreur notification :",
                      data || "Erreur serveur"
                    );
                    toast.error("Erreur lors de la création de la commande ❌");
                    return;
                  }

                  console.log("Notification créée :", data?.message);

                  // Reset panier
                  localStorage.removeItem("cart");
                  setCartItems([]);
                  setCartCount(0);
                  setCartOpen(false);
                  toast.success("Commande validée ✅");
                } catch (error) {
                  console.error(error);
                  toast.error("Erreur lors de la validation de la commande ❌");
                }
              }}
            >
              ✅ Valider la commande
            </Button>
          </div>
        </div>
      )}

      {showPaiementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="md:w-1/2 w-full max-w-lg bg-white border p-6 rounded-xl shadow-lg relative">
            <h3 className="text-lg font-bold mb-4 text-center text-blue-700">
              Paiement
            </h3>

            {/* Fermer */}
            <button
              onClick={() => setShowPaiementModal(false)}
              className="absolute top-4 right-4 text-red-400 cursor-pointer text-3xl hover:text-red-600"
            >
              ×
            </button>

            {/* Type de paiement */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Type de paiement</label>
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

            {/* Mode paiement */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Mode de paiement</label>
              <select
                className="w-full border px-3 py-2 rounded bg-gray-200"
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="carte">Carte</option>
              </select>
            </div>

            {/* Champs selon type */}
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
              className="bg-green-600 hover:bg-green-700 cursor-pointer px-4 py-2 rounded text-white w-full"
              onClick={handlePaiement}
              disabled={isPaying}
            >
              {isPaying ? "Traitement..." : "Valider le paiement"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
