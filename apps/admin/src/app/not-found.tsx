import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background,#F7F5F0)] px-4 text-center text-[var(--color-text-primary,#14201C)]">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary,#5A6B65)]">
        404
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--color-text-secondary,#5A6B65)]">
        That admin or legal URL does not exist. Return home or open a published legal page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link
          href="/"
          className="rounded bg-[var(--color-primary,#1F4B3F)] px-4 py-2 text-white"
        >
          Dashboard / Home
        </Link>
        <Link href="/legal/privacy" className="rounded border border-[var(--color-border,#D9D3C7)] px-4 py-2">
          Privacy
        </Link>
        <Link href="/login" className="rounded border border-[var(--color-border,#D9D3C7)] px-4 py-2">
          Sign in
        </Link>
      </div>
    </div>
  );
}
