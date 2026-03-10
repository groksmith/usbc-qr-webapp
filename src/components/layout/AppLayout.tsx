import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function AppLayout(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-4 sm:px-6 md:px-8 pb-6 sm:pb-7 pt-[calc(28px+72px)] sm:pt-[calc(28px+72px)]">
        <Outlet />
      </main>
    </div>
  );
}
