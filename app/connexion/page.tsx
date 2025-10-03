"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignInClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    nom: "",
    prenom: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = "/client/connexion";
      const body: any = { password: formData.password };

      if (formData.email) {
        body.Client_email = formData.email.trim();
      } else if (formData.nom) {
        body.Client_nom = formData.nom.trim();
        if (formData.prenom) body.Client_prenom = formData.prenom.trim();
      } else {
        toast.error("Veuillez saisir l'email ou le nom");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Identifiants invalides");
        setIsLoading(false);
        return;
      }

      // Stockage token et infos utilisateur
      localStorage.setItem("token", data.token);
      localStorage.setItem("Client_role", data.user.Client_role);
      localStorage.setItem("clientId", data.user.id.toString());
      localStorage.setItem("Client_nom", data.user.Client_nom);
      localStorage.setItem("Client_prenom", data.user.Client_prenom || "");

      toast.success("Connexion réussie 🎉");
      router.push("/");
    } catch (err) {
      console.error("Erreur attrapée:", err);
      toast.error("Une erreur est survenue.");
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
          <form onSubmit={handleSubmit}>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email (optionnel)"
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom (si pas d'email)"
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Prénom (optionnel)"
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full border p-2 mb-4 rounded"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
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
