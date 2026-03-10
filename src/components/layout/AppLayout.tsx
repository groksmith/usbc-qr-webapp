import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function AppLayout(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-8 pb-7 pt-[calc(28px+72px)]">
        <Outlet />
      </main>
    </div>
  );
}
