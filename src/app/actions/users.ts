"use server";

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFieldErrors,
  staffCreateSchema,
  staffUpdateSchema,
  type ActionState,
} from "@/lib/validation";

function readStaffForm(formData: FormData) {
  return {
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createStaff(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = staffCreateSchema.safeParse(readStaffForm(formData));

  if (!parsed.success) {
    return {
      message: "Periksa kembali data akun staff yang Anda masukkan.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const username = parsed.data.username.toLowerCase();
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        ...(parsed.data.email ? [{ email: parsed.data.email }] : []),
      ],
    },
    select: { username: true, email: true },
  });

  if (existing) {
    const errors: Record<string, string[]> = {};
    if (existing.username === username) {
      errors.username = ["Username sudah digunakan."];
    }
    if (parsed.data.email && existing.email === parsed.data.email) {
      errors.email = ["Email sudah digunakan."];
    }
    return { message: "Username atau email sudah digunakan.", errors };
  }

  const passwordHash = await hash(parsed.data.password, 10);

  let staff;
  try {
    staff = await prisma.user.create({
      data: {
        name: parsed.data.name,
        username,
        email: parsed.data.email,
        passwordHash,
        role: "STAFF",
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        message: "Username atau email sudah digunakan.",
        errors: { username: ["Username atau email sudah digunakan."] },
      };
    }
    throw error;
  }

  await logActivity(prisma, {
    userId: admin.id,
    action: "USER_CREATE",
    description: `${admin.name} menambahkan akun staff ${staff.name} (@${staff.username}).`,
  });

  revalidatePath("/users");
  revalidatePath("/activity");
  redirect(
    `/users?success=${encodeURIComponent(
      `Akun staff ${staff.name} (@${staff.username}) berhasil dibuat.`,
    )}`,
  );
}

export async function updateStaff(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = staffUpdateSchema.safeParse(readStaffForm(formData));

  if (!parsed.success) {
    return {
      message: "Periksa kembali data akun staff yang Anda masukkan.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return { message: "Akun staff tidak ditemukan." };
  }
  if (target.role === "ADMIN") {
    return { message: "Akun Administrator tidak dapat diubah dari menu ini." };
  }

  const username = parsed.data.username.toLowerCase();
  const duplicate = await prisma.user.findFirst({
    where: {
      id: { not: id },
      OR: [
        { username },
        ...(parsed.data.email ? [{ email: parsed.data.email }] : []),
      ],
    },
    select: { username: true, email: true },
  });

  if (duplicate) {
    const errors: Record<string, string[]> = {};
    if (duplicate.username === username) {
      errors.username = ["Username sudah digunakan."];
    }
    if (parsed.data.email && duplicate.email === parsed.data.email) {
      errors.email = ["Email sudah digunakan."];
    }
    return { message: "Username atau email sudah digunakan.", errors };
  }

  const data: {
    name: string;
    username: string;
    email: string | null;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    username,
    email: parsed.data.email,
  };

  if (parsed.data.password) {
    data.passwordHash = await hash(parsed.data.password, 10);
  }

  const staff = await prisma.user.update({ where: { id }, data });

  await logActivity(prisma, {
    userId: admin.id,
    action: "USER_UPDATE",
    description: `${admin.name} memperbarui akun staff ${staff.name} (@${staff.username}).`,
  });

  revalidatePath("/users");
  revalidatePath("/activity");
  redirect(
    `/users?success=${encodeURIComponent(
      `Akun staff ${staff.name} berhasil diperbarui.`,
    )}`,
  );
}

export async function toggleStaff(id: string): Promise<void> {
  const admin = await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id } });

  if (!target) {
    redirect("/users?error=Akun%20staff%20tidak%20ditemukan.");
  }

  if (target.role === "ADMIN") {
    redirect(
      "/users?error=Akun%20Administrator%20tidak%20dapat%20dinonaktifkan.",
    );
  }

  const staff = await prisma.user.update({
    where: { id },
    data: { isActive: !target.isActive },
  });

  await logActivity(prisma, {
    userId: admin.id,
    action: "USER_TOGGLE",
    description: `${admin.name} ${staff.isActive ? "mengaktifkan" : "menonaktifkan"} akun staff ${staff.name} (@${staff.username}).`,
  });

  revalidatePath("/users");
  revalidatePath("/activity");
  redirect(
    `/users?success=${encodeURIComponent(
      `Akun ${staff.name} berhasil ${staff.isActive ? "diaktifkan" : "dinonaktifkan"}.`,
    )}`,
  );
}
