import React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import type { CodeSetStatus, OwnershipChange } from "../types";
import { Badge, QRCodeDisplay, CopyIconButton } from "./ui";
import { formatTableDate } from "../utils/date";

export interface SelfTitlingItemCardData {
  itemTag: string;
  status: CodeSetStatus;
  publicCode: string;
  ownerDisplay: string;
  qrUrl: string;
  /** Optional item description; shown under the item name. */
  description?: string;
  /** Log of ownership changes (most-recent last). */
  ownershipHistory?: OwnershipChange[];
  imageUrl?: string;
  createdAt?: string;
}

export interface SelfTitlingItemCardProps {
  data: SelfTitlingItemCardData;
  /** Show "Back to the dashboard" link (authenticated view). */
  showBackLink?: boolean;
  onBack?: () => void;
  /** Show Print Sticker and Transfer CTAs (authenticated view). */
  showCTAs?: boolean;
  onPrintSticker?: () => void;
  onTransfer?: () => void;
  showTransferButton?: boolean;
  /** Caption under QR code. */
  qrCaption?: string;
  /** When set, shows an edit icon in the top-right corner of the card; called when the owner wants to edit the item. */
  onEdit?: () => void;
}

export function SelfTitlingItemCard({
  data,
  showBackLink = false,
  onBack,
  showCTAs = false,
  onPrintSticker,
  onTransfer,
  showTransferButton = false,
  qrCaption = "QR links to this page",
  onEdit,
}: SelfTitlingItemCardProps): React.ReactElement {
  const ownershipHistory =
    data.ownershipHistory ?? [{ owner: data.ownerDisplay, timestamp: data.createdAt ?? new Date().toISOString() }];

  const formatDateTime = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-[68rem] mx-auto px-4 sm:px-6">
      <div className="relative rounded-2xl bg-white border border-zinc-200 shadow-soft p-4 sm:p-6 lg:p-8">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-transparent border-0 text-zinc-500 cursor-pointer hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
            aria-label="Edit item"
          >
            <PencilSquareIcon className="w-5 h-5" aria-hidden />
          </button>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: Image + Ownership history */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square max-w-full lg:max-w-none rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt={data.itemTag}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-500 text-sm">
                  No image
                </div>
              )}
            </div>
            {ownershipHistory.length > 0 && (
              <div className="pt-0">
                <p className="text-sm font-medium text-zinc-500 m-0 mb-3">Ownership history</p>
                <div className="space-y-2">
                  {ownershipHistory.map((h, idx) => (
                    <div key={`${h.owner}-${h.timestamp}-${idx}`} className="flex items-start justify-between gap-3">
                      <span className="text-sm text-zinc-950 font-medium break-all">{h.owner}</span>
                      <span className="text-sm text-zinc-500 whitespace-nowrap">{formatDateTime(h.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-6">
            {showBackLink && onBack && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
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
            )}

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Self-titled item
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 m-0">
                  {data.itemTag}
                </h1>
                <Badge status={data.status} />
              </div>
              {data.description != null && data.description !== "" && (
                <p className="text-base font-normal text-zinc-700 mt-2 mb-0 whitespace-pre-wrap">
                  {data.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-start gap-9">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Public code</p>
                <div className="flex items-center gap-2">
                  <code className="text-base font-mono font-normal text-zinc-950 whitespace-nowrap">
                    {data.publicCode}
                  </code>
                  <CopyIconButton text={data.publicCode} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Owned by</p>
                <p className="text-base font-normal text-zinc-950 m-0">
                  {data.ownerDisplay}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500 m-0">Created at</p>
                <p className="text-base font-normal text-zinc-950 m-0">
                  {formatTableDate(data.createdAt)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <p className="text-sm font-medium text-zinc-500 m-0 mb-3">
                Scan to view
              </p>
              <QRCodeDisplay
                value={data.qrUrl}
                size={180}
                linkToUrl
                alt="Item profile QR code"
              />
              <p className="text-xs text-muted mt-2">{qrCaption}</p>
            </div>

            {showCTAs && (
              <div className="flex flex-wrap gap-2">
                {onPrintSticker && (
                  <button
                    type="button"
                    onClick={onPrintSticker}
                    className="w-[140px] h-10 px-4 rounded-lg bg-zinc-950 text-white font-medium text-sm whitespace-nowrap border-0 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                  >
                    Print Sticker
                  </button>
                )}
                {showTransferButton && onTransfer && (
                  <button
                    type="button"
                    onClick={onTransfer}
                    className="w-[140px] h-10 px-4 rounded-lg bg-transparent text-zinc-950 font-medium text-sm whitespace-nowrap border border-zinc-950 cursor-pointer hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                  >
                    Transfer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
