"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import {
  createSession,
  destroySession,
  getCurrentUser,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFieldErrors,
  loginSchema,
  type ActionState,
} from "@/lib/validation";

function safeRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      message: "Periksa kembali data yang Anda masukkan.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const username = parsed.data.username.toLowerCase();
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return { message: "Username atau password salah." };
  }

  if (!user.isActive) {
    return {
      message:
        "Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator laboratorium.",
    };
  }

  const passwordValid = await compare(parsed.data.password, user.passwordHash);
  if (!passwordValid) {
    return { message: "Username atau password salah." };
  }

  await createSession(user);

  await logActivity(prisma, {
    userId: user.id,
    action: "LOGIN",
    description: `${user.name} masuk ke sistem.`,
  });

  redirect(safeRedirect(formData.get("redirectTo")));
}

export async function logout(): Promise<void> {
  const user = await getCurrentUser();

  if (user) {
    await logActivity(prisma, {
      userId: user.id,
      action: "LOGOUT",
      description: `${user.name} keluar dari sistem.`,
    });
  }

  await destroySession();
  redirect("/login?success=Anda%20telah%20keluar%20dari%20sistem.");
}
