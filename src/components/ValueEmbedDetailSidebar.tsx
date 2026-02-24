import React, { useEffect, useState } from "react";
import { getValueEmbedCodeById, cancelValueEmbedCode } from "../services/api";
import type { ValueEmbedCodeSet } from "../types";
import {
  Button,
  Badge,
  CopyButton,
  StickerExportModal,
  QRCodeDisplay,
} from "./ui";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(147, 197, 213, 0.45)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "flex-end",
  zIndex: 1000,
};

const SIDEBAR_TRANSITION_MS = 300;

const shellStyleBase: React.CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  borderRadius: "24px 0 0 24px",
  background: "linear-gradient(135deg, rgba(193, 220, 230, 0.65), rgba(210, 232, 240, 0.55))",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "none",
  outline: "none",
  boxShadow: "-4px 0 48px rgba(0,0,0,0.06)",
  padding: "24px 28px 28px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: `transform ${SIDEBAR_TRANSITION_MS}ms ease-out`,
};

const innerCardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "28px 36px 36px",
  flex: "1 1 auto",
  overflow: "auto",
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 700,
  color: "#09090b",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#64748b",
  fontSize: "24px",
  lineHeight: 1,
  padding: 0,
};

const sectionStyle: React.CSSProperties = {
  marginTop: "20px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#09090b",
  margin: "0 0 8px",
};

export interface ValueEmbedDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  codeId: string | null;
}

export function ValueEmbedDetailSidebar({
  open,
  onClose,
  codeId,
}: ValueEmbedDetailSidebarProps): React.ReactElement {
  const [code, setCode] = useState<ValueEmbedCodeSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealPrivate, setRevealPrivate] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);
  const [slideEntered, setSlideEntered] = useState(false);
  const [slideClosing, setSlideClosing] = useState(false);

  useEffect(() => {
    if (!open) {
      setSlideEntered(false);
      setSlideClosing(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const handleClose = (): void => {
    setSlideClosing(true);
    setTimeout(() => onClose(), SIDEBAR_TRANSITION_MS);
  };

  useEffect(() => {
    if (!open || !codeId) {
      setCode(null);
      return;
    }
    setLoading(true);
    setRevealPrivate(false);
    setCancelConfirm(false);
    getValueEmbedCodeById(codeId).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [open, codeId]);

  const handleCancel = async (): Promise<void> => {
    if (!codeId) return;
    setCancelling(true);
    await cancelValueEmbedCode(codeId);
    setCancelConfirm(false);
    setCode((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    setCancelling(false);
  };

  if (!open) return <></>;

  const shellTransform = slideClosing || !slideEntered ? "translateX(100%)" : "translateX(0)";

  return (
    <>
      <div style={overlayStyle} onClick={handleClose} role="dialog" aria-modal="true" aria-label="Value Embed code detail">
        <div style={{ ...shellStyleBase, transform: shellTransform }} onClick={(e) => e.stopPropagation()}>
          <div style={innerCardStyle}>
            <div style={headerRowStyle}>
              <h2 style={titleStyle}>Value Embed Code</h2>
              <button type="button" onClick={handleClose} style={closeBtnStyle} aria-label="Close">
                ×
              </button>
            </div>

            {loading && <p style={{ color: "#64748b" }}>Loading…</p>}
            {!loading && !code && <p style={{ color: "#64748b" }}>Code not found.</p>}
            {!loading && code && (
              <>
                <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#64748b" }}>
                  <strong>Description tag:</strong> {code.label}
                </p>
                <p style={{ margin: 0 }}><Badge status={code.status} /></p>

                <section style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>QR code</h3>
                  <QRCodeDisplay value={code.qrUrl} size={160} linkToUrl alt="Value Embed QR code" />
                  <p style={{ fontSize: "14px", marginTop: "8px" }}>
                    <a href={code.qrUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>{code.qrUrl}</a>
                  </p>
                </section>

                <section style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Public code</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <code style={{ fontFamily: "monospace", fontSize: "14px" }}>{code.publicCode}</code>
                    <CopyButton text={code.publicCode} />
                  </div>
                </section>

                <section style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Private code</h3>
                  {revealPrivate ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <code style={{ fontFamily: "monospace", fontSize: "14px" }}>{code.privateCode ?? "—"}</code>
                      <CopyButton text={code.privateCode ?? ""} />
                    </div>
                  ) : (
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
                  )}
                </section>

                <section style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Value & balance</h3>
                  <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
                    A wallet is generated for this code pair and holds the assigned funds until redemption or return to source.
                  </p>
                  <p style={{ margin: 0, fontSize: "14px" }}>Value: {code.value} · Balance: {code.balance}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "14px" }}>Funding source: {code.fundingSourceId}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
                    Expiration: {code.expiration ? new Date(code.expiration).toLocaleString() : "None"}
                  </p>
                </section>

                <section style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Status timeline</h3>
                  <p style={{ margin: 0, fontSize: "14px" }}>Created: {new Date(code.createdAt).toLocaleString()}</p>
                  {code.redemptionTimestamp && (
                    <p style={{ margin: "4px 0 0", fontSize: "14px" }}>Redeemed: {new Date(code.redemptionTimestamp).toLocaleString()}</p>
                  )}
                </section>

                <section style={{ ...sectionStyle, display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <Button variant="outline" onClick={() => setStickerModalOpen(true)}>
                    Export sticker template
                  </Button>
                  {code.status === "active" && (
                    <>
                      {!cancelConfirm ? (
                        <Button variant="secondary" onClick={() => setCancelConfirm(true)}>
                          Cancel code
                        </Button>
                      ) : (
                        <>
                          <span style={{ fontSize: "14px", width: "100%" }}>Value returns to source. Confirm?</span>
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

                <p style={{ marginTop: "16px", fontSize: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <a href={`${window.location.origin}/check-balance?code=${encodeURIComponent(code.publicCode)}`} target="_blank" rel="noopener noreferrer">
                    View public check balance page
                  </a>
                  {code.status === "active" && (
                    <a href={`${window.location.origin}/redeem?code=${encodeURIComponent(code.publicCode)}`} target="_blank" rel="noopener noreferrer">
                      Redeem (private code required)
                    </a>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {!loading && code && (
        <>
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
        </>
      )}
    </>
  );
}
