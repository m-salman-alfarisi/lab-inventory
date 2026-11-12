import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { updateStaff } from "@/app/actions/users";
import { UserForm } from "@/app/(app)/users/user-form";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Staff",
};

export default async function EditUserPage(
  props: PageProps<"/users/[id]/edit">,
) {
  await requireAdmin();
  const { id } = await props.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) notFound();
  if (user.role === "ADMIN") {
    redirect(
      "/users?error=Akun%20Administrator%20tidak%20dapat%20diubah%20dari%20menu%20ini.",
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Akun Staff"
        description={`Perbarui informasi akun @${user.username}.`}
        back={
          <Link
            href="/users"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke manajemen pengguna
          </Link>
        }
      />
      <UserForm
        action={updateStaff.bind(null, user.id)}
        mode="edit"
        isActive={user.isActive}
        defaultValues={{
          name: user.name,
          username: user.username,
          email: user.email,
        }}
      />
    </>
  );
}
