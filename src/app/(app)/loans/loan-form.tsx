"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  CalendarDays,
  Info,
} from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";
import {
  errorClass,
  hintClass,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "@/components/ui/field";
import { addDays, cn, formatNumber } from "@/lib/utils";
import type { ActionState } from "@/lib/validation";

export type LoanItemOption = {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
};

export function LoanForm({
  action,
  items,
  defaultBorrowDate,
  defaultDueDate,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  items: LoanItemOption[];
  defaultBorrowDate: string;
  defaultDueDate: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [borrowDate, setBorrowDate] = useState(defaultBorrowDate);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const selectedItem = items.find((item) => item.id === itemId);
  const quantityNumber = Number(quantity) || 0;
  const remaining = selectedItem
    ? selectedItem.stock - quantityNumber
    : null;
  const exceedsStock = Boolean(
    selectedItem && quantityNumber > selectedItem.stock,
  );

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
            <ArrowLeftRight className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Detail Peminjaman
            </h2>
            <p className="text-xs text-slate-500">
              Catat barang yang akan dibawa keluar laboratorium.
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
            <label htmlFor="borrowerName" className={labelClass}>
              Nama Peminjam <span className="text-rose-500">*</span>
            </label>
            <input
              id="borrowerName"
              name="borrowerName"
              type="text"
              required
              maxLength={100}
              placeholder="Contoh: Andi Pratama"
              aria-invalid={Boolean(state?.errors?.borrowerName)}
              className={inputClass}
            />
            {state?.errors?.borrowerName ? (
              <p className={errorClass}>{state.errors.borrowerName[0]}</p>
            ) : (
              <p className={hintClass}>Nama lengkap orang yang meminjam.</p>
            )}
          </div>

          <div>
            <label htmlFor="borrowerInfo" className={labelClass}>
              Kelas / Unit
            </label>
            <input
              id="borrowerInfo"
              name="borrowerInfo"
              type="text"
              maxLength={100}
              placeholder="Contoh: TI-2A / Laboran"
              className={inputClass}
            />
            {state?.errors?.borrowerInfo && (
              <p className={errorClass}>{state.errors.borrowerInfo[0]}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="itemId" className={labelClass}>
              Barang <span className="text-rose-500">*</span>
            </label>
            <select
              id="itemId"
              name="itemId"
              required
              value={itemId}
              onChange={(event) => setItemId(event.target.value)}
              aria-invalid={Boolean(state?.errors?.itemId)}
              className={selectClass}
            >
              <option value="">Pilih barang yang akan dipinjam</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} — {item.name} (stok {item.stock})
                </option>
              ))}
            </select>
            {state?.errors?.itemId ? (
              <p className={errorClass}>{state.errors.itemId[0]}</p>
            ) : (
              <p className={hintClass}>
                Hanya barang dengan stok tersedia yang dapat dipilih.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className={labelClass}>
              Jumlah <span className="text-rose-500">*</span>
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={selectedItem?.stock ?? 1000}
              required
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={Boolean(state?.errors?.quantity) || exceedsStock}
              className={cn(
                inputClass,
                exceedsStock && "border-rose-300 focus:border-rose-500",
              )}
            />
            {state?.errors?.quantity ? (
              <p className={errorClass}>{state.errors.quantity[0]}</p>
            ) : exceedsStock ? (
              <p className={errorClass}>
                Jumlah melebihi stok tersedia ({selectedItem?.stock} unit).
              </p>
            ) : (
              <p className={hintClass}>
                {selectedItem
                  ? `Maksimal ${selectedItem.stock} unit.`
                  : "Pilih barang untuk melihat stok."}
              </p>
            )}
          </div>

          <div />

          <div>
            <label htmlFor="borrowDate" className={labelClass}>
              Tanggal Pinjam <span className="text-rose-500">*</span>
            </label>
            <input
              id="borrowDate"
              name="borrowDate"
              type="date"
              required
              value={borrowDate}
              onChange={(event) => {
                const value = event.target.value;
                setBorrowDate(value);
                if (value && (!dueDate || dueDate <= value)) {
                  setDueDate(addDays(value, 7));
                }
              }}
              aria-invalid={Boolean(state?.errors?.borrowDate)}
              className={inputClass}
            />
            {state?.errors?.borrowDate && (
              <p className={errorClass}>{state.errors.borrowDate[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="dueDate" className={labelClass}>
              Tanggal Jatuh Tempo
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              min={borrowDate || undefined}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              aria-invalid={Boolean(state?.errors?.dueDate)}
              className={inputClass}
            />
            {state?.errors?.dueDate ? (
              <p className={errorClass}>{state.errors.dueDate[0]}</p>
            ) : (
              <p className={hintClass}>
                Disarankan maksimal 7 hari setelah tanggal pinjam.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className={labelClass}>
              Catatan
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={500}
              placeholder="Keperluan peminjaman atau catatan tambahan (opsional)"
              className={textareaClass}
            />
            {state?.errors?.notes && (
              <p className={errorClass}>{state.errors.notes[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link href="/loans" className={buttonClass("outline", "md")}>
            Batal
          </Link>
          <SubmitButton pendingText="Menyimpan transaksi..." disabled={exceedsStock}>
            Simpan Peminjaman
          </SubmitButton>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Boxes className="size-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">Ringkasan Stok</h3>
          </div>

          {!selectedItem ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-xs text-slate-500">
                Pilih barang untuk melihat ringkasan stok.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-mono text-[11px] text-slate-400">
                  {selectedItem.code}
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedItem.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {selectedItem.category}
                </p>
              </div>

              <dl className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Stok tersedia</dt>
                  <dd className="font-semibold text-slate-800">
                    {formatNumber(selectedItem.stock)} unit
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Jumlah pinjam</dt>
                  <dd className="font-semibold text-slate-800">
                    {formatNumber(quantityNumber)} unit
                  </dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-slate-200 pt-2">
                  <dt className="text-slate-500">Sisa setelah pinjam</dt>
                  <dd
                    className={cn(
                      "font-bold",
                      remaining !== null && remaining < 0
                        ? "text-rose-600"
                        : "text-emerald-600",
                    )}
                  >
                    {remaining === null ? "-" : `${formatNumber(remaining)} unit`}
                  </dd>
                </div>
              </dl>

              {exceedsStock && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-[11px] text-rose-700">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  Jumlah pinjam melebihi stok yang tersedia.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center gap-2 text-sky-800">
            <Info className="size-4" />
            <p className="text-xs font-semibold">Stok otomatis berkurang</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-sky-700">
            Setelah transaksi disimpan, stok barang langsung berkurang sesuai
            jumlah yang dipinjam. Stok akan kembali ketika pengembalian
            diproses.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
          <CalendarDays className="size-4 text-slate-400" />
          Tanggal pinjam mengikuti zona waktu Asia/Jakarta.
        </div>
      </aside>
    </form>
  );
}
