'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/lib/api/auth';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
type Form = z.infer<typeof schema>;

export default function CreateUserPage() {
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setSubmitting(true);
    try {
      await registerUser.mutateAsync({
        email: values.email,
        password: values.password,
      });
      setCreated(true);
    } catch (err: unknown) {
      let msg = 'Could not create the account';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (
          err as { response?: { data?: { message?: string | string[] } } }
        ).response;
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
            <UserPlus className="h-3 w-3" />
            Account setup
          </span>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            Create <span className="gradient-text">account.</span>
          </h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
            New accounts start without dashboard access — the role is granted
            directly in the database.
          </p>
        </div>

        {created ? (
          <div className="ring-lift glass-strong space-y-3 rounded-2xl border border-[hsl(var(--border))] p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              Account created
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Promote it to admin in the database to enable dashboard access,
              then sign in.
            </p>
            <Button asChild variant="outline" className="mt-2 rounded-full">
              <Link href="/login">Go to sign in</Link>
            </Button>
          </div>
        ) : (
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
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password ? (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirm')}
              />
              {errors.confirm ? (
                <p className="text-xs text-red-500">
                  {errors.confirm.message}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
