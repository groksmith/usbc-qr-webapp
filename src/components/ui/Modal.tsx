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
        className="bg-white rounded-card-inner pt-4 px-4 pb-6 sm:pt-7 sm:px-8 sm:pb-8 max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] overflow-auto shadow-elevated mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-2 mb-4">
          <h2 id="modal-title" className="m-0 text-lg sm:text-xl truncate min-w-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 text-2xl cursor-pointer text-body-text leading-none shrink-0 w-8 h-8 flex items-center justify-center touch-manipulation"
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
