/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type Notification = {
  message: string;
  client_id: number;
};

type Responsable = {
  id: number;
  Responsable_role: string;
  Responsable_photo: string;
  Responsable_nom: string;
  Responsable_email: string;
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

const Header = () => {
  const router = useRouter();
  const [responsable, setResponsable] = useState<Responsable | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nbMessages, setNbMessages] = useState(0);
  const [messages, setMessages] = useState<Notification[]>([]);
  const [role, setRole] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Récupérer l'utilisateur depuis le token JWT en localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setResponsable({
        id: Number(decoded.user_id),
        Responsable_email: decoded.email,
        Responsable_nom: decoded.nom,
        Responsable_photo: decoded.photo || "",
        Responsable_role: decoded.role,
      });
    } catch (err) {
      console.error("Erreur décodage JWT :", err);
    }
  }, []);

  // Notifications (comme avant)
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

  // Gestion clic en dehors dropdown
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

  // Déconnexion : supprimer token et rediriger
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("Responsable_role");

    router.push("/");
  };
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
  if (!role || role === "client") {
    // Pas connecté ou utilisateur client : ne rien afficher
    return null;
  }

  return (
    <header className="flex items-center justify-between px-3 py-2 bg-white shadow lg:hidden fixed top-0 left-0 right-0 z-50">
      <div>{/* Logo ou titre ici */}</div>

      <div className="flex items-center gap-4">
        {responsable && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative"
            >
              <img
                src={
                  responsable.Responsable_photo.startsWith("http")
                    ? responsable.Responsable_photo
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}${responsable.Responsable_photo}`
                }
                alt="Responsable"
                className="w-10 h-10 object-cover rounded-full cursor-pointer"
              />
              {nbMessages > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs rounded-full px-1.5">
                  {nbMessages}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border rounded-xl shadow-lg z-50">
                <div className="px-4 py-3 text-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {responsable.Responsable_nom}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {responsable.Responsable_email}
                  </p>
                </div>

                {/* Notifications */}
                <div className="border-t border-gray-200 max-h-48 overflow-y-auto">
                  {messages.length > 0 ? (
                    <ul className="p-2 text-sm text-gray-800">
                      {messages.map((item, i) => (
                        <li
                          key={i}
                          className="py-2 px-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                        >
                          <Link
                            href={`/achatPro/${item.client_id}`}
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

                {/* Profil */}
                <div className="border-t border-blue-200 px-4 py-2">
                  <Link
                    href={`/responsable/${responsable.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full text-sm hover:bg-gray-100 text-black px-4 py-2 rounded"
                  >
                    Mon Profil
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 px-4 py-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-sm hover:bg-gray-100 text-black px-4 py-2 rounded"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
