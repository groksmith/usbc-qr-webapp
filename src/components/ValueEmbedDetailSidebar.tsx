import React, { useEffect, useState } from "react";
import { getValueEmbedCodeById, cancelValueEmbedCode } from "../services/api";
import type { ValueEmbedCodeSet } from "../types";
import {
  Button,
  Badge,
  CopyButton,
  CopyIconButton,
  CloseIcon,
  StickerPrintModal,
  QRCodeDisplay,
} from "./ui";

const SIDEBAR_TRANSITION_MS = 300;

export interface ValueEmbedDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  codeId: string | null;
}

export function ValueEmbedDetailSidebar({
  open,
  onClose,
  codeId,
}: ValueEmbedDetailSidebarProps): React.ReactElement {
  const [code, setCode] = useState<ValueEmbedCodeSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealPrivate, setRevealPrivate] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);
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

  useEffect(() => {
    if (!open || !codeId) {
      setCode(null);
      return;
    }
    setLoading(true);
    setRevealPrivate(false);
    setCancelConfirm(false);
    getValueEmbedCodeById(codeId).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [open, codeId]);

  const handleCancel = async (): Promise<void> => {
    if (!codeId) return;
    setCancelling(true);
    await cancelValueEmbedCode(codeId);
    setCancelConfirm(false);
    setCode((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    setCancelling(false);
  };

  if (!open) return <></>;

  const shellTransform = slideClosing || !slideEntered ? "translateX(100%)" : "translateX(0)";

  return (
    <>
      <div
        className="fixed inset-0 bg-[rgba(147,197,213,0.45)] backdrop-blur-[6px] flex items-stretch justify-end z-[1000]"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label="Value Embed code detail"
      >
        <div
          className="w-full max-w-[100%] sm:max-w-[520px] rounded-none sm:rounded-l-[24px] bg-white border-0 outline-none shadow-sidebar p-4 sm:p-6 sm:px-7 pb-6 sm:pb-7 flex flex-col overflow-auto transition-transform duration-300 ease-out"
          style={{ transform: shellTransform }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
            <h2 className="m-0 text-lg sm:text-[22px] font-bold text-zinc-950 truncate min-w-0">Value Embed Code</h2>
            <button type="button" onClick={handleClose} className="bg-transparent border-0 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full cursor-pointer text-muted p-0 touch-manipulation shrink-0 hover:bg-zinc-200 transition-colors" aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {loading && <p className="text-muted">Loading…</p>}
          {!loading && !code && <p className="text-muted">Code not found.</p>}
          {!loading && code && (
            <>
              <p className="m-0 mb-1 text-sm text-muted"><strong>Description tag:</strong> {code.label}</p>
              <p className="m-0"><Badge status={code.status} /></p>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">QR code</h3>
                <QRCodeDisplay value={code.qrUrl} size={160} linkToUrl alt="Value Embed QR code" />
                <p className="text-sm mt-2">
                  <a href={code.qrUrl} target="_blank" rel="noopener noreferrer" className="break-all">{code.qrUrl}</a>
                </p>
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Public code</h3>
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <code className="font-mono text-sm break-all">{code.publicCode}</code>
                  <CopyIconButton text={code.publicCode} />
                </div>
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Private code</h3>
                {revealPrivate ? (
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm">{code.privateCode ?? "—"}</code>
                    <CopyButton text={code.privateCode ?? ""} />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm("Reveal private code? It should be kept secure.")) {
                        setRevealPrivate(true);
                      }
                    }}
                  >
                    Reveal private code
                  </Button>
                )}
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Value & balance</h3>
                <p className="m-0 mb-2 text-sm">
                  A wallet is generated for this code pair and holds the assigned funds until redemption or return to source.
                </p>
                <p className="m-0 text-sm">Value: {code.value} · Balance: {code.balance}</p>
                <p className="mt-1 mb-0 text-sm">Funding source: {code.fundingSourceId}</p>
                <p className="mt-1 mb-0 text-sm">
                  Expiration: {code.expiration ? new Date(code.expiration).toLocaleString() : "None"}
                </p>
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Status timeline</h3>
                <p className="m-0 text-sm">Created: {new Date(code.createdAt).toLocaleString()}</p>
                {code.redemptionTimestamp && (
                  <p className="mt-1 mb-0 text-sm">Redeemed: {new Date(code.redemptionTimestamp).toLocaleString()}</p>
                )}
              </section>

              <section className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setStickerModalOpen(true)}>
                  Print sticker template
                </Button>
                {code.status === "active" && (
                  <>
                    {!cancelConfirm ? (
                      <Button variant="secondary" onClick={() => setCancelConfirm(true)}>
                        Cancel code
                      </Button>
                    ) : (
                      <>
                        <span className="text-sm w-full">Value returns to source. Confirm?</span>
                        <Button onClick={handleCancel} disabled={cancelling}>
                          {cancelling ? "Cancelling…" : "Confirm cancel"}
                        </Button>
                        <Button variant="outline" onClick={() => setCancelConfirm(false)}>
                          Back
                        </Button>
                      </>
                    )}
                  </>
                )}
              </section>

              <div className="mt-4 text-sm flex flex-col gap-2">
                <a href={`${window.location.origin}/check-balance?code=${encodeURIComponent(code.publicCode)}`} target="_blank" rel="noopener noreferrer">
                  View public check balance page
                </a>
                {code.status === "active" && (
                  <a href={`${window.location.origin}/redeem?code=${encodeURIComponent(code.publicCode)}`} target="_blank" rel="noopener noreferrer">
                    Redeem (private code required)
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {!loading && code && (
        <>
<StickerPrintModal
          open={stickerModalOpen}
          onClose={() => setStickerModalOpen(false)}
          variant="value-embed"
          valueEmbedCode={{
            publicCode: code.publicCode,
            privateCode: code.privateCode,
            qrUrl: code.qrUrl,
          }}
        />
        </>
      )}
    </>
  );
}
