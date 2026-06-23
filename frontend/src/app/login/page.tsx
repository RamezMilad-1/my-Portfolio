'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/lib/api/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type Form = z.infer<typeof schema>;

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get('next') || '/admin';
  const [submitting, setSubmitting] = useState(false);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setSubmitting(true);
    try {
      await login.mutateAsync(values);
      toast.success('Signed in');
      router.push(next);
    } catch (err: unknown) {
      let msg = 'Could not sign you in';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string | string[] } } }).response;
        const m = res?.data?.message;
        if (Array.isArray(m)) msg = m.join(', ');
        else if (typeof m === 'string') msg = m;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="aurora relative min-h-dvh overflow-hidden">
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>

        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))]/60 px-3 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))] backdrop-blur">
            <Lock className="h-3 w-3" />
            Admin only
          </span>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            Welcome <span className="gradient-text">back.</span>
          </h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
            Sign in to manage projects, media, collaborators, and your profile.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="ring-lift glass-strong space-y-5 rounded-2xl border border-[hsl(var(--border))] p-6"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full rounded-full" size="lg" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          One admin per portfolio. Bootstrap with{' '}
          <code className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[11px]">
            npm run create-admin
          </code>
          .
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
