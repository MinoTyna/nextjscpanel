import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      id="contact"
      className="bg-gradient-to-br from-red-400/40 to-blue-600/90 text-white flex justify-center p-4"
    >
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">AUF-SARL</h3>
            <p className="text-sm text-gray-50">Lundi - Vendredi: 8h - 18h</p>
            <p className="text-sm text-gray-50">Lieu Mitsinjo Toliara 601</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Contacts</h3>
            <ul className="space-y-2 text-sm text-gray-50">
              <li>Yas: +261 34 07 123 45</li>
              <li>Airtel: +261 34 07 123 45</li>
              <li>Orange: +261 34 07 123 45</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">À Propos</h3>
            <ul className="space-y-2 text-sm text-gray-50">
              <li>
                <Link
                  href="#accueil"
                  className=" text-white hover:bg-white p-2 rounded-2xl hover:text-black transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="#a-propos"
                  className=" text-white hover:bg-white p-2 rounded-2xl hover:text-black transition-colors"
                >
                  Mission
                </Link>
              </li>
              <li>
                <Link
                  href="#produits"
                  className=" text-white hover:bg-white p-2 rounded-2xl hover:text-black transition-colors"
                >
                  Produit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              Suivez-nous
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white hover:text-brand-accent hover:bg-orange-500 p-2 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-white hover:text-brand-accent hover:bg-orange-500 p-2 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-white hover:text-brand-accent hover:bg-orange-500 p-2 transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-50">
              Inscrivez-vous à notre newsletter pour recevoir nos offres
              exclusives
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
