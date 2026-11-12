"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateOnly, todayJakarta } from "@/lib/utils";
import {
  getFieldErrors,
  loanSchema,
  type ActionState,
} from "@/lib/validation";

function makeLoanCode(): string {
  const date = todayJakarta().replaceAll("-", "");
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `PJM-${date}-${suffix}`;
}

function safeReturnPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/returns";
  if (!value.startsWith("/") || value.startsWith("//")) return "/returns";
  return value;
}

function refreshLoanPages() {
  revalidatePath("/dashboard");
  revalidatePath("/loans");
  revalidatePath("/returns");
  revalidatePath("/items");
  revalidatePath("/activity");
}

export async function createLoan(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = loanSchema.safeParse({
    borrowerName: formData.get("borrowerName"),
    borrowerInfo: formData.get("borrowerInfo"),
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
    borrowDate: formData.get("borrowDate"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      message: "Periksa kembali data peminjaman yang Anda masukkan.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: parsed.data.itemId },
    });

    if (!item) {
      return {
        ok: false as const,
        message: "Barang tidak ditemukan atau sudah dihapus.",
        field: "itemId",
      };
    }

    if (item.stock < parsed.data.quantity) {
      return {
        ok: false as const,
        message: `Stok ${item.name} hanya tersisa ${item.stock} unit.`,
        field: "quantity",
      };
    }

    const updated = await tx.item.updateMany({
      where: {
        id: item.id,
        stock: { gte: parsed.data.quantity },
      },
      data: { stock: { decrement: parsed.data.quantity } },
    });

    if (updated.count === 0) {
      return {
        ok: false as const,
        message:
          "Stok barang berubah saat transaksi diproses. Silakan coba lagi.",
        field: "quantity",
      };
    }

    const loan = await tx.loan.create({
      data: {
        code: makeLoanCode(),
        borrowerName: parsed.data.borrowerName,
        borrowerInfo: parsed.data.borrowerInfo,
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        quantity: parsed.data.quantity,
        borrowDate: parseDateOnly(parsed.data.borrowDate),
        dueDate: parsed.data.dueDate
          ? parseDateOnly(parsed.data.dueDate)
          : null,
        notes: parsed.data.notes,
        officerId: user.id,
      },
    });

    await logActivity(tx, {
      userId: user.id,
      action: "LOAN_CREATE",
      description: `${user.name} mencatat peminjaman ${loan.code}: ${item.name} (${loan.quantity} unit) oleh ${loan.borrowerName}.`,
    });

    return { ok: true as const, loan };
  });

  if (!result.ok) {
    return {
      message: result.message,
      errors: { [result.field]: [result.message] },
    };
  }

  refreshLoanPages();
  redirect(
    `/loans/${result.loan.id}?success=${encodeURIComponent(
      `Peminjaman ${result.loan.code} berhasil dicatat.`,
    )}`,
  );
}

export async function returnLoan(
  id: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const redirectTo = safeReturnPath(formData.get("redirectTo"));

  const result = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id } });

    if (!loan) {
      return {
        ok: false as const,
        message: "Transaksi peminjaman tidak ditemukan.",
      };
    }

    if (loan.status === "SELESAI") {
      return {
        ok: false as const,
        message: `Transaksi ${loan.code} sudah selesai diproses.`,
      };
    }

    const updated = await tx.loan.updateMany({
      where: { id, status: "DIPINJAM" },
      data: { status: "SELESAI", returnDate: new Date() },
    });

    if (updated.count === 0) {
      return {
        ok: false as const,
        message: "Transaksi sudah diproses oleh pengguna lain.",
      };
    }

    if (loan.itemId) {
      await tx.item.update({
        where: { id: loan.itemId },
        data: { stock: { increment: loan.quantity } },
      });
    }

    await logActivity(tx, {
      userId: user.id,
      action: "LOAN_RETURN",
      description: `${user.name} memproses pengembalian ${loan.code}: ${loan.itemName} (${loan.quantity} unit) milik ${loan.borrowerName}.`,
    });

    return {
      ok: true as const,
      message: `Pengembalian ${loan.code} berhasil diproses. Stok ${loan.itemName} bertambah ${loan.quantity} unit.`,
    };
  });

  refreshLoanPages();

  if (!result.ok) {
    redirect(`${redirectTo}?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`${redirectTo}?success=${encodeURIComponent(result.message)}`);
}
