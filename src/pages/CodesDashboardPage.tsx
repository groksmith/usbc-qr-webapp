import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getValueEmbedCodes, getSelfTitlingCodes } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet, CodeSetStatus } from "../types";
import { Button, Tabs, StickerExportModal, SortIcon, SearchIcon, CopyIconButton } from "../components/ui";
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

  const tabs = [
    { id: "value-embed" as const, label: "Value Embed" },
    { id: "self-titling" as const, label: "Self-Titling" },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-card)",
    padding: "32px 40px 40px",
  };

  const tableWrapStyle: React.CSSProperties = {
    overflow: "hidden",
    border: "1px solid #E8E8E8",
    borderRadius: "0 0 12px 12px",
    backgroundColor: "#FFFFFF",
    boxShadow: "var(--shadow-soft)",
  };

  const thStyle: React.CSSProperties = {
    padding: "16px 20px",
    textAlign: "left",
    backgroundColor: "#F8FAFA",
    color: "var(--color-body)",
    fontWeight: 600,
    fontSize: "14px",
    borderBottom: "1px solid #EEF2F2",
  };

  const getRowStyle = (index: number): React.CSSProperties => ({
    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8FCFC",
    borderBottom: "1px solid #EEF2F2",
  });

  const tdStyle: React.CSSProperties = {
    padding: "16px 20px",
    fontSize: "14px",
    color: "var(--color-heading)",
  };

  return (
    <div>
      <div className="card" style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px" }}>Codes Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <select
              className="select-chevron-right"
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value || "") as CodeSetStatus | "")}
              style={{ height: "44px", boxSizing: "border-box", fontSize: "14px", borderRadius: "12px", border: "1px solid #E0E0E0", outline: "none", backgroundColor: "#FFFFFF" }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending_transfer">Pending transfer</option>
            </select>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%) scale(0.8)",
                  color: "#9ca3af",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
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
                style={{
                  height: "44px",
                  padding: "0 14px 0 40px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                  borderRadius: "12px",
                  border: "1px solid #E0E0E0",
                  outline: "none",
                  backgroundColor: "#FFFFFF",
                  minWidth: "220px",
                }}
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
              style={{
                height: "44px",
                width: "165px",
                padding: "0 16px 0 14px",
                borderRadius: "12px",
                border: "1px solid #dcdcdc",
                outline: "none",
                backgroundColor: "#ffffff",
                color: "#1e1e1e",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-family)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <img src={csvIcon} alt="" width={18} height={18} style={{ display: "block", flexShrink: 0 }} />
              <span>Download csv</span>
            </button>
            <Button onClick={() => setGenerateModalOpen(true)} style={{ height: "44px", width: "165px" }}>
              Generate code
            </Button>
          </div>
        </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as DashboardTab)} variant="dashboard" />
      {loading ? (
        <p style={{ padding: "24px", margin: 0 }}>Loading...</p>
      ) : activeTab === "value-embed" ? (
        <div style={{ overflowX: "auto" }}>
          <div style={tableWrapStyle}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Description tag <SortIcon /></th>
                  <th style={thStyle}>Public code <SortIcon /></th>
                  <th style={thStyle}>Value <SortIcon /></th>
                  <th style={thStyle}>Status <SortIcon /></th>
                  <th style={thStyle}>Created <SortIcon /></th>
                  <th style={thStyle}>Expiration <SortIcon /></th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {valueEmbedList.map((row, index) => (
                  <tr key={row.id} style={getRowStyle(index)}>
                    <td style={tdStyle}>{row.label}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}>
                        {row.publicCode}
                        <CopyIconButton text={row.publicCode} />
                      </span>
                    </td>
                    <td style={tdStyle}>{row.value} {row.fundingSourceId}</td>
                    <td style={tdStyle}>
                      <span style={{ color: STATUS_COLORS[row.status], fontWeight: 500 }}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {formatTableDate(row.createdAt)}
                    </td>
                    <td style={tdStyle}>
                      {formatTableDate(row.expiration)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setViewDetailCodeId(row.id)} style={{ background: "none", border: "none", color: "#09090b", cursor: "pointer" }}>View</button>
                        <button type="button" onClick={() => { setStickerValueEmbedCode({ publicCode: row.publicCode, privateCode: row.privateCode, qrUrl: row.qrUrl }); setStickerModalOpen(true); }} style={{ background: "none", border: "none", color: "#09090b", cursor: "pointer" }}>Export</button>
                        {row.status === "active" && (
                          <button type="button" style={{ background: "none", border: "none", color: "#09090b", cursor: "pointer" }}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {valueEmbedList.length === 0 && (
            <p style={{ padding: "24px", color: "var(--color-body)" }}>No Value Embed codes found.</p>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={tableWrapStyle}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Item tag <SortIcon /></th>
                  <th style={thStyle}>UNS name <SortIcon /></th>
                  <th style={thStyle}>Public code <SortIcon /></th>
                  <th style={thStyle}>Status <SortIcon /></th>
                  <th style={thStyle}>Created <SortIcon /></th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selfTitlingList.map((row, index) => (
                  <tr key={row.id} style={getRowStyle(index)}>
                    <td style={tdStyle}>{row.itemTag}</td>
                    <td style={tdStyle}>{row.unsName}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}>
                        {row.publicCode}
                        <CopyIconButton text={row.publicCode} />
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: STATUS_COLORS[row.status], fontWeight: 500 }}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {formatTableDate(row.createdAt)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setViewDetailSelfTitlingId(row.id)} style={{ background: "none", border: "none", color: "#09090b", cursor: "pointer", padding: 0, font: "inherit", textDecoration: "none" }}>View</button>
                        <button type="button" onClick={() => { setStickerValueEmbedCode(null); setStickerModalOpen(true); }} style={{ background: "none", border: "none", color: "#09090b", cursor: "pointer" }}>Export</button>
                        <button type="button" onClick={() => setTransferModal({ codeId: row.id, itemTag: row.itemTag, publicCode: row.publicCode })} style={{ background: "none", border: "none", color: "#09090b", cursor: "pointer" }}>Transfer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selfTitlingList.length === 0 && (
            <p style={{ padding: "24px", color: "var(--color-body)" }}>No Self-Titling codes found.</p>
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
