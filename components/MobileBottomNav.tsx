"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  sub: string;
  email: string;
  nom: string;
  photo: string;
  role: string;
};

const MobileBottomNav = () => {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<
    { path: string; icon: string; label: string }[]
  >([]);

  // 1) Récupérer le rôle depuis localStorage ou token
  useEffect(() => {
    const cached = localStorage.getItem("Responsable_role");
    if (cached) {
      setRole(cached);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.role) {
        setRole(decoded.role);
        localStorage.setItem("Responsable_role", decoded.role);
      }
    } catch (err) {
      console.error("Erreur décodage token :", err);
    }
  }, []);

  // 2) Mettre à jour le menu selon le rôle
  useEffect(() => {
    if (role === "vendeur") {
      setNavItems([
        { path: "/client", icon: "👥", label: "Client" },
        { path: "/achatPro", icon: "💳", label: "Paiement" },
        { path: "/achat", icon: "🛒", label: "Achat" },
        { path: "/facture", icon: "🧾", label: "Facture" },
      ]);
    } else if (role === "admin") {
      setNavItems([
        { path: "/insertproduit", icon: "📦", label: "Produit" },
        { path: "/client", icon: "👥", label: "Client" },
        { path: "/achat", icon: "🛒", label: "Achat" },
        { path: "/achatPro", icon: "💳", label: "Paiement" },
        { path: "/facture", icon: "🧾", label: "Facture" },
      ]);
    }
  }, [role]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-gradient-to-br from-red-400/60 to-blue-600/90 text-white shadow lg:hidden border-t border-blue-800">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center px-3 py-2 text-xs rounded-lg transition-colors ${
              isActive
                ? "bg-white/20 text-white shadow"
                : "text-white hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="h-5 w-5">{item.icon}</div>
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
