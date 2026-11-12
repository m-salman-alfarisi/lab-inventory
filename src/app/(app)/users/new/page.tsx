import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createStaff } from "@/app/actions/users";
import { UserForm } from "@/app/(app)/users/user-form";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tambah Staff",
};

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="Tambah Akun Staff"
        description="Buat akun untuk petugas laboratorium yang akan mengelola transaksi operasional."
        back={
          <Link
            href="/users"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke manajemen pengguna
          </Link>
        }
      />
      <UserForm action={createStaff} mode="create" />
    </>
  );
}
