/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// types.ts
export interface Client {
  id: number;
  Client_nom: string;
  Client_prenom: string;
  Client_cin: string;
  Client_adresse: string;
  Client_telephone1?: string; // Rends-le optionnel si pas toujours fourni
  Client_telephone2?: string;
  Client_telephone3?: string;
  Client_telephone4?: string;
  Client_photo?: string;
  latitude?: number;
  longitude?: number;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onUpdate: () => void;
};

export default function UpdateClientModal({
  isOpen,
  onClose,
  client,
  onUpdate,
}: Props) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone1: "",
    telephone2: "",
    telephone3: "",
    telephone4: "",
    adresse: "",
    latitude: "",
    longitude: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        nom: client.Client_nom,
        prenom: client.Client_prenom,
        cin: client.Client_cin,
        telephone1: client.Client_telephone1 || "",
        telephone2: client.Client_telephone2 || "",
        telephone3: client.Client_telephone3 || "",
        telephone4: client.Client_telephone4 || "",
        adresse: client.Client_adresse,
        latitude: client.latitude?.toString() || "",
        longitude: client.longitude?.toString() || "",
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  const handleSubmit = async () => {
    if (!client) return;
    const formData = new FormData();
    formData.append("Client_nom", form.nom);
    formData.append("Client_prenom", form.prenom);
    formData.append("Client_cin", form.cin);
    formData.append("Client_telephone1", form.telephone1);
    if (form.telephone2) formData.append("Client_telephone2", form.telephone2);
    if (form.telephone3) formData.append("Client_telephone3", form.telephone3);
    if (form.telephone4) formData.append("Client_telephone4", form.telephone4);
    formData.append("Client_adresse", form.adresse);
    if (form.latitude) formData.append("latitude", form.latitude);
    if (form.longitude) formData.append("longitude", form.longitude);
    if (photoFile) formData.append("Client_photo", photoFile);

    try {
      setLoading(true);
      setSuccess(false);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/update/${client.id}`,
        { method: "PUT", body: formData }
      );

      if (response.ok) {
        setSuccess(true);
        toast.success("Client mis à jour avec succès !");
        setTimeout(() => {
          setLoading(false);
          setSuccess(false);
          onUpdate();
          onClose();
        }, 2000);
      } else {
        setLoading(false);
        const data = await response.json();
        toast.error(data.error || "Erreur lors de la mise à jour.");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Erreur réseau, veuillez réessayer.");
      console.error("Erreur lors de la requête :", error);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl relative">
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

        <h2 className="text-xl font-semibold text-center mb-4 text-black">
          Modifiez les informations du client
        </h2>

        {/* Form in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
            placeholder="Nom"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="cin"
            value={form.cin}
            onChange={handleChange}
            placeholder="CIN"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="adresse"
            value={form.adresse}
            onChange={handleChange}
            placeholder="Adresse"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="telephone1"
            value={form.telephone1}
            onChange={handleChange}
            placeholder="Téléphone 1"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="telephone2"
            value={form.telephone2}
            onChange={handleChange}
            placeholder="Téléphone 2"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="telephone3"
            value={form.telephone3}
            onChange={handleChange}
            placeholder="Téléphone 3"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="telephone4"
            value={form.telephone4}
            onChange={handleChange}
            placeholder="Téléphone 4"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
        </div>

        {/* Photo Upload */}
        <div className="mt-3">
          <input
            type="file"
            onChange={handlePhotoChange}
            className="w-full border border-gray-300 p-2 rounded bg-white text-black"
          />
          {client.Client_photo && (
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${client.Client_photo}`}
              alt="Photo actuelle"
              className="w-20 h-20 object-cover rounded border mt-2"
            />
          )}
        </div>

        {/* Latitude / Longitude */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <input
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
          <input
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            className="border border-gray-300 p-2 rounded bg-white text-black"
          />
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 cursor-pointer"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}
