/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiUserPlus } from "react-icons/fi";
import Layout from "../../components/layout/Layouts";
import Tableau from "../../components/Tableaux";
import ClientCardMobile from "../../components/ClientCardMobile";
import { useRouter } from "next/navigation";
import UpdateClientModal from "./UpdateClientModal";
import { jwtDecode } from "jwt-decode";
import { FaPlus, FaSearch } from "react-icons/fa";
import LoadingOverlayAnimatedCircle from "../../components/LoadingOverlayCircle";
type DecodedToken = {
  sub: string; // id
  email: string;
  nom: string;
  photo?: string;
  role: string;
};
type Client = {
  id: number;
  Client_nom: string;
  Client_prenom: string;
  Client_cin: string;
  Client_telephone: string;
  Client_adresse: string;
  Client_photo?: string;
};
type Responsable = {
  id: number;
  Responsable_email: string;
  Responsable_nom: string;
  Responsable_photo: string;
  Responsable_role: string;
};
export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [responsable, setResponsable] = useState<Responsable | null>(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone: "",
    telephone1: "",
    telephone2: "",
    telephone3: "",
    telephone4: "",
    adresse: "",
    latitude: "",
    longitude: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingRole(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);

      setRole(decoded.role);
      setResponsable({
        id: Number(decoded.sub),
        Responsable_email: decoded.email,
        Responsable_nom: decoded.nom,
        Responsable_photo: decoded.photo || "",
        Responsable_role: decoded.role,
      });

      localStorage.setItem("Responsable_role", decoded.role);
    } catch (err) {
      console.error("Erreur décodage token JWT :", err);
      setRole(null);
      setResponsable(null);
    } finally {
      setLoadingRole(false);
    }
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/get?ts=${Date.now()}`, // 🔄 évite le cache
        { cache: "no-store" }
      );
      const data = await res.json();
      setClients(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des clients :", error);
    }
  };

  // Appelle fetchClients au montage du composant
  useEffect(() => {
    fetchClients();
  }, []);

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

        // Utilise une API de géocodage inversé comme OpenStreetMap (gratuite)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();

          if (data?.display_name) {
            setForm((prev) => ({ ...prev, adresse: data.display_name }));
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
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification frontend : éviter doublon (hors téléphone)
    const exists = clients.some(
      (c) =>
        c.Client_nom?.trim().toLowerCase() === form.nom.trim().toLowerCase() &&
        c.Client_prenom?.trim().toLowerCase() ===
          form.prenom.trim().toLowerCase() &&
        c.Client_cin?.trim() === form.cin.trim() &&
        c.Client_adresse?.trim().toLowerCase() ===
          form.adresse.trim().toLowerCase()
    );

    if (exists) {
      toast.error("Ce client existe déjà dans la liste.");
      return;
    }

    // Préparer FormData
    const formData = new FormData();
    formData.append("Client_nom", form.nom);
    formData.append("Client_prenom", form.prenom);
    formData.append("Client_cin", form.cin);
    formData.append("Client_telephone", form.telephone);
    formData.append("Client_telephone1", form.telephone1 || "");
    formData.append("Client_telephone2", form.telephone2 || "");
    formData.append("Client_telephone3", form.telephone3 || "");
    formData.append("Client_telephone4", form.telephone4 || "");
    formData.append("Client_adresse", form.adresse);
    formData.append("latitude", form.latitude || "");
    formData.append("longitude", form.longitude || "");
    if (photoFile) formData.append("Client_photo", photoFile);

    try {
      setAdding(true);
      setAddSuccess(false);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/post`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Ajouter le client dans la liste locale
        setClients((prev) => [...prev, data]);
        setAddSuccess(true);
        toast.success("Client ajouté avec succès !");

        // Réinitialiser après un petit délai
        setTimeout(() => {
          setAdding(false);
          setAddSuccess(false);
          setShowAddModal(false);
          setForm({
            nom: "",
            prenom: "",
            cin: "",
            telephone: "",
            telephone1: "",
            telephone2: "",
            telephone3: "",
            telephone4: "",
            adresse: "",
            latitude: "",
            longitude: "",
          });
          setPhotoFile(null);
        }, 2000);
      } else {
        toast.error(data.error || "Erreur lors de l'ajout du client.");
        setAdding(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau, veuillez réessayer.");
      setAdding(false);
    }
  };

  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleConfirmDelete = () => {
    if (!selectedClient) return;

    setDeleting(true);
    setDeleteSuccess(false);

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/delete/${selectedClient.id}`,
      {
        method: "DELETE",
      }
    )
      .then((res) => {
        if (res.ok) {
          setClients((prev) =>
            prev.filter((client) => client.id !== selectedClient.id)
          );
          setDeleteSuccess(true); // afficher le check vert
          toast.success("Client supprimé avec succès !");
        } else {
          toast.error("Erreur lors de la suppression.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erreur réseau !");
      })
      .finally(() => {
        // cacher l'overlay après 1-1.5s pour voir le check
        setTimeout(() => {
          setDeleting(false);
          setDeleteSuccess(false);
          setSelectedClient(null);
        }, 2000);
        setShowModal(false);
      });
  };

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase();
    return (
      client.Client_nom?.toLowerCase().includes(query) ||
      client.Client_prenom?.toLowerCase().includes(query) ||
      client.Client_cin?.toLowerCase().includes(query) ||
      client.Client_telephone?.toLowerCase().includes(query) ||
      client.Client_adresse?.toLowerCase().includes(query)
    );
  });
  const router = useRouter();
  const [choix, setChoix] = useState("client");

  const handleClick = (type: string) => {
    setChoix(type);
    if (type === "client") {
      router.push("/client");
    } else if (type === "achat") {
      router.push("/achat");
    }
  };
  return (
    <>
      {/* <div className="h-full overflow-y-auto p-2 md:p-6 flex flex-col gap-4"> */}
      <div className="h-full  flex flex-col gap-6  bg-gradient-to-br from-red-400/30 to-blue-600/90 ">
        {/* <h1 className="md:text-2xl font-bold text-center">Liste de Clients</h1> */}
        {/* Ligne: Search + Bouton Ajouter */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-5 p-3 mb-2 gap-3">
          <h2 className="text-2xl font-bold text-white ">Liste de Clients</h2>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Champ de recherche avec icône */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-100">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="border border-gray-100 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-blue-500 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Bouton ajouter avec icône et tooltip */}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 cursor-pointer rounded-lg relative group"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus />
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Ajouter
              </span>
            </button>
          </div>
        </div>

        {/* Mobile view */}
        {loadingRole || !role ? (
          <div className="text-center text-gray-600">Chargement...</div>
        ) : (
          <>
            {/* Desktop */}
            {(role === "vendeur" || role === "admin") && (
              <div className="hidden md:block p-4 lg:mt-[-22px]  ">
                <Tableau
                  headers={[
                    "Image",
                    "Nom",
                    "Prenom",
                    "Cin",
                    "Telephone",
                    "Adresse",
                  ]}
                  colonnesAffichees={[
                    "Client_photo",
                    "Client_nom",
                    "Client_prenom",
                    "Client_cin",
                    "Client_telephone",
                    "Client_adresse",
                  ]}
                  rows={filteredClients}
                  {...(role === "admin" && {
                    onEdit: (user) => {
                      setSelectedClient(user);
                      setShowUpdateModal(true);
                    },
                    onDelete: (user) => {
                      setSelectedClient(user);
                      setShowModal(true);
                    },
                  })}
                  loading={loading}
                />
              </div>
            )}

            {/* Mobile */}
            {(role === "vendeur" || role === "admin") && (
              <div className="block md:hidden">
                {filteredClients.length === 0 ? (
                  <p className="text-center text-gray-600">
                    Aucun client à afficher
                  </p>
                ) : (
                  filteredClients.map((client) => (
                    <ClientCardMobile
                      key={client.id}
                      client={client}
                      {...(role === "admin" && {
                        onEdit: (user) => {
                          setSelectedClient(user);
                          setShowUpdateModal(true);
                        },
                        onDelete: (user) => {
                          setSelectedClient(user);
                          setShowModal(true);
                        },
                      })}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
      <UpdateClientModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        client={selectedClient}
        onUpdate={fetchClients}
      />
      {/* modal delete  */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40  px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white  w-full max-w-md rounded-lg shadow-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-1xl text-gray-700  mb-5 text-center">
              Êtes-vous sûr de vouloir supprimer ce client ?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 cursor-pointer text-gray-800 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 cursor-pointer text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Ajouter client */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
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
              Ajouter un client
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
              {/* Téléphones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="telephone"
                  placeholder="Téléphone principal"
                  value={form.telephone}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="telephone1"
                  placeholder="Téléphone 1 (optionnel)"
                  value={form.telephone1}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="telephone2"
                  placeholder="Téléphone 2 (optionnel)"
                  value={form.telephone2}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="telephone3"
                  placeholder="Téléphone 3 (optionnel)"
                  value={form.telephone3}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="telephone4"
                  placeholder="Téléphone 4 (optionnel)"
                  value={form.telephone4}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <input
                  type="text"
                  name="adresse"
                  placeholder="Adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="md:col-span-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  📍
                </button>
              </div>

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
                  className="w-full sm:w-auto px-4 py-2 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{" "}
      <LoadingOverlayAnimatedCircle
        show={deleting}
        success={deleteSuccess}
        text={deleteSuccess ? "Supprimé !" : "Suppression en cours..."}
      />
      <LoadingOverlayAnimatedCircle
        show={adding}
        success={addSuccess}
        text={addSuccess ? "Ajouté !" : "Ajout en cours..."}
      />
    </>
  );
}
