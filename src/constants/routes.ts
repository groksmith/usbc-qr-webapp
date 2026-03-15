/**
 * Route path constants. Use for navigation and route definitions.
 */
export const ROUTES = {
  HOME: "/",
  CODES: "/codes",
  CODES_VALUE_EMBED_NEW: "/codes/value-embed/new",
  CODES_VALUE_EMBED_DETAIL: "/codes/value-embed/:id",
  CODES_SELF_TITLING_NEW: "/codes/self-titling/new",
  CODES_SELF_TITLING_DETAIL: "/codes/self-titling/:id",
  CHECK_BALANCE: "/check-balance",
  REDEEM: "/redeem",
  ITEM_PROFILE: "/item/:publicCode",
  TRANSFER_HISTORY: "/transfer-history",
} as const;

export function pathToValueEmbedDetail(id: string): string {
  return `/codes/value-embed/${id}`;
}

export function pathToSelfTitlingDetail(id: string): string {
  return `/codes/self-titling/${id}`;
}

export function pathToItemProfile(publicCode: string): string {
  return `/item/${encodeURIComponent(publicCode)}`;
}
