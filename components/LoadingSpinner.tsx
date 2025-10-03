"use client";
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-300">
      {/* Cercle animé */}
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_#9333ea]"></div>

      {/* Texte */}
      <p className="text-base">Chargement...</p>
    </div>
  );
}
