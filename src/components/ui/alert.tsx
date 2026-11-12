import type { ReactNode } from "react";
import {
  AlertTriangle,
  CircleAlert,
  CircleCheck,
  Info,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "warning" | "info";

const styles: Record<Tone, { wrapper: string; icon: ReactNode }> = {
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <CircleCheck className="size-5 shrink-0 text-emerald-600" />,
  },
  error: {
    wrapper: "border-rose-200 bg-rose-50 text-rose-800",
    icon: <CircleAlert className="size-5 shrink-0 text-rose-600" />,
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-800",
    icon: <AlertTriangle className="size-5 shrink-0 text-amber-600" />,
  },
  info: {
    wrapper: "border-sky-200 bg-sky-50 text-sky-800",
    icon: <Info className="size-5 shrink-0 text-sky-600" />,
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm",
        styles[tone].wrapper,
        className,
      )}
    >
      {styles[tone].icon}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && "mt-0.5", "leading-relaxed")}>
          {children}
        </div>
      </div>
    </div>
  );
}
