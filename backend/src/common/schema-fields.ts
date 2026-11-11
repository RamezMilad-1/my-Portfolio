import type { Schema } from 'mongoose';

/**
 * A projection of exactly the paths a schema defines. Documents written by older versions of the
 * app can still hold fields that were removed since; selecting this keeps them out of responses.
 */
export const schemaFields = (schema: Schema): string => Object.keys(schema.paths).join(' ');
