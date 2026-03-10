import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  /** URL or text to encode in the QR code */
  value: string;
  /** Size in pixels (default 160) */
  size?: number;
  /** If true, wrap the QR in a link to the same URL */
  linkToUrl?: boolean;
  /** Accessible label for the QR image */
  alt?: string;
}

/**
 * Renders a QR code from a URL (e.g. Value Embed qrUrl). Reusable for detail page and sticker preview.
 */
export function QRCodeDisplay({
  value,
  size = 160,
  linkToUrl = false,
  alt = "QR code",
}: QRCodeDisplayProps): React.ReactElement {
  const qr = (
    <QRCodeSVG
      value={value}
      size={size}
      level="M"
      includeMargin={false}
      aria-label={alt}
    />
  );

  const wrapperClass = "flex items-center justify-center rounded-[8px] bg-white";

  if (linkToUrl && value.startsWith("http")) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className={`${wrapperClass} no-underline`}
        style={{ width: size, height: size }}
        aria-label={`${alt} (opens in new tab)`}
      >
        {qr}
      </a>
    );
  }

  return (
    <div className={wrapperClass} style={{ width: size, height: size }}>
      {qr}
    </div>
  );
}
