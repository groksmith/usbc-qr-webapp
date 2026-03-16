import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import brandLogo from "../../assets/images/brand_logo.svg";
import profilePicPlaceholder from "../../assets/images/profile-pic-placeholder.jpg";

export function AppHeader(): React.ReactElement {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRefMobile = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const outsideDesktop = userMenuRef.current && !userMenuRef.current.contains(target);
      const outsideMobile = userMenuRefMobile.current && !userMenuRefMobile.current.contains(target);
      if (outsideDesktop && outsideMobile) setUserMenuOpen(false);
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
    <header className="fixed top-0 left-0 right-0 z-[1000] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 sm:py-[14px] px-4 sm:px-7 bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      {/* Left: logo + nav (desktop) | logo only (mobile). Right on mobile: burger + user grouped */}
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-5 min-w-0 w-full sm:w-auto">
        <div className="flex items-center gap-2 sm:gap-5 min-w-0">
          <NavLink
            to={ROUTES.CODES}
            className="flex items-center py-1.5 sm:py-2 px-2 sm:px-3 rounded-card bg-zinc-100 border border-zinc-200 no-underline shrink-0"
            aria-label="USBC QR - Home"
          >
            <img src={brandLogo} alt="USBC" className="h-6 sm:h-7 w-auto block" />
          </NavLink>
        </div>

        {/* Mobile only: user + burger grouped on the right (burger rightmost) */}
        <div className="sm:hidden flex items-center gap-2 shrink-0">
          <div
            ref={userMenuRefMobile}
            className="relative flex items-center gap-[10px] cursor-pointer shrink-0"
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
          <div
            className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden"
            aria-hidden
          >
            <img
              src={profilePicPlaceholder}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-zinc-950 truncate max-w-[100px]">frunjyan</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-zinc-950 ml-0.5 transition-transform duration-150 ${userMenuOpen ? "rotate-180" : "rotate-0"}`}
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          {userMenuOpen && (
            <div
              className="absolute top-[calc(100%+8px)] right-0 min-w-[240px] p-4 pb-5 bg-white/[0.92] backdrop-blur-xl border border-black/[0.06] rounded-card shadow-[0_4px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] z-[1000]"
              role="menu"
            >
              <div className="pt-1 pb-2" role="none">
                <div className="text-[11px] font-semibold tracking-[0.05em] text-zinc-500 mb-1 uppercase">Signed in as</div>
                <div className="text-lg font-bold text-zinc-900">+37441878899</div>
              </div>
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" role="separator" />
              <div className="flex items-center gap-3 py-3 rounded-[8px]">
                <div
                  className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0"
                  aria-hidden
                >
                  <img
                    src={profilePicPlaceholder}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="flex-1 text-sm font-medium text-zinc-900">frunjyan</span>
              </div>
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" aria-hidden />
              <button
                type="button"
                className="flex items-center justify-between w-full py-3 text-sm font-medium text-zinc-900 bg-transparent border-0 rounded-[8px] cursor-pointer no-underline font-sans hover:bg-black/[0.04]"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate(ROUTES.TRANSFER_HISTORY);
                }}
              >
                Transfer history
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" aria-hidden />
              <button
                type="button"
                className="flex items-center gap-[10px] w-full py-3 text-sm font-medium text-zinc-900 bg-transparent border-0 rounded-[8px] cursor-pointer font-sans hover:bg-black/[0.04]"
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
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 p-0 bg-transparent border-0 text-zinc-600 shrink-0 cursor-pointer"
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-zinc-600"
            >
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
      </div>
      </div>

      {/* Right (desktop only): user menu (Get Help hidden for now) */}
      <div className="hidden sm:flex items-center justify-end gap-3 sm:gap-6 flex-shrink-0">
        <div
          ref={userMenuRef}
          className="relative flex items-center gap-[10px] cursor-pointer"
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
          <div
            className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden"
            aria-hidden
          >
            <img
              src={profilePicPlaceholder}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-zinc-950 truncate max-w-[100px] sm:max-w-none">frunjyan</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-zinc-950 ml-0.5 transition-transform duration-150 ${userMenuOpen ? "rotate-180" : "rotate-0"}`}
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          {userMenuOpen && (
            <div
              className="absolute top-[calc(100%+8px)] right-0 min-w-[240px] p-4 pb-5 bg-white/[0.92] backdrop-blur-xl border border-black/[0.06] rounded-card shadow-[0_4px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] z-[1000]"
              role="menu"
            >
              <div className="pt-1 pb-2" role="none">
                <div className="text-[11px] font-semibold tracking-[0.05em] text-zinc-500 mb-1 uppercase">Signed in as</div>
                <div className="text-lg font-bold text-zinc-900">+37441878899</div>
              </div>
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" role="separator" />
              <div className="flex items-center gap-3 py-3 rounded-[8px]">
                <div
                  className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0"
                  aria-hidden
                >
                  <img
                    src={profilePicPlaceholder}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="flex-1 text-sm font-medium text-zinc-900">frunjyan</span>
              </div>
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" aria-hidden />
              <button
                type="button"
                className="flex items-center justify-between w-full py-3 text-sm font-medium text-zinc-900 bg-transparent border-0 rounded-[8px] cursor-pointer no-underline font-sans hover:bg-black/[0.04]"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate(ROUTES.TRANSFER_HISTORY);
                }}
              >
                Transfer history
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" aria-hidden />
              <button
                type="button"
                className="flex items-center gap-[10px] w-full py-3 text-sm font-medium text-zinc-900 bg-transparent border-0 rounded-[8px] cursor-pointer font-sans hover:bg-black/[0.04]"
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

      {/* Mobile dropdown: help (hidden for now) */}
    </header>
  );
}
