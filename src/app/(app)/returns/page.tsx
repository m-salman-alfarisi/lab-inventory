import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  RotateCcw,
  Search,
  Undo2,
} from "lucide-react";

import { returnLoan } from "@/app/actions/loans";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { EmptyState } from "@/components/empty-state";
import { Flash } from "@/components/flash";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatCard } from "@/components/stat-card";
import { LoanStatusBadge } from "@/components/status-badge";
import { buttonClass } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  firstParam,
  formatDate,
  formatNumber,
  isOverdue,
  parsePage,
  startOfTodayUtc,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pengembalian",
};

export default async function ReturnsPage(props: PageProps<"/returns">) {
  await requireUser();
  const searchParams = await props.searchParams;

  const q = (firstParam(searchParams.q) ?? "").trim();
  const page = parsePage(searchParams.page);
  const success = firstParam(searchParams.success);
  const error = firstParam(searchParams.error);

  const searchWhere: Prisma.LoanWhereInput = q
    ? {
        OR: [
          { code: { contains: q, mode: "insensitive" } },
          { borrowerName: { contains: q, mode: "insensitive" } },
          { itemName: { contains: q, mode: "insensitive" } },
          { itemCode: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const where: Prisma.LoanWhereInput = {
    AND: [{ status: "DIPINJAM" }, searchWhere],
  };

  const [total, activeSummary, overdueCount] = await Promise.all([
    prisma.loan.count({ where }),
    prisma.loan.aggregate({
      where: { status: "DIPINJAM" },
      _count: { _all: true },
      _sum: { quantity: true },
    }),
    prisma.loan.count({
      where: { status: "DIPINJAM", dueDate: { lt: startOfTodayUtc() } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const loans = await prisma.loan.findMany({
    where,
    orderBy: { borrowDate: "asc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      officer: { select: { name: true } },
    },
  });

  const activeCount = activeSummary._count._all;
  const borrowedUnits = activeSummary._sum.quantity ?? 0;

  return (
    <>
      <PageHeader
        title="Pengembalian Barang"
        description="Proses pengembalian barang yang sedang dipinjam. Stok inventaris akan diperbarui otomatis."
        action={
          <Link href="/loans" className={buttonClass("outline", "md")}>
            <ArrowLeftRight className="size-4" />
            Riwayat Peminjaman
          </Link>
        }
      />

      <Flash success={success} error={error} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Transaksi Aktif"
          value={formatNumber(activeCount)}
          hint="Menunggu proses pengembalian"
          icon={<ArrowLeftRight className="size-5" />}
          tone="amber"
        />
        <StatCard
          label="Unit Dipinjam"
          value={formatNumber(borrowedUnits)}
          hint="Total unit yang masih di luar laboratorium"
          icon={<Boxes className="size-5" />}
          tone="sky"
        />
        <StatCard
          label="Terlambat"
          value={formatNumber(overdueCount)}
          hint="Melewati tanggal jatuh tempo"
          icon={<AlertTriangle className="size-5" />}
          tone={overdueCount > 0 ? "rose" : "emerald"}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form method="get" className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari peminjam, barang, atau kode transaksi..."
              aria-label="Cari transaksi aktif"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-10 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className={buttonClass("primary", "md")}>
              <Search className="size-4" />
              Cari
            </button>
            {q && (
              <Link
                href="/returns"
                className={buttonClass("outline", "icon")}
                title="Reset pencarian"
                aria-label="Reset pencarian"
              >
                <RotateCcw className="size-4" />
              </Link>
            )}
          </div>
        </form>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Barang yang Sedang Dipinjam
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatNumber(total)} transaksi menunggu pengembalian
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Stok bertambah saat tombol kembalikan diproses
          </p>
        </div>

        {loans.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Undo2 className="size-5" />}
              title={
                q
                  ? "Transaksi tidak ditemukan"
                  : "Tidak ada barang yang dipinjam"
              }
              description={
                q
                  ? "Coba gunakan kata kunci lain."
                  : "Semua barang sudah kembali ke laboratorium. Pengembalian baru akan muncul di sini."
              }
              action={
                q ? (
                  <Link href="/returns" className={buttonClass("outline", "sm")}>
                    <RotateCcw className="size-3.5" />
                    Reset Pencarian
                  </Link>
                ) : (
                  <Link href="/loans" className={buttonClass("brand", "sm")}>
                    <ArrowLeftRight className="size-3.5" />
                    Lihat Riwayat
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  <th className="px-5 py-3">Peminjam</th>
                  <th className="px-5 py-3">Barang</th>
                  <th className="px-5 py-3">Jumlah</th>
                  <th className="px-5 py-3">Tanggal Pinjam</th>
                  <th className="px-5 py-3">Jatuh Tempo</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => {
                  const overdue = isOverdue({
                    status: loan.status,
                    dueDate: loan.dueDate,
                  });
                  return (
                    <tr
                      key={loan.id}
                      className={
                        overdue
                          ? "bg-rose-50/30 transition hover:bg-rose-50/60"
                          : "transition hover:bg-slate-50/70"
                      }
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/loans/${loan.id}`}
                          className="font-mono text-[11px] font-semibold text-slate-400 hover:text-emerald-600"
                        >
                          {loan.code}
                        </Link>
                        <p className="max-w-44 truncate font-medium text-slate-800">
                          {loan.borrowerName}
                        </p>
                        <p className="max-w-44 truncate text-[11px] text-slate-400">
                          {loan.borrowerInfo || loan.officer.name}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="max-w-44 truncate text-slate-700">
                          {loan.itemName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {loan.itemCode}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        {loan.quantity}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          unit
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap text-slate-500">
                        {formatDate(loan.borrowDate)}
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap text-slate-500">
                        {formatDate(loan.dueDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <LoanStatusBadge
                          status={loan.status}
                          dueDate={loan.dueDate}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <form action={returnLoan.bind(null, loan.id)}>
                            <input
                              type="hidden"
                              name="redirectTo"
                              value="/returns"
                            />
                            <ConfirmSubmit
                              message={`Proses pengembalian ${loan.code}? Stok ${loan.itemName} akan bertambah ${loan.quantity} unit.`}
                              variant="brand"
                              size="sm"
                              title="Proses pengembalian"
                              pendingText="Memproses..."
                            >
                              <Undo2 className="size-3.5" />
                              Kembalikan
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-5">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/returns"
            query={{ q: q || undefined }}
          />
        </div>
      </section>
    </>
  );
}
