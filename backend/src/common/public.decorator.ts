import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Every route requires an admin session unless it is marked `@Public()`, so a newly added
 * endpoint is protected by default instead of exposed by default.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
