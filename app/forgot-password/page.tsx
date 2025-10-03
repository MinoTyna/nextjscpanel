/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [responsableId, setResponsableId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/check-email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Email introuvable");
      }

      const data = await response.json();
      setResponsableId(data.id);
      setStep("password");
    } catch (error) {
      toast.error("Email introuvable");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsableId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/reset-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: responsableId,
            new_password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la réinitialisation");
      }

      toast.success("Mot de passe réinitialisé avec succès");
      setEmail("");
      setNewPassword("");
      setStep("email");

      // ✅ Redirection après succès
      router.push("/sign-in");
    } catch (error) {
      toast.error("Erreur lors de la réinitialisation");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row w-200 max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative w-full md:w-[50%] h-64 md:h-auto flex items-center justify-center overflow-hidden">
          {/* Image de fond */}
          <img
            src="/images.jpeg"
            alt="fond"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay en dégradé */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/70 to-blue-600/70" />

          {/* Contenu centré */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white px-4 text-center">
            <img src="/logo.jpeg" alt="Logo" className="w-20 h-20 mb-2" />
            <h1 className="text-2xl lg:text-3xl font-bold">AUF-SARL</h1>
          </div>
        </div>

        {/* Formulaire à droite */}
        <div className="w-full md:w-[50%] p-6 lg:p-8">
          <h2 className="lg:text-2xl font-bold text-gray-800 mb-6 text-center">
            MOT DE PASSE OUBLIÉ
          </h2>

          {step === "email" ? (
            <form onSubmit={handleCheckEmail}>
              <input
                type="email"
                placeholder="Votre email"
                className="w-full p-2 border rounded mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/sign-in")}
                  className="w-full   bg-red-400 cursor-pointer hover:bg-red-600 text-gray-800 p-2 rounded"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white  rounded cursor-pointer hover:bg-blue-800"
                >
                  Vérifier l'email
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <h2 className="text-lg font-semibold mb-4 text-center">
                Nouveau mot de passe
              </h2>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                className="w-full p-2 border rounded mb-4"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-2 rounded"
              >
                Réinitialiser le mot de passe
              </button>
              <button
                type="button"
                onClick={() => router.push("/sign-in")}
                className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded"
              >
                Retour
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
