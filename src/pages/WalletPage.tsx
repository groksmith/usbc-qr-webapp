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
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl mb-2">Wallet</h1>
      <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as WalletTab)} />

      {loading ? (
        <p>Loading...</p>
      ) : activeTab === "value-embed" ? (
        <div>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3">
            {valueEmbedItems.map((row) => (
              <div
                key={row.id}
                className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-xs"
              >
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-heading">{row.label}</span>
                    <Badge status={row.status} />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-muted">
                    <span><span className="font-medium text-heading">Value:</span> {row.value}</span>
                    <span><span className="font-medium text-heading">Balance:</span> {row.balance}</span>
                    <span><span className="font-medium text-heading">Expiration:</span> {formatTableDate(row.expiration)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e5e7eb]">
                    <Link to={pathToValueEmbedDetail(row.id)}>
                      <Button variant="outline">View details</Button>
                    </Link>
                    <Button variant="outline">Print stickers</Button>
                    {row.status === "redeemed" && (
                      <Button variant="outline">Clear from view</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
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
                        <Button variant="outline">Print stickers</Button>
                        {row.status === "redeemed" && (
                          <Button variant="outline">Clear from view</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {valueEmbedItems.length === 0 && (
            <p className="p-6 text-body-text">No Value Embed tokens in wallet.</p>
          )}
        </div>
      ) : (
        <div>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3">
            {selfTitlingItems.map((row) => (
              <div
                key={row.id}
                className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-xs"
              >
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-heading">{row.itemTag}</span>
                    <Badge status={row.status} />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-muted">
                    <span><span className="font-medium text-heading">UNS name:</span> {row.unsName}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e5e7eb]">
                    <a href={pathToItemProfile(row.publicCode)} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">View item profile</Button>
                    </a>
                    <Link to={pathToSelfTitlingDetail(row.id)}>
                      <Button variant="outline">View details</Button>
                    </Link>
                    <Button variant="outline">Transfer</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
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
          </div>
          {selfTitlingItems.length === 0 && (
            <p className="p-6 text-body-text">No Self-Titling objects in wallet.</p>
          )}
        </div>
      )}
    </div>
  );
}
