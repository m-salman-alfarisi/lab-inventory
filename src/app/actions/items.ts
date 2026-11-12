"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFieldErrors,
  itemSchema,
  type ActionState,
} from "@/lib/validation";

function readItemForm(formData: FormData) {
  return {
    code: formData.get("code"),
    name: formData.get("name"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    minStock: formData.get("minStock"),
    description: formData.get("description"),
  };
}

function refreshItemPages() {
  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  revalidatePath("/loans");
}

export async function createItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = itemSchema.safeParse(readItemForm(formData));

  if (!parsed.success) {
    return {
      message: "Periksa kembali data barang yang Anda masukkan.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const code = parsed.data.code.toUpperCase();
  const existing = await prisma.item.findUnique({ where: { code } });
  if (existing) {
    return {
      message: "Kode barang sudah digunakan.",
      errors: { code: ["Kode barang sudah digunakan oleh barang lain."] },
    };
  }

  let item;
  try {
    item = await prisma.item.create({
      data: {
        code,
        name: parsed.data.name,
        category: parsed.data.category,
        stock: parsed.data.stock,
        minStock: parsed.data.minStock,
        description: parsed.data.description,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        message: "Kode barang sudah digunakan.",
        errors: { code: ["Kode barang sudah digunakan oleh barang lain."] },
      };
    }
    throw error;
  }

  await logActivity(prisma, {
    userId: user.id,
    action: "ITEM_CREATE",
    description: `${user.name} menambahkan barang ${item.code} — ${item.name} sebanyak ${item.stock} unit.`,
  });

  refreshItemPages();
  redirect(
    `/items?success=${encodeURIComponent(
      `Barang ${item.code} — ${item.name} berhasil ditambahkan.`,
    )}`,
  );
}

export async function updateItem(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = itemSchema.safeParse(readItemForm(formData));

  if (!parsed.success) {
    return {
      message: "Periksa kembali data barang yang Anda masukkan.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const current = await prisma.item.findUnique({ where: { id } });
  if (!current) {
    return { message: "Barang tidak ditemukan atau sudah dihapus." };
  }

  const code = parsed.data.code.toUpperCase();
  const duplicate = await prisma.item.findFirst({
    where: { code, id: { not: id } },
    select: { id: true },
  });
  if (duplicate) {
    return {
      message: "Kode barang sudah digunakan.",
      errors: { code: ["Kode barang sudah digunakan oleh barang lain."] },
    };
  }

  const item = await prisma.item.update({
    where: { id },
    data: {
      code,
      name: parsed.data.name,
      category: parsed.data.category,
      stock: parsed.data.stock,
      minStock: parsed.data.minStock,
      description: parsed.data.description,
    },
  });

  await logActivity(prisma, {
    userId: user.id,
    action: "ITEM_UPDATE",
    description: `${user.name} memperbarui data barang ${item.code} — ${item.name}.`,
  });

  refreshItemPages();
  redirect(
    `/items?success=${encodeURIComponent(
      `Data ${item.code} — ${item.name} berhasil diperbarui.`,
    )}`,
  );
}

export async function deleteItem(id: string): Promise<void> {
  const user = await requireAdmin();

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    redirect("/items?error=Barang%20tidak%20ditemukan.");
  }

  const activeLoans = await prisma.loan.count({
    where: { itemId: id, status: "DIPINJAM" },
  });

  if (activeLoans > 0) {
    redirect(
      `/items?error=${encodeURIComponent(
        `Barang ${item.code} — ${item.name} masih dipinjam dan tidak dapat dihapus. Proses pengembalian terlebih dahulu.`,
      )}`,
    );
  }

  await prisma.item.delete({ where: { id } });

  await logActivity(prisma, {
    userId: user.id,
    action: "ITEM_DELETE",
    description: `${user.name} menghapus barang ${item.code} — ${item.name}.`,
  });

  refreshItemPages();
  redirect(
    `/items?success=${encodeURIComponent(
      `Barang ${item.code} — ${item.name} berhasil dihapus.`,
    )}`,
  );
}
