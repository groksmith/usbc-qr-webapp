import React, { useEffect, useState } from "react";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { CopyButton } from "./CopyButton";

const SIDEBAR_TRANSITION_MS = 300;

export interface ViewQRCodeSidebarProps {
  open: boolean;
  onClose: () => void;
  /** Page title in the sidebar */
  title?: string;
  /** URL encoded in the QR code */
  qrUrl: string;
  /** Public code to show with copy (optional) */
  publicCode?: string;
  /** Short label/description (optional) */
  label?: string;
}

export function ViewQRCodeSidebar({
  open,
  onClose,
  title = "QR code",
  qrUrl,
  publicCode,
  label,
}: ViewQRCodeSidebarProps): React.ReactElement {
  const [slideEntered, setSlideEntered] = useState(false);
  const [slideClosing, setSlideClosing] = useState(false);

  useEffect(() => {
    if (!open) {
      setSlideEntered(false);
      setSlideClosing(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const handleClose = (): void => {
    setSlideClosing(true);
    setTimeout(() => onClose(), SIDEBAR_TRANSITION_MS);
  };

  if (!open) return <></>;

  const shellTransform = slideClosing || !slideEntered ? "translateX(100%)" : "translateX(0)";

  return (
    <div
      className="fixed inset-0 bg-[rgba(147,197,213,0.45)] backdrop-blur-[6px] flex items-stretch justify-end z-[1001]"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-[420px] rounded-l-[24px] bg-white border-0 outline-none shadow-sidebar p-6 px-7 pb-7 flex flex-col overflow-auto transition-transform duration-300 ease-out"
        style={{ transform: shellTransform }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="m-0 text-[22px] font-bold text-zinc-950">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="bg-transparent border-0 w-8 h-8 flex items-center justify-center cursor-pointer text-muted text-2xl leading-none p-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="w-full max-w-[320px] mx-auto flex flex-col items-center text-center">
          {label && (
            <p className="m-0 mb-4 text-sm text-muted">{label}</p>
          )}
          <QRCodeDisplay value={qrUrl} size={200} linkToUrl alt={`QR code – ${title}`} />
          <p className="text-sm mt-4 text-muted break-all">
            Links to:{" "}
            <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
              {qrUrl}
            </a>
          </p>
          {publicCode && (
            <div className="mt-5 w-full text-center">
              <p className="m-0 mb-2 text-sm font-medium text-zinc-950">Public code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono text-base">{publicCode}</code>
                <CopyButton text={publicCode} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
