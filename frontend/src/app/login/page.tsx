import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main id="main-content" className="aurora relative min-h-dvh overflow-hidden">
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>

        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Lock className="h-3 w-3" />
            Admin only
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            Welcome <span className="text-accent-gradient">back.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to manage projects, media, collaborators, and your profile.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is limited to the portfolio owner.
        </p>
      </div>
    </main>
  );
}
