import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSelfTitlingCodeById } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import { ROUTES } from "../constants/routes";
import { SelfTitlingItemCard } from "../components/SelfTitlingItemCard";
import { EditSelfTitlingModal } from "../components/EditSelfTitlingModal";
import { TransferTitleModal } from "../components/TransferTitleModal";
import { StickerPrintModal } from "../components/ui";

export function SelfTitlingDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<SelfTitlingCodeSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);

  const refreshCode = (): void => {
    if (!id) return;
    getSelfTitlingCodeById(id).then((c) => setCode(c ?? null));
  };

  useEffect(() => {
    if (!id) return;
    getSelfTitlingCodeById(id).then((c) => {
      setCode(c ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Loading…</div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-body-text">Code not found.</div>
      </div>
    );
  }

  return (
    <>
      <SelfTitlingItemCard
        data={{
          itemTag: code.itemTag,
          status: code.status,
          publicCode: code.publicCode,
          ownerDisplay: code.unsName,
          qrUrl: code.qrUrl,
          description: code.description,
          imageUrl: code.imageUrl,
          createdAt: code.createdAt,
        }}
        showBackLink
        onBack={() => navigate(ROUTES.CODES)}
        showCTAs
        onEdit={() => setEditModalOpen(true)}
        onPrintSticker={() => setStickerModalOpen(true)}
        onTransfer={() => setTransferOpen(true)}
        showTransferButton={code.ownershipStatus !== "transferred"}
        qrCaption="QR links to item profile"
      />

      <EditSelfTitlingModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        code={code}
        onSuccess={refreshCode}
      />

      {id && (
        <TransferTitleModal
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          codeId={id}
          itemTag={code.itemTag}
          publicCode={code.publicCode}
          onTransferred={() =>
            setCode((previous) =>
              previous
                ? {
                    ...previous,
                    ownershipStatus: "transferred",
                    updatedAt: new Date().toISOString(),
                  }
                : null
            )
          }
        />
      )}

      <StickerPrintModal
        open={stickerModalOpen}
        onClose={() => setStickerModalOpen(false)}
        variant="self-titling"
      />
    </>
  );
}
