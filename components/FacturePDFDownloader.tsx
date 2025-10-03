/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

export interface Produit {
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

export interface Responsable {
  nom: string;
  telephone_res: string;
}

export interface Paiement {
  Paiement_montant: number | string;
}

export interface Facture {
  numero_facture: string;
  date_creation: string;
  client: string;
  prenom?: string;
  telephone: string;
  responsable: Responsable;
  produits: Produit[];
  paiement: Paiement;
  prixtotalproduit: number | string;
  total_paye: number | string;
  reste_a_payer: number | string;
  statut: string;
}

interface FacturePDFDownloaderProps {
  facture: Facture;
  factureHistorique: Facture[];
}

export const FacturePDFDownloader: React.FC<FacturePDFDownloaderProps> = ({
  factureHistorique,
}) => {
  const generatePDF = () => {
    if (factureHistorique.length === 0) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    const latestFacture = factureHistorique[factureHistorique.length - 1];

    const formatNumberWithSpaces = (num: number | string) =>
      Number(num)
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const logo = new Image();
    logo.src = "/logo.jpeg";

    logo.onload = () => {
      // === Logo & En-tête
      doc.addImage(logo, "JPEG", 14, 10, 40, 20);
      doc.setFontSize(16);
      doc.setTextColor(0, 74, 153);
      doc.text(`Facture : ${latestFacture.numero_facture}`, 200, 16, {
        align: "right",
      });
      doc.setFontSize(12);
      doc.text(
        `Date : ${new Date(latestFacture.date_creation).toLocaleDateString()}`,
        200,
        24,
        { align: "right" }
      );

      // === Infos Client / Responsable
      const infoStartY = 40;
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text("Client :", 14, infoStartY);
      doc.text(
        `Nom : ${latestFacture.client} ${latestFacture.prenom || ""}`,
        14,
        infoStartY + 7
      );
      doc.text(`Téléphone : ${latestFacture.telephone}`, 14, infoStartY + 14);

      doc.text("Responsable :", 120, infoStartY);
      doc.text(`Nom : ${latestFacture.responsable.nom}`, 120, infoStartY + 7);
      doc.text(
        `Téléphone : ${latestFacture.responsable.telephone_res}`,
        120,
        infoStartY + 14
      );

      // === Tableau Produits
      const produitsStartY = infoStartY + 30;

      autoTable(doc, {
        startY: produitsStartY,
        head: [["Produit", "Quantité", "Prix Unitaire (Ar)", "Total (Ar)"]],
        body: latestFacture.produits.map((p) => [
          p.nom,
          p.quantite.toString(),
          formatNumberWithSpaces(p.prix_unitaire),
          formatNumberWithSpaces(p.total),
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 74, 153],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246],
        },
      });

      const afterProductY =
        (doc as any).lastAutoTable?.finalY || produitsStartY + 40;

      // === Historique des paiements
      const paiementStartY = afterProductY + 10;
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text("Historique des paiements :", 14, paiementStartY);

      autoTable(doc, {
        startY: paiementStartY + 5,
        head: [["Date", "Montant"]],
        body: [
          [
            new Date(latestFacture.date_creation).toLocaleDateString("fr-FR"),
            `${formatNumberWithSpaces(
              latestFacture.paiement.Paiement_montant
            )} Ar`,
          ],
        ],
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 74, 153],
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246],
        },
      });

      const afterPaiementY =
        (doc as any).lastAutoTable?.finalY || paiementStartY + 30;

      // === Totaux
      const totauxStartY = afterPaiementY + 10;
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(
        `Total des produits : ${formatNumberWithSpaces(
          latestFacture.prixtotalproduit
        )} Ar`,
        14,
        totauxStartY
      );
      doc.text(
        `Total payé : ${formatNumberWithSpaces(latestFacture.total_paye)} Ar`,
        14,
        totauxStartY + 7
      );
      doc.text(
        `Reste à payer : ${formatNumberWithSpaces(
          latestFacture.reste_a_payer
        )} Ar`,
        14,
        totauxStartY + 14
      );
      doc.text(`Statut : ${latestFacture.statut}`, 14, totauxStartY + 21);

      // === Message de remerciement
      doc.setFontSize(11);
      doc.setTextColor(0, 74, 153);
      doc.setFont("helvetica", "italic");
      doc.text(
        "Merci de votre passage chez AUF-SARLU. Nous espérons vous revoir bientôt !",
        105,
        totauxStartY + 35,
        { align: "center" }
      );

      doc.save(`facture-${latestFacture.numero_facture}.pdf`);
    };
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-blue-600 text-white px-2 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
    >
      <Download className="w-4 h-4 " />
      
    </button>
  );
};
