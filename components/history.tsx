import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function History() {
  const products = [
    {
      name: "Couteaux",
      price: 25000,
      image: "/couteaux.png",
      category: "Cuisine",
    },
    {
      name: "Casseroles",
      price: 45000,
      image: "/casseroles.png",
      category: "Cuisine",
    },
    {
      name: "Ustensiles pâtisserie",
      price: 20000,
      image: "/patisserie.png",
      category: "Cuisine",
    },
    {
      name: "Accessoires cuisine",
      price: 15000,
      image: "/accessoires.png",
      category: "Cuisine",
    },
    {
      name: "Réfrigérateur",
      price: 350000,
      image: "/refrigerateur.png",
      category: "Electroménager",
    },
    {
      name: "Cuisinière",
      price: 250000,
      image: "/cuisiniere.png",
      category: "Electroménager",
    },
    {
      name: "Lave-linge",
      price: 300000,
      image: "/lavelinge.png",
      category: "Electroménager",
    },
    {
      name: "Canapé",
      price: 500000,
      image: "/canape.png",
      category: "Meubles",
    },
    {
      name: "Table de salon",
      price: 2000000,
      image: "/table.png",
      category: "Meubles",
    },
    { name: "Chaise", price: 80000, image: "/chaise.png", category: "Meubles" },
    {
      name: "Bouteille de gaz",
      price: 60000,
      image: "/gaz.png",
      category: "Gaz",
    },
    {
      name: "Réchaud gaz",
      price: 45000,
      image: "/rechaud.png",
      category: "Gaz",
    },
    // ajoute le reste de tes produits ici
  ];

  const categories = [
    "Tous",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  // Filtrer les produits selon la catégorie sélectionnée
  const filteredProducts =
    selectedCategory === "Tous"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <section id="historique" className="py-2 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-950 mb-8">
          Nos Produits
        </h2>

        <div className="flex justify-center gap-4 mb-8 flex-wrap ">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`${
                selectedCategory === category
                  ? "bg-orange-500 text-white hover:bg-orange-600" // bouton actif
                  : "bg-white text-black hover:bg-orange-500" // bouton normal
              } border-0 cursor-pointer`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Grille de produits */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="aspect-square relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mt-2">
                  {/* Nom et prix en flex */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-orange-600 font-bold">
                      {product.price.toLocaleString()} Ar
                    </p>
                  </div>

                  {/* Détails en dessous */}
                  <p className="text-muted-foreground mt-1">
                    Détails du produit
                  </p>
                </div>

                <Button className="mt-3 bg-blue-900 hover:bg-blue-950 cursor-pointer w-full">
                  Ajouter au panier
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
