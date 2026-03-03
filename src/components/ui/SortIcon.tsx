import React from "react";

export interface SortIconProps {
  /** When set, shows a single arrow in this direction; when undefined, shows both (neutral). */
  direction?: "asc" | "desc";
  /** Chevron color (e.g. black in table headers). Defaults to currentColor. */
  color?: string;
}

export function SortIcon({ direction, color }: SortIconProps): React.ReactElement {
  const isAsc = direction === "asc";
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transform: isAsc ? "rotate(180deg)" : "rotate(0deg)",
        transformOrigin: "center",
        transition: "transform 0.25s ease",
      }}
      aria-hidden
    >
      <path d="m7 15 5 5 5-5" />
    </svg>
  );
}
