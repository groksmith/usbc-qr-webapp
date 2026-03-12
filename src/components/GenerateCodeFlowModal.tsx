import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createValueEmbedCodes, createSelfTitlingCodes } from "../services/api";
import type { ValueEmbedCodeSet, SelfTitlingCodeSet, BulkValueEmbedItem } from "../types";
import { pathToValueEmbedDetail, pathToSelfTitlingDetail } from "../constants/routes";
import { Button, Input, SearchInput } from "./ui";
import {
  validateDescriptionTag,
  validateValueAmount,
  validateQuantity,
  validateItemTag,
  validateUnsName,
  UNS_NAME_HINT,
} from "../utils/validation";

type CodeType = "value-embed" | "self-titling" | null;

interface GenerateCodeFlowModalProps {
  open: boolean;
  onClose: () => void;
  defaultCodeType: "value-embed" | "self-titling";
}

function ProgressDots({ current, total }: { current: number; total: number }): React.ReactElement {
  return (
    <div className="inline-flex items-center justify-center py-[5px] px-[10px] rounded-full bg-[#f0f0f2]">
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <span
              className={`w-[5px] h-[5px] rounded-full flex-shrink-0 transition-all duration-200 ${
                isActive ? "bg-transparent border border-[#09090b]" : "bg-[#6B7280] border-0"
              }`}
              aria-hidden
            />
            {i < total - 1 && (
              <span
                className="w-[10px] h-0 border-t border-dashed border-[#6B7280] mx-px flex-shrink-0"
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
      className="w-8 h-8 min-w-[32px] min-h-[32px] p-0 flex items-center justify-center bg-transparent border-0 text-[32px] leading-none text-slate-400 cursor-pointer flex-shrink-0"
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
  const [fundingSourceId, setFundingSourceId] = useState("USBC");
  const [value, setValue] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expiration, setExpiration] = useState("");
  const [quantity, setQuantity] = useState("1");
  // Bulk items: per-code value + expiration
  const [bulkItems, setBulkItems] = useState<{ value: string; expiration: string }[]>([]);
  // Self-Titling fields
  const [itemTag, setItemTag] = useState("");
  const [unsName, setUnsName] = useState("");
  /** Data URL of uploaded image for self-titling item. */
  const [selfTitlingImageUrl, setSelfTitlingImageUrl] = useState<string | null>(null);
  const [isDraggingOverImage, setIsDraggingOverImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdVE, setCreatedVE] = useState<ValueEmbedCodeSet[] | null>(null);
  const [createdST, setCreatedST] = useState<SelfTitlingCodeSet[] | null>(null);
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  if (!open) return null;

  const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);
  const isBulk = codeType === "value-embed" && parsedQty > 1;
  const totalSteps = isBulk ? 5 : 4;

  // Map internal step to visual dot index depending on flow length
  const visualStep = isBulk
    ? step // 0=type, 1=config, 2=bulk grid, 3=review, 4=success
    : step; // 0=type, 1=config, 2=review, 3=success

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
    setBulkItems([]);
    setItemTag("");
    setUnsName("");
    setSelfTitlingImageUrl(null);
    setIsDraggingOverImage(false);
    setCreatedVE(null);
    setCreatedST(null);
    setErrors({});
  };

  const validateValueEmbedConfig = (): boolean => {
    const e: Record<string, string> = {};
    const vDesc = validateDescriptionTag(descriptionTag);
    const vQty = validateQuantity(quantity);
    if (!vDesc.valid) e.descriptionTag = vDesc.message!;
    if (!vQty.valid) e.quantity = vQty.message!;
    // Only validate single value when qty=1
    if (parsedQty <= 1) {
      const vValue = validateValueAmount(value);
      if (!vValue.valid) e.value = vValue.message!;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSelfTitlingConfig = (): boolean => {
    const e: Record<string, string> = {};
    const vItem = validateItemTag(itemTag);
    const vUns = validateUnsName(unsName);
    if (!vItem.valid) e.itemTag = vItem.message!;
    if (!vUns.valid) e.unsName = vUns.message!;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const initBulkItems = (): void => {
    const defaultVal = value || "0";
    const defaultExp = expirationEnabled && expiration ? expiration : "";
    setBulkItems(
      Array.from({ length: parsedQty }, () => ({
        value: defaultVal,
        expiration: defaultExp,
      }))
    );
  };

  const validateBulkItems = (): boolean => {
    for (const item of bulkItems) {
      const n = Number(item.value);
      if (!item.value || isNaN(n) || n <= 0) return false;
    }
    return true;
  };

  const handleConfigNext = (): void => {
    if (!validateValueEmbedConfig()) return;
    if (isBulk) {
      initBulkItems();
      setStep(2); // go to bulk grid
    } else {
      setStep(2); // go to review (same index, different meaning for non-bulk)
    }
  };

  const reviewStep = isBulk ? 3 : 2;
  const successStep = isBulk ? 4 : 3;

  const handleCreate = async (): Promise<void> => {
    setLoading(true);
    try {
      if (codeType === "value-embed") {
        if (isBulk) {
          const items: BulkValueEmbedItem[] = bulkItems.map((b) => ({
            value: Number(b.value) || 0,
            expiration: b.expiration || undefined,
          }));
          const result = await createValueEmbedCodes({
            descriptionTag,
            fundingSourceId,
            value: 0,
            bulkItems: items,
          });
          setCreatedVE(result.codes);
        } else {
          const result = await createValueEmbedCodes({
            descriptionTag,
            fundingSourceId,
            value: Number(value) || 0,
            expiration: expirationEnabled && expiration ? expiration : undefined,
            quantity: 1,
          });
          setCreatedVE(result.codes);
        }
      } else {
        const result = await createSelfTitlingCodes({
          itemTag,
          unsName,
          imageUrl: selfTitlingImageUrl ?? undefined,
          quantity: 1,
        });
        setCreatedST(result.codes);
      }
      setStep(successStep);
    } finally {
      setLoading(false);
    }
  };

  const updateBulkItem = (index: number, field: "value" | "expiration", val: string): void => {
    setBulkItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };

  const applyValueToAll = (): void => {
    setBulkItems((prev) => prev.map((item) => ({ ...item, value: prev[0]?.value ?? "" })));
  };

  const applyExpirationToAll = (): void => {
    setBulkItems((prev) => prev.map((item) => ({ ...item, expiration: prev[0]?.expiration ?? "" })));
  };

  const successList = createdVE ?? createdST ?? [];

  const bulkTotal = bulkItems.reduce((sum, b) => sum + (Number(b.value) || 0), 0);
  const bulkValues = bulkItems.map((b) => Number(b.value) || 0);
  const bulkMin = bulkValues.length > 0 ? Math.min(...bulkValues) : 0;
  const bulkMax = bulkValues.length > 0 ? Math.max(...bulkValues) : 0;

  const shellClass = isBulk && step === 2
    ? "w-full max-w-[640px] rounded-[16px] sm:rounded-[20px] bg-white border-0 outline-none shadow-[0_8px_48px_rgba(0,0,0,0.10)] p-4 sm:p-6"
    : "w-full max-w-[420px] rounded-[16px] sm:rounded-[20px] bg-white border-0 outline-none shadow-[0_8px_48px_rgba(0,0,0,0.10)] p-4 sm:p-6";

  const codeTypeBtnClass = (type: "value-embed" | "self-titling", marginClass: string): string => {
    const selected = codeType === type;
    const hovered = hoverCodeType === type;
    return `w-full p-4 px-5 ${marginClass} rounded-card text-left cursor-pointer transition-[border-color,background-color] duration-150 ${
      selected
        ? "border-2 border-primary bg-primary/[0.06]"
        : hovered
        ? "border-2 border-primary/50 bg-primary/[0.04]"
        : "border border-[#E0E0E0] bg-white"
    }`;
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(147,197,213,0.45)] backdrop-blur-[6px] flex items-center justify-center z-[1000] p-4 sm:p-0 overflow-y-auto"
      onClick={resetAndClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={`${shellClass} w-full mx-0 sm:mx-4`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2 min-h-[32px] gap-2">
          <div className="flex-1 min-w-0" />
          <ProgressDots current={visualStep} total={totalSteps} />
          <div className="flex-1 flex justify-end items-center min-w-0">
            <CloseButton onClick={resetAndClose} />
          </div>
        </div>

        <div className={isBulk && step === 2 ? "w-full" : "w-full mx-auto"}>
          {/* STEP 0 — Choose code type */}
          {step === 0 && (
            <>
              <h2 className="m-0 mb-2 text-lg sm:text-[22px] font-bold text-zinc-950 text-center">
                What type of code do you want to generate?
              </h2>

              <button
                type="button"
                onClick={() => setCodeType("value-embed")}
                onMouseEnter={() => setHoverCodeType("value-embed")}
                onMouseLeave={() => setHoverCodeType(null)}
                className={codeTypeBtnClass("value-embed", "mb-3")}
              >
                <span className="text-[15px] font-semibold text-zinc-950 block mb-1">
                  Value Embed
                </span>
                <span className="text-[13px] font-normal text-muted leading-[1.4]">
                  Embed value onto physical objects (coins, cards). Includes funding source, balance check, and redemption via public/private code pair.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCodeType("self-titling")}
                onMouseEnter={() => setHoverCodeType("self-titling")}
                onMouseLeave={() => setHoverCodeType(null)}
                className={codeTypeBtnClass("self-titling", "mb-7")}
              >
                <span className="text-[15px] font-semibold text-zinc-950 block mb-1">
                  Self-Titling
                </span>
                <span className="text-[13px] font-normal text-muted leading-[1.4]">
                  Enable self-titling of physical objects using stickers. Attached to a UNS name with auto-generated profile page and transferable ownership.
                </span>
              </button>

              <Button
                onClick={() => { if (codeType) setStep(1); }}
                disabled={!codeType}
                className="w-full h-11 text-sm font-semibold"
              >
                Continue
              </Button>
            </>
          )}

          {/* STEP 1 — Configuration (Value Embed) */}
          {step === 1 && codeType === "value-embed" && (
            <>
              <h2 className="m-0 mb-2 text-[22px] font-bold text-zinc-950 text-center">Configure Value Embed Code</h2>
              <p className="m-0 mb-7 text-sm text-muted font-normal text-center">Set up your code parameters.</p>

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
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-950 mb-1.5">
                  Funding source
                </label>
                <select
                  className="select-chevron-right w-full h-10 text-sm border border-[#E0E0E0] rounded-card bg-white outline-none text-zinc-950 font-sans box-border px-3.5"
                  value={fundingSourceId}
                  onChange={(e) => setFundingSourceId(e.target.value)}
                >
                  <option value="USBC">USBC</option>
                  <option value="URT">URT</option>
                </select>
              </div>
              <Input
                label="Quantity"
                required
                type="number"
                min={1}
                hint="At least 1. For bulk (>1), you can customize each code's value next."
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setErrors((prev) => ({ ...prev, quantity: undefined })); }}
                error={errors.quantity}
                style={{ border: "1px solid #E0E0E0" }}
              />
              {parsedQty <= 1 && (
                <>
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
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-950 font-medium">
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
                </>
              )}
              {parsedQty > 1 && (
                <p className="text-[13px] text-muted m-0 mb-4">
                  You&apos;ll customize individual values and expirations in the next step.
                </p>
              )}
              <div className="flex justify-end gap-2 sm:gap-3 mt-2 flex-wrap">
                <Button variant="outline" onClick={() => setStep(0)} className="w-full sm:w-[120px] h-11">Back</Button>
                <Button onClick={handleConfigNext} className="w-full sm:w-[120px] h-11">Next</Button>
              </div>
            </>
          )}

          {/* STEP 1 — Configuration (Self-Titling) */}
          {step === 1 && codeType === "self-titling" && (
            <>
              <h2 className="m-0 mb-2 text-[22px] font-bold text-zinc-950 text-center">Configure Self-Titling Code</h2>
              <p className="m-0 mb-7 text-sm text-muted font-normal text-center">Set up your code parameters.</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-950 mb-1.5">
                  Item image <span className="font-normal text-muted">(optional)</span>
                </label>
                {selfTitlingImageUrl ? (
                  <div className="flex flex-col gap-2">
                    <img
                      src={selfTitlingImageUrl}
                      alt="Item preview"
                      className="w-full max-w-[200px] h-auto max-h-[200px] object-contain rounded-[8px] border border-[#e4e4e7]"
                    />
                    <div className="flex gap-2">
                      <label className="py-2 px-3 text-sm font-medium text-primary bg-primary/[0.08] border border-primary/20 rounded-[8px] cursor-pointer">
                        Change image
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setSelfTitlingImageUrl(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelfTitlingImageUrl(null)}
                        className="py-2 px-3 text-sm font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-[8px] cursor-pointer hover:bg-zinc-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-full py-6 px-4 border-2 border-dashed rounded-[8px] cursor-pointer transition-colors ${
                      isDraggingOverImage
                        ? "border-primary bg-primary/[0.08]"
                        : "border-[#e4e4e7] hover:border-primary/50 hover:bg-primary/[0.04]"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingOverImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingOverImage(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingOverImage(false);
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      const accepted = ["image/png", "image/jpeg", "image/jpg"];
                      if (!accepted.includes(file.type)) return;
                      const reader = new FileReader();
                      reader.onload = () => setSelfTitlingImageUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  >
                    <span className="text-sm font-medium text-zinc-600">
                      {isDraggingOverImage ? "Drop image here" : "Click or drag and drop to upload"}
                    </span>
                    <span className="text-xs text-muted mt-1 block text-center">Recommended: 1:1 aspect ratio (e.g. 1080×1080 px), minimum 100 KB.</span>
                    <span className="text-xs text-muted mt-0.5 block">PNG, JPG, JPEG</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setSelfTitlingImageUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

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
              <SearchInput
                label="UNS name"
                required
                hint={UNS_NAME_HINT}
                value={unsName}
                onChange={(e) => { setUnsName(e.target.value); setErrors((prev) => ({ ...prev, unsName: undefined })); }}
                placeholder="e.g. alice.uns"
                error={errors.unsName}
              />
              <div className="flex justify-end gap-2 sm:gap-3 mt-2 flex-wrap">
                <Button variant="outline" onClick={() => setStep(0)} className="w-full sm:w-[120px] h-11">Back</Button>
                <Button
                  onClick={() => { if (validateSelfTitlingConfig()) setStep(2); }}
                  className="w-full sm:w-[120px] h-11"
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* STEP 2 (bulk only) — Bulk Grid */}
          {isBulk && step === 2 && (
            <>
              <h2 className="m-0 mb-2 text-[22px] font-bold text-zinc-950 text-center">Customize each code</h2>
              <p className="m-0 mb-7 text-sm text-muted font-normal text-center">
                Set individual values and expirations for {parsedQty} codes.
              </p>

              <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto border border-[#e4e4e7] rounded-card mb-4">
                {/* Mobile: card list for bulk items */}
                <div className="sm:hidden divide-y divide-[#e4e4e7]">
                  {bulkItems.map((item, i) => (
                    <div key={i} className="p-3 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-muted">#{i + 1}</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={item.value}
                        onChange={(e) => updateBulkItem(i, "value", e.target.value)}
                        placeholder="Value ($)"
                        className="w-full py-2 px-3 text-sm border border-[#e4e4e7] rounded-[8px] outline-none bg-white box-border"
                      />
                      <input
                        type="datetime-local"
                        value={item.expiration}
                        onChange={(e) => updateBulkItem(i, "expiration", e.target.value)}
                        className="w-full py-2 px-3 text-sm border border-[#e4e4e7] rounded-[8px] outline-none bg-white box-border"
                      />
                    </div>
                  ))}
                </div>
                {/* Desktop: table */}
                <table className="w-full border-collapse text-sm hidden sm:table">
                  <thead>
                    <tr className="bg-[#f8fafa] sticky top-0 z-[1]">
                      <th className="p-[10px_12px] text-left font-semibold text-body-text text-xs border-b border-[#e4e4e7] w-12">#</th>
                      <th className="p-[10px_12px] text-left font-semibold text-body-text text-xs border-b border-[#e4e4e7]">Value ($)</th>
                      <th className="p-[10px_12px] text-left font-semibold text-body-text text-xs border-b border-[#e4e4e7]">Expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkItems.map((item, i) => (
                      <tr key={i} className={i < bulkItems.length - 1 ? "border-b border-[#f0f0f0]" : ""}>
                        <td className="p-[8px_12px] text-muted font-medium">{i + 1}</td>
                        <td className="p-[6px_8px]">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={item.value}
                            onChange={(e) => updateBulkItem(i, "value", e.target.value)}
                            className="w-full py-1.5 px-2.5 text-[13px] border border-[#e4e4e7] rounded-[8px] outline-none bg-white box-border"
                          />
                        </td>
                        <td className="p-[6px_8px]">
                          <input
                            type="datetime-local"
                            value={item.expiration}
                            onChange={(e) => updateBulkItem(i, "expiration", e.target.value)}
                            className="w-full py-1.5 px-2.5 text-[13px] border border-[#e4e4e7] rounded-[8px] outline-none bg-white box-border"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  type="button"
                  onClick={applyValueToAll}
                  className="py-1.5 px-3 text-xs font-medium text-primary bg-primary/[0.08] border border-primary/20 rounded-[8px] cursor-pointer font-sans"
                >
                  Apply row 1 value to all
                </button>
                <button
                  type="button"
                  onClick={applyExpirationToAll}
                  className="py-1.5 px-3 text-xs font-medium text-primary bg-primary/[0.08] border border-primary/20 rounded-[8px] cursor-pointer font-sans"
                >
                  Apply row 1 expiration to all
                </button>
              </div>

              <div className="text-[13px] text-muted mb-4">
                Total: <strong className="text-zinc-950">${bulkTotal.toLocaleString()}</strong> across {parsedQty} codes
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 flex-wrap">
                <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-[120px] h-11">Back</Button>
                <Button
                  onClick={() => { if (validateBulkItems()) setStep(reviewStep); }}
                  disabled={!validateBulkItems()}
                  className="w-full sm:w-[120px] h-11"
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* STEP 2 or 3 — Review */}
          {step === reviewStep && (
            <>
              <h2 className="m-0 mb-2 text-[22px] font-bold text-zinc-950 text-center">Review and create</h2>
              <p className="m-0 mb-7 text-sm text-muted font-normal text-center">
                Confirm your details and generate {isBulk ? "codes" : "code"}.
              </p>

              <div className="p-5 rounded-card bg-slate-50 mb-6 text-sm text-zinc-950 leading-loose">
                {codeType === "value-embed" && !isBulk && (
                  <>
                    <div><span className="text-muted">Type:</span> Value Embed</div>
                    <div><span className="text-muted">Description:</span> {descriptionTag}</div>
                    <div><span className="text-muted">Funding source:</span> {fundingSourceId}</div>
                    <div><span className="text-muted">Value:</span> ${value}</div>
                    <div><span className="text-muted">Expiration:</span> {expirationEnabled && expiration ? expiration : "None"}</div>
                  </>
                )}
                {codeType === "value-embed" && isBulk && (
                  <>
                    <div><span className="text-muted">Type:</span> Value Embed (bulk)</div>
                    <div><span className="text-muted">Description:</span> {descriptionTag}</div>
                    <div><span className="text-muted">Funding source:</span> {fundingSourceId}</div>
                    <div><span className="text-muted">Quantity:</span> {parsedQty} codes</div>
                    <div>
                      <span className="text-muted">Values:</span>{" "}
                      {bulkMin === bulkMax ? `$${bulkMin} each` : `$${bulkMin}–$${bulkMax}`}
                    </div>
                    <div><span className="text-muted">Total value:</span> ${bulkTotal.toLocaleString()}</div>
                  </>
                )}
                {codeType === "self-titling" && (
                  <>
                    <div><span className="text-muted">Type:</span> Self-Titling</div>
                    <div><span className="text-muted">Item tag:</span> {itemTag}</div>
                    <div><span className="text-muted">UNS name:</span> {unsName}</div>
                    <div><span className="text-muted">Image:</span> {selfTitlingImageUrl ? "Yes" : "None"}</div>
                    {selfTitlingImageUrl && (
                      <img src={selfTitlingImageUrl} alt="" className="mt-2 max-w-[120px] max-h-[120px] object-contain rounded-[8px] border border-[#e4e4e7]" />
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 flex-wrap">
                <Button variant="outline" onClick={() => setStep(isBulk ? 2 : 1)} className="w-full sm:w-[120px] h-11">Back</Button>
                <Button onClick={handleCreate} disabled={loading} className="w-full sm:w-[140px] h-11">
                  {loading ? "Creating…" : isBulk ? "Create codes" : "Create code"}
                </Button>
              </div>
            </>
          )}

          {/* STEP 3 or 4 — Success */}
          {step === successStep && successList.length > 0 && (
            <>
              <div className="text-center mb-2">
                <span className="text-[40px]">✓</span>
              </div>
              <h2 className="m-0 mb-2 text-[22px] font-bold text-zinc-950 text-center">Code created successfully</h2>
              <p className="m-0 mb-7 text-sm text-muted font-normal text-center">
                {successList.length === 1
                  ? "Your code is ready to use."
                  : `${successList.length} code sets generated and ready to use.`}
              </p>

              <div className="p-4 px-5 rounded-card bg-slate-50 mb-6 text-sm max-h-[180px] overflow-y-auto">
                {successList.slice(0, 8).map((c: { id: string; publicCode: string; label?: string; itemTag?: string }) => (
                  <div key={c.id} className="mb-1.5">
                    <a
                      href={createdVE ? pathToValueEmbedDetail(c.id) : pathToSelfTitlingDetail(c.id)}
                      className="text-primary font-medium underline"
                    >
                      {(c as ValueEmbedCodeSet).label ?? (c as SelfTitlingCodeSet).itemTag} — {c.publicCode}
                    </a>
                  </div>
                ))}
                {successList.length > 8 && (
                  <div className="text-muted mt-1">and {successList.length - 8} more…</div>
                )}
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 flex-wrap">
                <Button variant="outline" onClick={resetAndClose} className="w-full sm:w-[120px] h-11">
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
                  className="w-full sm:w-[120px] h-11"
                >
                  {successList.length === 1 ? "View code" : "View codes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
