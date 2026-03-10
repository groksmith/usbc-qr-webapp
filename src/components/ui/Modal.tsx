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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-card-inner pt-7 px-8 pb-8 max-w-[90vw] max-h-[90vh] overflow-auto shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="m-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 text-2xl cursor-pointer text-body-text leading-none"
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
