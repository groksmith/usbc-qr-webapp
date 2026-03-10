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
      className={`flex-shrink-0 transition-transform duration-[250ms] ease-in-out ${isAsc ? "rotate-180" : "rotate-0"}`}
      aria-hidden
    >
      <path d="m7 15 5 5 5-5" />
    </svg>
  );
}
