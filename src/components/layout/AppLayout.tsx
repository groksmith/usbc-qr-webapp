import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function AppLayout(): React.ReactElement {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader />
      <main style={{ flex: 1, padding: "24px" }}>
        <Outlet />
      </main>
    </div>
  );
}
