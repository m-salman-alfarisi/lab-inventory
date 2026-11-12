import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";

import { createLoan } from "@/app/actions/loans";
import { LoanForm } from "@/app/(app)/loans/loan-form";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays, todayJakarta } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Catat Peminjaman",
};

export default async function NewLoanPage() {
  await requireUser();

  const items = await prisma.item.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
      stock: true,
    },
  });

  const today = todayJakarta();
  const defaultDueDate = addDays(today, 7);

  return (
    <>
      <PageHeader
        title="Catat Peminjaman"
        description="Isi data peminjam dan barang yang akan dipinjam. Stok akan diperbarui otomatis."
        back={
          <Link
            href="/loans"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke daftar peminjaman
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="size-5" />}
          title="Tidak ada barang dengan stok tersedia"
          description="Semua barang sedang dipinjam atau stoknya habis. Proses pengembalian terlebih dahulu atau tambahkan stok barang."
          action={
            <Link href="/returns" className={buttonClass("brand", "sm")}>
              Lihat Pengembalian
            </Link>
          }
        />
      ) : (
        <>
          <Alert tone="info" className="mb-5">
            Stok barang akan berkurang setelah transaksi disimpan. Pastikan
            data peminjam dan jumlah barang sudah benar.
          </Alert>
          <LoanForm
            action={createLoan}
            items={items}
            defaultBorrowDate={today}
            defaultDueDate={defaultDueDate}
          />
        </>
      )}
    </>
  );
}
