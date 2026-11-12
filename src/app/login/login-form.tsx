"use client";

import { useActionState, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";

import { login } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { inputClass, labelClass } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";

const demoAccounts = [
  { role: "Admin", username: "admin", password: "admin123" },
  { role: "Staff", username: "staff", password: "staff123" },
];

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(login, undefined);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state?.message && <Alert tone="error">{state.message}</Alert>}

      <div>
        <label htmlFor="username" className={labelClass}>
          Username
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Masukkan username"
            aria-invalid={Boolean(state?.errors?.username)}
            className={cn(inputClass, "pl-10")}
          />
        </div>
        {state?.errors?.username && (
          <p className="mt-1.5 text-xs font-medium text-rose-600">
            {state.errors.username[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Masukkan password"
            aria-invalid={Boolean(state?.errors?.password)}
            className={cn(inputClass, "pr-11 pl-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
            className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {state?.errors?.password && (
          <p className="mt-1.5 text-xs font-medium text-rose-600">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      <SubmitButton
        pendingText="Memproses..."
        className="mt-2 w-full"
        size="md"
      >
        <LogIn className="size-4" />
        Masuk
      </SubmitButton>

      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Akses demo
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {demoAccounts.map((account) => (
          <button
            key={account.username}
            type="button"
            onClick={() => {
              setUsername(account.username);
              setPassword(account.password);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
          >
            <span className="block text-[11px] font-bold text-slate-700">
              Isi akun {account.role}
            </span>
            <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
              {account.username} / {account.password}
            </span>
          </button>
        ))}
      </div>
    </form>
  );
}
