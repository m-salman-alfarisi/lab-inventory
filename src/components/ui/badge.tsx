import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "emerald" | "amber" | "rose" | "slate" | "sky" | "violet" | "cyan";

const tones: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
};

const dotTones: Record<Tone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-400",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
};

export function Badge({
  tone = "slate",
  dot = false,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn("size-1.5 rounded-full", dotTones[tone])} />
      )}
      {children}
    </span>
  );
}
