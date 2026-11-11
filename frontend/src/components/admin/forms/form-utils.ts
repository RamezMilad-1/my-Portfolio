import type { RegisterOptions } from 'react-hook-form';
import { isEmail, isHttpUrl } from '@/lib/admin/format';

/**
 * Form values from a loaded document: only the keys of `defaults` are copied, so ids and
 * timestamps never end up in the submitted payload (the API rejects unknown fields).
 */
export function formValues<T extends object>(defaults: T, source?: object): T {
  const values = { ...defaults };
  if (!source) return values;
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = (source as Partial<T>)[key];
    if (value !== undefined && value !== null) values[key] = value;
  }
  return values;
}

/** Whole-number position; an empty box means 0. */
export const positionRules = {
  setValueAs: (value: unknown) => (value === '' || value === undefined ? 0 : Number(value)),
  validate: (value: unknown) =>
    (Number.isInteger(value) && (value as number) >= 0) || 'Enter a whole number, 0 or more',
} satisfies RegisterOptions;

export const urlRules = {
  setValueAs: (value: unknown) => (typeof value === 'string' ? value.trim() : value),
  validate: (value: unknown) =>
    isHttpUrl(String(value ?? '')) || 'Enter a full link starting with https://',
} satisfies RegisterOptions;

export const emailRules = {
  setValueAs: (value: unknown) => (typeof value === 'string' ? value.trim() : value),
  validate: (value: unknown) => isEmail(String(value ?? '')) || 'Enter a valid email address',
} satisfies RegisterOptions;

export const required = (label: string) => ({
  validate: (value: unknown) => String(value ?? '').trim() !== '' || `${label} is required`,
});
