import React from "react";
import type { CodeSetStatus } from "../types";
import { Badge, QRCodeDisplay, CopyIconButton } from "./ui";
import { formatTableDate } from "../utils/date";

export interface SelfTitlingItemCardData {
  itemTag: string;
  status: CodeSetStatus;
  publicCode: string;
  ownerDisplay: string;
  qrUrl: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface SelfTitlingItemCardProps {
  data: SelfTitlingItemCardData;
  /** Show "Back to the dashboard" link (authenticated view). */
  showBackLink?: boolean;
  onBack?: () => void;
  /** Show Export Sticker and Transfer CTAs (authenticated view). */
  showCTAs?: boolean;
  onExportSticker?: () => void;
  onTransfer?: () => void;
  showTransferButton?: boolean;
  /** Caption under QR code. */
  qrCaption?: string;
}

export function SelfTitlingItemCard({
  data,
  showBackLink = false,
  onBack,
  showCTAs = false,
  onExportSticker,
  onTransfer,
  showTransferButton = false,
  qrCaption = "QR links to this page",
}: SelfTitlingItemCardProps): React.ReactElement {
  return (
    <div className="max-w-[68rem] mx-auto px-4 sm:px-6">
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-soft p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: Image */}
          <div className="w-full aspect-square max-w-full lg:max-w-none rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={data.itemTag}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-500 text-sm">
                No image
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
                {onExportSticker && (
                  <button
                    type="button"
                    onClick={onExportSticker}
                    className="w-[140px] h-10 px-4 rounded-lg bg-zinc-950 text-white font-medium text-sm whitespace-nowrap border-0 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                  >
                    Export Sticker
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
