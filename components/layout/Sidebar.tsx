/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

type Notification = {
  message: string;
  client_id: number;
  achat_date: string;
};

type Responsable = {
  id: number;
  Responsable_email: string;
  Responsable_nom: string;
  Responsable_photo: string;
  Responsable_role: string;
};

type DecodedToken = {
  user_id: string;
  email: string;
  nom: string;
  photo: string;
  role: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const [role, setRole] = useState<string | null>(null);
  const [responsable, setResponsable] = useState<Responsable | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [nbMessages, setNbMessages] = useState(0);
  const [messages, setMessages] = useState<Notification[]>([]);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setRole(decoded.role);

      // Récupérer id user dans le token
      const userId = Number(decoded.user_id || decoded.user_id);

      // Puis fetch les infos complètes du responsable (notamment photo)
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/get/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setResponsable(data);
        })
        .catch((err) => {
          console.error("Erreur récupération responsable :", err);
        });
    } catch (err) {
      console.error("Erreur décodage JWT :", err);
    }
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      // ✅ Appel backend pour supprimer le cookie
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/responsable/logout`, {
        method: "POST",
        credentials: "include", // ✅ important pour envoyer le cookie
      });
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }

    // ✅ Nettoyage du localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("Responsable_role");

    router.push("/sign-in");
  };

  const [navItems, setNavItems] = useState<
    { path: string; icon: React.ReactNode; label: string }[]
  >([]);

  useEffect(() => {
    if (role === "vendeur") {
      setNavItems([
        { path: "/", icon: "📊", label: "Dashboard" },
        { path: "/client", icon: "👥", label: "Client" },
        { path: "/achat", icon: "🛒", label: "Achat" },
        { path: "/achatPro", icon: "💳", label: "Paiement" },
        { path: "/commande", icon: "🧾", label: "Commande" },
      ]);
    } else if (role === "admin") {
      setNavItems([
        { path: "/", icon: "📊", label: "Dashboard" },
        { path: "/insertproduit", icon: "📦", label: "Produit" },
        { path: "/client", icon: "👥", label: "Client" },
        { path: "/achat", icon: "🛒", label: "Achat" },
        { path: "/achatPro", icon: "💳", label: "Paiement" },
        { path: "/commande", icon: "🧾", label: "Commande" },
      ]);
    } else {
      setNavItems([]);
    }
  }, [role]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/paiement/verifier`
        );
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();

        const today = new Date().toISOString().split("T")[0];
        const vues = JSON.parse(
          localStorage.getItem("notifications_vues") || "{}"
        );

        const filtres = (data.messages || []).filter(
          (msg: { client_id: number }) => vues[msg.client_id] !== today
        );

        setMessages(filtres);
        setNbMessages(filtres.length);
      } catch (err) {
        console.error("Erreur notif:", err);
        setMessages([]);
        setNbMessages(0);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);
  if (!role || role === "client") {
    // Pas connecté ou utilisateur client : ne rien afficher
    return null;
  }

  return (
    <>
      <div
        className={`hidden lg:flex flex-col fixed md:relative inset-y-0 left-0 z-30 transform transition duration-300 ease-in-out ${
          collapsed
            ? "-translate-x-full md:translate-x-0 md:w-20"
            : "translate-x-0 w-52"
        } bg-gradient-to-br from-red-400/60 to-blue-600/90 text-white shadow-lg md:shadow-none`}
      >
        <div className="hidden md:flex items-center justify-between h-16 px-6 border-b ">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer hover:bg-white/20 transition"
          >
            {collapsed ? (
              <div className="flex items-center gap-2">
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <img
                  src="/logo.jpeg" // Remplace par ton image personnalisée
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-bold">AUF-SARL</span>
              </div>
            )}
          </button>
        </div>

        <nav className="flex-1">
          <ul className="py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path} className="px-2 py-1 group relative">
                  <Link
                    href={item.path}
                    className={`flex items-center py-3 px-5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white shadow"
                        : "text-white hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="h-5 w-5">{item.icon}</span>
                    {!collapsed && <span className="ml-4">{item.label}</span>}
                  </Link>
                  {collapsed && (
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 whitespace-nowrap text-xs text-white bg-blue-600 rounded opacity-0 group-hover:opacity-100 transition">
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-800">
          {responsable && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative"
              >
                <img
                  src={
                    responsable?.Responsable_photo?.startsWith("http")
                      ? responsable.Responsable_photo
                      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${responsable?.Responsable_photo}`
                  }
                  alt="Responsable"
                  className="w-13 h-13 object-cover mx-auto rounded-full cursor-pointer"
                />
                {nbMessages > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs rounded-full px-1.5">
                    {nbMessages}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute bottom-0 w-72 bg-white border rounded-xl shadow-lg z-50">
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {responsable.Responsable_nom}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {responsable.Responsable_email}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 max-h-48 overflow-y-auto">
                    {messages.length > 0 ? (
                      <ul className="p-2 text-sm text-gray-800">
                        {messages.map((item, i) => (
                          <li
                            key={i}
                            className="py-2 px-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                          >
                            <Link
                              href={`/achatPro/${
                                item.client_id
                              }/${encodeURIComponent(item.achat_date)}`}
                              onClick={() => {
                                const today = new Date()
                                  .toISOString()
                                  .split("T")[0];
                                const vues = JSON.parse(
                                  localStorage.getItem("notifications_vues") ||
                                    "{}"
                                );
                                vues[item.client_id] = today;
                                localStorage.setItem(
                                  "notifications_vues",
                                  JSON.stringify(vues)
                                );

                                setMessages((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                );
                                setNbMessages((prev) => prev - 1);
                                setDropdownOpen(false);
                              }}
                              className="block w-full"
                            >
                              {item.message}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-2 text-gray-500 text-sm">
                        Aucune notification
                      </p>
                    )}
                  </div>

                  <div className="border-t border-blue-200 px-4 py-2">
                    <Link
                      href={`/responsable/${responsable.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 w-full text-sm hover:bg-gray-100 text-black px-4 py-2 rounded"
                    >
                      Mon Profil
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-2">
                    <button
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="flex items-center gap-2 w-full text-sm hover:bg-gray-100 text-black px-4 py-2 rounded"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Déconnexion...
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4" />
                          Déconnecter
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        className={`hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-blue-700 text-white shadow-lg ${
          collapsed ? "block" : "hidden"
        }`}
        onClick={() => setCollapsed(false)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};

export default Sidebar;
