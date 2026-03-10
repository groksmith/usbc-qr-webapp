import React, { useEffect, useState } from "react";

export interface CopyIconButtonProps {
  text: string;
  title?: string;
}

export function CopyIconButton({ text, title = "Copy" }: CopyIconButtonProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = (): void => {
    void navigator.clipboard.writeText(text).then(() => setCopied(true));
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied!" : title}
      aria-label={copied ? "Copied!" : title}
      className={`inline-flex items-center justify-center p-1 ml-1.5 bg-transparent border-0 cursor-pointer rounded-[4px] transition-[color,transform] duration-150 ${
        copied ? "text-positive scale-[1.15]" : "text-muted scale-100"
      }`}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}
