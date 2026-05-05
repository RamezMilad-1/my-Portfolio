'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Loader2, ScanLine, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useImportProposal, useRunScan } from '@/lib/api/scanner';
import type { ProposedProject } from '@/lib/types';

export default function AdminScanPage() {
  const scan = useRunScan();
  const importOne = useImportProposal();
  const [proposals, setProposals] = useState<ProposedProject[] | null>(null);

  const onScan = async () => {
    try {
      const res = await scan.mutateAsync();
      setProposals(res);
      toast.success(`Scanned — found ${res.length} folders`);
    } catch {
      toast.error('Scan failed');
    }
  };

  const onImport = async (folderName: string) => {
    try {
      await importOne.mutateAsync(folderName);
      toast.success(`Imported '${folderName}'`);
      const updated = (proposals ?? []).map((p) =>
        p.folderName === folderName ? { ...p, alreadyImported: true } : p,
      );
      setProposals(updated);
    } catch {
      toast.error('Could not import');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Scan project folders</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Walk <code>../projects/*</code> and propose new project entries based on README, package.json, and .git/config.
          </p>
        </div>
        <Button onClick={onScan} disabled={scan.isPending}>
          {scan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
          Run scan
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {(proposals ?? []).length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {proposals === null
              ? 'Click "Run scan" to detect project folders.'
              : 'No project folders found in projects/.'}
          </p>
        ) : (
          (proposals ?? []).map((p) => (
            <div
              key={p.folderName}
              className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:flex-row sm:items-start"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  {p.alreadyImported ? (
                    <Badge variant="secondary" className="text-[10px]">Already imported</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      <Sparkles className="mr-1 h-3 w-3" /> New
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{p.folderPath}</p>
                {p.readmeExcerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {p.readmeExcerpt}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                {p.githubUrl ? (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    <ExternalLink className="h-3 w-3" /> {p.githubUrl}
                  </a>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Button
                  onClick={() => onImport(p.folderName)}
                  disabled={p.alreadyImported || importOne.isPending}
                  variant={p.alreadyImported ? 'outline' : 'default'}
                  size="sm"
                >
                  {p.alreadyImported ? 'Imported' : 'Import'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
