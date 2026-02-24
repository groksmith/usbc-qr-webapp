import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSelfTitlingCodeById, transferSelfTitling } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import { ROUTES, pathToItemProfile } from "../constants/routes";
import { Button, Badge, Input, CopyButton, StickerExportModal } from "../components/ui";
import { validateUnsName, UNS_NAME_HINT } from "../utils/validation";

export function SelfTitlingDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<SelfTitlingCodeSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [recipientError, setRecipientError] = useState<string | undefined>();
  const [transferring, setTransferring] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSelfTitlingCodeById(id).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleTransfer = async (): Promise<void> => {
    if (!id) return;
    const validation = validateUnsName(recipient);
    if (!validation.valid) {
      setRecipientError(validation.message);
      return;
    }
    setRecipientError(undefined);
    setTransferring(true);
    await transferSelfTitling(id, recipient.trim());
    setTransferOpen(false);
    setRecipient("");
    setCode((prev) =>
      prev ? { ...prev, ownershipStatus: "transferred", updatedAt: new Date().toISOString() } : null
    );
    setTransferring(false);
  };

  const profileUrl = code ? pathToItemProfile(code.publicCode) : "";

  if (loading || !code) {
    return <div>{loading ? "Loading…" : "Code not found."}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Button variant="outline" onClick={() => navigate(ROUTES.CODES)}>
          Back to dashboard
        </Button>
      </div>
      <h1>Self-Titling Code</h1>
      <p><strong>Item tag:</strong> {code.itemTag}</p>
      <p><strong>UNS name:</strong> {code.unsName}</p>
      <p><Badge status={code.status} /></p>

      <section style={{ marginTop: "24px" }}>
        <h2>Public profile page</h2>
        <p>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            Open item profile
          </a>
        </p>
      </section>

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
        <p style={{ fontSize: "14px", marginTop: "8px" }}>Links to item profile.</p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Public code</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <code style={{ fontFamily: "monospace", fontSize: "18px" }}>{code.publicCode}</code>
          <CopyButton text={code.publicCode} />
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Ownership</h2>
        <p>Status: {code.ownershipStatus ?? "owned"}</p>
      </section>

      <section style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button variant="outline" onClick={() => setStickerModalOpen(true)}>
          Export sticker template
        </Button>
        {code.ownershipStatus !== "transferred" && (
          <Button variant="secondary" onClick={() => setTransferOpen(true)}>
            Transfer title
          </Button>
        )}
      </section>

      {transferOpen && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            maxWidth: "400px",
          }}
        >
          <h3>Transfer title</h3>
          <Input
            label="Recipient (UNS name)"
            required
            hint={UNS_NAME_HINT}
            value={recipient}
            onChange={(e) => { setRecipient(e.target.value); setRecipientError(undefined); }}
            placeholder="e.g. bob.uns"
            error={recipientError}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={handleTransfer} disabled={transferring}>
              {transferring ? "Transferring…" : "Confirm transfer"}
            </Button>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <StickerExportModal
        open={stickerModalOpen}
        onClose={() => setStickerModalOpen(false)}
        variant="self-titling"
      />
    </div>
  );
}
