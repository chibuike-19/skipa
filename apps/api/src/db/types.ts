import { customType } from 'drizzle-orm/pg-core';

/** Case-insensitive text (emails). */
export const citext = customType<{ data: string }>({ dataType: () => 'citext' });

/** Binary columns: hashes, HMACs and AES-256-GCM ciphertexts. */
export const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => 'bytea' });

/** Generated full-text search vectors (read-only in practice). */
export const tsvector = customType<{ data: string }>({ dataType: () => 'tsvector' });
