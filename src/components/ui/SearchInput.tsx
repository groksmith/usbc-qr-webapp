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
    <div style={{ marginBottom: "16px", width: "100%" }}>
      {label && (
        <>
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              marginBottom: "2px",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--color-heading)",
            }}
          >
            {label}
            {required && <span style={{ color: "#dc2626", marginLeft: "2px" }}>*</span>}
          </label>
          {hint && !error && (
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b", fontWeight: 400 }}>
              {hint}
            </p>
          )}
        </>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-hidden
        >
          <SearchIcon />
        </span>
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 14px 10px 40px",
            fontSize: "14px",
            borderRadius: "12px",
            border: error ? "2px solid #dc2626" : "1px solid #E0E0E0",
            outline: "none",
            backgroundColor: "#FFFFFF",
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#dc2626" }}>{error}</p>
      )}
    </div>
  );
}
