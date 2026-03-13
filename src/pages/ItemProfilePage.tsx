import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getItemProfile } from "../services/api";
import type { ItemProfilePublic } from "../types";
import { Badge, QRCodeDisplay, CopyIconButton } from "../components/ui";
import { formatTableDate } from "../utils/date";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-soft p-4 sm:p-6 lg:p-8">
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
            <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-500 text-sm">
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 m-0">
                {profile.itemTag}
              </h1>
              <Badge status={profile.status} />
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-9">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500 m-0">Public code</p>
              <div className="flex items-center gap-2">
                <code className="text-base font-mono font-normal text-zinc-950 whitespace-nowrap">
                  {profile.publicCode}
                </code>
                <CopyIconButton text={profile.publicCode} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500 m-0">Owned by</p>
              <p className="text-base font-normal text-zinc-950 m-0">{profile.ownerDisplay}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500 m-0">Created at</p>
              <p className="text-base font-normal text-zinc-950 m-0">
                {formatTableDate(profile.createdAt)}
              </p>
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
    </div>
  );
}
