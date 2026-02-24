import type { ValueEmbedCodeSet, SelfTitlingCodeSet } from "../../types";

function baseUrl(): string {
  return typeof window !== "undefined" ? window.location.origin : "https://example.com";
}

export const mockValueEmbedCodes: ValueEmbedCodeSet[] = [
  {
    id: "ve-1",
    kind: "value-embed",
    publicCode: "VE-A1B2-C3D4-E5F6",
    label: "Holiday promo 2024",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    qrUrl: `${baseUrl()}/check-balance?code=VE-A1B2-C3D4-E5F6`,
    fundingSourceId: "fs-masked-****1234",
    value: 50,
    balance: 50,
    expiration: "2025-12-31T23:59:59Z",
  },
  {
    id: "ve-2",
    kind: "value-embed",
    publicCode: "VE-X9Y8-Z7W6-V5U4",
    label: "Sample redeemed",
    status: "redeemed",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
    qrUrl: `${baseUrl()}/check-balance?code=VE-X9Y8-Z7W6-V5U4`,
    fundingSourceId: "fs-masked-****5678",
    value: 25,
    balance: 0,
    redemptionStatus: "completed",
    redemptionTimestamp: "2024-02-01T14:30:00Z",
  },
  {
    id: "ve-3",
    kind: "value-embed",
    publicCode: "VE-M1N2-O3P4-Q5R6",
    label: "Expired code",
    status: "expired",
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    qrUrl: `${baseUrl()}/check-balance?code=VE-M1N2-O3P4-Q5R6`,
    fundingSourceId: "fs-masked-****9012",
    value: 10,
    balance: 10,
    expiration: "2024-01-01T00:00:00Z",
  },
];

export const mockSelfTitlingCodes: SelfTitlingCodeSet[] = [
  {
    id: "st-1",
    kind: "self-titling",
    publicCode: "ST-ITEM-001-ABCD",
    label: "Conference badge",
    itemTag: "Conference badge",
    unsName: "alice.uns",
    status: "active",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
    qrUrl: `${baseUrl()}/item/ST-ITEM-001-ABCD`,
    ownershipTokenId: "tok-1",
    ownershipStatus: "owned",
  },
  {
    id: "st-2",
    kind: "self-titling",
    publicCode: "ST-ITEM-002-EFGH",
    label: "Art piece #42",
    itemTag: "Art piece #42",
    unsName: "bob.uns",
    status: "active",
    createdAt: "2024-02-10T11:00:00Z",
    updatedAt: "2024-02-10T11:00:00Z",
    qrUrl: `${baseUrl()}/item/ST-ITEM-002-EFGH`,
    ownershipTokenId: "tok-2",
    ownershipStatus: "owned",
  },
];
