import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSelfTitlingCodes } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import { ROUTES, pathToSelfTitlingDetail } from "../constants/routes";
import { Button, Input } from "../components/ui";

const STEPS = ["Type", "Configuration", "Review", "Create"] as const;

export function SelfTitlingNewPage(): React.ReactElement {
  const [step, setStep] = useState(0);
  const [itemTag, setItemTag] = useState("");
  const [unsName, setUnsName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [created, setCreated] = useState<SelfTitlingCodeSet[] | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await createSelfTitlingCodes({
        itemTag,
        unsName,
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
        <h1>Self-Titling code created</h1>
        <p>{created.length === 1 ? "Code set created." : `Created ${created.length} code sets.`}</p>
        <ul style={{ marginBottom: "24px" }}>
          {created.map((c) => (
            <li key={c.id}>
              <a href={pathToSelfTitlingDetail(c.id)} style={{ color: "var(--color-primary)" }}>
                {c.itemTag} — {c.publicCode}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button onClick={() => navigate(ROUTES.CODES)}>Done</Button>
          <Button variant="outline">Export stickers</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "560px" }}>
      <h1>Generate Self-Titling Code</h1>
      <p style={{ marginBottom: "24px" }}>
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {step === 0 && (
        <div>
          <p>You are creating <strong>Self-Titling</strong> code sets (item tag + UNS name, single sticker).</p>
          <Button onClick={() => setStep(1)}>Next</Button>
        </div>
      )}

      {step === 1 && (
        <div>
          <Input
            label="Item tag (required)"
            value={itemTag}
            onChange={(e) => setItemTag(e.target.value)}
            placeholder="e.g. Conference badge"
          />
          <Input
            label="UNS name (required)"
            value={unsName}
            onChange={(e) => setUnsName(e.target.value)}
            placeholder="e.g. alice.uns"
          />
          <Input
            label="Quantity (bulk)"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!itemTag.trim() || !unsName.trim()}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p><strong>Item tag:</strong> {itemTag}</p>
          <p><strong>UNS name:</strong> {unsName}</p>
          <p><strong>Quantity:</strong> {quantity}</p>
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <Button variant="outline" onClick={() => navigate(ROUTES.CODES)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
