import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createValueEmbedCodes, createSelfTitlingCodes } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet } from "../types";
import { pathToValueEmbedDetail, pathToSelfTitlingDetail } from "../constants/routes";
import { Button, Input } from "./ui";
import {
  validateDescriptionTag,
  validateValueAmount,
  validateQuantity,
  validateItemTag,
  validateUnsName,
  UNS_NAME_HINT,
} from "../utils/validation";

const TOTAL_STEPS = 4;

type CodeType = "value-embed" | "self-titling" | null;

interface GenerateCodeFlowModalProps {
  open: boolean;
  onClose: () => void;
  defaultCodeType: "value-embed" | "self-titling";
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(147, 197, 213, 0.45)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const shellStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  borderRadius: "20px",
  background: "linear-gradient(135deg, rgba(193, 220, 230, 0.65), rgba(210, 232, 240, 0.55))",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "none",
  outline: "none",
  boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
  padding: "20px 24px 24px",
};

const innerCardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  paddingTop: "36px",
  paddingRight: "40px",
  paddingBottom: "40px",
  paddingLeft: "40px",
};

const contentWrapStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "320px",
  margin: "0 auto",
};

const stepPillBg = "#C5D2D9";
const stepInactiveColor = "#6B7280";
const stepActiveBorder = "#374151";

const headingStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#09090b",
  textAlign: "center",
};

const subtitleStyle: React.CSSProperties = {
  margin: "0 0 28px",
  fontSize: "14px",
  color: "#64748b",
  fontWeight: 400,
  textAlign: "center",
};

const fullWidthBtnStyle: React.CSSProperties = {
  width: "100%",
  height: "44px",
  fontSize: "14px",
  fontWeight: 600,
};

function ProgressDots({ current, total }: { current: number; total: number }): React.ReactElement {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: "20px",
        padding: "7px 14px",
        borderRadius: "999px",
        backgroundColor: stepPillBg,
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: isActive ? "transparent" : stepInactiveColor,
                border: isActive ? "1px solid #09090b" : "none",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
              aria-hidden
            />
            {i < total - 1 && (
              <span
                style={{
                  width: "14px",
                  height: 0,
                  borderTop: `1px dashed ${stepInactiveColor}`,
                  margin: "0 1px",
                  flexShrink: 0,
                }}
                aria-hidden
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "32px",
        height: "32px",
        minWidth: "32px",
        minHeight: "32px",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        fontSize: "32px",
        lineHeight: 1,
        color: "#94a3b8",
        cursor: "pointer",
        flexShrink: 0,
      }}
      aria-label="Close"
    >
      ×
    </button>
  );
}

