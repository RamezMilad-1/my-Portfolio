import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { backendApiUrl, CONTENT_TAG } from '@/lib/api/content';

/**
 * Called by the admin dashboard after every save: drops the cached public pages so the next
 * visitor sees the change. Only a signed-in admin may trigger it — the session cookie is
 * checked by the backend itself.
 */
export async function POST(request: NextRequest) {
  const session = await fetch(backendApiUrl('/auth/me'), {
    headers: { cookie: request.headers.get('cookie') ?? '' },
    cache: 'no-store',
  }).catch(() => null);

  if (!session?.ok) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag(CONTENT_TAG, { expire: 0 });
  return new NextResponse(null, { status: 204 });
}
