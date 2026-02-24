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
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <h1>Item profile</h1>
      <p><strong>Item tag:</strong> {profile.itemTag}</p>
      <p><strong>UNS name:</strong> {profile.unsName}</p>
      <p><strong>Ownership:</strong> Owned by {profile.ownerDisplay}</p>
      <p><Badge status={profile.status} /> ({STATUS_LABELS[profile.status]})</p>

      <section style={{ marginTop: "24px" }}>
        <h2>QR code</h2>
        <div
          style={{
            width: "160px",
            height: "160px",
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          QR placeholder
        </div>
        <p style={{ fontSize: "14px", marginTop: "8px" }}>
          Public code: <code>{profile.publicCode}</code>
        </p>
      </section>

      <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--color-body)" }}>
        This is the public item profile. Transfer history and ownership changes may be shown here
        when supported.
      </p>
    </div>
  );
}
