/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpClient() {
  const router = useRouter();
  const [step, setStep] = useState(1); // ✅ 3 étapes
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    email: "",
    telephone: "",
    adresse: "",
    password: "",
    latitude: "",
    longitude: "",
    photo: null as File | null,
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, photo: e.target.files[0] });
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm({
            ...form,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });

          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.address) {
                const { road, city, state } = data.address;
                const shortAddress = [road, city, state]
                  .filter(Boolean)
                  .join(", ");
                setForm((prev) => ({ ...prev, adresse: shortAddress }));
              }
            });
        },
        (err) => alert("Erreur de géolocalisation : " + err.message)
      );
    } else {
      alert("Géolocalisation non supportée par votre navigateur");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("Client_nom", form.nom);
      formData.append("Client_prenom", form.prenom);
      formData.append("Client_cin", form.cin);
      formData.append("Client_email", form.email);
      formData.append("Client_telephone", form.telephone);
      formData.append("Client_adresse", form.adresse);
      formData.append("password", form.password);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      if (form.photo) formData.append("photo", form.photo);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/client/post`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("Client_role", data.user.Client_role);
      localStorage.setItem("clientId", data.user.id);

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-400/40 to-blue-600/90 p-4">
      <div className="flex flex-col md:flex-row w-200 max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image gauche */}
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

        {/* Formulaire multi-step */}
        <div className="w-full md:w-[50%] p-4 lg:p-6 h-100">
          <h2 className="text-2xl font-bold text-blue-600 text-center">
            CRÉER UN COMPTE
          </h2>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Étape 1 */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="nom"
                    placeholder="Nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                  <input
                    type="text"
                    name="prenom"
                    placeholder="Prénom"
                    value={form.prenom}
                    onChange={handleChange}
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />

                  <input
                    type="text"
                    name="telephone"
                    placeholder="Téléphone"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                </div>
              )}

              {/* Étape 2 */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="cin"
                    placeholder="CIN"
                    value={form.cin}
                    onChange={handleChange}
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                </div>
              )}

              {/* Étape 3 */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="adresse"
                    placeholder="Adresse"
                    value={form.adresse}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 col-span-2"
                  >
                    📍 Localiser mon adresse
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                </div>
              )}

              {/* Navigation étapes */}
              <div className="flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-2 py-2 cursor-pointer text-white rounded hover:bg-gray-500"
                  >
                    ⬅
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="ml-auto px-2 py-2 cursor-pointer  text-white rounded hover:bg-blue-700"
                  >
                    ➡
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </button>
                )}
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Vous avez déjà un compte ?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
