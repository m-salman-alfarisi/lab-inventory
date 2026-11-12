import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Package,
  Undo2,
  UserRound,
} from "lucide-react";

import { returnLoan } from "@/app/actions/loans";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Flash } from "@/components/flash";
import { PageHeader } from "@/components/page-header";
import { LoanStatusBadge } from "@/components/status-badge";
import { Alert } from "@/components/ui/alert";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  daysBetween,
  firstParam,
  formatDate,
  formatDateTime,
  isOverdue,
  todayJakarta,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Detail Peminjaman",
};

export default async function LoanDetailPage(
  props: PageProps<"/loans/[id]">,
) {
  await requireUser();
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const success = firstParam(searchParams.success);
  const error = firstParam(searchParams.error);

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      officer: { select: { name: true } },
      item: { select: { id: true, stock: true } },
    },
  });

  if (!loan) notFound();

  const overdue = isOverdue({ status: loan.status, dueDate: loan.dueDate });
  const duration = loan.returnDate
    ? daysBetween(loan.borrowDate, loan.returnDate)
    : daysBetween(loan.borrowDate, new Date());
  const isActive = loan.status === "DIPINJAM";

  return (
    <>
      <PageHeader
        title="Detail Peminjaman"
        description={`Transaksi ${loan.code} · dicatat ${formatDateTime(loan.createdAt)}`}
        back={
          <Link
            href="/loans"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke daftar peminjaman
          </Link>
        }
        action={
          <>
            <LoanStatusBadge status={loan.status} dueDate={loan.dueDate} />
            {isActive && (
              <form action={returnLoan.bind(null, loan.id)}>
                <input
                  type="hidden"
                  name="redirectTo"
                  value={`/loans/${loan.id}`}
                />
                <ConfirmSubmit
                  message={`Proses pengembalian ${loan.code}? Stok ${loan.itemName} akan bertambah ${loan.quantity} unit.`}
                  variant="brand"
                  size="sm"
                  title="Proses pengembalian"
                >
                  <Undo2 className="size-3.5" />
                  Proses Pengembalian
                </ConfirmSubmit>
              </form>
            )}
          </>
        }
      />

      <Flash success={success} error={error} />

      {overdue && (
        <Alert tone="warning" className="mb-5" title="Peminjaman terlambat">
          Transaksi ini melewati tanggal jatuh tempo (
          {formatDate(loan.dueDate)}). Segera proses pengembalian barang.
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ClipboardList className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Informasi Transaksi
              </h2>
              <p className="font-mono text-[11px] text-slate-400">
                {loan.code}
              </p>
            </div>
          </div>

          <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <UserRound className="size-3.5" /> Peminjam
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {loan.borrowerName}
              </dd>
              <dd className="text-xs text-slate-500">
                {loan.borrowerInfo || "Tanpa keterangan kelas/unit"}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <Package className="size-3.5" /> Barang
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {loan.itemName}
              </dd>
              <dd className="text-xs text-slate-500">
                {loan.itemCode} · {loan.quantity} unit
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <CalendarDays className="size-3.5" /> Tanggal Pinjam
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-700">
                {formatDate(loan.borrowDate)}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <Clock className="size-3.5" /> Jatuh Tempo
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-700">
                {formatDate(loan.dueDate)}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Petugas Pencatat
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-700">
                {loan.officer.name}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Durasi
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-700">
                {duration} hari {isActive ? "(berjalan)" : ""}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Catatan
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                {loan.notes || "Tidak ada catatan tambahan."}
              </dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">
              Status Peminjaman
            </h2>

            <div className="mt-4">
              <LoanStatusBadge status={loan.status} dueDate={loan.dueDate} />
            </div>

            <ol className="mt-5 space-y-4">
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Barang dipinjam
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatDate(loan.borrowDate)}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className={
                    overdue
                      ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600"
                      : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  }
                >
                  <Clock className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Batas pengembalian
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatDate(loan.dueDate)}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className={
                    loan.status === "SELESAI"
                      ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                      : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                  }
                >
                  <Undo2 className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {loan.status === "SELESAI"
                      ? "Barang dikembalikan"
                      : "Menunggu pengembalian"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {loan.returnDate
                      ? formatDateTime(loan.returnDate)
                      : "Belum dikembalikan"}
                  </p>
                </div>
              </li>
            </ol>

            {isActive ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Setelah pengembalian diproses, stok{" "}
                  <strong className="text-slate-700">{loan.itemName}</strong>{" "}
                  akan bertambah{" "}
                  <strong className="text-slate-700">
                    {loan.quantity} unit
                  </strong>
                  . Stok saat ini:{" "}
                  <strong className="text-slate-700">
                    {loan.item ? loan.item.stock : "-"} unit
                  </strong>
                  .
                </p>
                <form
                  action={returnLoan.bind(null, loan.id)}
                  className="mt-3"
                >
                  <input
                    type="hidden"
                    name="redirectTo"
                    value={`/loans/${loan.id}`}
                  />
                  <ConfirmSubmit
                    message={`Proses pengembalian ${loan.code}? Stok ${loan.itemName} akan bertambah ${loan.quantity} unit.`}
                    variant="brand"
                    size="md"
                    className="w-full"
                  >
                    <Undo2 className="size-4" />
                    Proses Pengembalian
                  </ConfirmSubmit>
                </form>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] leading-relaxed text-emerald-700">
                Transaksi selesai pada {formatDateTime(loan.returnDate)}. Stok
                barang sudah dikembalikan ke inventaris.
              </div>
            )}
          </section>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-relaxed text-slate-500">
            Tanggal transaksi hari ini: {formatDate(todayJakarta())}. Gunakan
            tombol kembali untuk melihat seluruh riwayat peminjaman.
          </div>
        </aside>
      </div>
    </>
  );
}
