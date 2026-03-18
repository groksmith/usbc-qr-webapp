import type React from "react";
import { useEffect, useState } from "react";
import { ITEM_CONDITION_LABELS } from "../constants/status";
import { updateSelfTitlingCode } from "../services/api";
import type { ItemConditionStatus, SelfTitlingCodeSet } from "../types";
import { validateImageFile } from "../utils/validation";
import { Button, CloseIcon, Input, Textarea } from "./ui";

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

export interface EditSelfTitlingModalProps {
  open: boolean;
  onClose: () => void;
  code: SelfTitlingCodeSet | null;
  onSuccess?: () => void;
}

export function EditSelfTitlingModal({
  open,
  onClose,
  code,
  onSuccess,
}: EditSelfTitlingModalProps): React.ReactElement | null {
  const [itemTag, setItemTag] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [itemConditionStatus, setItemConditionStatus] = useState<ItemConditionStatus>("normal");
  const [rewardOffer, setRewardOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (open && code) {
      setItemTag(code.itemTag);
      setImageUrl(code.imageUrl ?? null);
      setImageError(undefined);
      setDescription(code.description ?? "");
      setItemConditionStatus(code.itemConditionStatus ?? "normal");
      setRewardOffer(code.rewardOffer ?? "");
      setErrors({});
    }
  }, [open, code]);

  if (!open || !code) return null;

  const handleClose = (): void => {
    if (!loading) onClose();
  };

  const handleSubmit = async (ev: React.FormEvent): Promise<void> => {
    ev.preventDefault();
    const itemTagTrimmed = itemTag.trim();
    const errs: Record<string, string> = {};
    if (!itemTagTrimmed) errs.itemTag = "Item tag is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0 || loading) return;
    setLoading(true);
    try {
      await updateSelfTitlingCode(code.id, {
        itemTag: itemTagTrimmed,
        imageUrl: imageUrl ?? null,
        description: description.trim() || null,
        itemConditionStatus,
        rewardOffer: rewardOffer.trim() || null,
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
      aria-labelledby="edit-self-titling-title"
    >
      <div className={`${shellClass} mx-0 sm:mx-4`} onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between mb-1 min-h-[32px] gap-2">
          <h2
            id="edit-self-titling-title"
            className="m-0 text-lg sm:text-[22px] font-bold text-zinc-950"
          >
            Edit Self-Titling Code
          </h2>
          <CloseButton onClick={handleClose} />
        </div>

        <p className="m-0 mb-6 text-sm text-muted">Update item image, tag, and description.</p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-950 mb-1.5">
              Item image <span className="font-normal text-muted">(optional)</span>
            </label>
            {imageUrl ? (
              <div className="flex flex-col gap-2">
                <div className="w-[200px] h-[200px] rounded-[8px] overflow-hidden border border-[#e4e4e7] bg-zinc-100">
                  <img src={imageUrl} alt="Item preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <label className="py-2 px-3 text-sm font-medium text-primary bg-primary/[0.08] border border-primary/20 rounded-[8px] cursor-pointer">
                    Change image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const v = validateImageFile(file);
                        if (!v.valid) {
                          setImageError(v.message);
                          return;
                        }
                        setImageError(undefined);
                        const reader = new FileReader();
                        reader.onload = () => setImageUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(null);
                      setImageError(undefined);
                    }}
                    className="py-2 px-3 text-sm font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-[8px] cursor-pointer hover:bg-zinc-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full py-6 px-4 border-2 border-dashed rounded-[8px] cursor-pointer border-[#e4e4e7] hover:border-primary/50 hover:bg-primary/[0.04] transition-colors">
                <span className="text-sm font-medium text-zinc-600">
                  Click or drag and drop to upload
                </span>
                <span className="text-xs text-muted mt-1 block text-center">PNG, JPG, JPEG</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const v = validateImageFile(file);
                    if (!v.valid) {
                      setImageError(v.message);
                      return;
                    }
                    setImageError(undefined);
                    const reader = new FileReader();
                    reader.onload = () => setImageUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}
            {imageError && <p className="mt-1 mb-0 text-sm text-negative">{imageError}</p>}
          </div>

          <Input
            label="Item tag"
            required
            value={itemTag}
            onChange={(e) => {
              setItemTag(e.target.value);
              setErrors((prev) => ({ ...prev, itemTag: undefined }));
            }}
            placeholder="e.g. Conference badge"
            error={errors.itemTag}
            style={{ border: "1px solid #E0E0E0" }}
          />
          <Textarea
            label="Description"
            optional
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Limited edition conference badge 2024"
            style={{ border: "1px solid #E0E0E0" }}
          />

          <div className="mb-4">
            <label className="block text-[14px] font-medium text-zinc-950 mb-1.5">
              Item status
            </label>
            <div className="flex gap-2">
              {(["normal", "lost", "stolen"] as ItemConditionStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setItemConditionStatus(s)}
                  className={[
                    "flex-1 h-9 rounded-[8px] text-sm font-medium border transition-colors",
                    itemConditionStatus === s
                      ? s === "normal"
                        ? "bg-green-500 text-white border-green-500"
                        : s === "lost"
                          ? "bg-amber-400 text-white border-amber-400"
                          : "bg-red-500 text-white border-red-500"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400",
                  ].join(" ")}
                >
                  {ITEM_CONDITION_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {(itemConditionStatus === "lost" || itemConditionStatus === "stolen") && (
            <Input
              label="Reward offer"
              optional
              value={rewardOffer}
              onChange={(e) => setRewardOffer(e.target.value)}
              placeholder="e.g. $50 reward for safe return"
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
