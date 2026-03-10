import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

/** Optional code data for Value Embed 2-sticker export (3.11: outside = QR + public code, inside = private code). */
export interface ValueEmbedCodeExportData {
  publicCode: string;
  privateCode?: string;
  qrUrl: string;
}

interface StickerExportModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Value Embed = 2 stickers (outside + inside); Self-Titling = 1 */
  variant?: "value-embed" | "self-titling";
  /** When variant is value-embed, pass current code so the mock template contains real public/private codes and QR URL. */
  valueEmbedCode?: ValueEmbedCodeExportData;
}

/** Mock: triggers download of a file with the given content. Replace with real export when backend is ready. */
function mockDownload(filename: string, content: string, mimeType = "text/plain"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function StickerExportModal({
  open,
  onClose,
  title = "Export sticker template",
  variant = "value-embed",
  valueEmbedCode,
}: StickerExportModalProps): React.ReactElement {
  const handleDownload = (): void => {
    if (variant === "value-embed" && valueEmbedCode) {
      const { publicCode, privateCode, qrUrl } = valueEmbedCode;
      const outsideContent = [
        "Value Embed – Outside sticker (QR code + public code)",
        "======================================================",
        "",
        "QR code links to: " + qrUrl,
        "Public code: " + publicCode,
        "",
        "Place this sticker on the outside. Recipients can scan the QR or enter the public code to check balance.",
      ].join("\n");
      const insideContent = [
        "Value Embed – Inside sticker (private code)",
        "===========================================",
        "",
        "Private code: " + (privateCode ?? "(not provided)"),
        "",
        "Keep this sticker hidden. Use the private code only when redeeming.",
      ].join("\n");
      mockDownload("value-embed-outside-sticker.txt", outsideContent);
      mockDownload("value-embed-inside-sticker.txt", insideContent);
    } else if (variant === "value-embed") {
      mockDownload("value-embed-outside-sticker.txt", "Mock sticker print file - replace with real export. Open from a code detail to get a template with QR URL and codes.");
      mockDownload("value-embed-inside-sticker.txt", "Mock sticker print file - replace with real export.");
    } else {
      mockDownload("self-titling-sticker.txt", "Mock sticker print file - replace with real export");
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p>
        {variant === "value-embed"
          ? "Print preview: outside sticker (QR + public code) and inside sticker (private code)."
          : "Print preview: single QR sticker for item profile."}
      </p>
      <p className="text-sm text-body-text">
        Sticker dimensions and bleed can be configured when the real export is connected.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button onClick={handleDownload}>Download</Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
