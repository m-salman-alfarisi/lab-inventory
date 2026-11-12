import { Alert } from "@/components/ui/alert";

export function Flash({
  success,
  error,
  className,
}: {
  success?: string;
  error?: string;
  className?: string;
}) {
  if (!success && !error) return null;

  return (
    <div className={className ?? "mb-5"}>
      {success && <Alert tone="success">{success}</Alert>}
      {error && (
        <Alert tone="error" className={success ? "mt-3" : undefined}>
          {error}
        </Alert>
      )}
    </div>
  );
}
