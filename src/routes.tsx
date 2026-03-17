import type React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout, PublicLayout } from "./components/layout";
import { ROUTES } from "./constants/routes";
import {
  CheckBalancePage,
  CodesDashboardPage,
  ItemProfilePage,
  RedeemPage,
  SelfTitlingDetailPage,
  ValueEmbedDetailPage,
} from "./pages";

export function RoutesConfig(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.CODES} replace />} />

        <Route element={<AppLayout />}>
          <Route path={ROUTES.CODES} element={<CodesDashboardPage />} />
          <Route
            path={ROUTES.CODES_VALUE_EMBED_NEW}
            element={<Navigate to={ROUTES.CODES} replace />}
          />
          <Route path={ROUTES.CODES_VALUE_EMBED_DETAIL} element={<ValueEmbedDetailPage />} />
          <Route
            path={ROUTES.CODES_SELF_TITLING_NEW}
            element={<Navigate to={ROUTES.CODES} replace />}
          />
          <Route path={ROUTES.CODES_SELF_TITLING_DETAIL} element={<SelfTitlingDetailPage />} />
          <Route path={ROUTES.ITEM_PROFILE} element={<ItemProfilePage />} />
          <Route path={ROUTES.TRANSFER_HISTORY} element={<Navigate to={ROUTES.CODES} replace />} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route path={ROUTES.CHECK_BALANCE} element={<CheckBalancePage />} />
          <Route path={ROUTES.REDEEM} element={<RedeemPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.CODES} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
