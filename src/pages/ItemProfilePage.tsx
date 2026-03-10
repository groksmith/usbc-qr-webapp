import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getItemProfile } from "../services/api";
import type { ItemProfilePublic } from "../types";
import { STATUS_LABELS } from "../constants/status";
import { Badge } from "../components/ui";

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
    return <div>Loading…</div>;
  }

  if (!profile) {
    return <div>Item not found.</div>;
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <h1>Item profile</h1>
      <p><strong>Item tag:</strong> {profile.itemTag}</p>
      <p><strong>UNS name:</strong> {profile.unsName}</p>
      <p><strong>Ownership:</strong> Owned by {profile.ownerDisplay}</p>
      <p><Badge status={profile.status} /> ({STATUS_LABELS[profile.status]})</p>

      <section className="mt-6">
        <h2>QR code</h2>
        <div className="w-40 h-40 bg-gray-100 flex items-center justify-center rounded-[8px] font-mono text-xs">
          QR placeholder
        </div>
        <p className="text-sm mt-2">
          Public code: <code>{profile.publicCode}</code>
        </p>
      </section>

      <p className="mt-6 text-sm text-body-text">
        This is the public item profile. Transfer history and ownership changes may be shown here
        when supported.
      </p>
    </div>
  );
}
