import React from "react";
import { Outlet } from "react-router-dom";

export function PublicLayout(): React.ReactElement {
  return (
    <div className="min-h-screen py-7 px-8">
      <Outlet />
    </div>
  );
}
