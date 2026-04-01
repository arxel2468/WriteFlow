import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to WriteFlow</h1>
          <p className="mt-2 text-muted-foreground">Sign in to start writing</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
