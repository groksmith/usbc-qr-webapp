import React from "react";
import { SearchIcon } from "./SearchIcon";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function SearchInput({
  label,
  error,
  hint,
  required,
  id,
  style,
  ...props
}: SearchInputProps): React.ReactElement {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <div className="mb-4 w-full">
      {label && (
        <>
          <label htmlFor={inputId} className="block mb-0.5 text-sm font-medium text-heading">
            {label}
            {required && <span className="text-negative ml-0.5">*</span>}
          </label>
          {hint && !error && (
            <p className="m-0 mb-1 text-xs text-muted font-normal">{hint}</p>
          )}
        </>
      )}
      <div className="relative flex items-center w-full">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center"
          aria-hidden
        >
          <SearchIcon />
        </span>
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          className={`w-full box-border py-2.5 pl-10 pr-3.5 text-sm rounded-btn outline-none bg-white ${
            error ? "border-2 border-negative" : "border border-[#E0E0E0]"
          }`}
          style={style}
          {...props}
        />
      </div>
      {error && <p className="mt-1 mb-0 text-sm text-negative">{error}</p>}
    </div>
  );
}
