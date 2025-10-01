"use client";
import { useStore } from "@/lib/useStore";
import { useMemo } from "react";

interface InvoiceData {
  fournisseur: string;
  date: string;
  numero: string;
  montantHT: string;
  montantTTC: string;
  tva: string;
  dimensions: string;
  produits: Array<{
    nom: string;
    quantite: string;
    prixUnitaire: string;
    total: string;
    ecoParticipation: string;
    livraison: string;
  }>;
}

export default function CalculatedParametersTable() {
  const summaryText = useStore((s) => s.summaryText);
  const commandData = useStore((s) => s.commandData);
  const clientOrder = useStore((s) => s.clientOrder);
  const usage = useStore((s) => s.usage);
  const model = useStore((s) => s.model);
  const costTotalUSD = useStore((s) => s.costTotalUSD);

  const calculatedParams = useMemo(() => {
    if (!summaryText) {
      return {
        // Paramètres calculés
        tauxTVA: 0,
        montantTVA: 0,
        prixUnitaireHT: 0,
        marge: 0,
        typeMatelas: "",
        gammePrix: "",
        categorieCommande: "",
        // Paramètres techniques
        tempsTraitement: 0,
        tokensUtilises: 0,
        qualiteExtraction: 0,
        // Paramètres de validation
        coherencemontants: true,
        statutValidation: "À vérifier",
        erreursDetectees: []
      };
    }

    // Extraction des données de base pour les calculs depuis le résumé
    const lines = summaryText.split('\n').map(line => line.trim()).filter(line => line);
    let montantHT = 0;
    let montantTTC = 0;
    let prixUnitaireTTC = 0;
    let quantite = 1;
    let typeMatelas = "";

    // Extraction des montants depuis le résumé avec debug amélioré
    for (const line of lines) {
      
      if (line.includes('**Total TTC :**') || line.includes('**Montant Total TTC :**')) {
        const match = line.match(/(\d+[,.]?\d*)/);
        if (match) {
          montantTTC = parseFloat(match[1].replace(',', '.'));
        }
      }
      if (line.includes('**Montant HT :**')) {
        const match = line.match(/(\d+[,.]?\d*)/);
        if (match) {
          montantHT = parseFloat(match[1].replace(',', '.'));
        }
      }
      if (line.includes('**Prix unitaire TTC :**')) {
        const match = line.match(/(\d+[,.]?\d*)/);
        if (match) {
          prixUnitaireTTC = parseFloat(match[1].replace(',', '.'));
        }
      }
      if (line.includes('**Quantité :**')) {
        const match = line.match(/(\d+)/);
        if (match) {
          quantite = parseInt(match[1]);
        }
      }
      if (line.includes('**Matelas')) {
        typeMatelas = line.replace(/^-\s*\*\*/, '').replace(/\*\*$/, '').trim();
      }
    }

    // Calculs automatiques avec vérifications
    const montantTVA = montantTTC - montantHT;
    const tauxTVA = montantHT > 0 ? (montantTVA / montantHT) * 100 : 0;
    
    // Vérification que le taux de TVA est raisonnable (entre 0% et 30%)
    const tauxTVAValide = tauxTVA >= 0 && tauxTVA <= 30;
    
    const prixUnitaireHT = (prixUnitaireTTC > 0 && tauxTVAValide) ? 
      prixUnitaireTTC / (1 + tauxTVA / 100) : 0;
    
    const marge = (prixUnitaireHT > 0 && prixUnitaireTTC > 0) ? 
      ((prixUnitaireTTC - prixUnitaireHT) / prixUnitaireHT) * 100 : 0;

    
    // Classification automatique
    let gammePrix = "Standard";
    if (prixUnitaireTTC > 1000) gammePrix = "Haut de gamme";
    else if (prixUnitaireTTC < 500) gammePrix = "Entrée de gamme";
    
    let categorieCommande = "Petite commande";
    if (montantTTC > 2000) categorieCommande = "Grande commande";
    else if (montantTTC > 1000) categorieCommande = "Moyenne commande";

    // Validation des données
    const coherencemontants = Math.abs((montantTTC - montantHT) - montantTVA) < 0.01;
    const erreursDetectees = [];
    
    if (!coherencemontants) erreursDetectees.push("Incohérence dans les calculs de TVA");
    if (prixUnitaireTTC * quantite !== montantTTC) erreursDetectees.push("Incohérence prix unitaire × quantité");
    if (!tauxTVAValide) erreursDetectees.push("Taux de TVA invalide (doit être entre 0% et 30%)");
    if (montantTTC <= 0) erreursDetectees.push("Montant TTC invalide");
    if (montantHT <= 0) erreursDetectees.push("Montant HT invalide");
    if (montantTTC <= montantHT) erreursDetectees.push("Montant TTC doit être supérieur au montant HT");
    
    const statutValidation = erreursDetectees.length === 0 ? "Validé" : "À vérifier";
    const qualiteExtraction = erreursDetectees.length === 0 ? 95 : Math.max(60, 95 - erreursDetectees.length * 15);

    return {
      // Paramètres calculés
      tauxTVA: Math.round(tauxTVA * 100) / 100,
      montantTVA: Math.round(montantTVA * 100) / 100,
      prixUnitaireHT: Math.round(prixUnitaireHT * 100) / 100,
      marge: Math.round(marge * 100) / 100,
      typeMatelas,
      gammePrix,
      categorieCommande,
      // Paramètres techniques
      tempsTraitement: commandData.extractedTextLength ? Math.round(commandData.extractedTextLength / 100) : 0,
      tokensUtilises: usage?.total_tokens || 0,
      qualiteExtraction,
      // Paramètres de validation
      coherencemontants,
      statutValidation,
      erreursDetectees,
      // Données de base pour référence
      montantHT,
      montantTTC,
      prixUnitaireTTC,
      quantite
    };
  }, [summaryText, commandData, clientOrder, usage, model, costTotalUSD]);

  if (!summaryText) {
    return (
      <div className="text-sm text-[var(--neutral)]">
        Aucune facture analysée. Uploadez un PDF pour voir les paramètres calculés.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Paramètres calculés automatiquement */}
      <div className="card p-4">
        <h3 className="font-medium text-sm text-[var(--fg)] mb-4">Paramètres calculés automatiquement</h3>
        
        {/* Tableau simple */}
        <div className="space-y-1">
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--neutral)]">Taux de TVA</span>
            <span className="text-sm font-medium text-[var(--fg)]">{calculatedParams.tauxTVA || 0}%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--neutral)]">Montant TVA</span>
            <span className="text-sm font-medium text-[var(--fg)]">{(calculatedParams.montantTVA || 0).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--neutral)]">Prix unitaire HT</span>
            <span className="text-sm font-medium text-[var(--fg)]">{(calculatedParams.prixUnitaireHT || 0).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--neutral)]">Marge</span>
            <span className="text-sm font-medium text-[var(--fg)]">{(calculatedParams.marge || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--neutral)]">Type de matelas</span>
            <span className="text-sm font-medium text-[var(--fg)] max-w-[200px] text-right">{calculatedParams.typeMatelas || "Non détecté"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--neutral)]">Gamme de prix</span>
            <span className="text-sm font-medium text-[var(--fg)]">{calculatedParams.gammePrix}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--neutral)]">Catégorie commande</span>
            <span className="text-sm font-medium text-[var(--fg)]">{calculatedParams.categorieCommande}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-[var(--neutral)]">Qualité extraction</span>
            <span className="text-sm font-medium text-[var(--fg)]">{calculatedParams.qualiteExtraction || 0}%</span>
          </div>
        </div>
      </div>


      {/* Validation des données */}
      <div className="card p-3">
        <h3 className="font-medium mb-3 text-sm">Validation des données</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--neutral)]">Statut de validation:</span>
            <span className={`font-medium ${calculatedParams.statutValidation === "Validé" ? "text-green-600" : "text-amber-600"}`}>
              {calculatedParams.statutValidation}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--neutral)]">Cohérence des montants:</span>
            <span className={`font-medium ${calculatedParams.coherencemontants ? "text-green-600" : "text-red-600"}`}>
              {calculatedParams.coherencemontants ? "✓ OK" : "✗ Erreur"}
            </span>
          </div>
          {calculatedParams.erreursDetectees.length > 0 && (
            <div className="mt-2">
              <span className="text-[var(--neutral)]">Erreurs détectées:</span>
              <ul className="mt-1 space-y-1">
                {calculatedParams.erreursDetectees.map((erreur, index) => (
                  <li key={index} className="text-red-600 text-xs">• {erreur}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
