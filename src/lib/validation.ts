import { z } from "zod";

export type ActionState =
  | {
      message?: string;
      success?: boolean;
      errors?: Record<string, string[]>;
    }
  | undefined;

export function getFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() || "form";
    if (!result[key]) result[key] = [];
    result[key].push(issue.message);
  }
  return result;
}

const dateOnly = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), {
    message: "Tanggal tidak valid.",
  });

const optionalEmail = z
  .union([z.literal(""), z.string().trim().email("Format email tidak valid.")])
  .transform((value) => (value ? value : null));

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value ? value : null));

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

export const itemSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter.")
    .max(20, "Kode maksimal 20 karakter.")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "Kode hanya boleh berisi huruf, angka, dan tanda hubung.",
    ),
  name: z
    .string()
    .trim()
    .min(2, "Nama barang minimal 2 karakter.")
    .max(100, "Nama barang maksimal 100 karakter."),
  category: z
    .string()
    .trim()
    .min(2, "Kategori minimal 2 karakter.")
    .max(50, "Kategori maksimal 50 karakter."),
  stock: z.coerce
    .number()
    .int("Stok harus berupa bilangan bulat.")
    .min(0, "Stok tidak boleh negatif.")
    .max(100000, "Stok terlalu besar."),
  minStock: z.coerce
    .number()
    .int("Stok minimum harus berupa bilangan bulat.")
    .min(0, "Stok minimum tidak boleh negatif.")
    .max(100000, "Stok minimum terlalu besar."),
  description: optionalText(500, "Deskripsi maksimal 500 karakter."),
});

export const loanSchema = z
  .object({
    borrowerName: z
      .string()
      .trim()
      .min(2, "Nama peminjam minimal 2 karakter.")
      .max(100, "Nama peminjam maksimal 100 karakter."),
    borrowerInfo: optionalText(100, "Keterangan maksimal 100 karakter."),
    itemId: z.string().trim().min(1, "Pilih barang yang akan dipinjam."),
    quantity: z.coerce
      .number()
      .int("Jumlah harus berupa bilangan bulat.")
      .min(1, "Jumlah minimal 1 unit.")
      .max(1000, "Jumlah terlalu banyak."),
    borrowDate: dateOnly,
    dueDate: z
      .union([z.literal(""), dateOnly])
      .transform((value) => (value ? value : null)),
    notes: optionalText(500, "Catatan maksimal 500 karakter."),
  })
  .refine(
    (data) => !data.dueDate || data.dueDate >= data.borrowDate,
    {
      message: "Tanggal jatuh tempo tidak boleh sebelum tanggal pinjam.",
      path: ["dueDate"],
    },
  );

const staffBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter."),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(30, "Username maksimal 30 karakter.")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.",
    ),
  email: optionalEmail,
});

export const staffCreateSchema = staffBaseSchema.extend({
  password: z
    .string()
    .min(6, "Password minimal 6 karakter.")
    .max(72, "Password maksimal 72 karakter."),
});

export const staffUpdateSchema = staffBaseSchema.extend({
  password: z
    .union([
      z.literal(""),
      z
        .string()
        .min(6, "Password minimal 6 karakter.")
        .max(72, "Password maksimal 72 karakter."),
    ])
    .transform((value) => (value ? value : null)),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter."),
  email: optionalEmail,
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(6, "Password baru minimal 6 karakter.")
      .max(72, "Password maksimal 72 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });
