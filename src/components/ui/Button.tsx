import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: "bg-primary text-white border-0",
  secondary: "bg-body-text text-white border-0",
  outline: "bg-transparent text-primary border border-primary",
};

export function Button({
  variant = "primary",
  children,
  style,
  className,
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className={`btn btn--${variant} h-9 px-4 box-border text-sm font-semibold rounded-btn cursor-pointer ${variantClasses[variant]} ${className ?? ""}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
