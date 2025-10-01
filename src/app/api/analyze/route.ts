import { NextRequest, NextResponse } from "next/server";
import { extractPdfTextFromBlob } from "@/lib/pdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY non configurée" },
        { status: 500 }
      );
    }

    // 1) Extraire le texte du PDF via l'utilitaire commun
    const rawText = await extractPdfTextFromBlob(file);
    const trimmed = (rawText ?? "").slice(0, 15000);

    // 2) Construire le prompt
    const system = "Tu es un assistant qui produit un résumé clair et concis en français d'un document de facture: informations générales (fournisseur, date, numéro, montants TTC/HT/TVA) puis une section 'Produits commandés' en puces.";

    const userPrompt = trimmed
      ? `Analyse le texte extrait ci-dessous et fournis un résumé en 5-8 lignes, structuré comme suit:\n- Informations générales (2-3 lignes)\n- Section 'Produits commandés' en liste à puces (nom, quantité, prix si présent, total, options)\n\nTEXTE (tronqué):\n\n${trimmed}`
      : `Impossible d'extraire le texte du PDF. Fournis un résumé générique attendu pour une facture (structure + points de contrôle) en 5-8 lignes.`;

    // 3) Appel OpenRouter (format OpenAI-compatible)
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
        temperature: 0.2,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: txt }, { status: resp.status });
    }
    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content as string | undefined;
    const summary = content ?? "";
    const messages = [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
      { role: "assistant", content: summary },
    ] as const;
    const usage = json?.usage ?? null;
    const model = json?.model ?? "openai/gpt-4o-mini";
    const commandData = { extractedTextLength: trimmed.length };
    return NextResponse.json({ summary, messages, usage, model, commandData });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}

