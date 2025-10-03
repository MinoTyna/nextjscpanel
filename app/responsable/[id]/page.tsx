/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/LoadingSpinner";

type Responsable = {
  id: number;
  Responsable_email: string;
  Responsable_nom: string | null;
  Responsable_prenom: string | null;
  Responsable_adresse: string | null;
  Responsable_telephone: string | null;
  Responsable_role: string;
  Responsable_photo: string | null;
  date_creation: string;
};

export default function ProfilResponsable() {
  const [responsable, setResponsable] = useState<Responsable | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    Responsable_prenom: "",
    Responsable_nom: "",
    Responsable_email: "",
    Responsable_telephone: "",
    Responsable_adresse: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/get/${id}`
        );
        const data = await res.json();
        setResponsable(data);
        setFormData({
          Responsable_prenom: data.Responsable_prenom ?? "",
          Responsable_nom: data.Responsable_nom ?? "",
          Responsable_email: data.Responsable_email,
          Responsable_telephone: data.Responsable_telephone ?? "",
          Responsable_adresse: data.Responsable_adresse ?? "",
        });
      } catch (err) {
        toast.error("Erreur lors du chargement du responsable");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!responsable) return;

    setLoading(true);
    setError(null);
    toast.loading("Mise à jour en cours...", { id: "update" });

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        form.append(key, value ?? "")
      );
      if (imageFile) {
        form.append("Responsable_photo", imageFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/update/${responsable.id}`,
        {
          method: "PUT",
          body: form,
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      const updated = await res.json();
      setResponsable(updated.responsable);
      setImagePreview(null);
      setImageFile(null);
      toast.success("Responsable mis à jour avec succès", { id: "update" });
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
      toast.error("Erreur: " + err.message, { id: "update" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-400/30 to-blue-600/90">
        <LoadingSpinner />
      </div>
    );
  if (!responsable)
    return (
      <p className="text-center mt-10 text-red-500">Responsable introuvable</p>
    );

  return (
    <div className="bg-gradient-to-br from-red-400/30 to-blue-600/90 min-h-screen py-10">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            {editMode ? (
              <div className="flex items-center gap-4">
                <label className="text-sm text-blue-600">🖼️ Photo</label>

                <label
                  htmlFor="fileInput"
                  className="w-20 h-20 rounded-full overflow-hidden cursor-pointer block border border-gray-300"
                  title="Cliquez pour changer la photo"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-20 h-20 object-cover"
                    />
                  ) : responsable.Responsable_photo ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${
                        responsable.Responsable_photo
                      }`}
                      alt="Photo du responsable"
                      className="w-20 h-20 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-500">
                      Avatar
                    </div>
                  )}
                </label>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </div>
            ) : responsable.Responsable_photo ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${responsable.Responsable_photo}`}
                alt="Photo du responsable"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <p className="text-gray-500">Aucune photo</p>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {formData.Responsable_prenom} {formData.Responsable_nom}
            </h1>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block">
              🎓 {responsable.Responsable_role || "Responsable"}
            </span>
          </div>
          <button
            onClick={() => {
              if (editMode) {
                setFormData({
                  Responsable_prenom: responsable.Responsable_prenom ?? "",
                  Responsable_nom: responsable.Responsable_nom ?? "",
                  Responsable_email: responsable.Responsable_email,
                  Responsable_telephone:
                    responsable.Responsable_telephone ?? "",
                  Responsable_adresse: responsable.Responsable_adresse ?? "",
                });
                setError(null);
                setEditMode(false);
                setImagePreview(null);
                setImageFile(null);
              } else {
                setEditMode(true);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded cursor-pointer"
          >
            {editMode ? "X" : "✏️ "}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="text-sm text-blue-600 font-medium">
              👤 Prénom
            </label>
            {editMode ? (
              <input
                type="text"
                name="Responsable_prenom"
                value={formData.Responsable_prenom}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Responsable_prenom || "Non renseigné"}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-blue-600 font-medium">🧾 Nom</label>
            {editMode ? (
              <input
                type="text"
                name="Responsable_nom"
                value={formData.Responsable_nom}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Responsable_nom || "Non renseigné"}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-blue-600 font-medium">
              📧 Email
            </label>
            <div className="bg-gray-100 p-3 rounded">
              {formData.Responsable_email}
            </div>
          </div>

          <div>
            <label className="text-sm text-blue-600 font-medium">
              📞 Téléphone
            </label>
            {editMode ? (
              <input
                type="text"
                name="Responsable_telephone"
                value={formData.Responsable_telephone}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Responsable_telephone || "Non renseigné"}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-blue-600 font-medium">
              📍 Adresse
            </label>
            {editMode ? (
              <textarea
                name="Responsable_adresse"
                value={formData.Responsable_adresse}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                rows={3}
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Responsable_adresse || "Non renseigné"}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500 font-medium">
              🕓 Date de création
            </label>
            <div className="bg-gray-100 p-3 rounded">
              {new Date(responsable.date_creation).toLocaleString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {editMode && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>

            <button
              onClick={() => {
                setEditMode(false);
                setError(null);
                setImagePreview(null);
                setImageFile(null);
                setFormData({
                  Responsable_prenom: responsable.Responsable_prenom ?? "",
                  Responsable_nom: responsable.Responsable_nom ?? "",
                  Responsable_email: responsable.Responsable_email,
                  Responsable_telephone:
                    responsable.Responsable_telephone ?? "",
                  Responsable_adresse: responsable.Responsable_adresse ?? "",
                });
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        )}

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}
