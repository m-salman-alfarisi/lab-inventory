import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buildQuery, cn } from "@/lib/utils";

function pageItems(current: number, total: number): Array<number | "dots"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: Array<number | "dots"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("dots");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("dots");
  pages.push(total);

  return pages;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const items = pageItems(page, totalPages);
  const prevHref = buildQuery(basePath, { ...query, page: page - 1 });
  const nextHref = buildQuery(basePath, { ...query, page: page + 1 });

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Halaman <span className="font-semibold text-slate-700">{page}</span> dari{" "}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </p>

      <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            href={prevHref}
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span className="flex size-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300">
            <ChevronLeft className="size-4" />
          </span>
        )}

        {items.map((item, index) =>
          item === "dots" ? (
            <span
              key={`dots-${index}`}
              className="flex size-9 items-center justify-center text-xs text-slate-400"
            >
              ...
            </span>
          ) : (
            <Link
              key={item}
              href={buildQuery(basePath, { ...query, page: item })}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border text-xs font-semibold transition",
                item === page
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {item}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link
            href={nextHref}
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className="flex size-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300">
            <ChevronRight className="size-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
