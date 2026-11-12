"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { buttonClass } from "@/components/ui/button";

export function ConfirmSubmit({
  message,
  children,
  className,
  variant = "danger-outline",
  size = "icon-sm",
  title,
  ariaLabel,
  pendingText,
}: {
  message: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "brand" | "outline" | "ghost" | "danger" | "danger-outline";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
  title?: string;
  ariaLabel?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      title={title}
      aria-label={ariaLabel ?? title}
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      className={buttonClass(variant, size, className)}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
      {pending && pendingText && <span>{pendingText}</span>}
    </button>
  );
}
