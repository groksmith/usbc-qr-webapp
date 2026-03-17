import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SearchInput, Textarea } from "../components/ui";
import { pathToSelfTitlingDetail, ROUTES } from "../constants/routes";
import { createSelfTitlingCodes } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";

const STEPS = ["Type", "Configuration", "Review", "Create"] as const;

export function SelfTitlingNewPage(): React.ReactElement {
  const [step, setStep] = useState(0);
  const [itemTag, setItemTag] = useState("");
  const [unsName, setUnsName] = useState("");
  const [description, setDescription] = useState("");
  const [created, setCreated] = useState<SelfTitlingCodeSet[] | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await createSelfTitlingCodes({
        itemTag,
        unsName,
        description: description.trim() || undefined,
        quantity: 1,
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
        <p>Code set created.</p>
        <ul className="mb-6">
          {created.map((c) => (
            <li key={c.id}>
              <a href={pathToSelfTitlingDetail(c.id)} className="text-primary">
                {c.itemTag} — {c.publicCode}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <Button onClick={() => navigate(ROUTES.CODES)}>Done</Button>
          <Button variant="outline">Print stickers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[560px]">
      <h1>Generate Self-Titling Code</h1>
      <p className="mb-6">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {step === 0 && (
        <div>
          <p>
            You are creating <strong>Self-Titling</strong> code sets (item tag + UNS name, single
            sticker).
          </p>
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
          <Textarea
            label="Description"
            optional
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Limited edition conference badge 2024"
          />
          <SearchInput
            label="UNS name (required)"
            required
            value={unsName}
            onChange={(e) => setUnsName(e.target.value)}
            placeholder="e.g. alice.uns"
          />
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => setStep(2)} disabled={!itemTag.trim() || !unsName.trim()}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>
            <strong>Item tag:</strong> {itemTag}
          </p>
          <p>
            <strong>UNS name:</strong> {unsName}
          </p>
          {description.trim() && (
            <p>
              <strong>Description:</strong> {description.trim()}
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
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
