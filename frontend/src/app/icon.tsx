import { ImageResponse } from 'next/og';
import { getProfile } from '@/lib/api/content';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/** Favicon: the profile's logo initial on the brand gradient. */
export default async function Icon() {
  const profile = await getProfile();
  const letter = profile.logoInitial.trim() || profile.displayName.trim().charAt(0) || '·';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        background: 'linear-gradient(135deg, #7c78f5 0%, #b56cf6 100%)',
        color: 'white',
        fontSize: 38,
        fontWeight: 700,
      }}
    >
      {letter}
    </div>,
    size,
  );
}
