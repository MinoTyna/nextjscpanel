/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layouts";
import Tableau from "../../components/Tableau";
import ProduitCardMobile from "../../components/ProduitCardMobile";
import LoadingOverlayAnimatedCircle from "../../components/LoadingOverlayCircle";

import { Search } from "lucide-react";
import toast from "react-hot-toast";
import UpdateProduitModal from "./UpdateProduitModal";
import ProduitGrid from "../../components/ProduitGrid";
import { FaSearch, FaPlus } from "react-icons/fa"; // ou autre selon ta préférence
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { jwtDecode } from "jwt-decode";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useRouter } from "next/navigation";

type Gestion = {
  id: number;
  ResponsableID: number;
  Responsable_nom: string;
  ProduitID: number;
  Produit_nom: string;
  Gestion_date: string;
  Gestion_quantite: number;
};

type Produit = {
  id: number;
  Produit_nom: string;
  Produit_reference: string;
  Produit_description?: string;
  Produit_prix?: number;
  Produit_quantite?: number;
  Produit_photo?: string;
};

type Responsable = {
  id: number;
  Responsable_email: string;
  Responsable_nom: string;
};
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
export default function ProduitInsertPage() {
  const router = useRouter();
  const [responsable, setResponsable] = useState<Responsable | null>(null);

  const [insertion, setInsertion] = useState<Gestion[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [utilisateurId, setUtilisateurId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProduitModal, setShowAddProduitModal] = useState(false);

  // Form Insertion
  const [produitId, setProduitId] = useState("");
  const [quantite, setQuantite] = useState("");

  // Form Produit
  const [nom, setNom] = useState("");
  const [reference, Setreference] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true); // ✅ état de chargement
  const [error, setError] = useState<string | null>(null);
  // === Fetch initial data ===
  const [addSuccess, setAddSuccess] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // --- Fetch Produits ---
  const fetchProduits = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/get?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setProduits(data);
    } catch {
      toast.error("Erreur lors du chargement des produits");
    }
  };

  // --- Fetch Insertions ---
  const fetchInsertions = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/gestion/get?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setInsertion(data);
    } catch {
      toast.error("Erreur lors du chargement des insertions");
    }
  };

  // --- useEffect au montage ---
  useEffect(() => {
    fetchProduits();
    fetchInsertions();
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

  // === Insertion produit existant ===
  const handleCreateInsertion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!utilisateurId || !produitId || !quantite) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/gestion/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ProduitID: parseInt(produitId),
            Gestion_quantite: parseInt(quantite),
            ResponsableID: utilisateurId,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur lors de l'insertion");
      }

      const data = await res.json();
      setInsertion((prev) => [...prev, data]);

      toast.success("Insertion enregistrée !");
      fetchProduits();
      setShowAddModal(false);
      setProduitId("");
      setQuantite("");
    } catch (err: any) {
      toast.error(err.message || "Erreur réseau");
    }
  };

  // === Création nouveau produit ===
  const handleCreateProduit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Produit_nom", nom);
    formData.append("Produit_prix", prix);
    if (description) formData.append("Produit_description", description);
    if (stock) formData.append("Produit_quantite", stock);
    if (photo) formData.append("Produit_photo", photo);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/post`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur création produit");
      }

      const data = await res.json();
      setProduits((prev) => [...prev, data]);
      toast.success("Produit ajouté !");
      setShowAddProduitModal(false);
      setNom("");
      Setreference("");
      setPrix("");
      setDescription("");
      setStock("");
      setPhoto(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur réseau");
    }
  };

  // === Suppression produit ===
  const handleConfirmDelete = async () => {
    if (!selectedProduit) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/delete/${selectedProduit.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setProduits((prev) => prev.filter((p) => p.id !== selectedProduit.id));
      setDeleteSuccess(true); // afficher le check vert

      toast.success("Produit supprimé !");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setTimeout(() => {
        setDeleting(false);
        setDeleteSuccess(false);
        setSelectedProduit(null);
      }, 2000);
      setShowModal(false);
    }
  };

  // === Filtrage ===
  const filteredProduits = produits.filter((p) =>
    p.Produit_nom.toLowerCase().includes(search.toLowerCase())
  );

  // -----------------------

  return (
    <>
      <div className="h-full  flex flex-col gap-6   bg-gradient-to-br from-red-400/30 to-blue-600/90 ">
        <div className="flex flex-col md:flex-row justify-between items-center mt-5 p-3 mb-2 gap-3">
          <h2 className="text-2xl font-bold text-white">Liste de produits</h2>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Champ de recherche avec icône */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-blue-500 w-full"
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

        <div className="hidden md:block p-4 lg:mt-[-24px] ">
          <ProduitGrid
            rows={filteredProduits}
            onEdit={(produit) => {
              setSelectedProduit(produit);
              setShowUpdateModal(true);
            }}
            onDelete={(produit) => {
              setSelectedProduit(produit);
              setShowModal(true);
            }}
            loading={loading}
            error={error}
            emptyMessage="Aucun produit disponible."
          />
        </div>

        {/* Mobile */}
        <div className="block md:hidden">
          {filteredProduits.map((produit) => (
            <ProduitCardMobile
              key={produit.id}
              produit={produit}
              onEdit={(produit) => {
                setSelectedProduit(produit);
                setShowUpdateModal(true);
              }}
              onDelete={() => {
                setSelectedProduit(produit);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Modal Supprimer */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-100 dark:bg-gray-100 max-w-md w-full p-5 rounded shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className=" font-semibold text-center mb-3 text-2xl">
              Confirmer la suppression
            </h2>
            <p className="text-sm text-center mb-5">
              Êtes-vous sûr de vouloir supprimer cette produit ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center px-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
              aria-label="Fermer"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-black">
              Ajoute un produit
            </h2>

            <form onSubmit={handleCreateInsertion} className="space-y-5">
              {/* Sélection du produit dans une Card */}
              <div>
                <CardHeader>
                  <CardTitle>Produit</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={produitId}
                    onValueChange={(value) => setProduitId(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Sélectionner un produit --" />
                    </SelectTrigger>
                    <SelectContent>
                      {produits.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.Produit_nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </div>

              {/* Champ quantité */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  required
                  className="w-full border px-4 py-2 rounded-md "
                  placeholder="Quantité"
                />
              </div>

              {/* Lien vers "Nouveau produit" */}
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowAddProduitModal(true);
                }}
                className="text-blue-600 cursor-pointer hover:text-blue-800 font-semibold flex items-center gap-1 text-sm"
              >
                <span className="text-xl">＋</span> Nouveau produit
              </button>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-red-400 hover:bg-red-600 cursor-pointer text-gray-800 rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <UpdateProduitModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        produit={selectedProduit}
        onUpdate={fetchProduits}
      />

      {showAddProduitModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center px-4"
          onClick={() => setShowAddProduitModal(false)}
        >
          <div
            className="bg-gray-100 dark:bg-gray-100 w-full max-w-lg rounded-xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setShowAddProduitModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-black">
              Ajoute un nouveau produit
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCreateProduit(e); // ✅ ici on passe l'event
                setShowAddProduitModal(false);
              }}
            >
              <div>
                <label className="block text-sm font-semibold mb-1">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full  px-4 py-2 rounded-md border-2  dark:text-black"
                  placeholder="Nom du produit"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => Setreference(e.target.value)}
                  required
                  className="w-full  px-4 py-2  rounded-md border-2  dark:text-black"
                  placeholder="Reference du produit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full  px-4 py-2  rounded-md border-2  dark:text-black"
                  placeholder="Décrivez brièvement le produit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Prix</label>
                <input
                  type="number"
                  step="0.01"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  required
                  className="w-full  px-4 py-2  rounded-md border-2  dark:text-black"
                  placeholder="Ex: 25000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Stock (optionnel)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full  px-4 py-2  rounded-md border-2  dark:text-black"
                  placeholder="Quantité disponible"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Photo (optionnel)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setPhoto(e.target.files[0]);
                    }
                  }}
                  className="w-full  px-4 py-2  rounded-md border-2  dark:text-black"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduitModal(false)}
                  className="px-4 py-2 bg-red-400 text-gray-800 rounded-md hover:bg-red-600 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
