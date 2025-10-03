"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Message = {
  message: string;
  client_id: number;
};

export default function PaiementAlertes() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/paiement/verifier`
      );
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 180000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          📋 Paiements Proches
        </h1>
        <button
          onClick={fetchMessages}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded shadow"
        >
          🔄 Rafraîchir
        </button>
      </div>

      <div className="bg-white border rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500 text-center">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            ✅ Tous les paiements sont à jour.
          </div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-yellow-100 text-yellow-800 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3 border-b">#</th>
                <th className="px-6 py-3 border-b">Message</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {messages.map((msg, index) => (
                <tr
                  key={index}
                  className="hover:bg-yellow-50 transition duration-200"
                >
                  <td className="px-6 py-3 border-b font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3 border-b">
                    <Link
                      href={`/achatPro/${msg.client_id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {msg.message}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
