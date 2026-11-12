import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { updateItem } from "@/app/actions/items";
import { ItemForm } from "@/app/(app)/items/item-form";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Barang",
};

export default async function EditItemPage(
  props: PageProps<"/items/[id]/edit">,
) {
  await requireAdmin();
  const { id } = await props.params;

  const [item, categoryRows] = await Promise.all([
    prisma.item.findUnique({ where: { id } }),
    prisma.item.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  if (!item) notFound();

  const categories = Array.from(
    new Set([
      ...categoryRows.map((row) => row.category),
      ...ITEM_CATEGORIES,
    ]),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <PageHeader
        title="Edit Barang"
        description={`Perbarui informasi ${item.code} — ${item.name}.`}
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
        action={updateItem.bind(null, item.id)}
        categories={categories}
        mode="edit"
        defaultValues={{
          code: item.code,
          name: item.name,
          category: item.category,
          stock: item.stock,
          minStock: item.minStock,
          description: item.description,
        }}
      />
    </>
  );
}
