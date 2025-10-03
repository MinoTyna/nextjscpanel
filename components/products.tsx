/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "react-hot-toast";

export function Products() {
  const [products, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Vérifier si le client est connecté (via token dans localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Charger les produits depuis le backend
  const fetchProduits = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/produit/get?ts=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setProduits(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  // Ajouter au panier
  const addToCart = (product: any) => {
    if (!isLoggedIn) {
      toast.error("Veuillez vous connecter pour ajouter au panier.");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const productIndex = existingCart.findIndex(
      (p: any) => p.id === product.id
    );

    if (productIndex >= 0) {
      existingCart[productIndex].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));
    // toast.success(`${product.Produit_nom} ajouté au panier 🛒`);
  };

  // Catégories : correspondance clé (backend) → label (frontend)
  const categoryLabels: Record<string, string> = {
    Electromenager: "Électroménager",
    MaisonCuisine: "Maison & Cuisine",
    MobilierLiterie: "Mobilier & Literie",
    Electronique: "Électronique & Multimédia",
    Mode: "Mode & Accessoires",
    Transport: "Véhicules & Transport",
    Energie: "Énergie & Solaire",
  };

  // Liste des catégories affichées (on ajoute "Tous" devant)
  const categories = ["Tous", ...Object.keys(categoryLabels)];

  // Filtrage des produits
  const filteredProducts =
    selectedCategory === "Tous"
      ? products
      : products.filter((p) => p.Produit_categorie === selectedCategory);

  return (
    <section id="produits" className="py-2 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-950 mb-8">
          Nos Produits
        </h2>

        {/* Boutons catégories */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`${
                selectedCategory === category
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-white text-black hover:bg-orange-500"
              } border-0 cursor-pointer`}
            >
              {category === "Tous" ? "Tous" : categoryLabels[category]}
            </Button>
          ))}
        </div>

        {/* Produits */}
        {loading ? (
          <p className="text-center text-gray-500">
            Chargement des produits...
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            Aucun produit trouvé pour cette catégorie.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const imageUrl = product.Produit_photo?.startsWith("http")
                ? product.Produit_photo
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${product.Produit_photo}`;

              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="aspect-square relative mt-[-24px]">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={product.Produit_nom}
                      className="object-cover rounded-t-xl w-full h-full"
                    />
                  </div>

                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="mt-2">
                      <div className="flex justify-between items-center">
                        <h3 className=" font-semibold text-sm">
                          {product.Produit_nom}
                        </h3>
                        <p className="text-orange-600 font-bold text-sm">
                          {product.Produit_prix?.toLocaleString()}Ar
                        </p>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        {product.Produit_description || "Détails du produit"}
                      </p>
                    </div>
                    <Button
                      className={`mt-3 w-full ${
                        isLoggedIn
                          ? "bg-blue-900 hover:bg-blue-950 cursor-pointer"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => addToCart(product)}
                      disabled={!isLoggedIn}
                    >
                      {isLoggedIn ? "Ajouter au panier" : "Connectez-vous"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
