"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  icon: string;
  href?: string;
  sub?: string;
  warning?: boolean;
  currency?: string;
  hideValue?: boolean; // ✅ option pour masquer par défaut
};

export default function StatCard({
  title,
  value,
  icon,
  href = "#",
  sub,
  warning = false,
  currency = "Ar",
  hideValue = true,
}: StatCardProps) {
  const [showValue, setShowValue] = useState(!hideValue);

  const numericValue = Number(value) || 0;

  const isMoney =
    title === "Chiffre d'affaire" || title === "Montant en attente";

  const formattedValue = isMoney
    ? `${formatValue(numericValue)} ${currency}`
    : value;

  // ✅ Si masqué, on remplace par des points
  const displayValue = showValue ? formattedValue : "•••••••";

  return (
    <Link
      href={href}
      className={`relative rounded-xl p-4 shadow transition duration-200 min-h-[100px] flex items-center justify-center text-center
        ${
          warning
            ? "bg-yellow-100 hover:bg-yellow-200"
            : "bg-gray-100 hover:bg-blue-100"
        }`}
      title={
        isMoney ? `${numericValue.toLocaleString("fr-MG")} ${currency}` : value
      }
    >
      {/* Icon en haut à droite */}
      <div className="absolute top-2 right-2 text-2xl opacity-50">{icon}</div>

      {/* Contenu */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg font-bold">{displayValue}</span>
          {/* Bouton show/hide */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault(); // empêche la redirection du Link
              setShowValue(!showValue);
            }}
            className="text-gray-500 hover:text-gray-800"
          >
            {showValue ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {sub && (
          <div
            className={`text-xs ${
              sub.startsWith("+")
                ? "text-green-600"
                : warning
                ? "text-yellow-700"
                : "text-red-600"
            }`}
          >
            {sub}
          </div>
        )}
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </Link>
  );
}

function formatValue(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}
