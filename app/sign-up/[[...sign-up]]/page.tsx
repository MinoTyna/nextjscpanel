/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
} from "react-icons/fa";

export default function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    role: "vendeur",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Responsable_nom: formData.nom,
            Responsable_prenom: formData.prenom,
            Responsable_email: formData.email,
            Responsable_telephone: formData.telephone,
            Responsable_adresse: formData.adresse,
            Responsable_role: formData.role,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("Responsable_role", data.user.Responsable_role);

      router.push("/sign-in");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-400/40 to-blue-600/90 p-2">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden p-8 space-y-6">
        <div className="text-center">
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="mx-auto w-28 h-26 mb-2 mt-[-24px]"
          />
          <h2 className="text-2xl font-bold text-blue-600">CRÉER UN COMPTE</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-gray-700 mb-1">Nom</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <FaUser className="text-gray-500 mr-2" />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Entrez votre nom"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-1">Prénom</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <FaUser className="text-gray-500 mr-2" />
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Entrez votre prénom"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-gray-700 mb-1">Email</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <FaEnvelope className="text-gray-500 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@mail.com"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-1">Téléphone</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <FaPhone className="text-gray-500 mr-2" />
                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Numéro de téléphone"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-gray-700 mb-1">Adresse</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <FaMapMarkerAlt className="text-gray-500 mr-2" />
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Adresse complète"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-1">Mot de passe</label>
              <div className="flex items-center border border-gray-300 rounded-md p-2">
                <FaLock className="text-gray-500 mr-2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe sécurisé"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Lien vers connexion */}
          <div className="text-center text-sm">
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Vous avez déjà un compte ? Se connecter
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-md transition"
          >
            {isLoading ? "Chargement..." : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}
