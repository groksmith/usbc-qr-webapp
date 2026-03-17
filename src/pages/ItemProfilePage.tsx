import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getItemProfile } from "../services/api";
import type { ItemProfilePublic } from "../types";
import { SelfTitlingItemCard } from "../components/SelfTitlingItemCard";

/**
 * Public page for a self-titled code (no auth required).
 * Route: /item/:publicCode (e.g. /item/ST-ABC-123)
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
    <SelfTitlingItemCard
      data={{
        itemTag: profile.itemTag,
        status: profile.status,
        publicCode: profile.publicCode,
        ownerDisplay: profile.ownerDisplay,
        qrUrl: profile.qrUrl,
        description: profile.description,
        imageUrl: profile.imageUrl,
        createdAt: profile.createdAt,
      }}
      qrCaption="QR links to this page"
    />
  );
}
