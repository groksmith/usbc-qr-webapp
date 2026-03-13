import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSelfTitlingCodeById } from "../services/api";
import type { SelfTitlingCodeSet } from "../types";
import { ROUTES } from "../constants/routes";
import { SelfTitlingItemCard } from "../components/SelfTitlingItemCard";
import { TransferTitleModal } from "../components/TransferTitleModal";
import { StickerExportModal } from "../components/ui";

export function SelfTitlingDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<SelfTitlingCodeSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);

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
          imageUrl: code.imageUrl,
          createdAt: code.createdAt,
        }}
        showBackLink
        onBack={() => navigate(ROUTES.CODES)}
        showCTAs
        onExportSticker={() => setStickerModalOpen(true)}
        onTransfer={() => setTransferOpen(true)}
        showTransferButton={code.ownershipStatus !== "transferred"}
        qrCaption="QR links to item profile"
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

      <StickerExportModal
        open={stickerModalOpen}
        onClose={() => setStickerModalOpen(false)}
        variant="self-titling"
      />
    </>
  );
}
