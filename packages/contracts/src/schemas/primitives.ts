// Shared building blocks for contract schemas.
import { z } from 'zod';

/** Money in the API: integer kobo in fields ending `Kobo` (AD §6.2, PY-05). */
export const kobo = z
  .int()
  .min(0)
  .meta({ format: 'int64', description: 'Amount in kobo (₦1 = 100 kobo).' });
