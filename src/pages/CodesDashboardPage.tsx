import React, { useEffect, useMemo, useState } from "react";
import { getValueEmbedCodes, getSelfTitlingCodes } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet, CodeSetStatus } from "../types";
import { Button, Tabs, StickerExportModal, SearchIcon, CopyIconButton } from "../components/ui";
import type { ValueEmbedCodeExportData } from "../components/ui/StickerExportModal";
import { STATUS_LABELS, STATUS_COLORS } from "../constants/status";
import { downloadValueEmbedCsv, downloadSelfTitlingCsv } from "../utils/csvExport";
import { formatTableDate } from "../utils/date";
import csvIcon from "../assets/icons/csv_icon.png";
import { GenerateCodeFlowModal } from "../components/GenerateCodeFlowModal";
import { ValueEmbedDetailSidebar } from "../components/ValueEmbedDetailSidebar";
import { SelfTitlingDetailSidebar } from "../components/SelfTitlingDetailSidebar";
import { TransferTitleModal } from "../components/TransferTitleModal";

type DashboardTab = "value-embed" | "self-titling";

const PAGE_SIZE = 10;

type ValueEmbedSortColumn = "label" | "publicCode" | "value" | "status" | "createdAt" | "expiration";
type SelfTitlingSortColumn = "itemTag" | "unsName" | "publicCode" | "status" | "createdAt";
type SortDirection = "asc" | "desc";

const thClass = "p-4 px-5 text-left bg-[#F8FAFA] text-muted font-semibold text-sm border-b border-[#EEF2F2]";
const sortableThClass = `${thClass} cursor-pointer select-none`;
const tdClass = "p-4 px-5 text-sm text-heading";
const actionBtnClass = "bg-transparent border-0 text-zinc-950 cursor-pointer p-0 font-sans text-sm";
const paginationBtnClass = "py-1.5 px-3.5 text-sm rounded-[8px] border border-[#d1d5db] bg-[#f3f4f6] cursor-pointer text-[#4b5563]";

