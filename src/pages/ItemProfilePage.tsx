import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SelfTitlingItemCard } from "../components/SelfTitlingItemCard";
import { getItemProfile, submitStolenReport } from "../services/api";
import type { ItemProfilePublic } from "../types";
import { Button, Input, Textarea } from "../components/ui";

function StolenReportForm({ publicCode }: { publicCode: string }): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whereWasSeen, setWhereWasSeen] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Your name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email.";
    if (!whereWasSeen.trim()) e.whereWasSeen = "Please describe where you saw the item.";
    if (!message.trim()) e.message = "A report message is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent): Promise<void> => {
    ev.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    try {
      await submitStolenReport({
        publicCode,
        name: name.trim(),
        email: email.trim(),
        whereWasSeen: whereWasSeen.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-[68rem] mx-auto px-4 sm:px-6 mt-6">
        <div className="rounded-2xl bg-white border border-zinc-200 shadow-soft p-6 sm:p-8 text-center">
          <p className="text-base font-semibold text-green-600 m-0 mb-1">Report submitted</p>
          <p className="text-sm text-zinc-500 m-0">
            Thank you. Your report has been sent to the owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[68rem] mx-auto px-4 sm:px-6 mt-6">
      <div className="rounded-2xl bg-white border border-red-200 shadow-soft p-6 sm:p-8">
        <h2 className="m-0 mb-1 text-lg font-bold text-zinc-950">Report a sighting</h2>
        <p className="m-0 mb-6 text-[14px] text-zinc-500">
          If you have seen this item, please fill out the form below and we will notify the owner.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          <Input
            label="Your name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Jane Smith"
            error={errors.name}
            style={{ border: "1px solid #E0E0E0" }}
          />
          <Input
            label="Email"
            required
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="you@example.com"
            error={errors.email}
            style={{ border: "1px solid #E0E0E0" }}
          />
          <Input
            label="Where was it seen"
            required
            value={whereWasSeen}
            onChange={(e) => {
              setWhereWasSeen(e.target.value);
              setErrors((prev) => ({ ...prev, whereWasSeen: undefined }));
            }}
            placeholder="e.g. Central Park, New York"
            error={errors.whereWasSeen}
            style={{ border: "1px solid #E0E0E0" }}
          />
          <Textarea
            label="Report message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setErrors((prev) => ({ ...prev, message: undefined }));
            }}
            placeholder="Describe what you saw..."
            error={errors.message}
            style={{ border: "1px solid #E0E0E0" }}
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-[160px] h-11">
              {loading ? "Submitting…" : "Submit report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Public page for a self-titled code (no auth required).
 * Route: /item/:publicCode (e.g. /item/ST-ABC-123)
 */
export function ItemProfilePage(): React.ReactElement {
  const { publicCode } = useParams<{ publicCode: string }>();
  const [profile, setProfile] = useState<ItemProfilePublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicCode) return;
    getItemProfile(decodeURIComponent(publicCode)).then((p) => {
      setProfile(p ?? null);
      setLoading(false);
    });
  }, [publicCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Item not found.</div>
      </div>
    );
  }

  return (
    <>
      <SelfTitlingItemCard
        data={{
          itemTag: profile.itemTag,
          status: profile.status,
          publicCode: profile.publicCode,
          ownerDisplay: profile.ownerDisplay,
          qrUrl: profile.qrUrl,
          description: profile.description,
          imageUrl: profile.imageUrl,
          createdAt: profile.createdAt,
          itemConditionStatus: profile.itemConditionStatus,
          rewardOffer: profile.rewardOffer,
        }}
        qrCaption="QR links to this page"
      />
      {profile.itemConditionStatus === "stolen" && (
        <StolenReportForm publicCode={profile.publicCode} />
      )}
    </>
  );
}
