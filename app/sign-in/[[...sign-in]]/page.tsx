/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "", // Email Responsable ou Nom Client
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Déterminer si c'est Responsable (email) ou Client (nom)
      const isEmail = formData.email.includes("@");

      const url = isEmail
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/connexion`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/connexion`;

      const body = isEmail
        ? { Responsable_email: formData.email, password: formData.password }
        : { Client_nom: formData.email, password: formData.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Identifiants invalides");
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError("Impossible de récupérer les informations de l'utilisateur");
        setIsLoading(false);
        return;
      }

      // Stockage token
      localStorage.setItem("token", data.token);

      if (!isEmail) {
        // === Client ===
        localStorage.setItem("Client_role", data.user.Client_role || "client");
        localStorage.setItem("clientId", data.user.id.toString());
        localStorage.setItem("Client_nom", data.user.Client_nom || "");
        localStorage.setItem("Client_prenom", data.user.Client_prenom || "");

        router.push("/"); // redirection client
      } else {
        // === Responsable ===
        localStorage.setItem(
          "Responsable_role",
          data.user.Responsable_role || "responsable"
        );
        localStorage.setItem("responsableId", data.user.id.toString());
        localStorage.setItem(
          "Responsable_nom",
          data.user.Responsable_nom || ""
        );
        localStorage.setItem(
          "Responsable_prenom",
          data.user.Responsable_prenom || ""
        );

        router.push("/"); // redirection Responsable
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-400/40 to-blue-600/90 p-4">
      <div className="flex flex-col md:flex-row w-200 max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image à gauche */}
        <div className="relative w-full md:w-[50%] h-64 md:h-auto flex items-center justify-center overflow-hidden">
          <img
            src="/images.jpeg"
            alt="fond"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/70 to-blue-600/70" />
          <div className="relative z-10 flex flex-col items-center justify-center text-white px-4 text-center">
            <img src="/logo.jpeg" alt="Logo" className="w-30 h-30 mb-2" />
            <h1 className="text-4xl lg:text-5xl font-bold">AUF-SARL</h1>
          </div>
        </div>

        {/* Formulaire à droite */}
        <div className="w-full md:w-[50%] p-4 lg:p-6">
          <h2 className="text-2xl lg:text-2xl font-bold text-blue-600 mb-2 text-center">
            CONNEXION
          </h2>
          <h6 className="text-center mb-2 text-gray-600 font-medium">
            Accédez à votre compte
          </h6>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600 text-center">{error}</p>}

            {/* Email ou Nom */}
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email (Responsable) ou Nom (Client)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <EnvelopeIcon className="h-5 w-5" />
                </span>
                <input
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre email ou nom"
                  className="w-full border pl-10 pr-3 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-1 font-medium">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <LockClosedIcon className="h-5 w-5" />
                </span>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe"
                  className="w-full border pl-10 pr-3 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Liens */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">
              Vous n’avez pas de compte ?{" "}
              <Link
                href="/sign-up"
                className="text-blue-600 hover:underline font-medium"
              >
                Créer un compte
              </Link>
            </p>
            <p>
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
