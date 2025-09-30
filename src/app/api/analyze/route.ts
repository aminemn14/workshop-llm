import { NextRequest, NextResponse } from "next/server";

// On utilise un runtime Node pour pouvoir parser les PDF côté serveur
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
      "Tu es un assistant d'analyse de factures. Extrait les informations clés (fournisseur, date, numéro de facture, total TTC, TVA, lignes principales), et fournis un résumé concis en français.";

    const userPrompt = trimmed
      ? `Voici le texte extrait d'un PDF de facture. Analyse et produis un résumé court (5-8 lignes), clair et orienté métier.\n\nTEXTE PDF (tronqué si volumineux):\n\n${trimmed}`
      : `Je n'ai pas pu extraire le texte du PDF côté serveur. Donne un résumé générique attendu pour une facture (structure, informations à vérifier: fournisseur, date, numéro, montants TTC/HT/TVA, lignes), en rappelant que le contenu exact n'a pas pu être lu. Réponds en français en 5-8 lignes.`;

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
    const content = json?.choices?.[0]?.message?.content;
    const summary = typeof content === "string" ? content : JSON.stringify(content);
    return NextResponse.json({ summary });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

