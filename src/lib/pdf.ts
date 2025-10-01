export async function extractPdfTextFromBlob(file: Blob): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as any;
    const parsed = await pdfParse(buffer);
    const text: string = String(parsed?.text || "");
    return text;
  } catch (err) {
    console.error("[pdf] pdf-parse failed:", err);
    return "";
  }
}

export async function extractPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as any;
    const parsed = await pdfParse(buffer);
    const text: string = String(parsed?.text || "");
    return text;
  } catch (err) {
    console.error("[pdf] pdf-parse failed:", err);
    return "";
  }
}


