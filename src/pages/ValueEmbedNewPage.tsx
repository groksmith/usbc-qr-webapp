import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createValueEmbedCodes } from "../services/api";
import type { ValueEmbedCodeSet } from "../types";
import { ROUTES, pathToValueEmbedDetail } from "../constants/routes";
import { Button, Input } from "../components/ui";

const STEPS = ["Type", "Configuration", "Review", "Create"] as const;

export function ValueEmbedNewPage(): React.ReactElement {
  const [step, setStep] = useState(0);
  const [descriptionTag, setDescriptionTag] = useState("");
  const [fundingSourceId, setFundingSourceId] = useState("USBC");
  const [value, setValue] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expiration, setExpiration] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [created, setCreated] = useState<ValueEmbedCodeSet[] | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await createValueEmbedCodes({
        descriptionTag,
        fundingSourceId,
        value: Number(value) || 0,
        expiration: expirationEnabled && expiration ? expiration : undefined,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
      });
      setCreated(result.codes);
    } finally {
      setLoading(false);
    }
  };

  if (created && created.length > 0) {
    return (
      <div>
        <h1>Value Embed code created</h1>
        <p>{created.length === 1 ? "Code set created." : `Created ${created.length} code sets.`}</p>
        <ul className="mb-6">
          {created.map((c) => (
            <li key={c.id}>
              <a href={pathToValueEmbedDetail(c.id)} className="text-primary">
                {c.label} — {c.publicCode}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <Button onClick={() => navigate(ROUTES.CODES)}>Done</Button>
          <Button variant="outline">Export stickers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[560px]">
      <h1>Generate Value Embed Code</h1>
      <p className="mb-6">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {step === 0 && (
        <div>
          <p>You are creating <strong>Value Embed</strong> code sets (with funding source, value, optional expiration).</p>
          <Button onClick={() => setStep(1)}>Next</Button>
        </div>
      )}

      {step === 1 && (
        <div>
          <Input
            label="Description tag (required)"
            value={descriptionTag}
            onChange={(e) => setDescriptionTag(e.target.value)}
            placeholder="e.g. Holiday promo 2024"
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
              <option value="URT" disabled className="text-zinc-400">
                URT (Coming soon)
              </option>
            </select>
          </div>
          <Input
            label="Value amount (required)"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 50"
          />
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium">
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
              label="Expiration (date/time)"
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
          )}
          <Input
            label="Quantity (bulk)"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)} disabled={!descriptionTag.trim() || !value}>Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p><strong>Description tag:</strong> {descriptionTag}</p>
          <p><strong>Funding source:</strong> {fundingSourceId}</p>
          <p><strong>Value:</strong> {value}</p>
          <p><strong>Expiration:</strong> {expirationEnabled && expiration ? expiration : "None"}</p>
          <p><strong>Quantity:</strong> {quantity}</p>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={() => navigate(ROUTES.CODES)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
