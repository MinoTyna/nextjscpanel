/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Header } from "../../../components/header";

type Client = {
  id: number;
  Client_email: string | null;
  Client_nom: string | null;
  Client_prenom: string | null;
  Client_adresse: string | null;
  Client_telephone: string | null;
  Client_photo: string | null;
  Client_role: string;
  date_creation: string;
};

export default function ProfilClient() {
  const [client, setClient] = useState<Client | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    Client_prenom: "",
    Client_nom: "",
    Client_email: "",
    Client_telephone: "",
    Client_adresse: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const id = params?.id as string;

  // 🔹 Fonction pour récupérer le client
  const fetchClient = async () => {
    try {
      setFetching(true);
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/client/get/${id}?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setClient(data);

      // Mettre à jour formData immédiatement
      setFormData({
        Client_prenom: data.Client_prenom ?? "",
        Client_nom: data.Client_nom ?? "",
        Client_email: data.Client_email ?? "",
        Client_telephone: data.Client_telephone ?? "",
        Client_adresse: data.Client_adresse ?? "",
      });
    } catch {
      toast.error("Erreur lors du chargement du client");
    } finally {
      setFetching(false);
    }
  };

  // 🔹 Charger le client au montage
  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!client) return;

    const fd = new FormData();
    fd.append("Client_nom", formData.Client_nom);
    fd.append("Client_prenom", formData.Client_prenom);
    fd.append("Client_email", formData.Client_email);
    fd.append("Client_telephone", formData.Client_telephone);
    fd.append("Client_adresse", formData.Client_adresse);
    if (imageFile) fd.append("Client_photo", imageFile);

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/update/${client.id}`,
        { method: "PUT", body: fd }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      toast.success("Client mis à jour avec succès !");

      // 🔹 Recharger le client pour mettre à jour l'affichage
      // await fetchClient();

      setEditMode(false);
      setImagePreview(null);
      setImageFile(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur réseau");
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

  if (!client)
    return <p className="text-center mt-10 text-red-500">Client introuvable</p>;

  return (
    <div className="bg-gradient-to-br w-full from-red-400/30 to-blue-600/90 min-h-screen py-10">
      <Header />
      <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto mt-20">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          {/* PHOTO */}
          <div>
            {editMode ? (
              <div className="flex items-center gap-4">
                <label className="text-sm text-blue-600">🖼️ Photo</label>
                <label
                  htmlFor="fileInput"
                  className="w-20 h-20 rounded-full overflow-hidden cursor-pointer block border border-gray-300"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-20 h-20 object-cover"
                    />
                  ) : client.Client_photo ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${client.Client_photo}`}
                      alt="Photo du client"
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
            ) : client.Client_photo ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${client.Client_photo}`}
                alt="Photo du client"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <p className="text-gray-500">Aucune photo</p>
            )}
          </div>

          {/* INFO */}
          <div>
            <h1 className="text-2xl font-bold">
              {formData.Client_prenom} {formData.Client_nom}
            </h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block">
              👤 {client.Client_role || "Client"}
            </span>
          </div>

          {/* EDIT BTN */}
          <button
            onClick={() => {
              if (editMode) {
                // Annulation
                setFormData({
                  Client_prenom: client.Client_prenom ?? "",
                  Client_nom: client.Client_nom ?? "",
                  Client_email: client.Client_email ?? "",
                  Client_telephone: client.Client_telephone ?? "",
                  Client_adresse: client.Client_adresse ?? "",
                });
                setError(null);
                setEditMode(false);
                setImagePreview(null);
                setImageFile(null);
              } else setEditMode(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded cursor-pointer"
          >
            {editMode ? "X" : "✏️"}
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Prénom */}
          <div>
            <label className="text-sm text-blue-600 font-medium">
              👤 Prénom
            </label>
            {editMode ? (
              <input
                type="text"
                name="Client_prenom"
                value={formData.Client_prenom}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Client_prenom || "Non renseigné"}
              </div>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="text-sm text-blue-600 font-medium">🧾 Nom</label>
            {editMode ? (
              <input
                type="text"
                name="Client_nom"
                value={formData.Client_nom}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Client_nom || "Non renseigné"}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-blue-600 font-medium">
              📧 Email
            </label>
            <div className="bg-gray-100 p-3 rounded">
              {formData.Client_email || "Non renseigné"}
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="text-sm text-blue-600 font-medium">
              📞 Téléphone
            </label>
            {editMode ? (
              <input
                type="text"
                name="Client_telephone"
                value={formData.Client_telephone}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Client_telephone || "Non renseigné"}
              </div>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="text-sm text-blue-600 font-medium">
              📍 Adresse
            </label>
            {editMode ? (
              <textarea
                name="Client_adresse"
                value={formData.Client_adresse}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                rows={3}
              />
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                {formData.Client_adresse || "Non renseigné"}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-gray-500 font-medium">
              🕓 Date de création
            </label>
            <div className="bg-gray-100 p-3 rounded">
              {new Date(client.date_creation).toLocaleString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
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
                  Client_prenom: client.Client_prenom ?? "",
                  Client_nom: client.Client_nom ?? "",
                  Client_email: client.Client_email ?? "",
                  Client_telephone: client.Client_telephone ?? "",
                  Client_adresse: client.Client_adresse ?? "",
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