export function GenerateCodeFlowModal({
  open,
  onClose,
  defaultCodeType,
}: GenerateCodeFlowModalProps): React.ReactElement | null {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [codeType, setCodeType] = useState<CodeType>(null);
  const [hoverCodeType, setHoverCodeType] = useState<CodeType | null>(null);
  // Value Embed fields
  const [descriptionTag, setDescriptionTag] = useState("");
  const [fundingSourceId, setFundingSourceId] = useState("fs-mock-001");
  const [value, setValue] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expiration, setExpiration] = useState("");
  const [quantity, setQuantity] = useState("1");
  // Self-Titling fields
  const [itemTag, setItemTag] = useState("");
  const [unsName, setUnsName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdVE, setCreatedVE] = useState<ValueEmbedCodeSet[] | null>(null);
  const [createdST, setCreatedST] = useState<SelfTitlingCodeSet[] | null>(null);
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  if (!open) return null;

  const resetAndClose = (): void => {
    onClose();
    setStep(0);
    setCodeType(null);
    setHoverCodeType(null);
    setDescriptionTag("");
    setValue("");
    setExpiration("");
    setExpirationEnabled(false);
    setQuantity("1");
    setItemTag("");
    setUnsName("");
    setCreatedVE(null);
    setCreatedST(null);
    setErrors({});
  };

  const validateValueEmbedConfig = (): boolean => {
    const e: Record<string, string> = {};
    const vDesc = validateDescriptionTag(descriptionTag);
    const vValue = validateValueAmount(value);
    const vQty = validateQuantity(quantity);
    if (!vDesc.valid) e.descriptionTag = vDesc.message!;
    if (!vValue.valid) e.value = vValue.message!;
    if (!vQty.valid) e.quantity = vQty.message!;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSelfTitlingConfig = (): boolean => {
    const e: Record<string, string> = {};
    const vItem = validateItemTag(itemTag);
    const vUns = validateUnsName(unsName);
    const vQty = validateQuantity(quantity);
    if (!vItem.valid) e.itemTag = vItem.message!;
    if (!vUns.valid) e.unsName = vUns.message!;
    if (!vQty.valid) e.quantity = vQty.message!;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (): Promise<void> => {
    const valid = codeType === "value-embed" ? validateValueEmbedConfig() : validateSelfTitlingConfig();
    if (!valid) return;
    setLoading(true);
    try {
      if (codeType === "value-embed") {
        const result = await createValueEmbedCodes({
          descriptionTag,
          fundingSourceId,
          value: Number(value) || 0,
          expiration: expirationEnabled && expiration ? expiration : undefined,
          quantity: Math.max(1, parseInt(quantity, 10) || 1),
        });
        setCreatedVE(result.codes);
      } else {
        const result = await createSelfTitlingCodes({
          itemTag,
          unsName,
          quantity: Math.max(1, parseInt(quantity, 10) || 1),
        });
        setCreatedST(result.codes);
      }
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const successList = createdVE ?? createdST ?? [];

  return (
    <div style={overlayStyle} onClick={resetAndClose} role="dialog" aria-modal="true">
      <div style={shellStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
            minHeight: "32px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }} />
          <ProgressDots current={step} total={TOTAL_STEPS} />
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
            <CloseButton onClick={resetAndClose} />
          </div>
        </div>
        <div style={innerCardStyle}>
          <div style={contentWrapStyle}>
          {/* STEP 0 — Choose code type */}
          {step === 0 && (
            <>
              <h2 style={headingStyle}>What type of code do you want to generate?</h2>
              <p style={subtitleStyle}>Choose between Value Embed or Self-Titling codes.</p>

              <button
                type="button"
                onClick={() => setCodeType("value-embed")}
                onMouseEnter={() => setHoverCodeType("value-embed")}
                onMouseLeave={() => setHoverCodeType(null)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  marginBottom: "12px",
                  borderRadius: "12px",
                  border: codeType === "value-embed"
                    ? "2px solid var(--color-primary)"
                    : hoverCodeType === "value-embed"
                      ? "2px solid rgba(93, 159, 181, 0.5)"
                      : "1px solid #E0E0E0",
                  background: codeType === "value-embed"
                    ? "rgba(93, 159, 181, 0.06)"
                    : hoverCodeType === "value-embed"
                      ? "rgba(93, 159, 181, 0.04)"
                      : "#FFFFFF",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.15s ease, background-color 0.15s ease",
                }}
              >
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#09090b", display: "block", marginBottom: "4px" }}>
                  Value Embed Codes
                </span>
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#64748b", lineHeight: "1.4" }}>
                  Embed value onto physical objects (coins, cards). Includes funding source, balance check, and redemption via public/private code pair.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCodeType("self-titling")}
                onMouseEnter={() => setHoverCodeType("self-titling")}
                onMouseLeave={() => setHoverCodeType(null)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  marginBottom: "28px",
                  borderRadius: "12px",
                  border: codeType === "self-titling"
                    ? "2px solid var(--color-primary)"
                    : hoverCodeType === "self-titling"
                      ? "2px solid rgba(93, 159, 181, 0.5)"
                      : "1px solid #E0E0E0",
                  background: codeType === "self-titling"
                    ? "rgba(93, 159, 181, 0.06)"
                    : hoverCodeType === "self-titling"
                      ? "rgba(93, 159, 181, 0.04)"
                      : "#FFFFFF",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.15s ease, background-color 0.15s ease",
                }}
              >
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#09090b", display: "block", marginBottom: "4px" }}>
                  Self-Titling Codes
                </span>
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#64748b", lineHeight: "1.4" }}>
                  Enable self-titling of physical objects using stickers. Attached to a UNS name with auto-generated profile page and transferable ownership.
                </span>
              </button>

              <Button
                onClick={() => { if (codeType) setStep(1); }}
                disabled={!codeType}
                style={fullWidthBtnStyle}
              >
                Continue
              </Button>
            </>
          )}

          {/* STEP 1 — Configuration */}
          {step === 1 && codeType === "value-embed" && (
            <>
              <h2 style={headingStyle}>Configure Value Embed Code</h2>
              <p style={subtitleStyle}>Set up your code parameters.</p>

              <Input
                label="Description tag"
                required
                hint="Short label for this code set (e.g. Holiday promo 2024)"
                value={descriptionTag}
                onChange={(e) => { setDescriptionTag(e.target.value); setErrors((prev) => ({ ...prev, descriptionTag: undefined })); }}
                placeholder="e.g. Holiday promo 2024"
                error={errors.descriptionTag}
                style={{ border: "1px solid #E0E0E0" }}
              />
              <Input
                label="Funding source ID"
                value={fundingSourceId}
                onChange={(e) => setFundingSourceId(e.target.value)}
                style={{ border: "1px solid #E0E0E0" }}
              />
              <Input
                label="Value amount"
                required
                type="number"
                hint="Positive number (e.g. 50)"
                value={value}
                onChange={(e) => { setValue(e.target.value); setErrors((prev) => ({ ...prev, value: undefined })); }}
                placeholder="e.g. 50"
                error={errors.value}
                style={{ border: "1px solid #E0E0E0" }}
              />
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#09090b", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={expirationEnabled}
                    onChange={(e) => setExpirationEnabled(e.target.checked)}
                  />
                  Set expiration
                </label>
              </div>
              {expirationEnabled && (
                <Input
                  label="Expiration"
                  type="datetime-local"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  style={{ border: "1px solid #E0E0E0" }}
                />
              )}
              <Input
                label="Quantity"
                required
                type="number"
                min={1}
                hint="At least 1"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setErrors((prev) => ({ ...prev, quantity: undefined })); }}
                error={errors.quantity}
                style={{ border: "1px solid #E0E0E0" }}
              />
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setStep(0)} style={{ width: "120px", height: "44px" }}>Back</Button>
                <Button
                  onClick={() => { if (validateValueEmbedConfig()) setStep(2); }}
                  style={{ width: "120px", height: "44px" }}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 1 && codeType === "self-titling" && (
            <>
              <h2 style={headingStyle}>Configure Self-Titling Code</h2>
              <p style={subtitleStyle}>Set up your code parameters.</p>

              <Input
                label="Item tag"
                required
                hint="Short label for this item (e.g. Conference badge)"
                value={itemTag}
                onChange={(e) => { setItemTag(e.target.value); setErrors((prev) => ({ ...prev, itemTag: undefined })); }}
                placeholder="e.g. Conference badge"
                error={errors.itemTag}
                style={{ border: "1px solid #E0E0E0" }}
              />
              <Input
                label="UNS name"
                required
                hint={UNS_NAME_HINT}
                value={unsName}
                onChange={(e) => { setUnsName(e.target.value); setErrors((prev) => ({ ...prev, unsName: undefined })); }}
                placeholder="e.g. alice.uns"
                error={errors.unsName}
                style={{ border: "1px solid #E0E0E0" }}
              />
              <Input
                label="Quantity"
                required
                type="number"
                min={1}
                hint="At least 1"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setErrors((prev) => ({ ...prev, quantity: undefined })); }}
                error={errors.quantity}
                style={{ border: "1px solid #E0E0E0" }}
              />
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setStep(0)} style={{ width: "120px", height: "44px" }}>Back</Button>
                <Button
                  onClick={() => { if (validateSelfTitlingConfig()) setStep(2); }}
                  style={{ width: "120px", height: "44px" }}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* STEP 2 — Review */}
          {step === 2 && (
            <>
              <h2 style={headingStyle}>Review and create</h2>
              <p style={subtitleStyle}>Confirm your details and generate code.</p>

              <div
                style={{
                  padding: "20px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  marginBottom: "24px",
                  fontSize: "14px",
                  color: "#09090b",
                  lineHeight: "2",
                }}
              >
                {codeType === "value-embed" && (
                  <>
                    <div><span style={{ color: "#64748b" }}>Type:</span> Value Embed</div>
                    <div><span style={{ color: "#64748b" }}>Description:</span> {descriptionTag}</div>
                    <div><span style={{ color: "#64748b" }}>Funding source:</span> {fundingSourceId}</div>
                    <div><span style={{ color: "#64748b" }}>Value:</span> ${value}</div>
                    <div><span style={{ color: "#64748b" }}>Expiration:</span> {expirationEnabled && expiration ? expiration : "None"}</div>
                    <div><span style={{ color: "#64748b" }}>Quantity:</span> {quantity}</div>
                  </>
                )}
                {codeType === "self-titling" && (
                  <>
                    <div><span style={{ color: "#64748b" }}>Type:</span> Self-Titling</div>
                    <div><span style={{ color: "#64748b" }}>Item tag:</span> {itemTag}</div>
                    <div><span style={{ color: "#64748b" }}>UNS name:</span> {unsName}</div>
                    <div><span style={{ color: "#64748b" }}>Quantity:</span> {quantity}</div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <Button variant="outline" onClick={() => setStep(1)} style={{ width: "120px", height: "44px" }}>Back</Button>
                <Button onClick={handleCreate} disabled={loading} style={{ width: "140px", height: "44px" }}>
                  {loading ? "Creating…" : "Create code"}
                </Button>
              </div>
            </>
          )}

          {/* STEP 3 — Success */}
          {step === 3 && successList.length > 0 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "40px" }}>✓</span>
              </div>
              <h2 style={headingStyle}>Code created successfully</h2>
              <p style={subtitleStyle}>
                {successList.length === 1
                  ? "Your code is ready to use."
                  : `${successList.length} code sets generated and ready to use.`}
              </p>

              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  marginBottom: "24px",
                  fontSize: "14px",
                  maxHeight: "180px",
                  overflowY: "auto",
                }}
              >
                {successList.slice(0, 8).map((c: { id: string; publicCode: string; label?: string; itemTag?: string }) => (
                  <div key={c.id} style={{ marginBottom: "6px" }}>
                    <a
                      href={createdVE ? pathToValueEmbedDetail(c.id) : pathToSelfTitlingDetail(c.id)}
                      style={{ color: "var(--color-primary)", fontWeight: 500, textDecoration: "underline" }}
                    >
                      {(c as ValueEmbedCodeSet).label ?? (c as SelfTitlingCodeSet).itemTag} — {c.publicCode}
                    </a>
                  </div>
                ))}
                {successList.length > 8 && (
                  <div style={{ color: "#64748b", marginTop: "4px" }}>and {successList.length - 8} more…</div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <Button
                  variant="outline"
                  onClick={resetAndClose}
                  style={{ width: "120px", height: "44px" }}
                >
                  Done
                </Button>
                <Button
                  onClick={() => {
                    const href = createdVE?.length
                      ? pathToValueEmbedDetail(createdVE[0].id)
                      : createdST?.length
                        ? pathToSelfTitlingDetail(createdST[0].id)
                        : "/codes";
                    resetAndClose();
                    navigate(href);
                  }}
                  style={{ width: "120px", height: "44px" }}
                >
                  {successList.length === 1 ? "View code" : "View codes"}
                </Button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
