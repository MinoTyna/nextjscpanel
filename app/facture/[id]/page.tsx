/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";

type Responsable = {
  id: number;
  nom: string;
  prenomres: string;
  telephone_res: string;
};

type Produit = {
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
};

type PaiementDetail = {
  date: string;
  montant: number;
};

type FactureData = {
  numero_facture: string;
  date_achat: string;
  client: string;
  prenom: string;
  Client_adresse: string;
  telephone: string;
  responsable: Responsable;
  revenu?: number;
  produits: Produit[];
  prixtotalproduit: number;
  total_paye: number;
  reste_a_payer: number;
  statut: string;
  paiements_detail?: PaiementDetail[];
};

export default function FacturePage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [facture, setFacture] = useState<FactureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    const fetchFacture = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/achats/factures/${id}?ts=${Date.now()}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          setError("Erreur lors de la récupération de la facture.");
          setFacture(null);
          return;
        }

        const data: FactureData = await res.json();
        setFacture(data);
      } catch (err) {
        setError("Erreur réseau.");
        setFacture(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFacture();
  }, [id]);

  const generatePDF = () => {
    if (!facture) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    function formatNumberWithSpaces(num: number) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
    }

    const logo = new Image();
    logo.src = "/logo.jpeg";
    logo.onload = () => {
      // ✅ Logo carré avec bordure
      const logoSize = 25;
      doc.addImage(logo, "JPEG", 14, 10, logoSize, logoSize);
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(14, 10, logoSize, logoSize);

      // Infos société
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("NIF : 4005620968", 50, 15);
      doc.text("STAT : 46492 51 2021 0 00651", 50, 22);

      // Num facture
      doc.setFontSize(16);
      doc.setTextColor(0, 74, 153);
      doc.text(`${facture.numero_facture}`, 200, 16, { align: "right" });

      // Date
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(
        `Date : ${new Date(facture.date_achat).toLocaleDateString()}`,
        200,
        24,
        { align: "right" }
      );

      // Client
      const clientStartY = 45;
      doc.setFontSize(11);
      doc.text("Client :", 14, clientStartY);
      doc.text(
        `Nom : ${facture.client} ${facture.prenom}`,
        14,
        clientStartY + 7
      );
      doc.text(`Téléphone : ${facture.telephone}`, 14, clientStartY + 14);
      doc.text(`Adresse : ${facture.Client_adresse}`, 14, clientStartY + 21);

      // Responsable
      const responsableStartY = 45;
      doc.text("Responsable :", 120, responsableStartY);
      doc.text(
        `Nom : ${facture.responsable.nom} ${facture.responsable.prenomres}`,
        120,
        responsableStartY + 7
      );
      doc.text(
        `Téléphone : ${facture.responsable.telephone_res}`,
        120,
        responsableStartY + 14
      );

      // Produits
      const produitsStartY = clientStartY + 35;
      const produitsRows = facture.produits.map((p) => [
        p.nom,
        p.quantite.toString(),
        formatNumberWithSpaces(p.prix_unitaire),
        formatNumberWithSpaces(p.total),
      ]);

      autoTable(doc, {
        startY: produitsStartY,
        head: [["Produit", "Quantité", "Prix Unitaire (Ar)", "Total (Ar)"]],
        body: produitsRows,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          valign: "middle",
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [0, 74, 153],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [243, 244, 246] },
      });

      const finalYProduits =
        (doc as any).lastAutoTable.finalY || produitsStartY + 40;

      // Paiements
      const paiementStartY = finalYProduits + 15;
      doc.setFontSize(11);
      doc.text("Historique des paiements :", 14, paiementStartY);

      const paiementRows =
        facture.paiements_detail?.map((p) => [
          new Date(p.date).toLocaleDateString(),
          formatNumberWithSpaces(p.montant) + " Ar",
          "",
        ]) || [];

      autoTable(doc, {
        startY: paiementStartY + 5,
        head: [["Date", "Montant", "Signature"]],
        body: paiementRows,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [0, 74, 153],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [243, 244, 246] },
      });

      const finalYPaiement =
        (doc as any).lastAutoTable.finalY || paiementStartY + 40;

      // Totaux
      const totauxStartY = finalYPaiement + 15;
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(
        `Total des produits : ${formatNumberWithSpaces(
          facture.prixtotalproduit
        )} Ar`,
        14,
        totauxStartY
      );
      doc.text(
        `Total payé : ${formatNumberWithSpaces(facture.total_paye)} Ar`,
        14,
        totauxStartY + 7
      );
      doc.text(
        `Reste à payer : ${formatNumberWithSpaces(facture.reste_a_payer)} Ar`,
        14,
        totauxStartY + 14
      );
      doc.text(`Statut : ${facture.statut}`, 14, totauxStartY + 21);

      // ✅ Message de remerciement en bas avec ligne et AUF-SARL en gras
      const pageHeight = doc.internal.pageSize.height;

      // Ligne horizontale
      doc.setDrawColor(150); // gris clair
      doc.setLineWidth(0.2);
      doc.line(10, pageHeight - 25, 200, pageHeight - 25);

      // Texte découpé
      const before = "Merci de votre passage chez ";
      const middle = "AUF-SARL";
      const after = ". Nous espérons vous revoir bientôt !";

      doc.setFontSize(11);
      doc.setTextColor(0, 74, 153);

      // Mesurer largeur des morceaux
      doc.setFont("helvetica", "italic");
      const beforeWidth = doc.getTextWidth(before);
      doc.setFont("helvetica", "bolditalic");
      const middleWidth = doc.getTextWidth(middle);
      doc.setFont("helvetica", "italic");
      const afterWidth = doc.getTextWidth(after);

      const totalWidth = beforeWidth + middleWidth + afterWidth;
      const centerX = doc.internal.pageSize.width / 2;
      let cursorX = centerX - totalWidth / 2;
      const baselineY = pageHeight - 15;

      // Affichage partie avant
      doc.setFont("helvetica", "italic");
      doc.text(before, cursorX, baselineY);
      cursorX += beforeWidth;

      // AUF-SARL
      doc.setFont("helvetica", "bolditalic");
      doc.text(middle, cursorX, baselineY);
      cursorX += middleWidth;

      // Partie après
      doc.setFont("helvetica", "italic");
      doc.text(after, cursorX, baselineY);

      // Sauvegarde
      doc.save(`facture-${facture.numero_facture}.pdf`);
    };
  };

  if (loading)
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-400/30 to-blue-600/90">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;
  if (!facture)
    return (
      <div className="bg-gradient-to-br from-red-400/30 to-blue-600/90">
        Facture introuvable.
      </div>
    );

  const formatNumberWithSpaces = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");

  return (
    <div className="bg-gradient-to-br from-red-400/30 to-blue-600/90 ">
      <div
        style={{
          maxWidth: 1000,
          margin: "auto",
          padding: 20,
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f3f4f6",
          color: "#111827",
        }}
      >
        {/* EN-TÊTE */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.jpeg" alt="Logo AUF-SARL" style={{ height: 80 }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>NIF : 4005620968</p>
              <p style={{ margin: 0, fontWeight: "bold" }}>
                STAT : 46492 51 2021 0 00651
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ color: "#004a99", margin: 0 }}>
              {facture.numero_facture}
            </h1>
            <p style={{ margin: 0 }}>
              {new Date(facture.date_achat).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* CLIENT & RESPONSABLE */}
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 20 }}
        >
          <div style={{ flex: 1, background: "#f9f9f9", padding: 15 }}>
            <h2 style={{ color: "#004a99" }}>Client</h2>
            <p>
              <strong>Nom :</strong> {facture.client} {facture.prenom}
            </p>
            <p>
              <strong>Téléphone :</strong> {facture.telephone}
            </p>
            <p>
              <strong>Adresse :</strong> {facture.Client_adresse}
            </p>
          </div>
          <div style={{ flex: 1, background: "#f9f9f9", padding: 15 }}>
            <h2 style={{ color: "#004a99" }}>Responsable</h2>
            <p>
              <strong>Nom :</strong> {facture.responsable.nom}{" "}
              {facture.responsable.prenomres}
            </p>
            <p>
              <strong>Téléphone :</strong> {facture.responsable.telephone_res}
            </p>
          </div>
        </div>

        {/* PRODUITS */}
        <h2 style={{ color: "#004a99" }}>Produits</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 20,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Quantité</th>
              <th style={thStyle}>Prix unitaire</th>
              <th style={thStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {facture.produits.map((p, i) => (
              <tr key={i} style={i % 2 === 0 ? evenRow : {}}>
                <td style={tdStyle}>{p.nom}</td>
                <td style={tdStyle}>{p.quantite}</td>
                <td style={tdStyle}>
                  {formatNumberWithSpaces(p.prix_unitaire)} Ar
                </td>
                <td style={tdStyle}>{formatNumberWithSpaces(p.total)} Ar</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAIEMENTS */}
        {facture.paiements_detail && facture.paiements_detail.length > 0 && (
          <>
            <h2 style={{ color: "#004a99" }}>Historique des paiements</h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 20,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Montant</th>
                  <th style={thStyle}>Signature</th>
                </tr>
              </thead>
              <tbody>
                {facture.paiements_detail?.map((p, i) => (
                  <tr key={i} style={i % 2 === 0 ? evenRow : {}}>
                    <td style={tdStyle}>
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      {formatNumberWithSpaces(p.montant)} Ar
                    </td>
                    <td style={tdStyle}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* TOTALS */}
        <h3>
          Total des produits :{" "}
          {formatNumberWithSpaces(facture.prixtotalproduit)} Ar
        </h3>
        <h3>Total payé : {formatNumberWithSpaces(facture.total_paye)} Ar</h3>
        <h3>
          Reste à payer : {formatNumberWithSpaces(facture.reste_a_payer)} Ar
        </h3>
        <h3>Statut : {facture.statut}</h3>
        {facture.revenu && facture.revenu > 0 && (
          <h3 style={{ color: "green" }}>
            Revenu : {formatNumberWithSpaces(facture.revenu)} Ar
          </h3>
        )}

        <div
          style={{
            marginTop: 30,
            padding: 10,
            textAlign: "center",
            fontStyle: "italic",
            color: "#004a99",
            borderTop: "1px solid #ccc",
          }}
        >
          Merci de votre passage chez <strong>AUF-SARL</strong>. Nous espérons
          vous revoir bientôt !
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e5e7eb",
              color: "#111",
              border: "1px solid #ccc",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <button
            onClick={generatePDF}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 5,
            }}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  backgroundColor: "#ff00",
  color: "black",
  padding: "8px 12px",
  border: "1px solid #ccc",
  textAlign: "left" as const,
};

const tdStyle = {
  padding: "8px 12px",
  border: "1px solid #ccc",
};

const evenRow = {
  backgroundColor: "#f5faff",
};
