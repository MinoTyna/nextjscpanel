import Link from "next/link";
import { Button } from "../components/ui/button";

export function Hero() {
  return (
    <section
      id="accueil"
      className="bg-gradient-to-br from-red-400/40 to-blue-600/90 text-white  py-20"
    >
      <div className="container mx-auto max-w-5xl text-center text-white mt-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">AUF-SARL</h1>
        <p className="text-xl md:text-2xl mb-10">
          Des milliers de véhicules à vendre et à louer avec un système de
          filtrage avancé
        </p>
        {/* <div className="flex flex-col sm:flex-row justify-center gap-4">
          <>
            <Button
              size="lg"
              className="bg-white cursor-pointer text-black hover:bg-blue-900 hover:text-white border-white"
            >
              <Link href="/sign-up">Créer un compte</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white cursor-pointer"
            >
              <Link href="/sign-in">Se connecter</Link>
            </Button>
          </>
        </div> */}
      </div>
    </section>
  );
}
