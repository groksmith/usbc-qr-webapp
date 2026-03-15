import React, { useEffect, useState } from "react";
import { getSelfTitlingCodeById } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import {
  Button,
  Badge,
  CopyIconButton,
  CloseIcon,
  StickerExportModal,
  QRCodeDisplay,
} from "./ui";
import { TransferTitleModal } from "./TransferTitleModal";
import { formatTableDate } from "../utils/date";
import { pathToItemProfile } from "../constants/routes";

const SIDEBAR_TRANSITION_MS = 300;

export interface SelfTitlingDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  codeId: string | null;
}

export function SelfTitlingDetailSidebar({
  open,
  onClose,
  codeId,
}: SelfTitlingDetailSidebarProps): React.ReactElement {
  const [code, setCode] = useState<SelfTitlingCodeSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
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
      setTransferOpen(false);
      return;
    }
    setLoading(true);
    getSelfTitlingCodeById(codeId).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [open, codeId]);

  if (!open) return <></>;

  const shellTransform = slideClosing || !slideEntered ? "translateX(100%)" : "translateX(0)";
  const profileUrl = code ? pathToItemProfile(code.publicCode) : "";

  return (
    <>
      <div
        className="fixed inset-0 bg-[rgba(147,197,213,0.45)] backdrop-blur-[6px] flex items-stretch justify-end z-[1000]"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label="Self-Titling code detail"
      >
        <div
          className="w-full max-w-[100%] sm:max-w-[520px] rounded-none sm:rounded-l-[24px] bg-white border-0 outline-none shadow-sidebar p-4 sm:p-6 sm:px-7 pb-6 sm:pb-7 flex flex-col overflow-auto transition-transform duration-300 ease-out"
          style={{ transform: shellTransform }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
            <h2 className="m-0 text-lg sm:text-[22px] font-bold text-zinc-950 truncate min-w-0">Self-Titling Code</h2>
            <button type="button" onClick={handleClose} className="bg-transparent border-0 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full cursor-pointer text-muted p-0 touch-manipulation shrink-0 hover:bg-zinc-200 transition-colors" aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {loading && <p className="text-muted">Loading…</p>}
          {!loading && !code && <p className="text-muted">Code not found.</p>}
          {!loading && code && (
            <>
              <p className="m-0 mb-1 text-sm text-muted"><strong>Item tag:</strong> {code.itemTag}</p>
              <p className="m-0 mb-1 text-sm text-muted"><strong>UNS name:</strong> {code.unsName}</p>
              <p className="m-0"><Badge status={code.status} /></p>

              {code.imageUrl && (
                <section className="mt-5">
                  <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Item image</h3>
                  <img
                    src={code.imageUrl}
                    alt={code.itemTag}
                    className="w-full max-w-[240px] h-auto max-h-[240px] object-contain rounded-[8px] border border-[#e4e4e7]"
                  />
                </section>
              )}

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Public profile page</h3>
                <p className="text-sm m-0">
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="break-all">
                    Open item profile
                  </a>
                </p>
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">QR code</h3>
                <QRCodeDisplay value={code.qrUrl} size={160} linkToUrl alt="Item profile QR code" />
                <p className="text-sm mt-2">Links to item profile.</p>
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Public code</h3>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm">{code.publicCode}</code>
                  <CopyIconButton text={code.publicCode} />
                </div>
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Ownership</h3>
                <p className="m-0 text-sm">Status: {code.ownershipStatus ?? "owned"}</p>
              </section>

              <section className="mt-5">
                <h3 className="text-base font-semibold text-zinc-950 m-0 mb-2">Created</h3>
                <p className="m-0 text-sm">{formatTableDate(code.createdAt)}</p>
              </section>

              <section className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setStickerModalOpen(true)}>
                  Export sticker template
                </Button>
                {code.ownershipStatus !== "transferred" && (
                  <Button variant="secondary" onClick={() => setTransferOpen(true)}>
                    Transfer title
                  </Button>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {code && codeId && (
        <TransferTitleModal
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          codeId={codeId}
          itemTag={code.itemTag}
          publicCode={code.publicCode}
          onTransferred={() => setCode((prev) => (prev ? { ...prev, ownershipStatus: "transferred", updatedAt: new Date().toISOString() } : null))}
        />
      )}

      {!loading && code && (
        <StickerExportModal
          open={stickerModalOpen}
          onClose={() => setStickerModalOpen(false)}
          variant="self-titling"
        />
      )}
    </>
  );
}
