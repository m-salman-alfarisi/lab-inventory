"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Undo2,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { logout } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";

type ShellUser = {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "STAFF";
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Utama",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Inventaris",
    items: [{ label: "Data Barang", href: "/items", icon: Package }],
  },
  {
    title: "Transaksi",
    items: [
      { label: "Peminjaman", href: "/loans", icon: ArrowLeftRight },
      { label: "Pengembalian", href: "/returns", icon: Undo2 },
    ],
  },
  {
    title: "Administrasi",
    items: [
      { label: "Pengguna", href: "/users", icon: Users, adminOnly: true },
      { label: "Log Aktivitas", href: "/activity", icon: Activity, adminOnly: true },
    ],
  },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: "ADMIN" | "STAFF";
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter(
          (item) => !item.adminOnly || role === "ADMIN",
        );
        if (items.length === 0) return null;

        return (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-slate-500 uppercase">
              {section.title}
            </p>
            <div className="space-y-1">
              {items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-emerald-500/15 text-white ring-1 ring-emerald-400/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition",
                        active
                          ? "text-emerald-400"
                          : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {active && (
                      <span className="ml-auto size-1.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function UserCard({
  user,
  onNavigate,
}: {
  user: ShellUser;
  onNavigate?: () => void;
}) {
  return (
    <div className="border-t border-white/10 p-3">
      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/20">
            {getInitials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white" title={user.name}>
              {user.name}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {ROLE_LABEL[user.role]} · @{user.username}
            </p>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <UserRound className="size-3.5" />
            Profil
          </Link>
          <form action={logout} className="flex">
            <button
              type="submit"
              className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 text-[11px] font-medium text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300"
            >
              <LogOut className="size-3.5" />
              Keluar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-[#0b1220] lg:flex">
        <div className="flex h-[76px] items-center px-5">
          <Brand dark />
        </div>
        <NavLinks pathname={pathname} role={user.role} />
        <UserCard user={user} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
        >
          <Menu className="size-5" />
        </button>
        <Brand />
        <div className="ml-auto flex items-center gap-2">
          <Badge tone={user.role === "ADMIN" ? "violet" : "sky"}>
            {ROLE_LABEL[user.role]}
          </Badge>
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
            {getInitials(user.name)}
          </span>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[#0b1220] shadow-2xl">
            <div className="flex h-[76px] items-center justify-between px-5">
              <Brand dark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks
              pathname={pathname}
              role={user.role}
              onNavigate={() => setMobileOpen(false)}
            />
            <UserCard user={user} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
