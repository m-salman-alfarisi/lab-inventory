export const SESSION_COOKIE = "lab_inventory_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export const PAGE_SIZE = 8;

export const ITEM_CATEGORIES = [
  "Laptop",
  "Monitor",
  "Aksesoris",
  "Proyektor",
  "Jaringan",
  "Kabel & Adaptor",
  "Printer",
  "Penyimpanan",
  "Lainnya",
] as const;

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  STAFF: "Staff",
};

export const LOAN_STATUS_LABEL: Record<string, string> = {
  DIPINJAM: "Dipinjam",
  SELESAI: "Selesai",
};
