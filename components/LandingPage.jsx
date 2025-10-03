import { Hero } from "../components/hero";
import { Header } from "../components/header";
import { About } from "../components/about";
import { Products } from "../components/products";
import { Contact } from "../components/contact";
import { History } from "../components/history";
import { CardFooter } from "./ui/card";
import { Footer } from "./footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen max-w-full">
      {/* Header reste en haut */}
      <Header />

      {/* Contenu qui prend tout l’espace dispo */}
      <main className="flex-grow flex flex-col space-y-6">
        <Hero />
        <Products />
        <About />
      </main>
      <Footer />

      {/* Footer toujours collé en bas */}
    </div>
  );
}
