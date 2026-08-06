import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-surface-app-deep px-4">
      <div className="w-full max-w-[380px] rounded-card border border-line-subtle bg-surface-1 p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="font-display text-h4 font-bold tracking-heading text-fg-strong">
            dropbase<span className="text-brand">.</span>
          </div>
          <p className="mt-1 font-ui text-body-sm text-fg-muted">
            Entre para acessar o painel de leads.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
