import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import brandLogo from "../../assets/images/brand_logo.svg";
import { SearchIcon } from "../ui/SearchIcon";

const headerStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    padding: "12px 24px",
    backgroundColor: "var(--color-secondary)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  } as React.CSSProperties,
  left: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    minWidth: 0,
  } as React.CSSProperties,
  logoWrap: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "50px",
    backgroundColor: "var(--color-secondary)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    textDecoration: "none",
  } as React.CSSProperties,
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  navLink: (isActive: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 500,
    color: isActive ? "#FFFFFF" : "#09090b",
    backgroundColor: isActive ? "var(--color-primary)" : "transparent",
    textDecoration: "none",
  }),
  center: {
    flex: "1 1 320px",
    maxWidth: "480px",
    margin: "0 24px",
  } as React.CSSProperties,
  searchWrap: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    width: "100%",
  } as React.CSSProperties,
  searchInput: {
    width: "100%",
    padding: "10px 44px 10px 16px",
    fontSize: "14px",
    border: "1px solid #E0E0E0",
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
    outline: "none",
  } as React.CSSProperties,
  searchIcon: {
    position: "absolute" as const,
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none" as const,
  } as React.CSSProperties,
  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexShrink: 0,
  } as React.CSSProperties,
  getHelp: {
    fontSize: "14px",
    color: "#09090b",
    textDecoration: "none",
    fontWeight: 500,
  } as React.CSSProperties,
  userWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  } as React.CSSProperties,
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "var(--color-primary)",
    color: "var(--color-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 600,
  } as React.CSSProperties,
  userName: {
    fontSize: "14px",
    color: "#09090b",
    fontWeight: 500,
  } as React.CSSProperties,
  chevron: {
    color: "#09090b",
    marginLeft: "2px",
  } as React.CSSProperties,
};

export function AppHeader(): React.ReactElement {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.left}>
        <NavLink
          to={ROUTES.CODES}
          style={headerStyles.logoWrap}
          aria-label="USBC QR - Home"
        >
          <img
            src={brandLogo}
            alt="USBC QR"
            style={{ height: "32px", width: "auto" }}
          />
        </NavLink>
        <nav style={headerStyles.nav}>
          <NavLink
            to={ROUTES.CODES}
            style={({ isActive }) => headerStyles.navLink(isActive)}
          >
            Codes
          </NavLink>
          <NavLink
            to={ROUTES.WALLET}
            style={({ isActive }) => headerStyles.navLink(isActive)}
          >
            Wallet
          </NavLink>
        </nav>
      </div>

      <div style={headerStyles.center}>
        <div style={headerStyles.searchWrap}>
          <input
            type="search"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={headerStyles.searchInput}
            aria-label="Search"
          />
          <span style={headerStyles.searchIcon}>
            <SearchIcon />
          </span>
        </div>
      </div>

      <div style={headerStyles.right}>
        <a href="#help" style={headerStyles.getHelp}>
          Get Help
        </a>
        <div style={headerStyles.userWrap} role="button" tabIndex={0}>
          <div style={headerStyles.avatar} aria-hidden>
            A
          </div>
          <span style={headerStyles.userName}>alec</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={headerStyles.chevron}
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </header>
  );
}
