"use client"; // Si tu es dans app/

import StatCard from "../../components/StatCard";
import PieChartComponent from "../../components/PieChartComponent";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Clients"
          value="2,847"
          sub="+12% ce mois"
          icon="👥"
        />
        <StatCard
          title="Total Produits"
          value="1,234"
          sub="+8% ce mois"
          icon="📦"
        />
        <StatCard
          title="Total Montant"
          value="£125,847"
          sub="+23% ce mois"
          icon="💰"
        />
        <StatCard
          title="Prix Restant"
          value="£45,230"
          sub="-5% ce mois"
          icon="📉"
        />
        <StatCard
          title="Produits Insuffisants"
          value="47"
          sub="Attention requise"
          icon="⚠️"
          warning
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Clients Fidèles</h2>
          <PieChartComponent
            data={[
              { name: "Clients Fidèles", value: 65, color: "#3b82f6" },
              { name: "Nouveaux Clients", value: 35, color: "#10b981" },
            ]}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Produits Plus Vendus</h2>
          <PieChartComponent
            data={[
              { name: "Électronique", value: 45, color: "#f59e0b" },
              { name: "Vêtements", value: 30, color: "#8b5cf6" },
              { name: "Maison", value: 25, color: "#06b6d4" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
