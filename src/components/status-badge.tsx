import { Badge } from "@/components/ui/badge";
import { isOverdue } from "@/lib/utils";

export function LoanStatusBadge({
  status,
  dueDate,
}: {
  status: string;
  dueDate: Date | string | null;
}) {
  if (status === "SELESAI") {
    return (
      <Badge tone="emerald" dot>
        Selesai
      </Badge>
    );
  }

  if (isOverdue({ status, dueDate })) {
    return (
      <Badge tone="rose" dot>
        Terlambat
      </Badge>
    );
  }

  return (
    <Badge tone="amber" dot>
      Dipinjam
    </Badge>
  );
}

export function StockStatusBadge({
  stock,
  minStock,
}: {
  stock: number;
  minStock: number;
}) {
  if (stock <= 0) {
    return (
      <Badge tone="rose" dot>
        Habis
      </Badge>
    );
  }

  if (stock <= minStock) {
    return (
      <Badge tone="amber" dot>
        Menipis
      </Badge>
    );
  }

  return (
    <Badge tone="emerald" dot>
      Tersedia
    </Badge>
  );
}
