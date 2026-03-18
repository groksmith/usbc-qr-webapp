import type { CodeSetStatus, ItemConditionStatus } from "../types";

export const STATUS_LABELS: Record<CodeSetStatus, string> = {
  active: "Active",
  redeemed: "Redeemed",
  expired: "Expired",
  cancelled: "Cancelled",
  pending_transfer: "Pending transfer",
};

export const STATUS_COLORS: Record<CodeSetStatus, string> = {
  active: "#22c55e",
  redeemed: "#3b82f6",
  expired: "#f59e0b",
  cancelled: "#6b7280",
  pending_transfer: "#8b5cf6",
};

export const ITEM_CONDITION_LABELS: Record<ItemConditionStatus, string> = {
  normal: "Normal",
  lost: "Lost",
  stolen: "Stolen",
};

export const ITEM_CONDITION_COLORS: Record<ItemConditionStatus, string> = {
  normal: "#22c55e",
  lost: "#f59e0b",
  stolen: "#ef4444",
};
