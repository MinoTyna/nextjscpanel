import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Contactez-nous
        </h2>

        <div className="max-w-3xl mx-auto space-y-12">
          {/* Formulaire de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">
                Envoyez-nous un message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input id="nom" placeholder="Nom complet" />
                  <Input id="email" type="email" placeholder="Email" />
                </div>
                <Input id="telephone" placeholder="Téléphone" />
                <Input id="sujet" placeholder="Sujet" />
                <Textarea
                  id="message"
                  placeholder="Votre message..."
                  rows={5}
                />
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informations de contact en bas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Adresse</h4>
                  Mitsinjo Betanimena
                  <br />
                  Toliara 601, Madagascar
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Téléphone</h4>
                  +261 XX XXX XXX
                  <br />
                  +261 XX XXX XXX
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Email</h4>
                  contact@example.com
                  <br />
                  commercial@example.com
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Horaires</h4>
                  Lundi - Vendredi : 08h00 - 17h00
                  <br />
                  Samedi : 09h00 - 12h00
                  <br />
                  Dimanche : Fermé
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
