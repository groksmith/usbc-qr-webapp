import React from "react";
import { QRCodeSVG } from "qrcode.react";
import usbcIcon from "../../assets/images/usbc-icon.svg";

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

/** Logo overlay size as fraction of QR size (~18%); kept small so the QR stays fully scannable */
const LOGO_SIZE_RATIO = 0.18;

/**
 * Renders a QR code from a URL (e.g. Value Embed qrUrl) with USBC icon in the center.
 * Reusable for detail page and sticker preview.
 */
export function QRCodeDisplay({
  value,
  size = 160,
  linkToUrl = false,
  alt = "QR code",
}: QRCodeDisplayProps): React.ReactElement {
  const logoBoxSize = Math.round(size * LOGO_SIZE_RATIO);

  const qrWithLogo = (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={false}
        aria-label={alt}
      />
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded border border-zinc-200 bg-white p-[3px] shadow-sm"
        style={{ width: logoBoxSize, height: logoBoxSize }}
      >
        <img
          src={usbcIcon}
          alt=""
          aria-hidden
          className="h-full w-full object-contain"
        />
      </div>
    </div>
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
        {qrWithLogo}
      </a>
    );
  }

  return (
    <div className={wrapperClass} style={{ width: size, height: size }}>
      {qrWithLogo}
    </div>
  );
}
