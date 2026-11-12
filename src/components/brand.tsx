import { FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({
  dark = false,
  compact = false,
  className,
}: {
  dark?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
          dark
            ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25"
            : "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 ring-emerald-600",
        )}
      >
        <FlaskConical className="size-5" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span
            className={cn(
              "block text-[15px] font-bold tracking-tight",
              dark ? "text-white" : "text-slate-900",
            )}
          >
            LabInventory
          </span>
          <span
            className={cn(
              "block text-[11px] leading-tight",
              dark ? "text-slate-400" : "text-slate-500",
            )}
          >
            Laboratory System
          </span>
        </span>
      )}
    </div>
  );
}
