import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getValueEmbedCodes, getSelfTitlingCodes, cancelValueEmbedCode } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet, CodeSetStatus } from "../types";
import { Button, Tabs, StickerPrintModal, SearchIcon, CopyIconButton, Modal } from "../components/ui";
import type { ValueEmbedCodePrintData } from "../components/ui/StickerPrintModal";
import { STATUS_LABELS, STATUS_COLORS } from "../constants/status";
import { downloadValueEmbedCsv, downloadSelfTitlingCsv } from "../utils/csvExport";
import { formatTableDate } from "../utils/date";
import csvIcon from "../assets/icons/csv_icon.png";
import { GenerateCodeFlowModal } from "../components/GenerateCodeFlowModal";
import { EditValueEmbedModal } from "../components/EditValueEmbedModal";
import { EditSelfTitlingModal } from "../components/EditSelfTitlingModal";
import { pathToSelfTitlingDetail, pathToValueEmbedDetail, ROUTES } from "../constants/routes";
import { ValueEmbedDetailSidebar } from "../components/ValueEmbedDetailSidebar";
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
  const [stickerValueEmbedCode, setStickerValueEmbedCode] = useState<ValueEmbedCodePrintData | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const navigate = useNavigate();
  const [viewDetailCodeId, setViewDetailCodeId] = useState<string | null>(null);
  const [valueEmbedMenuRowId, setValueEmbedMenuRowId] = useState<string | null>(null);
  const valueEmbedMenuRef = useRef<HTMLDivElement>(null);
  const [valueEmbedConfirm, setValueEmbedConfirm] = useState<{ action: "redeem" | "cancel"; row: ValueEmbedCodeSet } | null>(null);
  const [selfTitlingMenuRowId, setSelfTitlingMenuRowId] = useState<string | null>(null);
  const selfTitlingMenuRef = useRef<HTMLDivElement>(null);
  const [transferModal, setTransferModal] = useState<{ codeId: string; itemTag: string; publicCode: string } | null>(null);
  const [editValueEmbedRow, setEditValueEmbedRow] = useState<ValueEmbedCodeSet | null>(null);
  const [editSelfTitlingRow, setEditSelfTitlingRow] = useState<SelfTitlingCodeSet | null>(null);
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
    if (!valueEmbedMenuRowId) return;
    const handleClickOutside = (event: MouseEvent): void => {
      if (valueEmbedMenuRef.current && !valueEmbedMenuRef.current.contains(event.target as Node)) {
        setValueEmbedMenuRowId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [valueEmbedMenuRowId]);

  useEffect(() => {
    if (!selfTitlingMenuRowId) return;
    const handleClickOutside = (event: MouseEvent): void => {
      if (selfTitlingMenuRef.current && !selfTitlingMenuRef.current.contains(event.target as Node)) {
        setSelfTitlingMenuRowId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selfTitlingMenuRowId]);

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

  const getRowClass = (): string =>
    "border-b border-[#EEF2F2] bg-white";

  return (
    <div className="min-w-0">
      <div className="card bg-white/95 p-4 sm:p-6 md:p-8 md:px-10 pb-6 md:pb-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="m-0 text-xl sm:text-2xl font-semibold">Codes Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial min-w-0 w-full sm:w-auto sm:min-w-[220px]">
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
                className="h-11 w-full min-w-0 py-0 pr-3.5 pl-10 box-border text-sm rounded-card border border-[#E0E0E0] outline-none bg-white"
              />
            </div>
            <select
              className="select-chevron-right h-11 box-border text-sm rounded-card border border-[#E0E0E0] outline-none bg-white px-3.5 w-full sm:w-[165px] min-w-0"
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
            <button
              type="button"
              onClick={() => {
                if (activeTab === "value-embed") downloadValueEmbedCsv(valueEmbedList);
                else downloadSelfTitlingCsv(selfTitlingList);
              }}
              title="Download CSV"
              aria-label="Download CSV"
              className="h-11 w-full sm:w-[165px] px-4 rounded-card border border-[#dcdcdc] outline-none bg-white text-[#1e1e1e] text-sm font-semibold font-sans inline-flex items-center justify-center gap-[10px] cursor-pointer box-border"
            >
              <img src={csvIcon} alt="" width={18} height={18} className="block flex-shrink-0" />
              <span>Download csv</span>
            </button>
            <div className="h-11 w-full sm:w-[165px] flex">
              <Button onClick={() => setGenerateModalOpen(true)} className="!h-full w-full min-h-0">
                Generate code
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0">
          <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as DashboardTab)} variant="dashboard" />
          {loading ? (
            <p className="p-6 m-0">Loading...</p>
          ) : activeTab === "value-embed" ? (
            <div>
              {/* Mobile: card list */}
              <div className="md:hidden space-y-3">
                {paginatedValueEmbedList.map((row) => (
                  <div
                    key={row.id}
                    className="relative rounded-card border border-[#E8E8E8] bg-white p-4 shadow-soft active:bg-zinc-50 transition-colors"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(pathToValueEmbedDetail(row.id))}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(pathToValueEmbedDetail(row.id)); } }}
                      className="flex flex-col gap-2 text-sm cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-2 pr-8">
                        <span className="font-semibold text-heading">{row.label}</span>
                        <span style={{ color: STATUS_COLORS[row.status] }} className="font-medium shrink-0">
                          {STATUS_LABELS[row.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 text-muted">
                        <span><span className="font-medium text-heading">Public code:</span>{" "}
                          <span className="inline-flex items-center gap-1 font-mono">
                            {row.publicCode}
                            <CopyIconButton text={row.publicCode} />
                          </span>
                        </span>
                        <span><span className="font-medium text-heading">Value:</span> {row.value} {row.fundingSourceId}</span>
                        <span><span className="font-medium text-heading">Created:</span> {formatTableDate(row.createdAt)}</span>
                        <span><span className="font-medium text-heading">Expiration:</span> {formatTableDate(row.expiration)}</span>
                      </div>
                      <div className="flex items-center justify-end pt-1">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <div ref={valueEmbedMenuRowId === row.id ? valueEmbedMenuRef : undefined} className="absolute top-4 right-4">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setValueEmbedMenuRowId((id) => (id === row.id ? null : row.id)); }}
                        className="p-1 rounded hover:bg-zinc-200 text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        aria-label="Actions"
                        aria-expanded={valueEmbedMenuRowId === row.id}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <circle cx="12" cy="6" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="18" r="1.5" />
                        </svg>
                      </button>
                      {valueEmbedMenuRowId === row.id && (
                        <div role="menu" className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                          <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setEditValueEmbedRow(row); setValueEmbedMenuRowId(null); }}>Edit</button>
                          <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setStickerValueEmbedCode({ publicCode: row.publicCode, privateCode: row.privateCode, qrUrl: row.qrUrl }); setStickerModalOpen(true); setValueEmbedMenuRowId(null); }}>Print</button>
                          <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setValueEmbedConfirm({ action: "redeem", row }); setValueEmbedMenuRowId(null); }}>Redeem</button>
                          <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setValueEmbedConfirm({ action: "cancel", row }); setValueEmbedMenuRowId(null); }}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sortedValueEmbedList.length > 0 && (
                  <div className="flex items-center justify-between p-4 border-t border-[#EEF2F2] flex-wrap gap-2">
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
              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
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
                      <th className={thClass} aria-label="Row actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedValueEmbedList.map((row, index) => (
                      <tr
                        key={row.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(pathToValueEmbedDetail(row.id))}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(pathToValueEmbedDetail(row.id)); } }}
                        className="group border-b border-[#EEF2F2] cursor-pointer transition-colors bg-white hover:bg-zinc-50"
                      >
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
                        <td className={`${tdClass} w-0 pr-4`}>
                          <div ref={valueEmbedMenuRowId === row.id ? valueEmbedMenuRef : undefined} className="relative flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setValueEmbedMenuRowId((id) => (id === row.id ? null : row.id)); }}
                              className="p-1 rounded hover:bg-zinc-200 text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                              aria-label="Actions"
                              aria-expanded={valueEmbedMenuRowId === row.id}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <circle cx="12" cy="6" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="18" r="1.5" />
                              </svg>
                            </button>
                            {valueEmbedMenuRowId === row.id && (
                              <div
                                role="menu"
                                className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setEditValueEmbedRow(row); setValueEmbedMenuRowId(null); }}>Edit</button>
                                <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setStickerValueEmbedCode({ publicCode: row.publicCode, privateCode: row.privateCode, qrUrl: row.qrUrl }); setStickerModalOpen(true); setValueEmbedMenuRowId(null); }}>Print</button>
                                <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setValueEmbedConfirm({ action: "redeem", row }); setValueEmbedMenuRowId(null); }}>Redeem</button>
                                <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setValueEmbedConfirm({ action: "cancel", row }); setValueEmbedMenuRowId(null); }}>Cancel</button>
                              </div>
                            )}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-4 h-4 shrink-0" aria-hidden>
                              <svg className="w-full h-full text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
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
              </div>
              {valueEmbedList.length === 0 && (
                <p className="p-6 text-body-text">No Value Embed codes found.</p>
              )}
            </div>
          ) : (
            <div>
              {/* Mobile: card list */}
              <div className="md:hidden space-y-3">
                {paginatedSelfTitlingList.map((row) => (
                  <div
                    key={row.id}
                    className="relative rounded-card border border-[#E8E8E8] bg-white p-4 shadow-soft active:bg-zinc-50 transition-colors"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(pathToSelfTitlingDetail(row.id))}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(pathToSelfTitlingDetail(row.id)); } }}
                      className="flex gap-3 text-sm cursor-pointer"
                    >
                      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                        {row.imageUrl ? (
                          <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs" aria-hidden>—</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2 pr-8">
                        <span className="font-semibold text-heading">{row.itemTag}</span>
                        <span style={{ color: STATUS_COLORS[row.status] }} className="font-medium shrink-0">
                          {STATUS_LABELS[row.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 text-muted">
                        <span><span className="font-medium text-heading">Public code:</span>{" "}
                          <span className="inline-flex items-center gap-1 font-mono">
                            {row.publicCode}
                            <CopyIconButton text={row.publicCode} />
                          </span>
                        </span>
                        <span><span className="font-medium text-heading">UNS name:</span> {row.unsName}</span>
                        <span><span className="font-medium text-heading">Created:</span> {formatTableDate(row.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-end pt-1">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      </div>
                    </div>
                    <div ref={selfTitlingMenuRowId === row.id ? selfTitlingMenuRef : undefined} className="absolute top-4 right-4">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelfTitlingMenuRowId((id) => (id === row.id ? null : row.id)); }}
                        className="p-1 rounded hover:bg-zinc-200 text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        aria-label="Actions"
                        aria-expanded={selfTitlingMenuRowId === row.id}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <circle cx="12" cy="6" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="18" r="1.5" />
                        </svg>
                      </button>
                      {selfTitlingMenuRowId === row.id && (
                        <div role="menu" className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                          <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setEditSelfTitlingRow(row); setSelfTitlingMenuRowId(null); }}>Edit</button>
                          <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setStickerValueEmbedCode(null); setStickerModalOpen(true); setSelfTitlingMenuRowId(null); }}>Print</button>
                          {row.ownershipStatus !== "transferred" && (
                            <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setTransferModal({ codeId: row.id, itemTag: row.itemTag, publicCode: row.publicCode }); setSelfTitlingMenuRowId(null); }}>Transfer</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sortedSelfTitlingList.length > 0 && (
                  <div className="flex items-center justify-between p-4 border-t border-[#EEF2F2] flex-wrap gap-2">
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
              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
              <div className="overflow-hidden border border-[#E8E8E8] rounded-b-card bg-white shadow-soft">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={thClass} style={{ width: 56 }}>Image</th>
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
                      <th className={thClass} aria-label="Row actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSelfTitlingList.map((row, index) => (
                      <tr
                        key={row.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(pathToSelfTitlingDetail(row.id))}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(pathToSelfTitlingDetail(row.id)); } }}
                        className="group border-b border-[#EEF2F2] cursor-pointer transition-colors bg-white hover:bg-zinc-50"
                      >
                        <td className={`${tdClass} w-[56px] pl-4 pr-2 align-middle`}>
                          {row.imageUrl ? (
                            <img src={row.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-zinc-200 bg-zinc-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-200 border border-zinc-200 flex items-center justify-center text-zinc-400 text-xs" aria-hidden>—</div>
                          )}
                        </td>
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
                        <td className={`${tdClass} w-0 pr-4`}>
                          <div ref={selfTitlingMenuRowId === row.id ? selfTitlingMenuRef : undefined} className="relative flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelfTitlingMenuRowId((id) => (id === row.id ? null : row.id)); }}
                              className="p-1 rounded hover:bg-zinc-200 text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                              aria-label="Actions"
                              aria-expanded={selfTitlingMenuRowId === row.id}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <circle cx="12" cy="6" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="18" r="1.5" />
                              </svg>
                            </button>
                            {selfTitlingMenuRowId === row.id && (
                              <div
                                role="menu"
                                className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setEditSelfTitlingRow(row); setSelfTitlingMenuRowId(null); }}>Edit</button>
                                <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setStickerValueEmbedCode(null); setStickerModalOpen(true); setSelfTitlingMenuRowId(null); }}>Print</button>
                                {row.ownershipStatus !== "transferred" && (
                                  <button type="button" role="menuitem" className="w-full px-4 py-2 text-left text-sm text-zinc-950 hover:bg-zinc-100" onClick={() => { setTransferModal({ codeId: row.id, itemTag: row.itemTag, publicCode: row.publicCode }); setSelfTitlingMenuRowId(null); }}>Transfer</button>
                                )}
                              </div>
                            )}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-4 h-4 shrink-0" aria-hidden>
                              <svg className="w-full h-full text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
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
              </div>
              {selfTitlingList.length === 0 && (
                <p className="p-6 text-body-text">No Self-Titling codes found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <StickerPrintModal
        open={stickerModalOpen}
        onClose={() => { setStickerModalOpen(false); setStickerValueEmbedCode(null); }}
        variant={activeTab}
        valueEmbedCode={activeTab === "value-embed" ? stickerValueEmbedCode ?? undefined : undefined}
      />
      <Modal
        open={!!valueEmbedConfirm}
        onClose={() => setValueEmbedConfirm(null)}
        title={valueEmbedConfirm?.action === "redeem" ? "Redeem code?" : valueEmbedConfirm?.action === "cancel" ? "Cancel / remove code?" : ""}
        size="confirmation"
      >
        {valueEmbedConfirm && (
          <>
            <p className="text-zinc-700 mb-4">
              {valueEmbedConfirm.action === "redeem"
                ? "Are you sure you want to redeem this value embed code? You will be taken to the redeem page."
                : "Are you sure you want to cancel or remove this code? Value will return to source and the code will no longer be active."}
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => setValueEmbedConfirm(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!valueEmbedConfirm) return;
                  if (valueEmbedConfirm.action === "redeem") {
                    navigate(`${ROUTES.REDEEM}?code=${encodeURIComponent(valueEmbedConfirm.row.publicCode)}`);
                  } else {
                    await cancelValueEmbedCode(valueEmbedConfirm.row.id);
                    void getValueEmbedCodes({ status: statusFilter || undefined, search: search || undefined }).then(setValueEmbedList);
                  }
                  setValueEmbedConfirm(null);
                }}
              >
                {valueEmbedConfirm.action === "redeem" ? "Redeem" : "Confirm cancel"}
              </Button>
            </div>
          </>
        )}
      </Modal>
      <GenerateCodeFlowModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        defaultCodeType={activeTab}
      />
      <EditValueEmbedModal
        open={!!editValueEmbedRow}
        onClose={() => setEditValueEmbedRow(null)}
        code={editValueEmbedRow}
        onSuccess={() => {
          void getValueEmbedCodes({ status: statusFilter || undefined, search: search || undefined }).then(setValueEmbedList);
        }}
      />
      <EditSelfTitlingModal
        open={!!editSelfTitlingRow}
        onClose={() => setEditSelfTitlingRow(null)}
        code={editSelfTitlingRow}
        onSuccess={() => {
          void getSelfTitlingCodes({ status: statusFilter || undefined, search: search || undefined }).then(setSelfTitlingList);
        }}
      />
      <ValueEmbedDetailSidebar
        open={!!viewDetailCodeId}
        onClose={() => setViewDetailCodeId(null)}
        codeId={viewDetailCodeId}
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
