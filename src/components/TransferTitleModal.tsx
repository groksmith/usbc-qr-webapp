import React, { useState } from "react";
import { transferSelfTitling } from "../services/api";
import { Button, CopyIconButton, Modal, SearchInput } from "./ui";
import { validateUnsName, UNS_NAME_HINT } from "../utils/validation";

export interface TransferTitleModalProps {
  open: boolean;
  onClose: () => void;
  codeId: string;
  itemTag: string;
  publicCode: string;
  /** Called after a successful transfer (e.g. to refresh list or update sidebar state) */
  onTransferred?: () => void;
}

export function TransferTitleModal({
  open,
  onClose,
  codeId,
  itemTag,
  publicCode,
  onTransferred,
}: TransferTitleModalProps): React.ReactElement {
  const [recipient, setRecipient] = useState("");
  const [recipientError, setRecipientError] = useState<string | undefined>();
  const [transferring, setTransferring] = useState(false);

  const handleClose = (): void => {
    setRecipient("");
    setRecipientError(undefined);
    onClose();
  };

  const handleTransfer = async (): Promise<void> => {
    const validation = validateUnsName(recipient);
    if (!validation.valid) {
      setRecipientError(validation.message);
      return;
    }
    setRecipientError(undefined);
    setTransferring(true);
    await transferSelfTitling(codeId, recipient.trim());
    setTransferring(false);
    setRecipient("");
    handleClose();
    onTransferred?.();
  };

  if (!open) return <></>;

  return (
    <Modal open={open} onClose={handleClose} title="Transfer title">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: "320px" }}>
        <div style={{ padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "12px", fontSize: "14px" }}>
          <p style={{ margin: "0 0 6px", color: "#64748b" }}><strong>Item tag</strong></p>
          <p style={{ margin: 0, color: "#09090b" }}>{itemTag}</p>
          <p style={{ margin: "12px 0 0", color: "#64748b" }}><strong>Public code</strong></p>
          <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "4px" }}>
            <code style={{ fontFamily: "monospace", fontSize: "14px", color: "#09090b" }}>{publicCode}</code>
            <CopyIconButton text={publicCode} />
          </div>
        </div>
        <SearchInput
          label="Recipient (UNS name)"
          required
          hint={UNS_NAME_HINT}
          value={recipient}
          onChange={(e) => { setRecipient(e.target.value); setRecipientError(undefined); }}
          placeholder="Search or enter e.g. bob.uns"
          error={recipientError}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={transferring}>
            {transferring ? "Transferring…" : "Transfer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
