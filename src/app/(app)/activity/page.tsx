import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  Activity,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { selectClass } from "@/components/ui/field";
import { ACTION_LABELS, activityLabel } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  firstParam,
  formatDateTime,
  formatNumber,
  formatRelative,
  getInitials,
  parsePage,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Log Aktivitas",
};

const ACTIVITY_PAGE_SIZE = 15;

type Tone = "slate" | "emerald" | "amber" | "sky" | "violet" | "rose";

function toneForAction(action: string): Tone {
  if (action.startsWith("ITEM_")) return "emerald";
  if (action === "LOAN_CREATE") return "amber";
  if (action === "LOAN_RETURN") return "sky";
  if (action.startsWith("USER_")) return "violet";
  if (action === "PASSWORD_CHANGE") return "rose";
  return "slate";
}

export default async function ActivityPage(props: PageProps<"/activity">) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const q = (firstParam(searchParams.q) ?? "").trim();
  const actionParam = firstParam(searchParams.action) ?? "";
  const action = Object.keys(ACTION_LABELS).includes(actionParam)
    ? actionParam
    : "";
  const page = parsePage(searchParams.page);

  const filters: Prisma.ActivityLogWhereInput[] = [];
  if (q) {
    filters.push({
      OR: [
        { description: { contains: q, mode: "insensitive" } },
        {
          user: {
            is: { name: { contains: q, mode: "insensitive" } },
          },
        },
      ],
    });
  }
  if (action) filters.push({ action });

  const where: Prisma.ActivityLogWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const total = await prisma.activityLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * ACTIVITY_PAGE_SIZE,
    take: ACTIVITY_PAGE_SIZE,
    include: {
      user: { select: { name: true, role: true } },
    },
  });

  const hasFilter = Boolean(q || action);

  return (
    <>
      <PageHeader
        title="Log Aktivitas"
        description="Rekam jejak seluruh aktivitas penting di sistem, termasuk transaksi dan perubahan data."
        action={
          <Badge tone="violet">
            <ShieldCheck className="size-3" />
            Khusus Admin
          </Badge>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form method="get" className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari deskripsi aktivitas atau nama pengguna..."
              aria-label="Cari aktivitas"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-10 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <select
            name="action"
            defaultValue={action}
            aria-label="Filter jenis aktivitas"
            className={`${selectClass} sm:w-56`}
          >
            <option value="">Semua aktivitas</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button type="submit" className={buttonClass("primary", "md")}>
              <Search className="size-4" />
              Cari
            </button>
            {hasFilter && (
              <Link
                href="/activity"
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
            <h2 className="text-sm font-bold text-slate-900">Riwayat Sistem</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatNumber(total)} aktivitas ditemukan
              {hasFilter && " berdasarkan filter"}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Waktu ditampilkan dalam zona Asia/Jakarta
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Activity className="size-5" />}
              title="Belum ada aktivitas"
              description={
                hasFilter
                  ? "Tidak ada aktivitas yang sesuai dengan filter."
                  : "Aktivitas login, transaksi, dan perubahan data akan tercatat di sini."
              }
              action={
                hasFilter ? (
                  <Link
                    href="/activity"
                    className={buttonClass("outline", "sm")}
                  >
                    <RotateCcw className="size-3.5" />
                    Reset Filter
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex flex-col gap-2 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="w-36 shrink-0">
                  <p className="text-xs font-semibold text-slate-700">
                    {formatDateTime(log.createdAt)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatRelative(log.createdAt)}
                  </p>
                </div>

                <div className="flex w-full shrink-0 items-center gap-2 sm:w-60">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600">
                    {log.user ? getInitials(log.user.name) : "SYS"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-700">
                      {log.user?.name ?? "Sistem"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {log.user?.role === "ADMIN" ? "Admin" : log.user ? "Staff" : "-"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <Badge tone={toneForAction(log.action)}>
                    {activityLabel(log.action)}
                  </Badge>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {log.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="px-5 pb-5">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/activity"
            query={{ q: q || undefined, action: action || undefined }}
          />
        </div>
      </section>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
        <Activity className="size-3.5" />
        Log aktivitas tidak dapat diubah atau dihapus untuk menjaga integritas
        data.
      </div>
    </>
  );
}
