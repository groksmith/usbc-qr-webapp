import type React from "react";
import { useEffect, useState } from "react";
import { updateValueEmbedCode } from "../services/api";
import type { ValueEmbedCodeSet } from "../types";
import { validateValueAmount } from "../utils/validation";
import { Button, CloseIcon, Input } from "./ui";

function formatExpirationForInput(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function CloseButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 min-w-[36px] min-h-[36px] p-0 flex items-center justify-center rounded-full bg-transparent border-0 text-slate-400 cursor-pointer shrink-0 hover:bg-zinc-200 transition-colors"
      aria-label="Close"
    >
      <CloseIcon />
    </button>
  );
}

export interface EditValueEmbedModalProps {
  open: boolean;
  onClose: () => void;
  code: ValueEmbedCodeSet | null;
  onSuccess?: () => void;
}

export function EditValueEmbedModal({
  open,
  onClose,
  code,
  onSuccess,
}: EditValueEmbedModalProps): React.ReactElement | null {
  const [value, setValue] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expiration, setExpiration] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (open && code) {
      setValue(String(code.value));
      setExpirationEnabled(!!code.expiration);
      setExpiration(formatExpirationForInput(code.expiration));
      setErrors({});
    }
  }, [open, code]);

  if (!open || !code) return null;

  const handleClose = (): void => {
    if (!loading) onClose();
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const vValue = validateValueAmount(value);
    if (!vValue.valid) e.value = vValue.message!;
    if (expirationEnabled && !expiration.trim()) {
      e.expiration = "Expiration is required when set expiration is checked.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    try {
      await updateValueEmbedCode(code.id, {
        value: Number(value),
        expiration:
          expirationEnabled && expiration.trim() ? new Date(expiration).toISOString() : null,
      });
      onSuccess?.();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const shellClass =
    "w-full max-w-[420px] rounded-[16px] sm:rounded-[20px] bg-white border-0 outline-none shadow-[0_8px_48px_rgba(0,0,0,0.10)] p-4 sm:p-6";

  return (
    <div
      className="fixed inset-0 bg-[rgba(147,197,213,0.45)] backdrop-blur-[6px] flex items-center justify-center z-[1000] p-4 sm:p-0 overflow-y-auto"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-value-embed-title"
    >
      <div className={`${shellClass} mx-0 sm:mx-4`} onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between mb-1 min-h-[32px] gap-2">
          <h2
            id="edit-value-embed-title"
            className="m-0 text-lg sm:text-[22px] font-bold text-zinc-950"
          >
            Edit Value Embed
          </h2>
          <CloseButton onClick={handleClose} />
        </div>

        <p className="m-0 mb-1 text-sm text-muted">
          Update the value amount and expiration for this code.
        </p>
        <p className="m-0 mb-6 text-sm font-medium text-zinc-950">
          Description tag: <span className="font-semibold">{code.label}</span>
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <Input
            label="Value amount"
            required
            type="number"
            min={0}
            hint="Positive number (e.g. 50)"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setErrors((prev) => ({ ...prev, value: undefined }));
            }}
            placeholder="e.g. 50"
            error={errors.value}
            style={{ border: "1px solid #E0E0E0" }}
          />
          <div className="mb-4">
            {!code.expiration && (
              <label className="flex items-center gap-2 text-sm text-zinc-950 font-medium">
                <input
                  type="checkbox"
                  checked={expirationEnabled}
                  onChange={(e) => setExpirationEnabled(e.target.checked)}
                />
                Set expiration
              </label>
            )}
          </div>
          {expirationEnabled && (
            <Input
              label="Expiration"
              type="datetime-local"
              value={expiration}
              onChange={(e) => {
                setExpiration(e.target.value);
                setErrors((prev) => ({ ...prev, expiration: undefined }));
              }}
              error={errors.expiration}
              style={{ border: "1px solid #E0E0E0" }}
            />
          )}

          <div className="flex flex-wrap gap-3 mt-6 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-[120px] h-11"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-[120px] h-11">
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
