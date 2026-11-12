import Link from "next/link";
import { FlaskConical, Home } from "lucide-react";

import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <FlaskConical className="size-7" />
          </span>
          <p className="mt-5 text-5xl font-bold tracking-tight text-slate-900">
            404
          </p>
          <h1 className="mt-2 text-lg font-bold text-slate-900">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Halaman yang Anda cari mungkin sudah dipindahkan atau alamatnya
            salah.
          </p>
          <Link href="/" className={`${buttonClass("brand", "md")} mt-6 w-full`}>
            <Home className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
