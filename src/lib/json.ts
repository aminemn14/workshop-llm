export function cleanAndParseJson(rawText: string): string {
  if (!rawText || !rawText.trim()) return "";
  try {
    JSON.parse(rawText);
    return rawText;
  } catch {
    // try utf-8 safe normalization
    // strip markdown fences
    try {
      let cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      JSON.parse(cleaned);
      return cleaned;
    } catch {}
    // strip backticks
    try {
      let cleaned = rawText.replace(/`+/g, "").trim();
      JSON.parse(cleaned);
      return cleaned;
    } catch {}
    // fallback original
    return rawText;
  }
}

// Décodage récursif des chaînes unicode style Python
export function decodeUnicodeStrings<T = unknown>(obj: T): T {
  if (obj == null) return obj;
  if (Array.isArray(obj)) {
    return (obj as unknown[]).map((v) => decodeUnicodeStrings(v)) as unknown as T;
  }
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = decodeUnicodeStrings(v);
    }
    return out as T;
  }
  if (typeof obj === "string") {
    try {
      // Interpréter les séquences d'échappement unicode (\uXXXX) si présentes
      return JSON.parse(`"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`) as unknown as T;
    } catch {
      return obj;
    }
  }
  return obj;
}


