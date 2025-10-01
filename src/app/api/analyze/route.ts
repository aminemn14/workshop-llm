import { ApiKeyService } from "@/lib/api-keys";
import { createClient } from "@/lib/supabase/server";
import { LLMProvider } from "@/types/api-keys";
import { NextRequest, NextResponse } from "next/server";

// On utilise un runtime Node pour pouvoir parser les PDF côté serveur
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const provider = formData.get("provider") as LLMProvider;
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    if (!provider) {
      return NextResponse.json({ error: "Provider manquant" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non connecté" }, { status: 401 });
    }

    const apiKey = await ApiKeyService.getApiKeyForProvider(provider, supabase);
    if (!apiKey) {
      return NextResponse.json(
        { error: `Aucune clé API configurée pour ${provider}` },
        { status: 400 }
      );
    }

    // 1) Extraire le texte du PDF (simplifié via pdf-parse uniquement)
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());
    let trimmed = "";
    try {
      // Importer explicitement le build CJS de pdf-parse pour éviter les résolutions internes bizarres
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as any;
      const parsed = await pdfParse(buffer);
      const text: string = String(parsed?.text || "");
      trimmed = text.slice(0, 15000);
      console.log("[analyze api] pdf-parse text length:", trimmed.length);
      if (trimmed.length > 0) {
        console.log("[analyze api] sample:", trimmed.slice(0, 160));
      }
    } catch (err) {
      console.error("[analyze api] pdf-parse failed:", err);
    }

    // 2) Construire le prompt
    const system =
      // "Tu es un assistant d'analyse de factures. Extrait les informations clés (fournisseur, date, numéro de facture, total TTC, TVA, lignes principales) et fournis un résumé concis en français. Mets un accent particulier sur les PRODUITS COMMANDÉS: pour chaque ligne, donne le nom du produit, les quantités, le prix unitaire HT/TTC si disponible, le total ligne, les remises/options, l'éco-participation, et les mentions de livraison/installation. Structure la section produits en liste à puces claire et lisible.";
      "renvoie juste le nom du fichier";

    const userPrompt = trimmed
      ? `Voici le texte extrait d'un PDF de facture. Analyse et produis un résumé court (5-8 lignes), clair et orienté métier.\n\nContraintes de présentation:\n- Commence par les informations générales (fournisseur, date, numéro, montants TTC/HT/TVA) très simple et sur 2-3 lignes.\n- Ajoute ensuite une section 'Produits commandés' en liste à puces, détaillant profondément pour chaque article toutes les informations disponibles.\n- Reste très précis sur les produits.\n\nTEXTE PDF (tronqué si volumineux):\n\n${trimmed}`
      : `Je n'ai pas pu extraire le texte du PDF côté serveur. Donne un résumé générique attendu pour une facture (structure, informations à vérifier: fournisseur, date, numéro, montants TTC/HT/TVA, lignes), avec une section 'Produits commandés' en liste à puces détaillant nom, quantité, prix unitaire, total, éco-participation et livraison. Réponds en français en 5-8 lignes.`;

    // 3) Appel OpenRouter (format JSON OpenAI-compatible)
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: txt }, { status: resp.status });
    }
    const json = await resp.json();
    const choice = json?.choices?.[0];
    const content = choice?.message?.content;
    const summary = typeof content === "string" ? content : JSON.stringify(content);
    const messages = [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
      { role: "assistant", content: summary },
    ];
    const usage = json?.usage ?? null;
    const model = json?.model ?? "openai/gpt-4o-mini";
    const commandData = { extractedTextLength: trimmed.length };
    return NextResponse.json({ summary, messages, usage, model, commandData });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

