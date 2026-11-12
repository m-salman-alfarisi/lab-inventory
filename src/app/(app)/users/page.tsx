import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";

import { toggleStaff } from "@/app/actions/users";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { EmptyState } from "@/components/empty-state";
import { Flash } from "@/components/flash";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatCard } from "@/components/stat-card";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { PAGE_SIZE, ROLE_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  firstParam,
  formatDate,
  formatNumber,
  getInitials,
  parsePage,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manajemen Pengguna",
};

export default async function UsersPage(props: PageProps<"/users">) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const q = (firstParam(searchParams.q) ?? "").trim();
  const page = parsePage(searchParams.page);
  const success = firstParam(searchParams.success);
  const error = firstParam(searchParams.error);

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, totalStaff, activeStaff] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "STAFF" } }),
    prisma.user.count({ where: { role: "STAFF", isActive: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun Staff laboratorium, pantau status aktif, dan perbarui data akun."
        action={
          <Link href="/users/new" className={buttonClass("brand", "md")}>
            <Plus className="size-4" />
            Tambah Staff
          </Link>
        }
      />

      <Flash success={success} error={error} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Staff"
          value={formatNumber(totalStaff)}
          hint="Akun staff terdaftar"
          icon={<Users className="size-5" />}
          tone="sky"
        />
        <StatCard
          label="Staff Aktif"
          value={formatNumber(activeStaff)}
          hint="Dapat login ke sistem"
          icon={<UserCheck className="size-5" />}
          tone="emerald"
        />
        <StatCard
          label="Staff Nonaktif"
          value={formatNumber(totalStaff - activeStaff)}
          hint="Akses login dinonaktifkan"
          icon={<UserX className="size-5" />}
          tone={totalStaff - activeStaff > 0 ? "rose" : "slate"}
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
              placeholder="Cari nama, username, atau email..."
              aria-label="Cari pengguna"
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
                href="/users"
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
            <h2 className="text-sm font-bold text-slate-900">Daftar Pengguna</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatNumber(total)} akun ditemukan
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Akun nonaktif tetap menyimpan riwayat transaksi
          </p>
        </div>

        {users.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<UserPlus className="size-5" />}
              title="Pengguna tidak ditemukan"
              description="Coba kata kunci lain atau tambahkan akun staff baru."
              action={
                <Link href="/users/new" className={buttonClass("brand", "sm")}>
                  <Plus className="size-3.5" />
                  Tambah Staff
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  <th className="px-5 py-3">Pengguna</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Terdaftar</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isAdmin = user.role === "ADMIN";

                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={
                              isAdmin
                                ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700"
                                : "flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700"
                            }
                          >
                            {getInitials(user.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-64 truncate font-semibold text-slate-800">
                              {user.name}
                            </p>
                            <p className="max-w-72 truncate text-[11px] text-slate-400">
                              @{user.username}
                              {user.email ? ` · ${user.email}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={isAdmin ? "violet" : "sky"}>
                          {isAdmin && <ShieldCheck className="size-3" />}
                          {ROLE_LABEL[user.role]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={user.isActive ? "emerald" : "rose"} dot>
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {isAdmin ? (
                          <p className="text-right text-[11px] font-medium text-slate-400">
                            Akun utama
                          </p>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/users/${user.id}/edit`}
                              className={buttonClass("outline", "icon-sm")}
                              title={`Edit ${user.name}`}
                              aria-label={`Edit ${user.name}`}
                            >
                              <Pencil className="size-3.5" />
                            </Link>
                            <form action={toggleStaff.bind(null, user.id)}>
                              <ConfirmSubmit
                                message={
                                  user.isActive
                                    ? `Nonaktifkan akun ${user.name}? Staff tersebut tidak akan bisa login, tetapi riwayat transaksinya tetap tersimpan.`
                                    : `Aktifkan kembali akun ${user.name}? Staff tersebut akan dapat login ke sistem.`
                                }
                                variant={
                                  user.isActive ? "danger-outline" : "outline"
                                }
                                title={
                                  user.isActive
                                    ? "Nonaktifkan akun"
                                    : "Aktifkan akun"
                                }
                                ariaLabel={
                                  user.isActive
                                    ? `Nonaktifkan ${user.name}`
                                    : `Aktifkan ${user.name}`
                                }
                              >
                                {user.isActive ? (
                                  <UserX className="size-3.5" />
                                ) : (
                                  <UserCheck className="size-3.5" />
                                )}
                              </ConfirmSubmit>
                            </form>
                          </div>
                        )}
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
            basePath="/users"
            query={{ q: q || undefined }}
          />
        </div>
      </section>

      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[11px] leading-relaxed text-sky-700">
        Akun staff yang dinonaktifkan tidak dapat login, namun seluruh riwayat
        peminjaman dan aktivitasnya tetap tersimpan di sistem.
      </div>
    </>
  );
}
