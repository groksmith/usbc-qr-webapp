import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getValueEmbedCodeById, cancelValueEmbedCode } from "../services/api";
import type { ValueEmbedCodeSet } from "../types";
import { ROUTES } from "../constants/routes";
import { Button, Badge, CopyButton, StickerExportModal, QRCodeDisplay } from "../components/ui";

export function ValueEmbedDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<ValueEmbedCodeSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealPrivate, setRevealPrivate] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getValueEmbedCodeById(id).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleCancel = async (): Promise<void> => {
    if (!id) return;
    setCancelling(true);
    await cancelValueEmbedCode(id);
    setCancelConfirm(false);
    setCode((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    setCancelling(false);
  };

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
      <h1>Value Embed Code</h1>
      <p><strong>Description tag:</strong> {code.label}</p>
      <p><Badge status={code.status} /></p>

      <section style={{ marginTop: "24px" }}>
        <h2>QR code</h2>
        <QRCodeDisplay value={code.qrUrl} size={160} linkToUrl alt="Value Embed QR code – scan to check balance or redeem" />
        <p style={{ fontSize: "14px", marginTop: "8px" }}>
          Links to: <a href={code.qrUrl} target="_blank" rel="noopener noreferrer">{code.qrUrl}</a>
        </p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Public code</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <code style={{ fontFamily: "monospace", fontSize: "18px" }}>{code.publicCode}</code>
          <CopyButton text={code.publicCode} />
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Private code</h2>
        {revealPrivate ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <code style={{ fontFamily: "monospace", fontSize: "18px" }}>
              {code.privateCode ?? "—"}
            </code>
            <CopyButton text={code.privateCode ?? ""} />
          </div>
        ) : (
          <div>
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("Reveal private code? It should be kept secure.")) {
                  setRevealPrivate(true);
                }
              }}
            >
              Reveal private code
            </Button>
          </div>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Value & balance</h2>
        <p style={{ marginBottom: "8px" }}>
          A wallet is generated for this code pair and holds the assigned funds until redemption or return to source.
        </p>
        <p>Value assigned: {code.value}</p>
        <p>Current balance: {code.balance}</p>
        <p>Funding source: {code.fundingSourceId}</p>
        <p>Expiration: {code.expiration ? new Date(code.expiration).toLocaleString() : "None"}</p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Status timeline</h2>
        <p>Created: {new Date(code.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(code.updatedAt).toLocaleString()}</p>
        {code.redemptionTimestamp && (
          <p>Redeemed: {new Date(code.redemptionTimestamp).toLocaleString()}</p>
        )}
      </section>

      <section style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button variant="outline" onClick={() => setStickerModalOpen(true)}>
          Export sticker template (2-sticker combo)
        </Button>
        {code.status === "active" && (
          <>
            {!cancelConfirm ? (
              <Button
                variant="secondary"
                onClick={() => setCancelConfirm(true)}
              >
                Cancel code
              </Button>
            ) : (
              <>
                <span>Cancel this code? The wallet will send the value back to your funding source.</span>
                <Button onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? "Cancelling…" : "Confirm cancel"}
                </Button>
                <Button variant="outline" onClick={() => setCancelConfirm(false)}>
                  Back
                </Button>
              </>
            )}
          </>
        )}
      </section>

      <p style={{ marginTop: "16px", fontSize: "14px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <a href={`${window.location.origin}/check-balance?code=${encodeURIComponent(code.publicCode)}`} target="_blank" rel="noopener noreferrer">
          View public check balance page
        </a>
        {code.status === "active" && (
          <a href={`${window.location.origin}/redeem?code=${encodeURIComponent(code.publicCode)}`} target="_blank" rel="noopener noreferrer">
            Redeem (private code required)
          </a>
        )}
      </p>

      <StickerExportModal
        open={stickerModalOpen}
        onClose={() => setStickerModalOpen(false)}
        variant="value-embed"
        valueEmbedCode={{
          publicCode: code.publicCode,
          privateCode: code.privateCode,
          qrUrl: code.qrUrl,
        }}
      />
    </div>
  );
}
