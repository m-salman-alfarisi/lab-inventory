import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createItem } from "@/app/actions/items";
import { ItemForm } from "@/app/(app)/items/item-form";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Tambah Barang",
};

export default async function NewItemPage() {
  await requireAdmin();

  const [existing, categoryRows] = await Promise.all([
    prisma.item.findMany({
      where: { code: { startsWith: "BR" } },
      select: { code: true },
    }),
    prisma.item.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const maxNumber = existing.reduce((max, item) => {
    const match = /^BR(\d+)$/i.exec(item.code);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  const suggestedCode = `BR${String(maxNumber + 1).padStart(3, "0")}`;
  const categories = Array.from(
    new Set([
      ...categoryRows.map((row) => row.category),
      ...ITEM_CATEGORIES,
    ]),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <PageHeader
        title="Tambah Barang"
        description="Tambahkan data inventaris baru ke dalam sistem laboratorium."
        back={
          <Link
            href="/items"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke data barang
          </Link>
        }
      />
      <ItemForm
        action={createItem}
        categories={categories}
        mode="create"
        defaultValues={{
          code: suggestedCode,
          name: "",
          category: "",
          stock: 0,
          minStock: 0,
          description: null,
        }}
      />
    </>
  );
}
