import React from "react";
import { Outlet } from "react-router-dom";

export function PublicLayout(): React.ReactElement {
  return (
    <div className="min-h-screen py-4 px-4 sm:py-6 sm:px-6 md:py-7 md:px-8">
      <Outlet />
    </div>
  );
}
