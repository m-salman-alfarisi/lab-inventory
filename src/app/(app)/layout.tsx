import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
    >
      {children}
    </AppShell>
  );
}
