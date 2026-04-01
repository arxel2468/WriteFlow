import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold tracking-tight">WriteFlow</h1>
      <p className="text-lg text-muted-foreground">
        Transform scattered thoughts into structured, polished writing.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
      >
        Get Started
      </Link>
    </main>
  );
}
