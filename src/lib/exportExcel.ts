import * as XLSX from "xlsx";

export type RowObject = Record<
  string,
  string | number | boolean | null | undefined
>;

export function exportToExcel(
  rows: RowObject[],
  options?: { filename?: string; sheetName?: string }
) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const worksheet = XLSX.utils.json_to_sheet(safeRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    options?.sheetName || "Données"
  );

  const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const filename = (options?.filename || "export") + ".xlsx";
  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
