import type { Prisma } from "@prisma/client";

export const ACTION_LABELS = {
  LOGIN: "Login",
  LOGOUT: "Logout",
  ITEM_CREATE: "Tambah barang",
  ITEM_UPDATE: "Ubah barang",
  ITEM_DELETE: "Hapus barang",
  LOAN_CREATE: "Peminjaman",
  LOAN_RETURN: "Pengembalian",
  USER_CREATE: "Tambah staff",
  USER_UPDATE: "Ubah staff",
  USER_TOGGLE: "Status akun",
  PASSWORD_CHANGE: "Ganti password",
  PROFILE_UPDATE: "Ubah profil",
} as const;

export type ActivityAction = keyof typeof ACTION_LABELS;

export function activityLabel(action: string): string {
  return ACTION_LABELS[action as ActivityAction] ?? action;
}

export async function logActivity(
  db: Prisma.TransactionClient,
  data: {
    userId: string | null;
    action: ActivityAction;
    description: string;
  },
): Promise<void> {
  await db.activityLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      description: data.description,
    },
  });
}
