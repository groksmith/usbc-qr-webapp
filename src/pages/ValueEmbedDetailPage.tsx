import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getValueEmbedCodeById, cancelValueEmbedCode } from "../services/api";
import type { ValueEmbedCodeSet } from "../types";
import { ROUTES } from "../constants/routes";
import {
  Badge,
  CopyIconButton,
  StickerPrintModal,
  QRCodeDisplay,
  Modal,
  Button,
} from "../components/ui";
import { formatTableDate } from "../utils/date";

export function ValueEmbedDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<ValueEmbedCodeSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealPrivate, setRevealPrivate] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getValueEmbedCodeById(id).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleCancel = async (): Promise<void> => {
    if (!id) return;
    setCancelling(true);
    await cancelValueEmbedCode(id);
    setCancelConfirmOpen(false);
    setCode((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    setCancelling(false);
  };

  const handleRevealPrivate = (): void => {
    if (window.confirm("Reveal private code? It should be kept secure.")) {
      setRevealPrivate(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Loading…</div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Code not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-[68rem] mx-auto px-4 sm:px-6">
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-soft p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: QR code (same visual role as image on self-titling) */}
          <div className="w-full aspect-square max-w-full lg:max-w-none rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center p-6">
            <QRCodeDisplay
              value={code.qrUrl}
              size={280}
              linkToUrl
              alt="Value Embed QR code – scan to check balance or redeem"
            />
          </div>

          {/* Right: Details — same structure as SelfTitlingItemCard */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.CODES)}
                className="inline-flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer text-zinc-950 font-sans text-[0.8rem] hover:underline focus:outline-none focus:underline"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Back to the dashboard</span>
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Value Embed
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 m-0">
                  {code.label}
                </h1>
                <Badge status={code.status} />
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-9">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Public code</p>
                <div className="flex items-center gap-2">
                  <code className="text-base font-mono font-normal text-zinc-950 whitespace-nowrap break-all">
                    {code.publicCode}
                  </code>
                  <CopyIconButton text={code.publicCode} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Value</p>
                <p className="text-base font-normal text-zinc-950 m-0">
                  {code.value} {code.fundingSourceId}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Created at</p>
                <p className="text-base font-normal text-zinc-950 m-0">
                  {formatTableDate(code.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-9">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Value</p>
                <p className="text-base font-normal text-zinc-950 m-0">
                  {code.balance} {code.fundingSourceId}
                </p>
              </div>
              {code.expiration && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-500 m-0">Expiration</p>
                  <p className="text-base font-normal text-zinc-950 m-0">
                    {formatTableDate(code.expiration)}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-200">
              <p className="text-sm font-medium text-zinc-500 m-0 mb-1">Private code</p>
              {revealPrivate ? (
                <div className="flex flex-wrap items-center gap-2">
                  <code className="text-base font-mono font-normal text-zinc-950 break-all">
                    {code.privateCode ?? "—"}
                  </code>
                  <CopyIconButton text={code.privateCode ?? ""} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRevealPrivate}
                  className="text-sm font-medium text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Reveal private code
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStickerModalOpen(true)}
                className="w-[140px] h-10 px-4 rounded-lg bg-zinc-950 text-white font-medium text-sm whitespace-nowrap border-0 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
              >
                Print Sticker
              </button>
              {code.status === "active" && (
                <button
                  type="button"
                  onClick={() => setCancelConfirmOpen(true)}
                  className="w-[140px] h-10 px-4 rounded-lg bg-transparent text-zinc-950 font-medium text-sm whitespace-nowrap border border-zinc-950 cursor-pointer hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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

      <Modal
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        title="Cancel code?"
        size="confirmation"
      >
        <p className="text-zinc-700 mb-4">
          Cancel this code? The wallet will send the value back to your funding source and the code will no longer be active.
        </p>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={() => setCancelConfirmOpen(false)}>
            Back
          </Button>
          <Button onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Confirm cancel"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
