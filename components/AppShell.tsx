"use client";

import { usePathname } from "next/navigation";
import Header from "./layout/Header";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./layout/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"; // Ajouté ici

  if (isAuthPage) {
    return <>{children}</>; // Pas de layout pour les pages d'authentification
  }

  return (
    <div className="flex h-screen bg-white text-gray-900">
      <Sidebar />
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto ">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
// gradient-to-br from-red-400/40 to-blue-600/70
// gradient-to-br from-red-400/30 to-blue-600/90
