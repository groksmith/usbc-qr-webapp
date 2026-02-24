import React, { useState } from "react";
import { Button } from "./Button";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
}

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied!",
}: CopyButtonProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleClick = (): void => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    });
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      {copied ? copiedLabel : label}
    </Button>
  );
}
