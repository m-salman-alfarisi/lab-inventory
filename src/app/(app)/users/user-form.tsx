"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import {
  errorClass,
  hintClass,
  inputClass,
  labelClass,
} from "@/components/ui/field";
import type { ActionState } from "@/lib/validation";

const STAFF_ABILITIES = [
  "Login dan logout sistem",
  "Melihat daftar dan ketersediaan barang",
  "Mencatat peminjaman barang",
  "Memproses pengembalian barang",
  "Melihat riwayat transaksi",
];

export function UserForm({
  action,
  defaultValues,
  mode,
  isActive,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    username: string;
    email: string | null;
  };
  mode: "create" | "edit";
  isActive?: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
            <UserPlus className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {mode === "create" ? "Akun Staff Baru" : "Informasi Akun Staff"}
            </h2>
            <p className="text-xs text-slate-500">
              Role akun akan otomatis diset sebagai Staff.
            </p>
          </div>
        </div>

        {state?.message && (
          <Alert tone="error" className="mb-5">
            {state.message}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              defaultValue={defaultValues?.name}
              placeholder="Contoh: Budi Santoso"
              aria-invalid={Boolean(state?.errors?.name)}
              className={inputClass}
            />
            {state?.errors?.name && (
              <p className={errorClass}>{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className={labelClass}>
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              defaultValue={defaultValues?.username}
              placeholder="Contoh: budi.santoso"
              autoComplete="off"
              aria-invalid={Boolean(state?.errors?.username)}
              className={inputClass}
            />
            {state?.errors?.username ? (
              <p className={errorClass}>{state.errors.username[0]}</p>
            ) : (
              <p className={hintClass}>
                Huruf, angka, titik, garis bawah, atau tanda hubung.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={150}
              defaultValue={defaultValues?.email ?? ""}
              placeholder="staff@laboratorium.ac.id (opsional)"
              autoComplete="off"
              aria-invalid={Boolean(state?.errors?.email)}
              className={inputClass}
            />
            {state?.errors?.email && (
              <p className={errorClass}>{state.errors.email[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="password" className={labelClass}>
              Password {mode === "create" && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required={mode === "create"}
                minLength={6}
                maxLength={72}
                autoComplete="new-password"
                placeholder={
                  mode === "create"
                    ? "Minimal 6 karakter"
                    : "Kosongkan jika tidak ingin mengganti password"
                }
                aria-invalid={Boolean(state?.errors?.password)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {state?.errors?.password ? (
              <p className={errorClass}>{state.errors.password[0]}</p>
            ) : (
              <p className={hintClass}>
                Gunakan minimal 6 karakter yang mudah diingat staff.
              </p>
            )}
          </div>
        </div>

        {mode === "edit" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="text-[11px] font-medium text-slate-500">
              Status akun saat ini:
            </span>
            <Badge tone={isActive ? "emerald" : "rose"} dot>
              {isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link href="/users" className={buttonClass("outline", "md")}>
            Batal
          </Link>
          <SubmitButton pendingText="Menyimpan akun...">
            {mode === "create" ? "Buat Akun Staff" : "Simpan Perubahan"}
          </SubmitButton>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-violet-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Hak Akses Staff
            </h3>
          </div>
          <ul className="mt-3 space-y-2.5">
            {STAFF_ABILITIES.map((ability) => (
              <li
                key={ability}
                className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"
              >
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                {ability}
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Staff tidak dapat menghapus barang, mengelola akun pengguna, atau
              mengakses pengaturan Admin.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-800">
          Simpan kredensial akun di tempat aman. Password disimpan dalam bentuk
          hash dan tidak dapat dilihat kembali oleh Admin.
        </div>
      </aside>
    </form>
  );
}
