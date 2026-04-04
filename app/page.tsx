import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold">WriteFlow</span>
        <Link
          href="/login"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          Think clearly. Write better.
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Transform scattered thoughts
          <br />
          into structured writing
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          WriteFlow guides you from raw ideas to polished prose.
          Dump your thoughts, organize them visually, and write with
          your structure always in view. AI helps you think — never writes for you.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Start Writing — Free
          </Link>
        </div>

        {/* Three steps */}
        <div className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="mb-2 text-2xl">💭</div>
            <h3 className="text-sm font-semibold">1. Dump</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Capture every thought as individual cards. No pressure to organize.
            </p>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="mb-2 text-2xl">🧩</div>
            <h3 className="text-sm font-semibold">2. Structure</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Drag thoughts into clusters. AI suggests groupings. Build your outline.
            </p>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm">
            <div className="mb-2 text-2xl">✍️</div>
            <h3 className="text-sm font-semibold">3. Write</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Write with your outline visible. AI checks logic, not words.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
        Built for writers who think in fragments.
      </footer>
    </main>
  );
}