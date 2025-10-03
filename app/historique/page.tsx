"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FacturePDFDownloader,
  Facture,
} from "../../components/FacturePDFDownloader";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function FiltrageParDate() {
  const [date, setDate] = useState<string>(""); // Format YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [choix, setChoix] = useState("historique");
  const [search, setSearch] = useState(""); // ajout recherche
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchFactures = async (selectedDate = "") => {
    setLoading(true);
    try {
      let query = "";
      if (selectedDate) {
        const [year, month] = selectedDate.split("-");
        query = `?mois=${month}&annee=${year}`;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/paiement/facture${query}`
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des données");

      const data = await res.json();
      setFactures(data);
    } catch (error) {
      console.error("Erreur lors du chargement des factures", error);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial : mois courant
  useEffect(() => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    setDate(formatted);
    setSelectedMonth(now);
    fetchFactures(formatted);
  }, []);

  useEffect(() => {
    if (date) fetchFactures(date);
  }, [date]);

  const handleDateChange = (date: Date | null) => {
    setSelectedMonth(date);

    if (date) {
      const formatted = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      setDate(formatted);
    } else {
      setDate("");
    }
  };

  const handleReset = () => {
    setDate("");
    setSelectedMonth(null);
    fetchFactures(""); // Recharge sans filtre
  };

  const handleClick = (type: string) => {
    setChoix(type);
    router.push(`/${type}`);
  };

  // Filtrage sécurisé
  const filteredFactures = factures.filter((facture) => {
    const numero = facture.numero_facture?.toLowerCase() || "";
    const client = facture.client?.toLowerCase() || "";
    const prenom = facture.prenom?.toLowerCase() || "";
    const s = search.toLowerCase();
    return numero.includes(s) || client.includes(s) || prenom.includes(s);
  });

  return (
    <div className="max-w-full">
      {/* Boutons navigation */}
      <div className="flex gap-2 mb-4 cursor-pointer">
        <button
          className={`flex-1 py-2 rounded cursor-pointer ${
            choix === "facture"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => handleClick("facture")}
        >
          Liste de factures
        </button>
        <button
          className={`flex-1 py-2 rounded cursor-pointer ${
            choix === "historique"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => handleClick("historique")}
        >
          Historique paiement
        </button>
      </div>

      {/* Sélecteur + bouton reset */}
      <div className="mb-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          📅 Mois de recherche :
        </label>

        <div className="flex items-center gap-2">
          <DatePicker
            selected={selectedMonth}
            onChange={handleDateChange}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Sélectionner un mois"
            className="border px-3 py-2 rounded-md bg-gray-50 cursor-pointer text-sm w-[180px]"
          />
          <button
            onClick={handleReset}
            className="px-2 py-2 text-sm rounded bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-800"
            title="Réinitialiser"
          >
            🔁
          </button>
        </div>

        <input
          type="text"
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-1 py-2 rounded-md bg-gray-50 text-sm w-[180px]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[150px] rounded-lg shadow">
          <LoadingSpinner />
        </div>
      ) : filteredFactures.length === 0 ? (
        <p>Aucune facture trouvée.</p>
      ) : (
        <div className="shadow rounded-lg border max-h-[420px] overflow-y-auto">
          {/* scroll vertical uniquement, pas horizontal */}
          <table className="min-w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="border px-2 py-1 text-center">Client</th>
                <th className="border px-2 py-1 text-center">Montant</th>
                <th className="border px-2 py-1 text-center">Date</th>
                <th className="border px-2 py-1 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFactures.map((facture, index) => (
                <tr key={index} className="bg-white hover:bg-gray-100">
                  <td className="border px-2 py-1 text-center">
                    {facture.client || "N/A"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {facture.paiement?.Paiement_montant
                      ? `${parseInt(
                          facture.paiement.Paiement_montant.toString()
                        )} Ar`
                      : "N/A"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {facture.date_creation
                      ? new Date(facture.date_creation).toLocaleDateString(
                          "fr-FR"
                        )
                      : "N/A"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <FacturePDFDownloader
                      facture={facture}
                      factureHistorique={factures}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
