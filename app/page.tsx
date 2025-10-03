/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import dynamic from "next/dynamic";
import ClientFideleBarChart from "../components/ClientFideleBarChart";
import ResponsableStatsBarChart from "../components/ResponsableStatsBarChart";
import ProduitEntreeSortieBarChart from "../components/ProduitEntreeSortieBarChart";
import GlobalStatsBarChart from "../components/GlobalStatsBarChart";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import LandingPage from "../components/LandingPage"; // ta page de destination
import LoadingSpinner from "../components/LoadingSpinner"; // ton spinner
import PieChartComponent from "../components/PieChartComponent";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [responsable, setResponsable] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // <-- loading global

  const [produitsPlusVendus, setProduitsPlusVendus] = useState<any[]>([]);
  const [clientsFideles, setClientsFideles] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [global, setGlobal] = useState<any[]>([]);
  const [entreeSortieData, setEntreeSortieData] = useState<any[]>([]);

  const colors = ["#f59e0b", "#8b5cf6", "#06b6d4", "#10b981", "#ef4444"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      setRole(decoded.role);
      setResponsable({
        id: Number(decoded.sub),
        Responsable_email: decoded.email,
        Responsable_nom: decoded.nom,
        Responsable_photo: decoded.photo,
        Responsable_role: decoded.role,
      });
      localStorage.setItem("Responsable_role", decoded.role);
    } catch (err) {
      console.error("Erreur décodage token JWT :", err);
      setRole(null);
      setResponsable(null);
    }
  }, []);

  useEffect(() => {
    if (!role) return;

    async function fetchAllData() {
      setLoading(true); // start loading
      try {
        // Statistiques
        const [
          clientsRes,
          responsablesRes,
          achatsRes,
          produitsRes,
          clientsFidelesRes,
          statsRespRes,
          globalRes,
          entreeSortieRes,
        ] = await Promise.all([
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/client/total?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/paiement/affaire?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/achats/sortie?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/achats/produit/vendu?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/achats/client?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/achats/statique?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/achats/global?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/achats/sorti?ts=${Date.now()}`,
            { cache: "no-store" }
          ),
        ]);

        const clientsData = await clientsRes.json();
        const responsablesData = await responsablesRes.json();
        const achatsData = await achatsRes.json();
        const produitsData = await produitsRes.json();
        const clientsFidelesData = await clientsFidelesRes.json();
        const statsRespData = await statsRespRes.json();
        const globalData = await globalRes.json();
        const entreeSortie = await entreeSortieRes.json();

        // Set stats selon rôle
        if (role === "vendeur") {
          setStats([
            {
              title: "Clients",
              value: clientsData.total_clients?.toString() ?? "0",
              icon: "👥",
              href: "/client",
            },
            {
              title: "Produit restant",
              value: achatsData.total_restant?.toString() ?? "0",
              icon: "📦",
              href: "/insertproduit",
            },
            {
              title: "Produit Sortie",
              value: achatsData.total_sortie?.toString() ?? "0",
              icon: "📉",
            },
          ]);
        } else if (role === "admin") {
          setStats([
            {
              title: "Chiffre d'affaire",
              value: responsablesData.chiffre_affaires?.toString() ?? "0",
              icon: "💰",
            },
            {
              title: "Clients",
              value: clientsData.total_clients?.toString() ?? "0",
              icon: "👥",
              href: "/client",
            },
            {
              title: "Produit restant",
              value: achatsData.total_restant?.toString() ?? "0",
              icon: "📦",
              href: "/insertproduit",
            },
            {
              title: "Produit Sortie",
              value: achatsData.total_sortie?.toString() ?? "0",
              icon: "📉",
            },
            {
              title: "Montant en attente",
              value: responsablesData.montant_restant_du?.toString() ?? "0",
              icon: "💰",
            },
          ]);
        }

        // Produits plus vendus
        if (Array.isArray(produitsData)) {
          setProduitsPlusVendus(
            produitsData.map((item: any, index: number) => ({
              name: item.produit_nom,
              value: item.quantite_vendue,
              color: colors[index % colors.length],
            }))
          );
        }

        setClientsFideles(clientsFidelesData || []);
        setData(statsRespData || []);
        setGlobal(globalData.global_par_mois || []);
        setEntreeSortieData(Array.isArray(entreeSortie) ? entreeSortie : []);
      } catch (error) {
        console.error("Erreur chargement Dashboard :", error);
      } finally {
        setLoading(false); // stop loading
      }
    }

    fetchAllData();
  }, [role]);

  if (!role) {
    return <LandingPage />;
  }
  if (role === "client") {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-400/30 to-blue-600/90">
        <LoadingSpinner />
      </div>
    );
  }

  const gridColsClass =
    role === "vendeur"
      ? "grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-red-400/30 to-blue-600/90 rounded-lg max-w-screen-xl mx-auto">
      <div className={`grid gap-4 ${gridColsClass}`}>
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Statistiques Produits</h2>

        <ProduitEntreeSortieBarChart data={entreeSortieData} />
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Produits Plus Vendus</h2>
        <PieChartComponent
          data={
            produitsPlusVendus.length
              ? produitsPlusVendus
              : [{ name: "Aucun produit", value: 1, color: "#ccc" }]
          }
        />
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Clients Fidèles</h2>
        <ClientFideleBarChart data={clientsFideles} />
      </section>

      {role === "admin" && (
        <>
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">Évolution des Ventes</h2>
            <GlobalStatsBarChart data={global} />
          </section>

          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Évolution des Ventes par Responsable
            </h2>
            <ResponsableStatsBarChart data={data} />
          </section>
        </>
      )}
    </div>
  );
}
