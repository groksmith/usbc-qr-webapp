import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { checkBalance } from "../services/api";
import type { CheckBalanceResult } from "../types";
import { ROUTES } from "../constants/routes";
import { STATUS_LABELS } from "../constants/status";
import { Button, Input } from "../components/ui";
import { validatePublicCode } from "../utils/validation";

export function CheckBalancePage(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const prefilledCode = searchParams.get("code") ?? "";
  const [publicCode, setPublicCode] = useState(prefilledCode);
  const [publicCodeError, setPublicCodeError] = useState<string | undefined>();
  const [result, setResult] = useState<CheckBalanceResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPublicCode(prefilledCode);
  }, [prefilledCode]);

  const handleCheck = async (): Promise<void> => {
    const validation = validatePublicCode(publicCode);
    if (!validation.valid) {
      setPublicCodeError(validation.message);
      return;
    }
    setPublicCodeError(undefined);
    setLoading(true);
    setResult(null);
    setSearched(true);
    try {
      const data = await checkBalance(publicCode.trim());
      setResult(data ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto px-4 sm:px-0">
      <h1 className="text-xl sm:text-2xl">Check balance</h1>
      <p className="mt-1 text-sm sm:text-base text-body-text">Enter the public code to see balance and status. Do not enter your private code here.</p>

      <div className="mb-6">
        <Input
          label="Public code"
          required
          hint="Letters, numbers, and hyphens only (e.g. VE-A1B2-C3D4-E5F6)"
          value={publicCode}
          onChange={(e) => { setPublicCode(e.target.value); setPublicCodeError(undefined); }}
          placeholder="e.g. VE-A1B2-C3D4-E5F6"
          error={publicCodeError}
        />
        <Button onClick={handleCheck} disabled={loading}>
          {loading ? "Checking…" : "Check balance"}
        </Button>
      </div>

      {searched && !loading && !result && (
        <p className="text-body-text">No item found for this public code.</p>
      )}

      {searched && !loading && result && (
        <div className="card p-4 sm:p-7 sm:px-8 mb-6">
          <h2>Result</h2>
          <p><strong>Current balance:</strong> {result.balance}</p>
          <p><strong>Original value:</strong> {result.value}</p>
          <p><strong>Status:</strong> {STATUS_LABELS[result.status]}</p>
          {result.status === "active" && (
            <p className="mt-4 text-base">
              To redeem, you need the private code, a bronze badge, and a UNS name.{" "}
              <Link to={`${ROUTES.REDEEM}?code=${encodeURIComponent(result.publicCode)}`} className="text-primary font-semibold">
                Go to Redeem page
              </Link>
            </p>
          )}
        </div>
      )}

      {searched && !loading && !result && (
        <p className="text-body-text">No item found for this public code.</p>
      )}

      <section className="card mt-6 sm:mt-8 p-4 sm:p-6 sm:px-7">
        <h2>How to redeem</h2>
        <p>You need:</p>
        <ul>
          <li>The <strong>private code</strong> (from the inside sticker or secure message)</li>
          <li>A <strong>bronze badge</strong> identity</li>
          <li>A valid <strong>UNS name</strong> linked to that identity</li>
        </ul>
        <p>
          <Link to={ROUTES.REDEEM} className="text-primary font-semibold">
            Go to Redeem page
          </Link>
        </p>
        <p className="text-sm mt-4">
          Download the app and acquire a bronze badge to complete redemption. This page is for
          information only; redemption is done on the Redeem page.
        </p>
      </section>
    </div>
  );
}