export function CodesDashboardPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<DashboardTab>("value-embed");
  const [valueEmbedList, setValueEmbedList] = useState<ValueEmbedCodeSet[]>([]);
  const [selfTitlingList, setSelfTitlingList] = useState<SelfTitlingCodeSet[]>([]);
  const [statusFilter, setStatusFilter] = useState<CodeSetStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);
  const [stickerValueEmbedCode, setStickerValueEmbedCode] = useState<ValueEmbedCodeExportData | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [viewDetailCodeId, setViewDetailCodeId] = useState<string | null>(null);
  const [viewDetailSelfTitlingId, setViewDetailSelfTitlingId] = useState<string | null>(null);
  const [transferModal, setTransferModal] = useState<{ codeId: string; itemTag: string; publicCode: string } | null>(null);
  const [valueEmbedSort, setValueEmbedSort] = useState<{ column: ValueEmbedSortColumn; direction: SortDirection }>({
    column: "createdAt",
    direction: "desc",
  });
  const [selfTitlingSort, setSelfTitlingSort] = useState<{ column: SelfTitlingSortColumn; direction: SortDirection }>({
    column: "createdAt",
    direction: "desc",
  });
  const [valueEmbedPage, setValueEmbedPage] = useState(1);
  const [selfTitlingPage, setSelfTitlingPage] = useState(1);

  useEffect(() => {
    setValueEmbedPage(1);
    setSelfTitlingPage(1);
  }, [statusFilter, search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      getValueEmbedCodes({ status: statusFilter || undefined, search: search || undefined }),
      getSelfTitlingCodes({ status: statusFilter || undefined, search: search || undefined }),
    ]).then(([ve, st]) => {
      if (!cancelled) {
        setValueEmbedList(ve);
        setSelfTitlingList(st);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [statusFilter, search]);

  const sortValueEmbed = (list: ValueEmbedCodeSet[], col: ValueEmbedSortColumn, dir: SortDirection): ValueEmbedCodeSet[] => {
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (col === "value") cmp = a.value - b.value;
      else if (col === "createdAt" || col === "expiration")
        cmp = new Date(a[col] ?? 0).getTime() - new Date(b[col] ?? 0).getTime();
      else cmp = String(a[col as keyof ValueEmbedCodeSet] ?? "").localeCompare(String(b[col as keyof ValueEmbedCodeSet] ?? ""));
      return dir === "asc" ? cmp : -cmp;
    });
  };
  const sortSelfTitling = (list: SelfTitlingCodeSet[], col: SelfTitlingSortColumn, dir: SortDirection): SelfTitlingCodeSet[] => {
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (col === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else cmp = String(a[col] ?? "").localeCompare(String(b[col] ?? ""));
      return dir === "asc" ? cmp : -cmp;
    });
  };

  const sortedValueEmbedList = useMemo(
    () => sortValueEmbed(valueEmbedList, valueEmbedSort.column, valueEmbedSort.direction),
    [valueEmbedList, valueEmbedSort]
  );
  const sortedSelfTitlingList = useMemo(
    () => sortSelfTitling(selfTitlingList, selfTitlingSort.column, selfTitlingSort.direction),
    [selfTitlingList, selfTitlingSort]
  );

  const valueEmbedTotalPages = Math.max(1, Math.ceil(sortedValueEmbedList.length / PAGE_SIZE));
  const selfTitlingTotalPages = Math.max(1, Math.ceil(sortedSelfTitlingList.length / PAGE_SIZE));

  const paginatedValueEmbedList = useMemo(
    () => sortedValueEmbedList.slice((valueEmbedPage - 1) * PAGE_SIZE, valueEmbedPage * PAGE_SIZE),
    [sortedValueEmbedList, valueEmbedPage]
  );
  const paginatedSelfTitlingList = useMemo(
    () => sortedSelfTitlingList.slice((selfTitlingPage - 1) * PAGE_SIZE, selfTitlingPage * PAGE_SIZE),
    [sortedSelfTitlingList, selfTitlingPage]
  );

  const handleValueEmbedSort = (column: ValueEmbedSortColumn): void => {
    setValueEmbedSort((prev) => ({
      column,
      direction: prev.column === column ? (prev.direction === "asc" ? "desc" : "asc") : "desc",
    }));
  };
  const handleSelfTitlingSort = (column: SelfTitlingSortColumn): void => {
    setSelfTitlingSort((prev) => ({
      column,
      direction: prev.column === column ? (prev.direction === "asc" ? "desc" : "asc") : "desc",
    }));
  };

  const tabs = [
    { id: "value-embed" as const, label: "Value Embed" },
    { id: "self-titling" as const, label: "Self-Titling" },
  ];

  const getRowClass = (index: number): string =>
    `border-b border-[#EEF2F2] ${index % 2 === 0 ? "bg-white" : "bg-[#F8FCFC]"}`;

  return (
    <div>
      <div className="card bg-white/95 p-8 px-10 pb-10">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
          <h1 className="m-0 text-2xl">Codes Dashboard</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="select-chevron-right h-11 box-border text-sm rounded-card border border-[#E0E0E0] outline-none bg-white px-3.5"
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value || "") as CodeSetStatus | "")}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending_transfer">Pending transfer</option>
            </select>
            <div className="relative inline-flex items-center">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 scale-[0.8] text-gray-400 pointer-events-none flex items-center justify-center"
                aria-hidden
              >
                <SearchIcon />
              </span>
              <input
                type="search"
                placeholder="Search by tag or code... (press Enter to search)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput.trim());
                }}
                className="h-11 py-0 pr-3.5 pl-10 box-border text-sm rounded-card border border-[#E0E0E0] outline-none bg-white min-w-[220px]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (activeTab === "value-embed") downloadValueEmbedCsv(valueEmbedList);
                else downloadSelfTitlingCsv(selfTitlingList);
              }}
              title="Download CSV"
              aria-label="Download CSV"
              className="h-11 w-[165px] px-4 rounded-card border border-[#dcdcdc] outline-none bg-white text-[#1e1e1e] text-sm font-semibold font-sans inline-flex items-center justify-center gap-[10px] cursor-pointer box-border"
            >
              <img src={csvIcon} alt="" width={18} height={18} className="block flex-shrink-0" />
              <span>Download csv</span>
            </button>
            <Button onClick={() => setGenerateModalOpen(true)} className="h-11 w-[165px]">
              Generate code
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-0">
          <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as DashboardTab)} variant="dashboard" />
          {loading ? (
            <p className="p-6 m-0">Loading...</p>
          ) : activeTab === "value-embed" ? (
            <div className="overflow-x-auto">
              <div className="overflow-hidden border border-[#E8E8E8] rounded-b-card bg-white shadow-soft">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={sortableThClass} onClick={() => handleValueEmbedSort("label")} aria-sort={valueEmbedSort.column === "label" ? (valueEmbedSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Description tag
                      </th>
                      <th className={sortableThClass} onClick={() => handleValueEmbedSort("publicCode")} aria-sort={valueEmbedSort.column === "publicCode" ? (valueEmbedSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Public code
                      </th>
                      <th className={sortableThClass} onClick={() => handleValueEmbedSort("value")} aria-sort={valueEmbedSort.column === "value" ? (valueEmbedSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Value
                      </th>
                      <th className={sortableThClass} onClick={() => handleValueEmbedSort("status")} aria-sort={valueEmbedSort.column === "status" ? (valueEmbedSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Status
                      </th>
                      <th className={sortableThClass} onClick={() => handleValueEmbedSort("createdAt")} aria-sort={valueEmbedSort.column === "createdAt" ? (valueEmbedSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Created
                      </th>
                      <th className={sortableThClass} onClick={() => handleValueEmbedSort("expiration")} aria-sort={valueEmbedSort.column === "expiration" ? (valueEmbedSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Expiration
                      </th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedValueEmbedList.map((row, index) => (
                      <tr key={row.id} className={getRowClass(index)}>
                        <td className={tdClass}>{row.label}</td>
                        <td className={`${tdClass} font-mono`}>
                          <span className="inline-flex items-center">
                            {row.publicCode}
                            <CopyIconButton text={row.publicCode} />
                          </span>
                        </td>
                        <td className={tdClass}>{row.value} {row.fundingSourceId}</td>
                        <td className={tdClass}>
                          <span style={{ color: STATUS_COLORS[row.status] }} className="font-medium">
                            {STATUS_LABELS[row.status]}
                          </span>
                        </td>
                        <td className={tdClass}>{formatTableDate(row.createdAt)}</td>
                        <td className={tdClass}>{formatTableDate(row.expiration)}</td>
                        <td className={tdClass}>
                          <div className="flex justify-start items-center gap-3 flex-wrap">
                            <button type="button" onClick={() => setViewDetailCodeId(row.id)} className={actionBtnClass}>View</button>
                            <button type="button" onClick={() => { setStickerValueEmbedCode({ publicCode: row.publicCode, privateCode: row.privateCode, qrUrl: row.qrUrl }); setStickerModalOpen(true); }} className={actionBtnClass}>Export</button>
                            {row.status === "active" && (
                              <button type="button" className={actionBtnClass}>Cancel</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedValueEmbedList.length > 0 && (
                  <div className="flex items-center justify-between p-4 px-5 border-t border-[#EEF2F2]">
                    <span className="text-sm text-gray-500">
                      Showing {(valueEmbedPage - 1) * PAGE_SIZE + 1} to{" "}
                      {Math.min(valueEmbedPage * PAGE_SIZE, sortedValueEmbedList.length)} of{" "}
                      {sortedValueEmbedList.length} codes
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`${paginationBtnClass} ${valueEmbedPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => setValueEmbedPage((p) => Math.max(1, p - 1))}
                        disabled={valueEmbedPage <= 1}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className={`${paginationBtnClass} ${valueEmbedPage >= valueEmbedTotalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => setValueEmbedPage((p) => Math.min(valueEmbedTotalPages, p + 1))}
                        disabled={valueEmbedPage >= valueEmbedTotalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {valueEmbedList.length === 0 && (
                <p className="p-6 text-body-text">No Value Embed codes found.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="overflow-hidden border border-[#E8E8E8] rounded-b-card bg-white shadow-soft">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={sortableThClass} onClick={() => handleSelfTitlingSort("itemTag")} aria-sort={selfTitlingSort.column === "itemTag" ? (selfTitlingSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Item tag
                      </th>
                      <th className={sortableThClass} onClick={() => handleSelfTitlingSort("publicCode")} aria-sort={selfTitlingSort.column === "publicCode" ? (selfTitlingSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Public code
                      </th>
                      <th className={sortableThClass} onClick={() => handleSelfTitlingSort("unsName")} aria-sort={selfTitlingSort.column === "unsName" ? (selfTitlingSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        UNS name
                      </th>
                      <th className={sortableThClass} onClick={() => handleSelfTitlingSort("status")} aria-sort={selfTitlingSort.column === "status" ? (selfTitlingSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Status
                      </th>
                      <th className={sortableThClass} onClick={() => handleSelfTitlingSort("createdAt")} aria-sort={selfTitlingSort.column === "createdAt" ? (selfTitlingSort.direction === "asc" ? "ascending" : "descending") : undefined}>
                        Created
                      </th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSelfTitlingList.map((row, index) => (
                      <tr key={row.id} className={getRowClass(index)}>
                        <td className={tdClass}>{row.itemTag}</td>
                        <td className={`${tdClass} font-mono`}>
                          <span className="inline-flex items-center">
                            {row.publicCode}
                            <CopyIconButton text={row.publicCode} />
                          </span>
                        </td>
                        <td className={tdClass}>{row.unsName}</td>
                        <td className={tdClass}>
                          <span style={{ color: STATUS_COLORS[row.status] }} className="font-medium">
                            {STATUS_LABELS[row.status]}
                          </span>
                        </td>
                        <td className={tdClass}>{formatTableDate(row.createdAt)}</td>
                        <td className={tdClass}>
                          <div className="flex justify-start items-center gap-3 flex-wrap">
                            <button type="button" onClick={() => setViewDetailSelfTitlingId(row.id)} className={actionBtnClass}>View</button>
                            <button type="button" onClick={() => { setStickerValueEmbedCode(null); setStickerModalOpen(true); }} className={actionBtnClass}>Export</button>
                            <button type="button" onClick={() => setTransferModal({ codeId: row.id, itemTag: row.itemTag, publicCode: row.publicCode })} className={actionBtnClass}>Transfer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedSelfTitlingList.length > 0 && (
                  <div className="flex items-center justify-between p-4 px-5 border-t border-[#EEF2F2]">
                    <span className="text-sm text-gray-500">
                      Showing {(selfTitlingPage - 1) * PAGE_SIZE + 1} to{" "}
                      {Math.min(selfTitlingPage * PAGE_SIZE, sortedSelfTitlingList.length)} of{" "}
                      {sortedSelfTitlingList.length} codes
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`${paginationBtnClass} ${selfTitlingPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => setSelfTitlingPage((p) => Math.max(1, p - 1))}
                        disabled={selfTitlingPage <= 1}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className={`${paginationBtnClass} ${selfTitlingPage >= selfTitlingTotalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => setSelfTitlingPage((p) => Math.min(selfTitlingTotalPages, p + 1))}
                        disabled={selfTitlingPage >= selfTitlingTotalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {selfTitlingList.length === 0 && (
                <p className="p-6 text-body-text">No Self-Titling codes found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <StickerExportModal
        open={stickerModalOpen}
        onClose={() => { setStickerModalOpen(false); setStickerValueEmbedCode(null); }}
        variant={activeTab}
        valueEmbedCode={activeTab === "value-embed" ? stickerValueEmbedCode ?? undefined : undefined}
      />
      <GenerateCodeFlowModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        defaultCodeType={activeTab}
      />
      <ValueEmbedDetailSidebar
        open={!!viewDetailCodeId}
        onClose={() => setViewDetailCodeId(null)}
        codeId={viewDetailCodeId}
      />
      <SelfTitlingDetailSidebar
        open={!!viewDetailSelfTitlingId}
        onClose={() => setViewDetailSelfTitlingId(null)}
        codeId={viewDetailSelfTitlingId}
      />
      {transferModal && (
        <TransferTitleModal
          open={!!transferModal}
          onClose={() => setTransferModal(null)}
          codeId={transferModal.codeId}
          itemTag={transferModal.itemTag}
          publicCode={transferModal.publicCode}
          onTransferred={() => {
            void Promise.all([
              getSelfTitlingCodes({ status: statusFilter || undefined, search: search || undefined }),
              getValueEmbedCodes({ status: statusFilter || undefined, search: search || undefined }),
            ]).then(([st, ve]) => {
              setSelfTitlingList(st);
              setValueEmbedList(ve);
            });
          }}
        />
      )}
    </div>
  );
}
