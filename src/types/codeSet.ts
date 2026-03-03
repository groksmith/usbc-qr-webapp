/**
 * Shared domain types for Code Sets (Value Embed and Self-Titling).
 */

export type CodeSetStatus =
  | "active"
  | "redeemed"
  | "expired"
  | "cancelled"
  | "pending_transfer";

export interface CodeSetBase {
  id: string;
  publicCode: string;
  /** Omitted in list/detail until explicitly revealed (security). */
  privateCode?: string;
  label: string;
  status: CodeSetStatus;
  createdAt: string;
  updatedAt: string;
  qrUrl: string;
}

export interface ValueEmbedCodeSet extends CodeSetBase {
  kind: "value-embed";
  fundingSourceId: string;
  value: number;
  balance: number;
  expiration?: string;
  redemptionStatus?: "completed" | "pending";
  redemptionTimestamp?: string;
}

export interface SelfTitlingCodeSet extends CodeSetBase {
  kind: "self-titling";
  itemTag: string;
  unsName: string;
  ownershipTokenId?: string;
  ownershipStatus?: "owned" | "transferred" | "pending_transfer";
}

export type CodeSet = ValueEmbedCodeSet | SelfTitlingCodeSet;

export interface CodeSetListFilters {
  status?: CodeSetStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface CheckBalanceResult {
  publicCode: string;
  balance: number;
  value: number;
  status: CodeSetStatus;
}

export interface RedeemParams {
  publicCode: string;
  privateCode: string;
  unsName: string;
}

export interface RedeemResult {
  success: boolean;
  redeemedAmount?: number;
  destination?: string;
  timestamp?: string;
  error?: string;
}

export interface ItemProfilePublic {
  itemTag: string;
  unsName: string;
  publicCode: string;
  ownerDisplay: string;
  qrUrl: string;
  status: CodeSetStatus;
}

export interface BulkValueEmbedItem {
  value: number;
  expiration?: string;
}

export interface CreateValueEmbedParams {
  descriptionTag: string;
  fundingSourceId: string;
  value: number;
  expiration?: string;
  quantity?: number;
  /** Per-code overrides for bulk creation. When provided, length determines quantity. */
  bulkItems?: BulkValueEmbedItem[];
}

export interface CreateSelfTitlingParams {
  itemTag: string;
  unsName: string;
  quantity?: number;
}
