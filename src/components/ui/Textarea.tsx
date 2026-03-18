import type React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /** Shown under the label; use for format hints */
  hint?: string;
  /** If true, label is shown with a required indicator */
  required?: boolean;
  /** If true, "(optional)" is appended in gray (text-muted) */
  optional?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  required,
  optional,
  id,
  style,
  ...props
}: TextareaProps): React.ReactElement {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <div className="mb-4 w-full">
      {label && (
        <>
          <label htmlFor={inputId} className="block mb-0.5 text-sm font-medium text-heading">
            {label}
            {optional && <span className="font-normal text-muted"> (optional)</span>}
            {required && <span className="text-negative ml-0.5">*</span>}
          </label>
          {hint && !error && <p className="m-0 mb-1 text-muted font-normal" style={{ fontSize: '12px' }}>{hint}</p>}
        </>
      )}
      <textarea
        id={inputId}
        className={`w-full box-border py-2.5 px-3.5 text-sm rounded-btn outline-none bg-white min-h-[80px] resize-y ${
          error ? "border-2 border-negative" : "border-0"
        }`}
        style={style}
        {...props}
      />
      {error && <p className="mt-1 mb-0 text-sm text-negative">{error}</p>}
    </div>
  );
}
