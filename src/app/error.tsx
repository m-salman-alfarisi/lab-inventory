"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";

import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <CircleAlert className="size-7" />
          </span>
          <h1 className="mt-5 text-lg font-bold text-slate-900">
            Terjadi kesalahan
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Sistem tidak dapat memproses permintaan Anda. Silakan coba lagi
            atau kembali ke dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className={buttonClass("brand", "md")}
            >
              <RotateCcw className="size-4" />
              Coba Lagi
            </button>
            <Link href="/dashboard" className={buttonClass("outline", "md")}>
              Ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
