'use client';

import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, errorMessage } from '@/lib/api/client';
import type { ContactMessageInput } from '@/lib/types';

type Field = 'name' | 'email' | 'body';
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, body }: ContactMessageInput): Errors {
  const errors: Errors = {};
  if (!name) errors.name = 'Name is required';
  else if (name.length > 120) errors.name = 'Keep the name under 120 characters';
  if (!EMAIL.test(email)) errors.email = 'Enter a valid email';
  if (!body) errors.body = 'Message is required';
  else if (body.length > 4000) errors.body = 'Keep the message under 4000 characters';
  return errors;
}

const fieldClasses = 'glass-card border-white/10 bg-white/[0.03]';

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [failure, setFailure] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const message: ContactMessageInput = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      body: String(data.get('body') ?? '').trim(),
      fax: String(data.get('fax') ?? ''),
    };
    const found = validate(message);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    try {
      await api('/messages', { method: 'POST', body: message });
      form.reset();
      setStatus('sent');
    } catch (error) {
      setFailure(errorMessage(error, 'Could not send the message — please try again.'));
      setStatus('failed');
    }
  };

  const describedBy = (field: Field) => (errors[field] ? `contact-${field}-error` : undefined);
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`contact-${field}-error`} className="text-xs text-red-400">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="glass-card card-sheen ring-conic relative space-y-4 overflow-hidden rounded-2xl p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-violet/10 blur-2xl"
      />
      <h3 className="relative font-display text-lg font-semibold tracking-tight text-[hsl(220_30%_96%)]">
        Message me
      </h3>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            maxLength={120}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name')}
            className={fieldClasses}
          />
          {errorText('name')}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
            className={fieldClasses}
          />
          {errorText('email')}
        </div>
      </div>

      <div className="relative space-y-1.5">
        <Label htmlFor="contact-body">Message</Label>
        <Textarea
          id="contact-body"
          name="body"
          rows={6}
          maxLength={4000}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={describedBy('body')}
          className={`${fieldClasses} min-h-[150px] resize-none`}
        />
        {errorText('body')}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-fax">Fax</label>
        <input id="contact-fax" name="fax" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="relative flex flex-wrap items-center justify-end gap-3">
        <p role="status" className="mr-auto text-xs">
          {status === 'sent' ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Message sent — thank you!
            </span>
          ) : status === 'failed' ? (
            <span className="text-red-400">{failure}</span>
          ) : null}
        </p>
        <GradientButton type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send
        </GradientButton>
      </div>
    </form>
  );
}
