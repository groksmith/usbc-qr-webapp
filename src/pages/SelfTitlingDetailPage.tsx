import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSelfTitlingCodeById, transferSelfTitling } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import { ROUTES, pathToItemProfile } from "../constants/routes";
import { Button, Badge, Input, CopyButton, StickerExportModal, QRCodeDisplay } from "../components/ui";
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
    return <div className="py-4 text-body-text">{loading ? "Loading…" : "Code not found."}</div>;
  }

  return (
    <div className="min-w-0">
      <div className="mb-4 sm:mb-6">
        <Button variant="outline" onClick={() => navigate(ROUTES.CODES)}>
          Back to dashboard
        </Button>
      </div>
      <h1 className="text-xl sm:text-2xl">Self-Titling Code</h1>
      <p className="mt-1"><strong>Item tag:</strong> {code.itemTag}</p>
      <p><strong>UNS name:</strong> {code.unsName}</p>
      <p><Badge status={code.status} /></p>

      {code.imageUrl && (
        <section className="mt-4 sm:mt-6">
          <h2 className="text-lg font-semibold">Item image</h2>
          <img
            src={code.imageUrl}
            alt={code.itemTag}
            className="mt-2 w-full max-w-[320px] h-auto max-h-[320px] object-contain rounded-[8px] border border-[#e5e7eb]"
          />
        </section>
      )}

      <section className="mt-4 sm:mt-6">
        <h2 className="text-lg font-semibold">Public profile page</h2>
        <p>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            Open item profile
          </a>
        </p>
      </section>

      <section className="mt-4 sm:mt-6">
        <h2 className="text-lg font-semibold">QR code</h2>
        <QRCodeDisplay value={code.qrUrl} size={160} linkToUrl alt="Item profile QR code" />
        <p className="text-sm mt-2">Links to item profile.</p>
      </section>

      <section className="mt-4 sm:mt-6">
        <h2 className="text-lg font-semibold">Public code</h2>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <code className="font-mono text-base sm:text-lg break-all">{code.publicCode}</code>
          <CopyButton text={code.publicCode} />
        </div>
      </section>

      <section className="mt-4 sm:mt-6">
        <h2 className="text-lg font-semibold">Ownership</h2>
        <p>Status: {code.ownershipStatus ?? "owned"}</p>
      </section>

      <section className="mt-4 sm:mt-6 flex flex-wrap gap-3">
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
        <div className="mt-4 sm:mt-6 p-4 border border-[#e5e7eb] rounded-[8px] w-full max-w-[400px]">
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
          <div className="flex gap-2">
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
