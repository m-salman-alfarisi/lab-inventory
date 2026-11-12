import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  Boxes,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { LoginForm } from "@/app/login/login-form";
import { Brand } from "@/components/brand";
import { Alert } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke sistem inventaris dan peminjaman laboratorium.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const searchParams = await props.searchParams;
  const success = firstParam(searchParams.success);
  const error = firstParam(searchParams.error);
  const redirectTo = firstParam(searchParams.redirectTo);

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b1220] p-10 lg:flex lg:flex-col xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="pointer-events-none absolute -top-28 -left-24 size-96 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-teal-400/10 blur-[120px]" />

        <div className="relative z-10">
          <Brand dark />
        </div>

        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
            <Sparkles className="size-3.5" />
            Digitalisasi Laboratorium Komputer
          </div>

          <h1 className="text-4xl leading-[1.15] font-bold tracking-tight text-white xl:text-5xl">
            Kelola inventaris laboratorium dalam{" "}
            <span className="text-emerald-400">satu tempat.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
            Pantau ketersediaan barang, catat peminjaman, dan proses
            pengembalian secara cepat, rapi, dan terdokumentasi.
          </p>

          <div className="mt-9 space-y-4">
            {[
              {
                icon: Boxes,
                title: "Inventaris terpusat",
                description:
                  "Data barang, kategori, dan stok selalu ter-update otomatis.",
              },
              {
                icon: ArrowLeftRight,
                title: "Peminjaman terkontrol",
                description:
                  "Stok berkurang saat dipinjam dan kembali saat dikembalikan.",
              },
              {
                icon: ShieldCheck,
                title: "Akses berbasis role",
                description:
                  "Admin dan Staff memiliki hak akses yang jelas dan terpisah.",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.035] p-4 backdrop-blur-sm"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-500">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Laboratorium Inventory &amp; Borrowing Management System
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-600 uppercase">
              Selamat datang kembali
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Masuk ke akun Anda
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Gunakan username dan password yang diberikan oleh Administrator
              laboratorium.
            </p>
          </div>

          <div className="space-y-3">
            {success && <Alert tone="success">{success}</Alert>}
            {error && <Alert tone="error">{error}</Alert>}
          </div>

          <LoginForm redirectTo={redirectTo} />

          <p className="mt-8 text-center text-[11px] text-slate-400">
            © {new Date().getFullYear()} LabInventory · Sistem Inventaris
            Laboratorium
          </p>
        </div>
      </main>
    </div>
  );
}
