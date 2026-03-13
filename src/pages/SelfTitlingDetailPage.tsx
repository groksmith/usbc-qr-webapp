import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSelfTitlingCodeById } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import { ROUTES } from "../constants/routes";
import {
  Badge,
  CopyIconButton,
  StickerExportModal,
  QRCodeDisplay,
} from "../components/ui";
import { TransferTitleModal } from "../components/TransferTitleModal";
import { formatTableDate } from "../utils/date";

export function SelfTitlingDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<SelfTitlingCodeSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSelfTitlingCodeById(id).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [id]);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-soft p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: Image — same as public view */}
          <div className="w-full aspect-square max-w-full lg:max-w-none rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
            {code.imageUrl ? (
              <img
                src={code.imageUrl}
                alt={code.itemTag}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-500 text-sm">
                No image
              </div>
            )}
          </div>

          {/* Right: Details — same structure as ItemProfilePage */}
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
                Self-titled item
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 m-0">
                  {code.itemTag}
                </h1>
                <Badge status={code.status} />
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-9">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Public code</p>
                <div className="flex items-center gap-2">
                  <code className="text-base font-mono font-normal text-zinc-950 whitespace-nowrap">
                    {code.publicCode}
                  </code>
                  <CopyIconButton text={code.publicCode} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Owned by</p>
                <p className="text-base font-normal text-zinc-950 m-0">{code.unsName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Created at</p>
                <p className="text-base font-normal text-zinc-950 m-0">
                  {formatTableDate(code.createdAt)}
                </p>
              </div>
            </div>

            {/* QR code — same as public view */}
            <div className="pt-4 border-t border-zinc-200">
              <p className="text-sm font-medium text-zinc-500 m-0 mb-3">
                Scan to view
              </p>
              <QRCodeDisplay
                value={code.qrUrl}
                size={180}
                linkToUrl
                alt="Item profile QR code"
              />
              <p className="text-xs text-muted mt-2">QR links to item profile</p>
            </div>

            {/* Auth-only CTAs */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStickerModalOpen(true)}
                className="w-[140px] h-10 px-4 rounded-lg bg-zinc-950 text-white font-medium text-sm whitespace-nowrap border-0 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
              >
                Export Sticker
              </button>
              {code.ownershipStatus !== "transferred" && (
                <button
                  type="button"
                  onClick={() => setTransferOpen(true)}
                  className="w-[140px] h-10 px-4 rounded-lg bg-transparent text-zinc-950 font-medium text-sm whitespace-nowrap border border-zinc-950 cursor-pointer hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                >
                  Transfer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {id && (
        <TransferTitleModal
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          codeId={id}
          itemTag={code.itemTag}
          publicCode={code.publicCode}
          onTransferred={() =>
            setCode((previous) =>
              previous
                ? {
                    ...previous,
                    ownershipStatus: "transferred",
                    updatedAt: new Date().toISOString(),
                  }
                : null
            )
          }
        />
      )}

      <StickerExportModal
        open={stickerModalOpen}
        onClose={() => setStickerModalOpen(false)}
        variant="self-titling"
      />
    </div>
  );
}
