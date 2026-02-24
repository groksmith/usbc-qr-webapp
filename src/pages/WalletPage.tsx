import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getValueEmbedWalletItems, getSelfTitlingWalletItems } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet } from "../types";
import { pathToValueEmbedDetail, pathToSelfTitlingDetail, pathToItemProfile } from "../constants/routes";
import { Tabs, Badge, Button } from "../components/ui";

type WalletTab = "value-embed" | "self-titling";

export function WalletPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<WalletTab>("value-embed");
  const [valueEmbedItems, setValueEmbedItems] = useState<ValueEmbedCodeSet[]>([]);
  const [selfTitlingItems, setSelfTitlingItems] = useState<SelfTitlingCodeSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([getValueEmbedWalletItems(), getSelfTitlingWalletItems()]).then(
      ([ve, st]) => {
        if (!cancelled) {
          setValueEmbedItems(ve);
          setSelfTitlingItems(st);
          setLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: "value-embed" as const, label: "Value Embed" },
    { id: "self-titling" as const, label: "Self Titling" },
  ];

  return (
    <div>
      <h1>Wallet</h1>
      <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as WalletTab)} />

      {loading ? (
        <p>Loading...</p>
      ) : activeTab === "value-embed" ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-body)", textAlign: "left" }}>
                <th style={{ padding: "12px 8px" }}>Description</th>
                <th style={{ padding: "12px 8px" }}>Value</th>
                <th style={{ padding: "12px 8px" }}>Balance</th>
                <th style={{ padding: "12px 8px" }}>Expiration</th>
                <th style={{ padding: "12px 8px" }}>Status</th>
                <th style={{ padding: "12px 8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {valueEmbedItems.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 8px" }}>{row.label}</td>
                  <td style={{ padding: "12px 8px" }}>{row.value}</td>
                  <td style={{ padding: "12px 8px" }}>{row.balance}</td>
                  <td style={{ padding: "12px 8px" }}>
                    {row.expiration
                      ? new Date(row.expiration).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <Badge status={row.status} />
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Link to={pathToValueEmbedDetail(row.id)}>
                        <Button variant="outline">View details</Button>
                      </Link>
                      <Button variant="outline">Export stickers</Button>
                      {row.status === "redeemed" && (
                        <Button variant="outline">Clear from view</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {valueEmbedItems.length === 0 && (
            <p style={{ padding: "24px", color: "var(--color-body)" }}>
              No Value Embed tokens in wallet.
            </p>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-body)", textAlign: "left" }}>
                <th style={{ padding: "12px 8px" }}>Item tag</th>
                <th style={{ padding: "12px 8px" }}>UNS name</th>
                <th style={{ padding: "12px 8px" }}>Status</th>
                <th style={{ padding: "12px 8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selfTitlingItems.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 8px" }}>{row.itemTag}</td>
                  <td style={{ padding: "12px 8px" }}>{row.unsName}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <Badge status={row.status} />
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <a
                        href={pathToItemProfile(row.publicCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline">View item profile</Button>
                      </a>
                      <Link to={pathToSelfTitlingDetail(row.id)}>
                        <Button variant="outline">View details</Button>
                      </Link>
                      <Button variant="outline">Transfer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selfTitlingItems.length === 0 && (
            <p style={{ padding: "24px", color: "var(--color-body)" }}>
              No Self-Titling objects in wallet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
