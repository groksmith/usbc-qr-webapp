/**
 * API client: all backend-style functions. Replace this module (or its implementations)
 * with real HTTP calls when the backend is ready. Call sites stay the same.
 */
import type {
  ValueEmbedCodeSet,
  SelfTitlingCodeSet,
  CodeSetListFilters,
  CheckBalanceResult,
  RedeemParams,
  RedeemResult,
  ItemProfilePublic,
  CreateValueEmbedParams,
  CreateSelfTitlingParams,
} from "../../types";
import { mockValueEmbedCodes, mockSelfTitlingCodes } from "./mockData";

// In-memory store so create/cancel/transfer persist during session
const valueEmbedStore = [...mockValueEmbedCodes];
const selfTitlingStore = [...mockSelfTitlingCodes];

function filterBySearch<T extends { label: string; publicCode: string }>(
  items: T[],
  search?: string
): T[] {
  if (!search?.trim()) return items;
  const q = search.toLowerCase();
  return items.filter(
    (i) =>
      i.label.toLowerCase().includes(q) || i.publicCode.toLowerCase().includes(q)
  );
}

function filterByStatus<T extends { status: string }>(
  items: T[],
  status?: string
): T[] {
  if (!status) return items;
  return items.filter((i) => i.status === status);
}

/** In mock: treat past-expiration active codes as expired; funds returned to source implied. */
function normalizeValueEmbedExpiration(
  code: ValueEmbedCodeSet
): ValueEmbedCodeSet {
  if (
    code.status !== "active" ||
    !code.expiration ||
    new Date(code.expiration) >= new Date()
  )
    return code;
  return {
    ...code,
    status: "expired",
    balance: 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getValueEmbedCodes(
  filters?: CodeSetListFilters
): Promise<ValueEmbedCodeSet[]> {
  await delay();
  let list = valueEmbedStore.map(normalizeValueEmbedExpiration);
  list = filterByStatus(list, filters?.status);
  list = filterBySearch(list, filters?.search);
  return list;
}

export async function getSelfTitlingCodes(
  filters?: CodeSetListFilters
): Promise<SelfTitlingCodeSet[]> {
  await delay();
  let list = [...selfTitlingStore];
  list = filterByStatus(list, filters?.status);
  list = filterBySearch(list, filters?.search);
  return list;
}

export async function getValueEmbedCodeById(
  id: string
): Promise<ValueEmbedCodeSet | null> {
  await delay();
  const code = valueEmbedStore.find((c) => c.id === id) ?? null;
  return code ? normalizeValueEmbedExpiration(code) : null;
}

export async function getSelfTitlingCodeById(
  id: string
): Promise<SelfTitlingCodeSet | null> {
  await delay();
  return selfTitlingStore.find((c) => c.id === id) ?? null;
}

export async function createValueEmbedCodes(
  params: CreateValueEmbedParams
): Promise<{ codes: ValueEmbedCodeSet[] }> {
  await delay();
  const hasBulk = params.bulkItems && params.bulkItems.length > 0;
  const quantity = hasBulk ? params.bulkItems!.length : (params.quantity ?? 1);
  const codes: ValueEmbedCodeSet[] = [];
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://example.com";

  for (let i = 0; i < quantity; i++) {
    const itemValue = hasBulk ? params.bulkItems![i].value : params.value;
    const itemExpiration = hasBulk ? params.bulkItems![i].expiration : params.expiration;
    const id = `ve-new-${Date.now()}-${i}`;
    const publicCode = `VE-NEW-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
    const privateCode = `priv-${randomSegment()}-${randomSegment()}`;
    const now = new Date().toISOString();
    const code: ValueEmbedCodeSet = {
      id,
      kind: "value-embed",
      publicCode,
      privateCode,
      label: quantity > 1 ? `${params.descriptionTag} #${i + 1}` : params.descriptionTag,
      status: "active",
      createdAt: now,
      updatedAt: now,
      qrUrl: `${baseUrl}/check-balance?code=${encodeURIComponent(publicCode)}`,
      fundingSourceId: params.fundingSourceId,
      value: itemValue,
      balance: itemValue,
      expiration: itemExpiration,
    };
    codes.push(code);
    valueEmbedStore.push(code);
  }
  return { codes };
}

export async function createSelfTitlingCodes(
  params: CreateSelfTitlingParams
): Promise<{ codes: SelfTitlingCodeSet[] }> {
  await delay();
  const quantity = params.quantity ?? 1;
  const codes: SelfTitlingCodeSet[] = [];
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://example.com";

  for (let i = 0; i < quantity; i++) {
    const id = `st-new-${Date.now()}-${i}`;
    const publicCode = `ST-${randomSegment()}-${randomSegment()}`;
    const now = new Date().toISOString();
    const itemTag = quantity > 1 ? `${params.itemTag} #${i + 1}` : params.itemTag;
    const code: SelfTitlingCodeSet = {
      id,
      kind: "self-titling",
      publicCode,
      label: itemTag,
      itemTag,
      unsName: params.unsName,
      imageUrl: params.imageUrl,
      status: "active",
      createdAt: now,
      updatedAt: now,
      qrUrl: `${baseUrl}/item/${encodeURIComponent(publicCode)}`,
      ownershipStatus: "owned",
    };
    codes.push(code);
    selfTitlingStore.push(code);
  }
  return { codes };
}

export async function cancelValueEmbedCode(id: string): Promise<void> {
  await delay();
  const idx = valueEmbedStore.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const updated = { ...valueEmbedStore[idx], status: "cancelled" as const };
  valueEmbedStore[idx] = updated;
}

export interface UpdateValueEmbedParams {
  value: number;
  expiration?: string | null;
}

export async function updateValueEmbedCode(
  id: string,
  params: UpdateValueEmbedParams
): Promise<void> {
  await delay();
  const idx = valueEmbedStore.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const current = valueEmbedStore[idx];
  const balance = Math.min(current.balance, params.value);
  const updated: ValueEmbedCodeSet = {
    ...current,
    value: params.value,
    balance,
    expiration: params.expiration ?? undefined,
    updatedAt: new Date().toISOString(),
  };
  valueEmbedStore[idx] = updated;
}

export async function transferSelfTitling(
  id: string,
  _recipient: string
): Promise<void> {
  await delay();
  const index = selfTitlingStore.findIndex((c) => c.id === id);
  if (index === -1) return;
  const updated = {
    ...selfTitlingStore[index],
    ownershipStatus: "transferred" as const,
    status: "active" as const,
    updatedAt: new Date().toISOString(),
  };
  selfTitlingStore[index] = updated;
}

export async function checkBalance(publicCode: string): Promise<CheckBalanceResult | null> {
  await delay();
  const ve = valueEmbedStore.find((c) => c.publicCode === publicCode);
  if (!ve) return null;
  const normalized = normalizeValueEmbedExpiration(ve);
  return {
    publicCode: normalized.publicCode,
    balance: normalized.balance,
    value: normalized.value,
    status: normalized.status,
  };
}

export async function redeem(params: RedeemParams): Promise<RedeemResult> {
  await delay();
  const ve = valueEmbedStore.find((c) => c.publicCode === params.publicCode);
  if (!ve)
    return { success: false, error: "Invalid or unknown code." };
  if (ve.privateCode !== params.privateCode)
    return { success: false, error: "Invalid private code." };
  if (ve.status !== "active")
    return { success: false, error: `Code is ${ve.status}; cannot redeem.` };
  const idx = valueEmbedStore.findIndex((c) => c.id === ve.id);
  const updated: ValueEmbedCodeSet = {
    ...ve,
    balance: 0,
    status: "redeemed",
    redemptionStatus: "completed",
    redemptionTimestamp: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  valueEmbedStore[idx] = updated;
  return {
    success: true,
    redeemedAmount: ve.balance,
    destination: params.unsName,
    timestamp: updated.redemptionTimestamp,
  };
}

export async function getItemProfile(publicCode: string): Promise<ItemProfilePublic | null> {
  await delay();
  const st = selfTitlingStore.find((c) => c.publicCode === publicCode);
  if (!st) return null;
  return {
    itemTag: st.itemTag,
    unsName: st.unsName,
    publicCode: st.publicCode,
    ownerDisplay: st.unsName,
    qrUrl: st.qrUrl,
    imageUrl: st.imageUrl,
    status: st.status,
    createdAt: st.createdAt,
  };
}

export async function getValueEmbedWalletItems(): Promise<ValueEmbedCodeSet[]> {
  return getValueEmbedCodes({});
}

export async function getSelfTitlingWalletItems(): Promise<SelfTitlingCodeSet[]> {
  return getSelfTitlingCodes({});
}

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSegment(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}
