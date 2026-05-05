'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Admin sign-in</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Manage projects, media, team, and profile content.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
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
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </Button>
      </form>
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
