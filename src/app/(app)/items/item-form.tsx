"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Info, PackagePlus } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";
import {
  errorClass,
  hintClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/field";
import type { ActionState } from "@/lib/validation";

type ItemValues = {
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  description: string | null;
};

export function ItemForm({
  action,
  categories,
  defaultValues,
  mode,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  categories: string[];
  defaultValues?: ItemValues;
  mode: "create" | "edit";
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <PackagePlus className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Informasi Barang
            </h2>
            <p className="text-xs text-slate-500">
              Lengkapi data inventaris dengan benar.
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
            <label htmlFor="code" className={labelClass}>
              Kode Barang <span className="text-rose-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={20}
              defaultValue={defaultValues?.code}
              placeholder="Contoh: BR011"
              aria-invalid={Boolean(state?.errors?.code)}
              className={inputClass}
            />
            {state?.errors?.code ? (
              <p className={errorClass}>{state.errors.code[0]}</p>
            ) : (
              <p className={hintClass}>
                Gunakan format kode unik, misalnya BR011.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="name" className={labelClass}>
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              defaultValue={defaultValues?.name}
              placeholder="Contoh: Laptop Lenovo"
              aria-invalid={Boolean(state?.errors?.name)}
              className={inputClass}
            />
            {state?.errors?.name && (
              <p className={errorClass}>{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              id="category"
              name="category"
              type="text"
              required
              maxLength={50}
              list="category-options"
              defaultValue={defaultValues?.category}
              placeholder="Pilih atau ketik kategori"
              aria-invalid={Boolean(state?.errors?.category)}
              className={inputClass}
            />
            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            {state?.errors?.category && (
              <p className={errorClass}>{state.errors.category[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="stock" className={labelClass}>
              Stok Tersedia <span className="text-rose-500">*</span>
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min={0}
              max={100000}
              required
              defaultValue={defaultValues?.stock ?? 0}
              aria-invalid={Boolean(state?.errors?.stock)}
              className={inputClass}
            />
            {state?.errors?.stock ? (
              <p className={errorClass}>{state.errors.stock[0]}</p>
            ) : (
              <p className={hintClass}>Jumlah unit yang dapat dipinjam.</p>
            )}
          </div>

          <div>
            <label htmlFor="minStock" className={labelClass}>
              Stok Minimum
            </label>
            <input
              id="minStock"
              name="minStock"
              type="number"
              min={0}
              max={100000}
              defaultValue={defaultValues?.minStock ?? 0}
              aria-invalid={Boolean(state?.errors?.minStock)}
              className={inputClass}
            />
            {state?.errors?.minStock ? (
              <p className={errorClass}>{state.errors.minStock[0]}</p>
            ) : (
              <p className={hintClass}>
                Batas peringatan ketika stok menipis.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={500}
              rows={4}
              defaultValue={defaultValues?.description ?? ""}
              placeholder="Keterangan tambahan mengenai barang (opsional)"
              className={textareaClass}
            />
            {state?.errors?.description && (
              <p className={errorClass}>{state.errors.description[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link href="/items" className={buttonClass("outline", "md")}>
            Batal
          </Link>
          <SubmitButton pendingText="Menyimpan barang...">
            {mode === "create" ? "Simpan Barang" : "Perbarui Barang"}
          </SubmitButton>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900">Panduan Singkat</h3>
          </div>
          <ul className="mt-3 space-y-3 text-xs leading-relaxed text-slate-500">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              Kode barang harus unik dan tidak boleh sama dengan barang lain.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              Stok tersedia berkurang otomatis ketika barang dipinjam dan
              bertambah saat dikembalikan.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              Barang yang masih memiliki peminjaman aktif tidak dapat dihapus.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              Stok minimum membantu admin memantau barang yang perlu
              direstock.
            </li>
          </ul>
        </div>

        {mode === "edit" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
            Perubahan stok akan langsung memengaruhi ketersediaan barang pada
            form peminjaman.
          </div>
        )}
      </aside>
    </form>
  );
}
