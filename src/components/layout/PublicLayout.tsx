import React from "react";
import { Outlet } from "react-router-dom";

export function PublicLayout(): React.ReactElement {
  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px" }}>
      <Outlet />
    </div>
  );
}
