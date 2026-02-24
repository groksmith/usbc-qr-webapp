import React, { useEffect, useState } from "react";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { CopyButton } from "./CopyButton";

const SIDEBAR_TRANSITION_MS = 300;

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(147, 197, 213, 0.45)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "flex-end",
  zIndex: 1001,
};

const shellStyleBase: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  borderRadius: "20px 0 0 20px",
  background: "linear-gradient(135deg, rgba(193, 220, 230, 0.65), rgba(210, 232, 240, 0.55))",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "none",
  outline: "none",
  boxShadow: "-4px 0 40px rgba(0,0,0,0.10)",
  padding: "20px 24px 24px",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  transition: `transform ${SIDEBAR_TRANSITION_MS}ms ease-out`,
};

const innerCardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "36px 40px 40px",
  flex: "1 1 auto",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
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

const contentWrapStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "320px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

export interface ViewQRCodeSidebarProps {
  open: boolean;
  onClose: () => void;
  /** Page title in the sidebar */
  title?: string;
  /** URL encoded in the QR code */
  qrUrl: string;
  /** Public code to show with copy (optional) */
  publicCode?: string;
  /** Short label/description (optional) */
  label?: string;
}

export function ViewQRCodeSidebar({
  open,
  onClose,
  title = "QR code",
  qrUrl,
  publicCode,
  label,
}: ViewQRCodeSidebarProps): React.ReactElement {
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

  if (!open) return <></>;

  const shellTransform = slideClosing || !slideEntered ? "translateX(100%)" : "translateX(0)";

  return (
    <div
      style={overlayStyle}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        style={{ ...shellStyleBase, transform: shellTransform }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={innerCardStyle}>
          <div style={headerRowStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <button
              type="button"
              onClick={handleClose}
              style={closeBtnStyle}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div style={contentWrapStyle}>
            {label && (
              <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#64748b" }}>
                {label}
              </p>
            )}
            <QRCodeDisplay value={qrUrl} size={200} linkToUrl alt={`QR code – ${title}`} />
            <p style={{ fontSize: "14px", marginTop: "16px", color: "#64748b", wordBreak: "break-all" }}>
              Links to:{" "}
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                {qrUrl}
              </a>
            </p>
            {publicCode && (
              <div style={{ marginTop: "20px", width: "100%", textAlign: "center" }}>
                <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 500, color: "#09090b" }}>
                  Public code
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <code style={{ fontFamily: "monospace", fontSize: "16px" }}>{publicCode}</code>
                  <CopyButton text={publicCode} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
