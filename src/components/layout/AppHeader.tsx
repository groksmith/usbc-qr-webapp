import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import brandLogo from "../../assets/images/brand_logo.svg";
import { SearchIcon } from "../ui/SearchIcon";

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
    <header className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between gap-6 py-[14px] px-7 bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-5 min-w-0">
        <NavLink
          to={ROUTES.CODES}
          className="flex items-center py-2 px-3 rounded-card bg-zinc-100 border border-zinc-200 no-underline"
          aria-label="USBC QR - Home"
        >
          <img src={brandLogo} alt="USBC" className="h-7 w-auto block" />
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink
            to={ROUTES.CODES}
            className={({ isActive }) =>
              `py-2 px-4 rounded-card text-sm no-underline ${
                isActive ? "font-semibold text-white bg-primary" : "font-normal text-zinc-950"
              }`
            }
          >
            Codes
          </NavLink>
        </nav>
      </div>

      <div className="flex-[1_1_320px] max-w-[480px] mx-8">
        <div className="relative flex items-center w-full">
          <input
            type="search"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full py-2.5 pl-4 pr-11 text-sm font-normal border border-zinc-200 rounded-card bg-white outline-none"
            aria-label="Search"
          />
          <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-shrink-0">
        <a href="#help" className="text-sm font-normal text-zinc-950 no-underline">
          Get Help
        </a>
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
          <div className="w-9 h-9 rounded-full bg-indigo-300 text-indigo-900 flex items-center justify-center text-sm font-semibold" aria-hidden>
            F
          </div>
          <span className="text-sm font-semibold text-zinc-950">frunjyan</span>
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
              <div className="flex items-center justify-between gap-3 py-3 rounded-[8px] hover:bg-black/[0.04]">
                <div className="w-9 h-9 rounded-full bg-indigo-300 text-indigo-900 flex items-center justify-center text-sm font-semibold flex-shrink-0" aria-hidden>
                  F
                </div>
                <span className="flex-1 text-sm font-medium text-zinc-900">frunjyan</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" fill="#5d9fb5" />
                  <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" aria-hidden />
              <button
                type="button"
                className="flex items-center justify-between w-full py-3 text-sm font-medium text-zinc-900 bg-transparent border-0 rounded-[8px] cursor-pointer no-underline font-sans hover:bg-black/[0.04]"
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
              <hr className="h-px bg-[#e5e5e7] my-2 -mx-4 border-0" aria-hidden />
              <button
                type="button"
                className="flex items-center gap-[10px] w-full py-3 text-sm font-medium text-zinc-900 bg-transparent border-0 rounded-[8px] cursor-pointer font-sans hover:bg-primary hover:text-white transition-colors duration-150"
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
