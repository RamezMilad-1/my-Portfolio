'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, errorMessage } from '@/lib/api/client';
import { safeRedirectPath } from '@/lib/site';

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      await api('/auth/login', {
        method: 'POST',
        body: {
          email: String(data.get('email') ?? ''),
          password: String(data.get('password') ?? ''),
        },
      });
      // Read at submit time so the page itself stays static.
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(safeRedirectPath(next));
    } catch (failure) {
      setError(errorMessage(failure, 'Could not sign you in'));
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="ring-lift glass-strong space-y-5 rounded-2xl border border-border p-6"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full rounded-full" size="lg" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}
