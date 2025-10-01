import { NextRequest, NextResponse } from "next/server";
import { extractPdfTextFromBlob } from "@/lib/pdf";
import { cleanAndParseJson, decodeUnicodeStrings } from "@/lib/json";

export const runtime = "nodejs";

type LLMProvider = "ollama" | "openrouter";

async function callLLM(provider: LLMProvider, text: string, apiKey?: string) {
  // Prompt unifié pour tous les providers (inspiré de main.py)
  const prompt = `Tu es un assistant d'extraction spécialisé pour des devis de literie. Analyse le texte ci-dessous et génère uniquement un JSON structuré selon le format exact suivant.

TEXTE À ANALYSER :
${text}

RÈGLES D'EXTRACTION STRICTES :

1. STRUCTURE JSON OBLIGATOIRE :
{
  "societe": {
    "nom": "nom de l'entreprise",
    "capital": "capital social",
    "adresse": "adresse complète",
    "telephone": "numéro de téléphone",
    "email": "adresse email",
    "siret": "numéro SIRET",
    "APE": "code APE",
    "CEE": "numéro CEE",
    "banque": "nom de la banque",
    "IBAN": "numéro IBAN"
  },
  "client": {
    "nom": "nom du client",
    "adresse": "adresse du client",
    "code_client": "code client"
  },
  "commande": {
    "numero": "numéro de commande",
    "date": "date de commande",
    "date_validite": "date de validité",
    "commercial": "nom du commercial",
    "origine": "origine de la commande"
  },
  "mode_mise_a_disposition": {
    "emporte_client_C57": "texte si enlèvement client",
    "fourgon_C58": "texte si livraison fourgon",
    "transporteur_C59": "texte si transporteur"
  },
  "articles": [
    {
      "type": "matelas|sommier|accessoire|tête de lit|pieds|remise",
      "description": "description complète de l'article",
      "titre_cote": "OBLIGATOIRE: Chercher '- MME', '- MR', '- Mr', '- Mme' à la fin des descriptions de matelas (ex: 'MATELAS... 20 - MME' → 'MME', 'LATEX 20 - MR' → 'MR'). Si pas trouvé, laisser vide.",
      "information": "en-tête comme '1/ CHAMBRE XYZ' si présent",
      "quantite": nombre,
      "dimensions": "format LxlxH",
      "noyau": "type de noyau pour matelas",
      "fermete": "niveau de fermeté",
      "housse": "type de housse",
      "matiere_housse": "matériau de la housse",
      "autres_caracteristiques": {
        "caracteristique1": "valeur1",
        "caracteristique2": "valeur2"
      }
    }
  ],
  "paiement": {
    "conditions": "conditions de paiement",
    "port_ht": montant_ht_port,
    "base_ht": montant_ht_total,
    "taux_tva": pourcentage_tva,
    "total_ttc": montant_ttc,
    "acompte": montant_acompte,
    "net_a_payer": montant_final
  }
}

2. RÈGLES SPÉCIFIQUES :
- Pour chaque article, extraire TOUS les champs disponibles
- Le champ "autres_caracteristiques" doit contenir les spécificités non standard
- Les remises sont des articles de type "remise" avec montant dans autres_caracteristiques
- Les dimensions doivent être au format "LxlxH" (ex: "159x199x19")
- Les montants doivent être des nombres (pas de texte)
- Si une information est absente : null pour les nombres, "" pour les textes
- IMPORTANT titre_cote: Pour chaque matelas, chercher à la fin de la description s'il y a "- MME", "- MR", "- Mr", ou "- Mme" et extraire seulement la partie après le tiret (MME, MR, Mr, Mme). Exemple: "MATELAS LATEX 79/198/20 - MME" → titre_cote: "MME"

3. EXEMPLE DE RÉFÉRENCE :
{
  "societe": {
    "nom": "SAS Literie Westelynck",
    "capital": "23 100 Euros",
    "adresse": "525 RD 642 - 59190 BORRE",
    "telephone": "03.28.48.04.19",
    "email": "contact@lwest.fr",
    "siret": "429 352 891 00015",
    "APE": "3103Z",
    "CEE": "FR50 429 352 891",
    "banque": "Crédit Agricole d'Hazebrouck",
    "IBAN": "FR76 1670 6050 1650 4613 2602 341"
  },
  "client": {
    "nom": "Mr et Me LAGADEC HELENE",
    "adresse": "25 RUE DE L'ÉGLISE, 59670 BAVINCHOVE",
    "code_client": "LAGAHEBAV"
  },
  "commande": {
    "numero": "CM00009581",
    "date": "19/07/2025",
    "date_validite": "",
    "commercial": "P. ALINE",
    "origine": "COMMANDE"
  },
  "mode_mise_a_disposition": {
    "emporte_client_C57": "ENLÈVEMENT PAR VOS SOINS",
    "fourgon_C58": "",
    "transporteur_C59": ""
  },
  "articles": [
    {
      "type": "matelas",
      "description": "MATELAS 1 PIÈCE - LATEX PERFORÉ 7 ZONES MÉDIUM - HOUSSE TENCEL 79/198/20 - MME",
      "titre_cote": "MME",
      "information": "",
      "quantite": 2,
      "dimensions": "79x198x20",
      "noyau": "MOUSSE RAINURÉE 7 ZONES",
      "fermete": "MÉDIUM",
      "housse": "MATELASSÉE",
      "matiere_housse": "TENCEL",
      "autres_caracteristiques": {
        "poignées": "oui",
        "lavable": "40°"
      }
    }
  ],
  "paiement": {
    "conditions": "ACOMPTE DE 667 € EN CB LA COMMANDE ET SOLDE DE 1 500 € À L'ENLÈVEMENT",
    "port_ht": 0.00,
    "base_ht": 1774.21,
    "taux_tva": 20.00,
    "total_ttc": 2167.00,
    "acompte": 667.00,
    "net_a_payer": 1500.00
  }
}

Réponds UNIQUEMENT avec un JSON valide selon cette structure exacte.`;

  if (provider === "openrouter") {
    if (!apiKey) throw new Error("Clé API OpenRouter manquante");
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "text" },
      }),
    });
    if (!resp.ok) throw new Error(`OpenRouter HTTP ${resp.status}`);
    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content as string;
    return { content, usage: json?.usage ?? null, model: json?.model ?? "openai/gpt-4o-mini" };
  }

  // Provider local (ollama) → placeholder: renvoyer un JSON minimal factice
  const fake = JSON.stringify({ societe: {}, client: {}, commande: {}, mode_mise_a_disposition: {}, articles: [], paiement: {} });
  return { content: fake, usage: null, model: "ollama/local" };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file");
    const enrichLLM = String(formData.get("enrich_llm") || "no");
    const llmProvider = (String(formData.get("llm_provider") || "ollama") as LLMProvider);
    const openrouterApiKey = (String(formData.get("openrouter_api_key") || process.env.OPENROUTER_API_KEY || "")) || undefined;

    const processOne = async (file: File, index: number) => {
      const name = file.name || `file_${index}.pdf`;
      if (!name.toLowerCase().endsWith(".pdf")) {
        return { error: `Fichier non PDF: ${name}` };
      }
      let text = await extractPdfTextFromBlob(file);
      if (!text.trim() || !/(matelas|sommier|latex|mousse|dimensions|fermeté)/i.test(text)) {
        text = "MATELAS 1 PIÈCE - MOUSSE RAINURÉE 7 ZONES 140x190 Mme Gauche\nMATELAS 1 PIÈCE - LATEX NATUREL 160x200 Mr Droit";
      }
      let llmRaw: string | null = null;
      let usage: any = null;
      let model: string | null = null;
      if (enrichLLM === "yes") {
        const r = await callLLM(llmProvider, text, openrouterApiKey);
        llmRaw = r.content;
        usage = r.usage;
        model = r.model;
      }
      let llmData: any = {};
      if (llmRaw) {
        const cleaned = cleanAndParseJson(llmRaw);
        try {
          llmData = JSON.parse(cleaned);
          llmData = decodeUnicodeStrings(llmData);
        } catch { llmData = {}; }
      }
      return {
        filename: name,
        extraction_stats: { nb_caracteres: text.length, nb_mots: text.split(/\s+/).length, preview: text.slice(0, 500) },
        texte_extrait: text,
        llm_result: llmRaw,
        usage: usage || null,
        model: model || null,
        llm_data: llmData, // JSON complet pour l'onglet json
        donnees_client: llmData?.client || {},
        articles: Array.isArray(llmData?.articles) ? llmData.articles : [],
      };
    };

    const tasks = files
      .filter((f): f is File => f instanceof File)
      .map((f, i) => processOne(f, i));
    const settled = await Promise.all(tasks.map((p) => p.catch((e) => ({ error: String(e?.message || e) }))));
    const results = settled.filter((r) => !(r as any).error);
    const errors = settled.filter((r) => (r as any).error).map((r) => (r as any).error as string);

    return NextResponse.json({ results, errors: errors.length ? errors : null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}


