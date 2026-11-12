import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  PackageOpen,
} from "lucide-react";

import { deleteItem } from "@/app/actions/items";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { EmptyState } from "@/components/empty-state";
import { Flash } from "@/components/flash";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StockStatusBadge } from "@/components/status-badge";
import { buttonClass } from "@/components/ui/button";
import { selectClass } from "@/components/ui/field";
import { requireUser } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  firstParam,
  formatNumber,
  parsePage,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Data Barang",
};

export default async function ItemsPage(props: PageProps<"/items">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;

  const q = (firstParam(searchParams.q) ?? "").trim();
  const category = (firstParam(searchParams.category) ?? "").trim();
  const page = parsePage(searchParams.page);
  const success = firstParam(searchParams.success);
  const error = firstParam(searchParams.error);

  const filters: Prisma.ItemWhereInput[] = [];
  if (q) {
    filters.push({
      OR: [
        { code: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (category) filters.push({ category });

  const where: Prisma.ItemWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const [totalItems, categories] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const items = await prisma.item.findMany({
    where,
    orderBy: { code: "asc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const isAdmin = user.role === "ADMIN";
  const hasFilter = Boolean(q || category);

  return (
    <>
      <PageHeader
        title={isAdmin ? "Manajemen Barang" : "Daftar Barang"}
        description={
          isAdmin
            ? "Kelola data inventaris laboratorium, stok, dan batas minimum persediaan."
            : "Lihat ketersediaan barang laboratorium. Perubahan data hanya dapat dilakukan oleh Admin."
        }
        action={
          isAdmin ? (
            <Link href="/items/new" className={buttonClass("brand", "md")}>
              <Plus className="size-4" />
              Tambah Barang
            </Link>
          ) : undefined
        }
      />

      <Flash success={success} error={error} />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form method="get" className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari kode, nama, atau kategori barang..."
              aria-label="Cari barang"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-10 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <select
            name="category"
            defaultValue={category}
            aria-label="Filter kategori"
            className={`${selectClass} sm:w-52`}
          >
            <option value="">Semua kategori</option>
            {categories.map((item) => (
              <option key={item.category} value={item.category}>
                {item.category}
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
                href="/items"
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
            <h2 className="text-sm font-bold text-slate-900">Daftar Inventaris</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatNumber(totalItems)} barang ditemukan
              {hasFilter && " berdasarkan filter"}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Stok diperbarui otomatis dari transaksi
          </p>
        </div>

        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<PackageOpen className="size-5" />}
              title={hasFilter ? "Barang tidak ditemukan" : "Belum ada barang"}
              description={
                hasFilter
                  ? "Coba gunakan kata kunci atau kategori lain."
                  : "Tambahkan data barang pertama untuk mulai mengelola inventaris."
              }
              action={
                hasFilter ? (
                  <Link href="/items" className={buttonClass("outline", "sm")}>
                    <RotateCcw className="size-3.5" />
                    Reset Filter
                  </Link>
                ) : isAdmin ? (
                  <Link href="/items/new" className={buttonClass("brand", "sm")}>
                    <Plus className="size-3.5" />
                    Tambah Barang
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  <th className="px-5 py-3">Barang</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Stok</th>
                  <th className="px-5 py-3">Status</th>
                  {isAdmin && <th className="px-5 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                          {item.code.slice(-3)}
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-56 truncate font-semibold text-slate-800">
                            {item.name}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">
                            {item.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {formatNumber(item.stock)}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          unit
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        min. {item.minStock} unit
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StockStatusBadge
                        stock={item.stock}
                        minStock={item.minStock}
                      />
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/items/${item.id}/edit`}
                            className={buttonClass("outline", "icon-sm")}
                            title={`Edit ${item.name}`}
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <form action={deleteItem.bind(null, item.id)}>
                            <ConfirmSubmit
                              message={`Hapus barang ${item.code} — ${item.name}? Tindakan ini tidak dapat dibatalkan.`}
                              title={`Hapus ${item.name}`}
                              ariaLabel={`Hapus ${item.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    )}
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
            basePath="/items"
            query={{ q: q || undefined, category: category || undefined }}
          />
        </div>
      </section>
    </>
  );
}
