import { defineConfig } from 'vitest/config';

import { testDefaults } from './vitest.js';

export default defineConfig({ test: { ...testDefaults } });
