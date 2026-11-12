"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFieldErrors,
  passwordSchema,
  profileSchema,
  type ActionState,
} from "@/lib/validation";

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      message: "Periksa kembali data profil Anda.",
      errors: getFieldErrors(parsed.error),
    };
  }

  if (parsed.data.email) {
    const duplicate = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        id: { not: user.id },
      },
      select: { id: true },
    });
    if (duplicate) {
      return {
        message: "Email sudah digunakan akun lain.",
        errors: { email: ["Email sudah digunakan akun lain."] },
      };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
    },
  });

  await logActivity(prisma, {
    userId: user.id,
    action: "PROFILE_UPDATE",
    description: `${user.name} memperbarui profil akunnya.`,
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Profil berhasil diperbarui.",
  };
}

export async function changePassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      message: "Periksa kembali data password Anda.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!account) {
    return { message: "Akun tidak ditemukan." };
  }

  const valid = await compare(parsed.data.currentPassword, account.passwordHash);
  if (!valid) {
    return {
      message: "Password saat ini tidak sesuai.",
      errors: { currentPassword: ["Password saat ini tidak sesuai."] },
    };
  }

  const passwordHash = await hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await logActivity(prisma, {
    userId: user.id,
    action: "PASSWORD_CHANGE",
    description: `${user.name} mengganti password akunnya.`,
  });

  revalidatePath("/profile");
  revalidatePath("/activity");

  return {
    success: true,
    message: "Password berhasil diganti. Gunakan password baru saat login berikutnya.",
  };
}
