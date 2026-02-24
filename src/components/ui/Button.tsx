import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  style,
  ...props
}: ButtonProps): React.ReactElement {
  const base: React.CSSProperties = {
    height: "36px",
    padding: "0 16px",
    boxSizing: "border-box",
    fontSize: "14px",
    fontWeight: 600,
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: "var(--color-primary)", color: "var(--color-secondary)" },
    secondary: { backgroundColor: "var(--color-body)", color: "var(--color-secondary)" },
    outline: {
      backgroundColor: "transparent",
      color: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
    },
  };
  return (
    <button
      type="button"
      className={`btn btn--${variant}`}
      style={{ ...base, ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
