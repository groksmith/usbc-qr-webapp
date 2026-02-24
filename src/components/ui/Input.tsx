import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Shown under the label; use for format hints (e.g. "Format: name.uns") */
  hint?: string;
  /** If true, label is shown with a required indicator */
  required?: boolean;
}

export function Input({ label, error, hint, required, id, style, ...props }: InputProps): React.ReactElement {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <div style={{ marginBottom: "16px", width: "320px" }}>
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
      <input
        id={inputId}
        style={{
          width: "320px",
          maxWidth: "320px",
          padding: "10px 14px",
          fontSize: "14px",
          borderRadius: "12px",
          border: error ? "2px solid #dc2626" : "none",
          outline: "none",
          backgroundColor: "#FFFFFF",
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#dc2626" }}>{error}</p>
      )}
    </div>
  );
}
