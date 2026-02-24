import React from "react";
import { STATUS_COLORS, STATUS_LABELS } from "../../constants/status";
import type { CodeSetStatus } from "../../types";

interface BadgeProps {
  status: CodeSetStatus;
  label?: string;
}

export function Badge({ status, label }: BadgeProps): React.ReactElement {
  const color = STATUS_COLORS[status];
  const text = label ?? STATUS_LABELS[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "14px",
        fontWeight: 600,
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {text}
    </span>
  );
}
