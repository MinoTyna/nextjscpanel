/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Produit = {
  id: number;
  Produit_nom: string;
  Produit_reference: string;
  Produit_description?: string;
  Produit_prix?: number;
  Produit_quantite?: number;
  Produit_photo?: string;
};

type UpdateProduitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  produit: Produit | null;
  onUpdate: () => void;
};

export default function UpdateProduitModal({
  isOpen,
  onClose,
  produit,
  onUpdate,
}: UpdateProduitModalProps) {
  const [form, setForm] = useState({
    nom: "",
    reference: "",
    description: "",
    prix: "",
    quantite: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (produit) {
      setForm({
        nom: produit.Produit_nom || "",
        reference: produit.Produit_reference || "",
        description: produit.Produit_description || "",
        prix: produit.Produit_prix?.toString() || "",
        quantite: produit.Produit_quantite?.toString() || "",
      });
      setPhotoFile(null);
    }
  }, [produit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produit) return;

    const formData = new FormData();
    formData.append("Produit_nom", form.nom);
    formData.append("Produit_reference", form.reference);
    formData.append("Produit_description", form.description);
    formData.append("Produit_prix", form.prix);
    formData.append("Produit_quantite", form.quantite);
    if (photoFile) formData.append("Produit_photo", photoFile);

    try {
      setLoading(true);
      setSuccess(false);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/update/${produit.id}`,
        { method: "PUT", body: formData }
      );

      if (res.ok) {
        setSuccess(true);
        toast.success("Produit mis à jour !"); // notification succès

        setTimeout(() => {
          setLoading(false);
          setSuccess(false);
          onUpdate();
          onClose();
        }, 2000); // check vert visible 2 secondes
      } else {
        setLoading(false);
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la mise à jour"); // notification erreur
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Erreur réseau");
    }
  };

  if (!isOpen || !produit) return null;

  return (
    <div
      className="fixed  inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {" "}
      {/* Spinner / Check overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10">
          {!success ? (
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
      )}
      <div
        className="bg-white dark:bg-gray-100 w-full  max-w-lg p-4 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold text-center">
          Modifier le produit
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">Nom</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Reference</label>
            <input
              type="text"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded bg-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded bg-gray-200"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-semibold">Prix</label>
              <input
                type="number"
                step="0.01"
                name="prix"
                value={form.prix}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded bg-gray-200"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-semibold bg-gray-200">
                Quantité
              </label>
              <input
                type="number"
                name="quantite"
                value={form.quantite}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded bg-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full bg-gray-200"
            />
            {produit.Produit_photo && !photoFile && (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${produit.Produit_photo}`}
                alt="Aperçu"
                className="mt-2 h-12 object-cover rounded "
              />
            )}
          </div>

          <div className="flex justify-end gap-3 ">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
