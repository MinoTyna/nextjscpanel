import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

export default function NotificationIcon() {
  const [nbMessages, setNbMessages] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/paiement/verifier`
        );
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setMessages(data.messages || []);
        setNbMessages(data.messages?.length || 0);
      } catch (err) {
        console.error("Erreur notif :", err);
        setNbMessages(0);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)}>
        <Bell className="h-6 w-6 text-gray-700" />
        {nbMessages > 0 && (
          <span className="absolute top-[-6px] right-[-6px] bg-red-600 text-white text-xs rounded-full px-2">
            {nbMessages}
          </span>
        )}
      </button>

      {/* Menu déroulant */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-md rounded border z-50">
          {messages.length > 0 ? (
            <ul className="p-2 text-sm text-gray-800">
              {messages.map((msg, i) => (
                <li key={i} className="py-1 border-b last:border-b-0">
                  {msg}
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-2 text-gray-500">Aucune notification</p>
          )}
        </div>
      )}
    </div>
  );
}
