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
      className="inline-block py-1 px-[10px] rounded-full text-sm font-semibold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {text}
    </span>
  );
}
