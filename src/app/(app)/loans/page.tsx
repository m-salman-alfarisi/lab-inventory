import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  ArrowLeftRight,
  Eye,
  Plus,
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
import { LoanStatusBadge } from "@/components/status-badge";
import { buttonClass } from "@/components/ui/button";
import { selectClass } from "@/components/ui/field";
import { requireUser } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  buildQuery,
  cn,
  firstParam,
  formatDate,
  formatNumber,
  parsePage,
  startOfTodayUtc,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Peminjaman",
};

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "DIPINJAM", label: "Dipinjam" },
  { value: "TERLAMBAT", label: "Terlambat" },
  { value: "SELESAI", label: "Selesai" },
] as const;

function statusWhere(status: string): Prisma.LoanWhereInput {
  const today = startOfTodayUtc();

  if (status === "DIPINJAM") {
    return {
      status: "DIPINJAM",
      OR: [{ dueDate: null }, { dueDate: { gte: today } }],
    };
  }
  if (status === "TERLAMBAT") {
    return { status: "DIPINJAM", dueDate: { lt: today } };
  }
  if (status === "SELESAI") {
    return { status: "SELESAI" };
  }
  return {};
}

export default async function LoansPage(props: PageProps<"/loans">) {
  await requireUser();
  const searchParams = await props.searchParams;

  const q = (firstParam(searchParams.q) ?? "").trim();
  const requestedStatus = (firstParam(searchParams.status) ?? "").toUpperCase();
  const status = ["DIPINJAM", "TERLAMBAT", "SELESAI"].includes(requestedStatus)
    ? requestedStatus
    : "";
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
    AND: [searchWhere, statusWhere(status)],
  };

  const [total, counts] = await Promise.all([
    prisma.loan.count({ where }),
    Promise.all([
      prisma.loan.count(),
      prisma.loan.count({ where: { status: "DIPINJAM" } }),
      prisma.loan.count({
        where: { status: "DIPINJAM", dueDate: { lt: startOfTodayUtc() } },
      }),
      prisma.loan.count({ where: { status: "SELESAI" } }),
    ]),
  ]);

  const [allCount, activeCount, overdueCount, completedCount] = counts;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const loans = await prisma.loan.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      officer: { select: { name: true } },
    },
  });
  const hasFilter = Boolean(q || status);

  const countMap: Record<string, number> = {
    "": allCount,
    DIPINJAM: activeCount - overdueCount,
    TERLAMBAT: overdueCount,
    SELESAI: completedCount,
  };

  return (
    <>
      <PageHeader
        title="Peminjaman Barang"
        description="Catat dan pantau seluruh transaksi peminjaman inventaris laboratorium."
        action={
          <Link href="/loans/new" className={buttonClass("brand", "md")}>
            <Plus className="size-4" />
            Catat Peminjaman
          </Link>
        }
      />

      <Flash success={success} error={error} />

      <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.value || "all"}
              href={buildQuery("/loans", {
                q: q || undefined,
                status: tab.value || undefined,
              })}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px]",
                  active
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {formatNumber(countMap[tab.value] ?? 0)}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form method="get" className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari kode transaksi, peminjam, atau barang..."
              aria-label="Cari transaksi"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-10 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <select
            name="status"
            defaultValue={status}
            aria-label="Filter status"
            className={`${selectClass} sm:w-44`}
          >
            <option value="">Semua status</option>
            <option value="DIPINJAM">Dipinjam</option>
            <option value="TERLAMBAT">Terlambat</option>
            <option value="SELESAI">Selesai</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" className={buttonClass("primary", "md")}>
              <Search className="size-4" />
              Cari
            </button>
            {hasFilter && (
              <Link
                href="/loans"
                className={buttonClass("outline", "icon")}
                title="Reset filter"
                aria-label="Reset filter"
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
              Daftar Transaksi
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatNumber(total)} transaksi ditemukan
              {hasFilter && " berdasarkan filter"}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Klik detail untuk melihat informasi lengkap
          </p>
        </div>

        {loans.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<ArrowLeftRight className="size-5" />}
              title={
                hasFilter ? "Transaksi tidak ditemukan" : "Belum ada transaksi"
              }
              description={
                hasFilter
                  ? "Coba ubah kata kunci atau filter status."
                  : "Catat peminjaman pertama untuk mulai melacak barang keluar."
              }
              action={
                hasFilter ? (
                  <Link href="/loans" className={buttonClass("outline", "sm")}>
                    <RotateCcw className="size-3.5" />
                    Reset Filter
                  </Link>
                ) : (
                  <Link href="/loans/new" className={buttonClass("brand", "sm")}>
                    <Plus className="size-3.5" />
                    Catat Peminjaman
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  <th className="px-5 py-3">Transaksi</th>
                  <th className="px-5 py-3">Peminjam</th>
                  <th className="px-5 py-3">Barang</th>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Petugas</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/loans/${loan.id}`}
                        className="font-mono text-xs font-semibold text-slate-800 hover:text-emerald-600"
                      >
                        {loan.code}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="max-w-40 truncate font-medium text-slate-800">
                        {loan.borrowerName}
                      </p>
                      {loan.borrowerInfo && (
                        <p className="max-w-40 truncate text-[11px] text-slate-400">
                          {loan.borrowerInfo}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="max-w-44 truncate text-slate-700">
                        {loan.itemName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {loan.itemCode} · {loan.quantity} unit
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap text-slate-500">
                      <p>{formatDate(loan.borrowDate)}</p>
                      <p className="text-[10px] text-slate-400">
                        Jatuh tempo: {formatDate(loan.dueDate)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <LoanStatusBadge
                        status={loan.status}
                        dueDate={loan.dueDate}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {loan.officer.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/loans/${loan.id}`}
                          className={buttonClass("outline", "icon-sm")}
                          title="Lihat detail"
                          aria-label={`Lihat detail ${loan.code}`}
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        {loan.status === "DIPINJAM" && (
                          <form action={returnLoan.bind(null, loan.id)}>
                            <input type="hidden" name="redirectTo" value="/loans" />
                            <ConfirmSubmit
                              message={`Proses pengembalian ${loan.code}? Stok ${loan.itemName} akan bertambah ${loan.quantity} unit.`}
                              title="Proses pengembalian"
                              ariaLabel={`Proses pengembalian ${loan.code}`}
                              variant="brand"
                              size="icon-sm"
                            >
                              <Undo2 className="size-3.5" />
                            </ConfirmSubmit>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-5">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/loans"
            query={{ q: q || undefined, status: status || undefined }}
          />
        </div>
      </section>
    </>
  );
}
