"use client";

import React, { useEffect, useState } from "react";

type Produit = {
  id: number;
  nom: string;
  quantite: number;
  prix: number;
};
type Client = {
  id: number;
  nom: string;
  prenom: string;
};

type Notification = {
  id: number;
  client: Client;
  mode_reception?: string;
  produit_nom?: string;
  produits?: Produit[];
  message: string;
  vue: boolean; // côté admin
  vue_client: boolean; // côté client
  created_at: string;
  url?: string;
};

export default function Commande() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/achats/notifications?ts=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Erreur serveur");

        const data: Notification[] = await res.json();
        setNotifications(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications :", error);
        setNotifications([]);
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccepter = async (notifId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/notifications/${notifId}/accepter/`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Erreur serveur");

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, vue: true } : n))
      );
    } catch (err) {
      console.error("Erreur accepter notification:", err);
    }
  };

  const handleMarkClientRead = async (notifId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/achats/notifications/${notifId}/mark-client-read/`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Erreur serveur");

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, vue_client: true } : n))
      );
    } catch (err) {
      console.error("Erreur marquer notification côté client:", err);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 bg-gradient-to-br from-red-400/30 to-blue-600/90 p-6">
      {loading ? (
        <p>Chargement des notifications...</p>
      ) : notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-2 px-4 border">Client</th>
                <th className="py-2 px-4 border">Produits</th>
                <th className="py-2 px-4 border">Message</th>
                <th className="py-2 px-4 border text-center">Action</th>
                {/* ✅ Action centré */}
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id} className="hover:bg-gray-100">
                  {/* Client */}
                  <td className="py-2 px-4 border">
                    {notif.client.nom} {notif.client.prenom}
                  </td>

                  {/* Produits (concaténés si plusieurs) */}
                  <td className="py-2 px-4 border">
                    {notif.produits && notif.produits.length > 0 ? (
                      <ul className="list-disc list-inside text-left">
                        {notif.produits.map((p) => (
                          <li key={p.id}>
                            {p.nom} ({p.quantite}) – {p.prix.toLocaleString()}{" "}
                            Ar
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Message : si pas dans le backend, tu peux mettre mode_reception */}
                  <td className="py-2 px-4 border">
                    {notif.mode_reception || "—"}
                  </td>

                  {/* Actions centrées */}
                  <td className="py-2 px-4 border text-center">
                    {!notif.vue && !notif.vue_client && (
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Voulez-vous accepter cette notification ?"
                            )
                          ) {
                            handleAccepter(notif.id);
                          }
                        }}
                      >
                        Accepter
                      </button>
                    )}

                    {!notif.vue && notif.vue_client && (
                      <span className="text-blue-600 font-semibold">
                        Déjà confirmé
                      </span>
                    )}

                    {notif.vue && !notif.vue_client && (
                      <span className="text-green-600 font-semibold">
                        Accepté côté admin
                      </span>
                    )}

                    {notif.vue && notif.vue_client && (
                      <span className="text-purple-600 font-semibold">
                        Lu (admin & client)
                      </span>
                    )}
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
