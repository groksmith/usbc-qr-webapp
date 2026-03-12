import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getItemProfile } from "../services/api";
import type { ItemProfilePublic } from "../types";
import { STATUS_LABELS } from "../constants/status";
import { Badge, QRCodeDisplay, CopyIconButton } from "../components/ui";

/**
 * Public page for a self-titled code (no auth required).
 * Route: /item/:publicCode (e.g. /item/ST-ABC-123)
 * OpenSea-style NFT detail: image, name, UNS, owner, QR code.
 */
export function ItemProfilePage(): React.ReactElement {
  const { publicCode } = useParams<{ publicCode: string }>();
  const [profile, setProfile] = useState<ItemProfilePublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicCode) return;
    getItemProfile(decodeURIComponent(publicCode)).then((p) => {
      setProfile(p ?? null);
      setLoading(false);
    });
  }, [publicCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Item not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* OpenSea-style: image + details side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Left: Image */}
        <div className="w-full aspect-square max-w-full lg:max-w-none rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.itemTag}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
              No image
            </div>
          )}
        </div>

        {/* Right: Details card */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Self-titled item
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 m-0">
              {profile.itemTag}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge status={profile.status} />
            <span className="text-sm text-muted">
              {STATUS_LABELS[profile.status]}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-500 m-0">UNS name</p>
            <p className="text-base font-semibold text-zinc-950 m-0">
              {profile.unsName}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-500 m-0">Owned by</p>
            <p className="text-base text-zinc-950 m-0">{profile.ownerDisplay}</p>
          </div>

          <div className="pt-2 border-t border-zinc-200">
            <p className="text-sm font-medium text-zinc-500 m-0 mb-1">
              Public code
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-sm font-mono text-zinc-800 break-all">
                {profile.publicCode}
              </code>
              <CopyIconButton text={profile.publicCode} />
            </div>
          </div>

          {/* QR code */}
          <div className="pt-4 border-t border-zinc-200">
            <p className="text-sm font-medium text-zinc-500 m-0 mb-3">
              Scan to view
            </p>
            <QRCodeDisplay
              value={profile.qrUrl}
              size={180}
              linkToUrl
              alt="Item profile QR code"
            />
            <p className="text-xs text-muted mt-2">
              QR links to this page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
