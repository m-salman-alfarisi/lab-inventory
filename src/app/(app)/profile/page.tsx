import type { Metadata } from "next";
import {
  CalendarDays,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { PasswordForm, ProfileForm } from "@/app/(app)/profile/profile-forms";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate, getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profil Saya",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun dan keamanan password Anda."
      />

      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
            {getInitials(user.name)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {user.name}
              </h2>
              <Badge tone={user.role === "ADMIN" ? "violet" : "sky"}>
                {user.role === "ADMIN" && <ShieldCheck className="size-3" />}
                {ROLE_LABEL[user.role]}
              </Badge>
              <Badge tone={user.isActive ? "emerald" : "rose"} dot>
                {user.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <UserRound className="size-3.5" />@{user.username}
              </span>
              {user.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                Bergabung {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileForm
          user={{
            name: user.name,
            username: user.username,
            email: user.email,
            role: ROLE_LABEL[user.role],
          }}
        />
        <PasswordForm />
      </div>

      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[11px] leading-relaxed text-sky-700">
        Demi keamanan, gunakan password yang berbeda dari akun lain dan jangan
        bagikan kredensial kepada orang yang tidak berkepentingan.
      </div>
    </>
  );
}
