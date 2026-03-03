import React, { useEffect, useState } from "react";
import { getSelfTitlingCodeById } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import {
  Button,
  Badge,
  CopyIconButton,
  StickerExportModal,
  QRCodeDisplay,
} from "./ui";
import { TransferTitleModal } from "./TransferTitleModal";
import { formatTableDate } from "../utils/date";
import { pathToItemProfile } from "../constants/routes";

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
  background: "#FFFFFF",
  border: "none",
  outline: "none",
  boxShadow: "-4px 0 48px rgba(0,0,0,0.10)",
  padding: "24px 28px 28px",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  transition: `transform ${SIDEBAR_TRANSITION_MS}ms ease-out`,
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

export interface SelfTitlingDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  codeId: string | null;
}

export function SelfTitlingDetailSidebar({
  open,
  onClose,
  codeId,
}: SelfTitlingDetailSidebarProps): React.ReactElement {
  const [code, setCode] = useState<SelfTitlingCodeSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
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
      setTransferOpen(false);
      return;
    }
    setLoading(true);
    getSelfTitlingCodeById(codeId).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [open, codeId]);

  if (!open) return <></>;

  const shellTransform = slideClosing || !slideEntered ? "translateX(100%)" : "translateX(0)";
  const profileUrl = code ? pathToItemProfile(code.publicCode) : "";

  return (
    <>
      <div style={overlayStyle} onClick={handleClose} role="dialog" aria-modal="true" aria-label="Self-Titling code detail">
        <div style={{ ...shellStyleBase, transform: shellTransform }} onClick={(e) => e.stopPropagation()}>
          <div style={headerRowStyle}>
            <h2 style={titleStyle}>Self-Titling Code</h2>
            <button type="button" onClick={handleClose} style={closeBtnStyle} aria-label="Close">
              ×
            </button>
          </div>

          {loading && <p style={{ color: "#64748b" }}>Loading…</p>}
          {!loading && !code && <p style={{ color: "#64748b" }}>Code not found.</p>}
          {!loading && code && (
            <>
              <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#64748b" }}>
                <strong>Item tag:</strong> {code.itemTag}
              </p>
              <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#64748b" }}>
                <strong>UNS name:</strong> {code.unsName}
              </p>
              <p style={{ margin: 0 }}><Badge status={code.status} /></p>

              <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Public profile page</h3>
                <p style={{ fontSize: "14px", margin: 0 }}>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>
                    Open item profile
                  </a>
                </p>
              </section>

              <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>QR code</h3>
                <QRCodeDisplay value={code.qrUrl} size={160} linkToUrl alt="Item profile QR code" />
                <p style={{ fontSize: "14px", marginTop: "8px" }}>Links to item profile.</p>
              </section>

              <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Public code</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <code style={{ fontFamily: "monospace", fontSize: "14px" }}>{code.publicCode}</code>
                  <CopyIconButton text={code.publicCode} />
                </div>
              </section>

              <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Ownership</h3>
                <p style={{ margin: 0, fontSize: "14px" }}>Status: {code.ownershipStatus ?? "owned"}</p>
              </section>

              <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Created</h3>
                <p style={{ margin: 0, fontSize: "14px" }}>{formatTableDate(code.createdAt)}</p>
              </section>

              <section style={{ ...sectionStyle, display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <Button variant="outline" onClick={() => setStickerModalOpen(true)}>
                  Export sticker template
                </Button>
                {code.ownershipStatus !== "transferred" && (
                  <Button variant="secondary" onClick={() => setTransferOpen(true)}>
                    Transfer title
                  </Button>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {code && codeId && (
        <TransferTitleModal
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          codeId={codeId}
          itemTag={code.itemTag}
          publicCode={code.publicCode}
          onTransferred={() => setCode((prev) => (prev ? { ...prev, ownershipStatus: "transferred", updatedAt: new Date().toISOString() } : null))}
        />
      )}

      {!loading && code && (
        <StickerExportModal
          open={stickerModalOpen}
          onClose={() => setStickerModalOpen(false)}
          variant="self-titling"
        />
      )}
    </>
  );
}
