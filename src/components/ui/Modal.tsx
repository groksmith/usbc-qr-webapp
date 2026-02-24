import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps): React.ReactElement {
  if (!open) return <></>;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        style={{
          backgroundColor: "var(--color-secondary)",
          borderRadius: "var(--radius-card-inner)",
          padding: "28px 32px 32px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "var(--shadow-elevated)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 id="modal-title" style={{ margin: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--color-body)",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
