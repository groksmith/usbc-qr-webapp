import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { redeem } from "../services/api";
import type { RedeemResult } from "../types";
import { ROUTES } from "../constants/routes";
import { Button, Input } from "../components/ui";
import { validatePublicCode, validatePrivateCode, validateUnsName, UNS_NAME_HINT } from "../utils/validation";

export function RedeemPage(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const prefilledCode = searchParams.get("code") ?? "";
  const [publicCode, setPublicCode] = useState(prefilledCode);
  const [privateCode, setPrivateCode] = useState("");
  const [unsName, setUnsName] = useState("");
  const [publicCodeError, setPublicCodeError] = useState<string | undefined>();
  const [privateCodeError, setPrivateCodeError] = useState<string | undefined>();
  const [unsNameError, setUnsNameError] = useState<string | undefined>();
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (): Promise<void> => {
    const vPublic = validatePublicCode(publicCode);
    const vPrivate = validatePrivateCode(privateCode);
    const vUns = validateUnsName(unsName);
    setPublicCodeError(vPublic.valid ? undefined : vPublic.message);
    setPrivateCodeError(vPrivate.valid ? undefined : vPrivate.message);
    setUnsNameError(vUns.valid ? undefined : vUns.message);
    if (!vPublic.valid || !vPrivate.valid || !vUns.valid) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await redeem({
        publicCode: publicCode.trim(),
        privateCode: privateCode.trim(),
        unsName: unsName.trim(),
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto px-4 sm:px-0">
      <h1 className="text-xl sm:text-2xl">Redeem value</h1>
      <p className="mt-1 text-sm sm:text-base text-body-text">
        Enter the <strong>private code</strong> and your <strong>UNS name</strong> (with bronze
        badge) to redeem. Do not share your private code.
      </p>

      <div className="mb-6">
        <Input
          label="Public code"
          required
          hint="From the QR or outside sticker. Letters, numbers, and hyphens only."
          value={publicCode}
          onChange={(e) => { setPublicCode(e.target.value); setPublicCodeError(undefined); }}
          placeholder="e.g. VE-A1B2-C3D4-E5F6"
          error={publicCodeError}
        />
        <Input
          label="Private code"
          required
          type="password"
          hint="From inside sticker or secure message. Never share this."
          value={privateCode}
          onChange={(e) => { setPrivateCode(e.target.value); setPrivateCodeError(undefined); }}
          placeholder="From inside sticker or secure message"
          error={privateCodeError}
        />
        <Input
          label="UNS name (bronze badge required)"
          required
          hint={UNS_NAME_HINT}
          value={unsName}
          onChange={(e) => { setUnsName(e.target.value); setUnsNameError(undefined); }}
          placeholder="e.g. alice.uns"
          error={unsNameError}
        />
        <Button
          onClick={handleRedeem}
          disabled={loading}
        >
          {loading ? "Redeeming…" : "Redeem"}
        </Button>
      </div>

      {result && (
        <div className={`p-4 sm:p-6 rounded-[8px] mb-6 ${result.success ? "bg-green-100" : "bg-red-100"}`}>
          {result.success ? (
            <>
              <h2>Redemption complete</h2>
              <p>Redeemed amount: {result.redeemedAmount}</p>
              <p>Destination: {result.destination}</p>
              <p>Time: {result.timestamp ? new Date(result.timestamp).toLocaleString() : "—"}</p>
            </>
          ) : (
            <>
              <h2>Redemption failed</h2>
              <p>{result.error ?? "Unknown error."}</p>
              <p className="text-sm mt-2">
                Possible reasons: invalid code, already redeemed, expired, cancelled, or UNS name
                not valid / not bronze badge.
              </p>
            </>
          )}
        </div>
      )}

      <section className="mt-6 sm:mt-8 p-4 sm:p-4 bg-white/60 rounded-[8px]">
        <h2>Instructions</h2>
        <ul>
          <li><strong>Public code</strong> — on the QR or outside sticker; safe to share for balance check.</li>
          <li><strong>Private code</strong> — on the inside sticker or sent securely; never share.</li>
          <li><strong>Bronze badge</strong> — required to receive redeemed value; get it via the app.</li>
        </ul>
        <p>
          <Link to={ROUTES.CHECK_BALANCE} className="text-primary font-semibold">
            Check balance first
          </Link>
        </p>
      </section>
    </div>
  );
}
