// components/Sidebar.jsx
import { Home, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  return (
    <aside className="h-screen w-64 bg-blue-900 text-white fixed top-0 left-0 shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-blue-700">
        <h1 className="text-xl font-bold">VenteManager</h1>
      </div>

      <nav className="flex flex-col p-4 gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 hover:bg-blue-700 p-2 rounded-md"
        >
          <Home size={20} />
          <span>Accueil</span>
        </Link>

        <Link
          href="/produits"
          className="flex items-center gap-3 hover:bg-blue-700 p-2 rounded-md"
        >
          <ShoppingCart size={20} />
          <span>Produits</span>
        </Link>

        <Link
          href="/clients"
          className="flex items-center gap-3 hover:bg-blue-700 p-2 rounded-md"
        >
          <Users size={20} />
          <span>Clients</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
