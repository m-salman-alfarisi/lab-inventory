import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowLeftRight,
  Boxes,
  ChevronRight,
  ClipboardList,
  Package,
  PackageOpen,
  Plus,
  Undo2,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Flash } from "@/components/flash";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { LoanStatusBadge } from "@/components/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { activityLabel } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  firstParam,
  formatDate,
  formatLongDate,
  formatNumber,
  formatRelative,
  getInitials,
  startOfTodayUtc,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const success = firstParam(searchParams.success);
  const error = firstParam(searchParams.error);

  const [
    itemStats,
    categoryGroups,
    loanGroups,
    overdueCount,
    staffCount,
    recentLoans,
    allItems,
    recentActivity,
  ] = await Promise.all([
    prisma.item.aggregate({
      _count: { _all: true },
      _sum: { stock: true },
    }),
    prisma.item.groupBy({ by: ["category"] }),
    prisma.loan.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { quantity: true },
    }),
    prisma.loan.count({
      where: { status: "DIPINJAM", dueDate: { lt: startOfTodayUtc() } },
    }),
    prisma.user.count({ where: { role: "STAFF", isActive: true } }),
    prisma.loan.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        borrowerName: true,
        itemName: true,
        quantity: true,
        borrowDate: true,
        dueDate: true,
        status: true,
      },
    }),
    prisma.item.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        stock: true,
        minStock: true,
      },
      orderBy: { stock: "asc" },
    }),
    user.role === "ADMIN"
      ? prisma.activityLog.findMany({
          take: 7,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const activeGroup = loanGroups.find((group) => group.status === "DIPINJAM");
  const completedGroup = loanGroups.find((group) => group.status === "SELESAI");

  const totalItems = itemStats._count._all;
  const totalStock = itemStats._sum.stock ?? 0;
  const activeLoans = activeGroup?._count._all ?? 0;
  const borrowedUnits = activeGroup?._sum.quantity ?? 0;
  const totalLoans = loanGroups.reduce(
    (total, group) => total + group._count._all,
    0,
  );
  const completedLoans = completedGroup?._count._all ?? 0;
  const lowStockItems = allItems.filter(
    (item) => item.stock <= item.minStock,
  );
  const visibleLowStock = lowStockItems.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Ringkasan inventaris dan aktivitas laboratorium · ${formatLongDate()}`}
        action={
          <>
            <Link href="/items" className={buttonClass("outline", "md")}>
              <Package className="size-4" />
              Data Barang
            </Link>
            <Link href="/loans/new" className={buttonClass("brand", "md")}>
              <Plus className="size-4" />
              Catat Peminjaman
            </Link>
          </>
        }
      />

      <Flash success={success} error={error} />

      {overdueCount > 0 && (
        <Alert tone="warning" className="mb-5" title="Perhatian">
          Ada <strong>{overdueCount} peminjaman</strong> yang melewati tanggal
          jatuh tempo.{" "}
          <Link
            href="/loans?status=TERLAMBAT"
            className="font-semibold underline underline-offset-2"
          >
            Lihat daftar
          </Link>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Barang"
          value={formatNumber(totalItems)}
          hint={`${categoryGroups.length} kategori terdaftar`}
          icon={<Package className="size-5" />}
          tone="sky"
          href="/items"
        />
        <StatCard
          label="Stok Tersedia"
          value={formatNumber(totalStock)}
          hint="Unit barang siap dipinjamkan"
          icon={<Boxes className="size-5" />}
          tone="emerald"
          href="/items"
        />
        <StatCard
          label="Sedang Dipinjam"
          value={formatNumber(borrowedUnits)}
          hint={`${activeLoans} transaksi aktif${
            overdueCount > 0 ? ` · ${overdueCount} terlambat` : ""
          }`}
          icon={<ArrowLeftRight className="size-5" />}
          tone="amber"
          href="/returns"
        />
        <StatCard
          label="Total Peminjaman"
          value={formatNumber(totalLoans)}
          hint={`${completedLoans} transaksi selesai`}
          icon={<ClipboardList className="size-5" />}
          tone="violet"
          href="/loans"
        />
      </div>

      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Transaksi Terbaru
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Peminjaman yang terakhir dicatat
              </p>
            </div>
            <Link
              href="/loans"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Lihat semua
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {recentLoans.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<ArrowLeftRight className="size-5" />}
                title="Belum ada transaksi"
                description="Transaksi peminjaman pertama akan muncul di sini."
                action={
                  <Link href="/loans/new" className={buttonClass("brand", "sm")}>
                    <Plus className="size-3.5" />
                    Catat Peminjaman
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 md:hidden">
                {recentLoans.map((loan) => (
                  <Link
                    key={loan.id}
                    href={`/loans/${loan.id}`}
                    className="block px-4 py-3.5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-slate-400">
                          {loan.code}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                          {loan.borrowerName}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {loan.itemName} · {loan.quantity} unit
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatDate(loan.borrowDate)}
                        </p>
                      </div>
                      <LoanStatusBadge
                        status={loan.status}
                        dueDate={loan.dueDate}
                      />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      <th className="px-5 py-3">Transaksi</th>
                      <th className="px-5 py-3">Peminjam</th>
                      <th className="px-5 py-3">Barang</th>
                      <th className="px-5 py-3">Tanggal</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentLoans.map((loan) => (
                      <tr
                        key={loan.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/loans/${loan.id}`}
                            className="font-mono text-xs font-semibold text-slate-800 hover:text-emerald-600"
                          >
                            {loan.code}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="max-w-32 truncate font-medium text-slate-700">
                            {loan.borrowerName}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="max-w-40 truncate text-slate-600">
                            {loan.itemName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {loan.quantity} unit
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap text-slate-500">
                          {formatDate(loan.borrowDate)}
                        </td>
                        <td className="px-5 py-3.5">
                          <LoanStatusBadge
                            status={loan.status}
                            dueDate={loan.dueDate}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <PackageOpen className="size-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  Stok Perlu Perhatian
                </h2>
              </div>
              <Badge tone={lowStockItems.length > 0 ? "amber" : "emerald"}>
                {lowStockItems.length} barang
              </Badge>
            </div>

            {visibleLowStock.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Semua stok aman
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Tidak ada barang yang menyentuh batas minimum.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibleLowStock.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/items?q=${encodeURIComponent(item.code)}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.code} · min. {item.minStock} unit
                        </p>
                      </div>
                      <span
                        className={
                          item.stock === 0
                            ? "shrink-0 rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600"
                            : "shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600"
                        }
                      >
                        {item.stock} unit
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {user.role === "ADMIN" ? (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Aktivitas Terbaru
                  </h2>
                </div>
                <Link
                  href="/activity"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Semua
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  Belum ada aktivitas tercatat.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentActivity.map((entry) => (
                    <li key={entry.id} className="flex gap-3 px-5 py-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {entry.user ? getInitials(entry.user.name) : "SYS"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs leading-relaxed text-slate-700">
                          {entry.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {activityLabel(entry.action)} ·{" "}
                          {formatRelative(entry.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">Aksi Cepat</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Catat transaksi operasional laboratorium dengan cepat.
              </p>
              <div className="mt-4 space-y-2">
                <Link
                  href="/loans/new"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <ArrowLeftRight className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs font-semibold text-slate-800">
                      Catat Peminjaman
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      Barang keluar dari laboratorium
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>
                <Link
                  href="/returns"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Undo2 className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs font-semibold text-slate-800">
                      Proses Pengembalian
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      Kembalikan stok barang
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-700">
                  {staffCount} staff aktif
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                  Pastikan data peminjam diisi dengan benar sebelum menyimpan
                  transaksi.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
