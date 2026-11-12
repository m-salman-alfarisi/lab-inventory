"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingText = "Menyimpan...",
  className,
  variant = "brand",
  size = "md",
  disabled = false,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "primary" | "brand" | "outline" | "ghost" | "danger" | "danger-outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? pendingText : children}
    </Button>
  );
}
