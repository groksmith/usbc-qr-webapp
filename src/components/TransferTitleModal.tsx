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
      <div className="flex flex-col gap-5 w-full min-w-0 sm:min-w-[320px]">
        <div className="p-3 px-4 bg-slate-50 rounded-card text-sm">
          <p className="m-0 mb-1.5 text-muted"><strong>Item tag</strong></p>
          <p className="m-0 text-zinc-950">{itemTag}</p>
          <p className="mt-3 mb-0 text-muted"><strong>Public code</strong></p>
          <div className="flex items-center gap-0 mt-1">
            <code className="font-mono text-sm text-zinc-950">{publicCode}</code>
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
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={transferring} className="w-full sm:w-auto">
            {transferring ? "Transferring…" : "Transfer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
