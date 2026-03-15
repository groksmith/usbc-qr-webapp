import React from "react";
import { CloseIcon } from "./CloseIcon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Use "confirmation" for narrow confirmation dialogs (max-w-96). */
  size?: "default" | "confirmation";
}

export function Modal({ open, onClose, title, children, size = "default" }: ModalProps): React.ReactElement {
  if (!open) return <></>;
  const innerClass =
    size === "confirmation"
      ? "bg-white rounded-card-inner pt-4 px-4 pb-6 sm:pt-7 sm:px-8 sm:pb-8 max-w-96 w-full max-h-[90vh] overflow-auto shadow-elevated mx-2 sm:mx-0"
      : "bg-white rounded-card-inner pt-4 px-4 pb-6 sm:pt-7 sm:px-8 sm:pb-8 max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] overflow-auto shadow-elevated mx-2 sm:mx-0";
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={innerClass}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-2 mb-4">
          <h2 id="modal-title" className="m-0 text-lg sm:text-xl font-semibold truncate min-w-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 cursor-pointer text-body-text shrink-0 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full touch-manipulation hover:bg-zinc-200 transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
