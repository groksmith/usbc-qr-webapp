import type { ValueEmbedCodeSet, SelfTitlingCodeSet } from "../types";

/**
 * Mock CSV export: description/item tag, public code, internal ID.
 * Private codes are never included.
 */
export function downloadValueEmbedCsv(codes: ValueEmbedCodeSet[]): void {
  const header = "Description tag,Public code,ID\n";
  const rows = codes
    .map((c) => `"${escapeCsv(c.label)}","${escapeCsv(c.publicCode)}","${escapeCsv(c.id)}"`)
    .join("\n");
  const csv = header + rows;
  triggerDownload(csv, "value-embed-codes.csv");
}

export function downloadSelfTitlingCsv(codes: SelfTitlingCodeSet[]): void {
  const header = "Item tag,Public code,ID\n";
  const rows = codes
    .map((c) => `"${escapeCsv(c.itemTag)}","${escapeCsv(c.publicCode)}","${escapeCsv(c.id)}"`)
    .join("\n");
  const csv = header + rows;
  triggerDownload(csv, "self-titling-codes.csv");
}

function escapeCsv(value: string): string {
  return value.replace(/"/g, '""');
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
