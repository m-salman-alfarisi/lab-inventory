"use client";

import { useActionState, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Save,
  UserRound,
} from "lucide-react";

import { changePassword, updateProfile } from "@/app/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui/alert";
import {
  errorClass,
  hintClass,
  inputClass,
  labelClass,
} from "@/components/ui/field";

type ProfileValues = {
  name: string;
  username: string;
  email: string | null;
  role: string;
};

export function ProfileForm({ user }: { user: ProfileValues }) {
  const [state, formAction] = useActionState(updateProfile, undefined);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <UserRound className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Informasi Profil</h2>
          <p className="text-xs text-slate-500">
            Perbarui nama dan alamat email akun Anda.
          </p>
        </div>
      </div>

      {state?.message && (
        <Alert
          tone={state.success ? "success" : "error"}
          className="mb-5"
        >
          {state.message}
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={user.name}
            placeholder="Nama lengkap"
            aria-invalid={Boolean(state?.errors?.name)}
            className={inputClass}
          />
          {state?.errors?.name && (
            <p className={errorClass}>{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-email" className={labelClass}>
            Email
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            maxLength={150}
            defaultValue={user.email ?? ""}
            placeholder="nama@laboratorium.ac.id"
            aria-invalid={Boolean(state?.errors?.email)}
            className={inputClass}
          />
          {state?.errors?.email && (
            <p className={errorClass}>{state.errors.email[0]}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              value={user.username}
              readOnly
              disabled
              className={inputClass}
            />
            <p className={hintClass}>
              Username tidak dapat diubah dari halaman profil.
            </p>
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <input
              type="text"
              value={user.role}
              readOnly
              disabled
              className={inputClass}
            />
            <p className={hintClass}>
              Role akun ditentukan oleh Administrator.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
        <SubmitButton pendingText="Menyimpan profil...">
          <Save className="size-4" />
          Simpan Profil
        </SubmitButton>
      </div>
    </form>
  );
}

function PasswordInput({
  id,
  name,
  label,
  placeholder,
  error,
  autoComplete = "new-password",
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          maxLength={72}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePassword, undefined);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <KeyRound className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Ganti Password</h2>
          <p className="text-xs text-slate-500">
            Gunakan password yang kuat dan tidak mudah ditebak.
          </p>
        </div>
      </div>

      {state?.message && (
        <Alert
          tone={state.success ? "success" : "error"}
          className="mb-5"
        >
          {state.message}
        </Alert>
      )}

      <div className="space-y-4">
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          label="Password Saat Ini"
          placeholder="Masukkan password saat ini"
          autoComplete="current-password"
          error={state?.errors?.currentPassword?.[0]}
        />
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label="Password Baru"
          placeholder="Minimal 6 karakter"
          error={state?.errors?.newPassword?.[0]}
        />
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi Password Baru"
          placeholder="Ulangi password baru"
          error={state?.errors?.confirmPassword?.[0]}
        />
      </div>

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
        <SubmitButton pendingText="Mengganti password...">
          <KeyRound className="size-4" />
          Ganti Password
        </SubmitButton>
      </div>
    </form>
  );
}
