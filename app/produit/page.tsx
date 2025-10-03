/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layouts";
import Tableau from "../../components/Tableaux";
import ProduitCardMobile from "../../components/ProduitCardMobile";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

type Produit = {
  id: number;
  nom: string;
  description?: string;
  prix?: string;
  stock?: number;
  photo?: string;
};

export default function ProduitPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  // Form inputs
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);

  // Utilisateur ID Django récupéré

  // Charger les produits
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/get`)
      .then((res) => res.json())
      .then((data) => setProduits(data))
      .catch((err) => console.error("Erreur produits :", err));
  }, []);

  // Création produit
  const handleCreateProduit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prix", prix);
    if (description) formData.append("description", description);
    if (stock) formData.append("stock", stock);
    if (photo) formData.append("photo", photo);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/post`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        setProduits((prev) => [...prev, data]);
        toast.success("Produit ajouté !");
        setShowAddModal(false);
        setNom("");
        setPrix("");
        setDescription("");
        setStock("");
        setPhoto(null);
      } else {
        const error = await res.json();
        toast.error(error.detail || "Erreur inconnue");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau !");
    }
  };

  // Suppression produit
  const handleConfirmDelete = () => {
    if (!selectedProduit) return;

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/delete/${selectedProduit.id}`,
      {
        method: "DELETE",
      }
    )
      .then((res) => {
        if (res.ok) {
          setProduits((prev) =>
            prev.filter((p) => p.id !== selectedProduit.id)
          );
          toast.success("Produit supprimé !");
        } else {
          toast.error("Erreur lors de la suppression.");
        }
        setShowModal(false);
        setSelectedProduit(null);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erreur réseau !");
        setShowModal(false);
      });
  };

  const filteredProduits = produits.filter((produit) =>
    produit.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lg:mt-[-20px]">
      <div className="h-full overflow-y-auto p-4 md:p-2 ">
        <h1 className="md:text-2xl font-bold text-center mb-4">
          Liste de Produits
        </h1>

        {/* Recherche + Ajouter */}
        <div className="flex justify-between items-center gap-2 w-full mb-4">
          <div className="flex items-center gap-2 w-full max-w-[300px]">
            <Search size={16} className="text-gray-600" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none border-b border-gray-300 dark:border-gray-600 px-2 py-1 text-sm w-full text-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="relative group inline-block">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
            >
              ➕
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Ajouter
            </span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <Tableau
            headers={["Image", "Nom", "Description", "Prix", "Stock"]}
            colonnesAffichees={["photo", "nom", "description", "prix", "stock"]}
            rows={filteredProduits}
            onEdit={(produit: Produit) => console.log("Modifier:", produit.id)}
            onDelete={(produit: Produit) => {
              setSelectedProduit(produit);
              setShowModal(true);
            }}
          />
        </div>

        {/* Mobile */}
        <div className="block md:hidden">
          {filteredProduits.map((produit) => (
            <ProduitCardMobile
              key={produit.id}
              produit={produit}
              onEdit={() => console.log("Modifier:", produit.id)}
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
            className="bg-white dark:bg-gray-900 max-w-md w-full p-5 rounded shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-center mb-3">
              Confirmer la suppression
            </h2>
            <p className="text-sm text-center mb-5">
              Êtes-vous sûr de vouloir supprimer ce produit ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
          className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Ajouter un nouveau produit
            </h2>

            <form onSubmit={handleCreateProduit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Prix</label>
                <input
                  type="number"
                  step="0.01"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  required
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Stock (optionnel)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
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
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
