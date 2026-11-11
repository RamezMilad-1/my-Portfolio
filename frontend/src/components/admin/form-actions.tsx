import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Cancel + submit row at the bottom of an editor form. */
export function FormActions({
  cancelHref,
  submitLabel,
  pending,
  disabled,
}: {
  cancelHref?: string;
  submitLabel: string;
  pending: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-3">
      {cancelHref ? (
        <Button asChild variant="outline">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      ) : null}
      <Button type="submit" disabled={pending || disabled}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </div>
  );
}
