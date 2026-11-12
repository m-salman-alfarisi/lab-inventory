import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "emerald" | "amber" | "sky" | "violet" | "rose" | "slate";

const tones: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "emerald",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: Tone;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
            tones[tone],
          )}
        >
          {icon}
        </span>
      </div>
      {hint && <p className="mt-3 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </>
  );

  const className =
    "block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          className,
          "transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
