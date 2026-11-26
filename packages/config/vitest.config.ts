import { defineConfig } from 'vitest/config';

import { projectDefaults, rootDefaults } from './vitest.ts';

export default defineConfig({ test: { ...rootDefaults, ...projectDefaults } });
