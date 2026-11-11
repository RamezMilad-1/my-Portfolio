/**
 * Browser-side API client (admin dashboard, login, contact form). Requests carry the httpOnly
 * session cookie; in production `/api/v1` is same-origin and proxied to the backend.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/** Nest errors look like `{ message: string | string[] }`; anything else gets a generic message. */
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: unknown };
    if (Array.isArray(data.message)) return data.message.join(', ');
    if (typeof data.message === 'string') return data.message;
  } catch {
    // Not JSON — fall through.
  }
  return res.status === 429 ? 'Too many requests — please wait a moment.' : res.statusText;
}

export async function api<T = void>(path: string, { method = 'GET', body }: RequestOptions = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, await readErrorMessage(res));
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** A user-facing message for any thrown value. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError || error instanceof Error) return error.message || fallback;
  return fallback;
}
