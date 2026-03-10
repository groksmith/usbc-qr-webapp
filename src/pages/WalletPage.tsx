import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getValueEmbedWalletItems, getSelfTitlingWalletItems } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet } from "../types";
import { pathToValueEmbedDetail, pathToSelfTitlingDetail, pathToItemProfile } from "../constants/routes";
import { Tabs, Badge, Button } from "../components/ui";
import { formatTableDate } from "../utils/date";

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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-body-text text-left">
                <th className="p-3 px-2">Description</th>
                <th className="p-3 px-2">Value</th>
                <th className="p-3 px-2">Balance</th>
                <th className="p-3 px-2">Expiration</th>
                <th className="p-3 px-2">Status</th>
                <th className="p-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {valueEmbedItems.map((row) => (
                <tr key={row.id} className="border-b border-[#e5e7eb]">
                  <td className="p-3 px-2">{row.label}</td>
                  <td className="p-3 px-2">{row.value}</td>
                  <td className="p-3 px-2">{row.balance}</td>
                  <td className="p-3 px-2">{formatTableDate(row.expiration)}</td>
                  <td className="p-3 px-2"><Badge status={row.status} /></td>
                  <td className="p-3 px-2">
                    <div className="flex gap-2 flex-wrap">
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
            <p className="p-6 text-body-text">No Value Embed tokens in wallet.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-body-text text-left">
                <th className="p-3 px-2">Item tag</th>
                <th className="p-3 px-2">UNS name</th>
                <th className="p-3 px-2">Status</th>
                <th className="p-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selfTitlingItems.map((row) => (
                <tr key={row.id} className="border-b border-[#e5e7eb]">
                  <td className="p-3 px-2">{row.itemTag}</td>
                  <td className="p-3 px-2">{row.unsName}</td>
                  <td className="p-3 px-2"><Badge status={row.status} /></td>
                  <td className="p-3 px-2">
                    <div className="flex gap-2 flex-wrap">
                      <a href={pathToItemProfile(row.publicCode)} target="_blank" rel="noopener noreferrer">
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
            <p className="p-6 text-body-text">No Self-Titling objects in wallet.</p>
          )}
        </div>
      )}
    </div>
  );
}
