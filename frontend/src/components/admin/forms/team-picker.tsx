'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { useTeam } from '@/lib/admin/queries';

/** Picks collaborators from the team roster. */
export function TeamPicker({
  value,
  onChange,
  id,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  id?: string;
}) {
  const { data: roster = [] } = useTeam();
  const byId = new Map(roster.map((member) => [member._id, member]));
  const available = roster.filter((member) => !value.includes(member._id));

  return (
    <div className="space-y-2">
      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((memberId) => (
            <li
              key={memberId}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span className="text-sm font-medium">{byId.get(memberId)?.name ?? 'Loading…'}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onChange(value.filter((entry) => entry !== memberId))}
                aria-label={`Remove ${byId.get(memberId)?.name ?? 'collaborator'}`}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {roster.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No collaborators yet —{' '}
          <Link href="/admin/team" className="underline underline-offset-2">
            add them to the team roster
          </Link>{' '}
          first.
        </p>
      ) : (
        <Select
          id={id}
          value=""
          onChange={(event) => {
            if (event.target.value) onChange([...value, event.target.value]);
          }}
          disabled={available.length === 0}
        >
          <option value="">
            {available.length > 0 ? 'Add a collaborator…' : 'Everyone on the roster is added'}
          </option>
          {available.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
