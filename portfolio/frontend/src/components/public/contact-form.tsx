'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { GradientButton } from './gradient-button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSendMessage } from '@/lib/api/messages';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email'),
  body: z.string().trim().min(1, 'Message is required').max(4000),
});
type Form = z.infer<typeof schema>;

export function ContactForm() {
  const sendMessage = useSendMessage();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      body: '',
    },
  });

  const onSubmit = async (values: Form) => {
    try {
      await sendMessage.mutateAsync(values);
      toast.success('Message sent');
      reset();
    } catch {
      toast.error('Could not send message');
    }
  };

  const pending = isSubmitting || sendMessage.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="ek-glass ek-card-sheen ek-ring-conic relative space-y-4 overflow-hidden rounded-2xl p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[hsl(var(--brand-violet)/0.10)] blur-2xl"
      />
      <div className="relative">
        <h3 className="font-display text-lg font-semibold tracking-tight text-[hsl(220_30%_96%)]">
          Message me
        </h3>
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            className="ek-glass border-white/10 bg-white/[0.03]"
            {...register('name')}
          />
          {errors.name ? (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            className="ek-glass border-white/10 bg-white/[0.03]"
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="relative space-y-1.5">
        <Label htmlFor="contact-body">Message</Label>
        <Textarea
          id="contact-body"
          rows={6}
          className="ek-glass min-h-[150px] resize-none border-white/10 bg-white/[0.03]"
          {...register('body')}
        />
        {errors.body ? (
          <p className="text-xs text-red-400">{errors.body.message}</p>
        ) : null}
      </div>

      <div className="relative flex justify-end">
        <GradientButton type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </GradientButton>
      </div>
    </form>
  );
}
