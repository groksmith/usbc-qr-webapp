import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import brandLogo from "../../assets/images/brand_logo.svg";
import { SearchIcon } from "../ui/SearchIcon";

const headerStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    padding: "14px 28px",
    backgroundColor: "var(--color-secondary)",
    boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
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
    borderRadius: "12px",
    backgroundColor: "#f4f4f5",
    border: "1px solid #e4e4e7",
    textDecoration: "none",
  } as React.CSSProperties,
  logoImg: {
    height: "28px",
    width: "auto",
    display: "block",
  } as React.CSSProperties,
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  } as React.CSSProperties,
  navLink: (isActive: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#FFFFFF" : "#09090b",
    backgroundColor: isActive ? "var(--color-primary)" : "transparent",
    textDecoration: "none",
  }),
  center: {
    flex: "1 1 320px",
    maxWidth: "480px",
    margin: "0 32px",
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
    fontWeight: 400,
    border: "1px solid #e4e4e7",
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
    gap: "24px",
    flexShrink: 0,
  } as React.CSSProperties,
  getHelp: {
    fontSize: "14px",
    fontWeight: 400,
    color: "#09090b",
    textDecoration: "none",
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
    backgroundColor: "#a5b4fc",
    color: "#312e81",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 600,
  } as React.CSSProperties,
  userName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#09090b",
  } as React.CSSProperties,
  chevron: {
    color: "#09090b",
    marginLeft: "2px",
  } as React.CSSProperties,
  userWrapRelative: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  } as React.CSSProperties,
  dropdownPanel: {
    position: "absolute" as const,
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: "240px",
    padding: "16px 16px 20px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    zIndex: 1000,
  } as React.CSSProperties,
  signedInBlock: {
    padding: "4px 0 8px",
  } as React.CSSProperties,
  signedInAs: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    color: "#71717a",
    marginBottom: "4px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  dropdownPhone: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#18181b",
    marginBottom: "0",
  } as React.CSSProperties,
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#e5e5e7",
    margin: "8px -16px",
    border: "none",
  } as React.CSSProperties,
  dropdownProfileRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 0",
    margin: "0",
    borderRadius: "8px",
  } as React.CSSProperties,
  dropdownAvatarSmall: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#a5b4fc",
    color: "#312e81",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 600,
    flexShrink: 0,
  } as React.CSSProperties,
  dropdownProfileName: {
    flex: 1,
    fontSize: "14px",
    fontWeight: 500,
    color: "#18181b",
  } as React.CSSProperties,
  dropdownMenuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px 0",
    marginBottom: "0",
    fontSize: "14px",
    fontWeight: 500,
    color: "#18181b",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "var(--font-family)",
  } as React.CSSProperties,
  dropdownSignOut: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 0",
    marginTop: "0",
    fontSize: "14px",
    fontWeight: 500,
    color: "#18181b",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "var(--font-family)",
  } as React.CSSProperties,
};

export function AppHeader(): React.ReactElement {
  const [searchValue, setSearchValue] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleSignOut = () => {
    setUserMenuOpen(false);
    // TODO: clear auth and redirect to login
    navigate(ROUTES.HOME);
  };

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
            alt="USBC"
            style={headerStyles.logoImg}
          />
        </NavLink>
        <nav style={headerStyles.nav}>
          <NavLink
            to={ROUTES.CODES}
            style={({ isActive }) => headerStyles.navLink(isActive)}
          >
            Codes
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
        <div
          ref={userMenuRef}
          style={headerStyles.userWrapRelative}
          role="button"
          tabIndex={0}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
          onClick={() => setUserMenuOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setUserMenuOpen((open) => !open);
            }
          }}
        >
          <div style={headerStyles.avatar} aria-hidden>
            F
          </div>
          <span style={headerStyles.userName}>frunjyan</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ ...headerStyles.chevron, transform: userMenuOpen ? "rotate(180deg)" : undefined }}
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          {userMenuOpen && (
            <div className="header-user-menu" style={headerStyles.dropdownPanel} role="menu">
              <div style={headerStyles.signedInBlock} role="none">
                <div style={headerStyles.signedInAs}>Signed in as</div>
                <div style={headerStyles.dropdownPhone}>+37441878899</div>
              </div>
              <div style={headerStyles.dropdownDivider} role="separator" />
              <div className="header-user-menu-profile" style={headerStyles.dropdownProfileRow}>
                <div style={headerStyles.dropdownAvatarSmall} aria-hidden>
                  F
                </div>
                <span style={headerStyles.dropdownProfileName}>frunjyan</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" fill="var(--color-primary)" />
                  <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={headerStyles.dropdownDivider} aria-hidden />
              <button
                type="button"
                style={headerStyles.dropdownMenuItem}
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/settings");
                }}
              >
                Settings
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <div style={headerStyles.dropdownDivider} aria-hidden />
              <button
                type="button"
                className="header-user-menu-signout"
                style={headerStyles.dropdownSignOut}
                role="menuitem"
                onClick={handleSignOut}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
