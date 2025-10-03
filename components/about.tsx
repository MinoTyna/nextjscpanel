/* eslint-disable @next/next/no-img-element */

export function About() {
  return (
    <section id="a-propos" className="py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-950 mb-12">
            À Propos d'AUF-SARL
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            {/* Texte */}
            <div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-4">
                Notre Mission
              </h3>
              <p className="text-black leading-relaxed mb-6">
                AUF-SARL s'engage à fournir des produits de qualité supérieure
                pour équiper votre maison et faciliter votre quotidien. Nous
                proposons une large gamme d'ustensiles de cuisine,
                d'électroménagers, de meubles et de solutions gaz adaptées aux
                besoins de nos clients à Toliara et dans toute la région.
              </p>
              <p className="text-black leading-relaxed">
                Notre équipe expérimentée vous accompagne dans le choix des
                meilleurs produits selon vos besoins et votre budget, avec un
                service client personnalisé et des conseils d'experts.
              </p>
            </div>

            {/* Image */}
            <div className="flex justify-center">
              <img
                src="christine.png" // remplace par ton image
                alt="Illustration AUF-SARL"
                className="rounded-2xl shadow-lg w-80 h-80 animate-float"
              />
            </div>
          </div>

          {/* Carte Google Maps */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">
              📍 Localisation AUF-SARL
            </h3>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps?q=-23.356660512168702,43.67018088720444&hl=fr&z=15&output=embed"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
