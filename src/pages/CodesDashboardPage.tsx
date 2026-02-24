import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getValueEmbedCodes, getSelfTitlingCodes } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet, CodeSetStatus } from "../types";
import { pathToSelfTitlingDetail } from "../constants/routes";
import { Button, Tabs, StickerExportModal, SortIcon, SearchIcon } from "../components/ui";
import type { ValueEmbedCodeExportData } from "../components/ui/StickerExportModal";
import { STATUS_LABELS, STATUS_COLORS } from "../constants/status";
import { downloadValueEmbedCsv, downloadSelfTitlingCsv } from "../utils/csvExport";
import csvIcon from "../assets/icons/csv_icon.png";
import { GenerateCodeFlowModal } from "../components/GenerateCodeFlowModal";
import { ValueEmbedDetailSidebar } from "../components/ValueEmbedDetailSidebar";

type DashboardTab = "value-embed" | "self-titling";

export function CodesDashboardPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<DashboardTab>("value-embed");
  const [valueEmbedList, setValueEmbedList] = useState<ValueEmbedCodeSet[]>([]);
  const [selfTitlingList, setSelfTitlingList] = useState<SelfTitlingCodeSet[]>([]);
  const [statusFilter, setStatusFilter] = useState<CodeSetStatus | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);
  const [stickerValueEmbedCode, setStickerValueEmbedCode] = useState<ValueEmbedCodeExportData | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [viewDetailCodeId, setViewDetailCodeId] = useState<string | null>(null);

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
    { id: "value-embed" as const, label: "Value Embed Codes" },
    { id: "self-titling" as const, label: "Self-Titling Codes" },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    padding: "32px",
  };

  const tableWrapStyle: React.CSSProperties = {
    overflow: "hidden",
    border: "1px solid #E0E0E0",
    borderRadius: "0 0 12px 12px",
    backgroundColor: "#FFFFFF",
  };

  const thStyle: React.CSSProperties = {
    padding: "14px 16px",
    textAlign: "left",
    backgroundColor: "#F8F8F8",
    color: "#5A5A5A",
    fontWeight: 600,
    fontSize: "14px",
    borderBottom: "1px solid #E8E8E8",
  };

  const getRowStyle = (index: number): React.CSSProperties => ({
    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F6FCFC",
    borderBottom: "1px solid #E8E8E8",
  });

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#333333",
  };

  return (
    <div>
      <div style={cardStyle}>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value || "") as CodeSetStatus | "")}
              style={{ height: "36px", padding: "0 14px", boxSizing: "border-box", fontSize: "14px", borderRadius: "12px", border: "1px solid #E0E0E0", outline: "none", backgroundColor: "#FFFFFF" }}
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
                placeholder="Search by tag or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "36px",
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
            <Button onClick={() => setGenerateModalOpen(true)}>
              Generate code
            </Button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === "value-embed") downloadValueEmbedCsv(valueEmbedList);
                else downloadSelfTitlingCsv(selfTitlingList);
              }}
              title="Download CSV"
              aria-label="Download CSV"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                border: "none",
                outline: "none",
                backgroundColor: "#DFDFDF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <img src={csvIcon} alt="" width={16} height={16} style={{ display: "block" }} />
            </button>
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
                  <th style={thStyle}>Balance <SortIcon /></th>
                  <th style={thStyle}>Expiration <SortIcon /></th>
                  <th style={thStyle}>Status <SortIcon /></th>
                  <th style={thStyle}>Created <SortIcon /></th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {valueEmbedList.map((row, index) => (
                  <tr key={row.id} style={getRowStyle(index)}>
                    <td style={tdStyle}>{row.label}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>{row.publicCode}</td>
                    <td style={tdStyle}>{row.value}</td>
                    <td style={tdStyle}>{row.balance}</td>
                    <td style={tdStyle}>
                      {row.expiration
                        ? new Date(row.expiration).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: STATUS_COLORS[row.status], fontWeight: 500 }}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button type="button" onClick={() => setViewDetailCodeId(row.id)} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", marginRight: "12px" }}>View</button>
                      <button type="button" onClick={() => { setStickerValueEmbedCode({ publicCode: row.publicCode, privateCode: row.privateCode, qrUrl: row.qrUrl }); setStickerModalOpen(true); }} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", marginRight: "12px" }}>Export</button>
                      {row.status === "active" && (
                        <button type="button" style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>Cancel</button>
                      )}
                      <span style={{ color: "#9ca3af", marginLeft: "8px" }}>›</span>
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
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>{row.publicCode}</td>
                    <td style={tdStyle}>
                      <span style={{ color: STATUS_COLORS[row.status], fontWeight: 500 }}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <Link to={pathToSelfTitlingDetail(row.id)} style={{ color: "var(--color-primary)", marginRight: "12px" }}>View</Link>
                      <button type="button" onClick={() => { setStickerValueEmbedCode(null); setStickerModalOpen(true); }} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", marginRight: "12px" }}>Export</button>
                      <button type="button" style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", marginRight: "8px" }}>Transfer</button>
                      <span style={{ color: "#9ca3af" }}>›</span>
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
    </div>
  );
}
