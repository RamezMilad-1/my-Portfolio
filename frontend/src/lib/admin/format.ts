/** "2.4 MB", "830 KB" */
export function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Medium date and short time in the viewer's locale. */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  );
}

/** Lenient client-side check; the API does the real validation. */
export const isHttpUrl = (value: string) => value === '' || /^https?:\/\/\S+$/i.test(value);

export const isEmail = (value: string) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
