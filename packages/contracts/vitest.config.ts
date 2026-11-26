import { defineConfig } from 'vitest/config';

import { projectDefaults, rootDefaults } from '@skipa/config/vitest';

export default defineConfig({ test: { ...rootDefaults, ...projectDefaults } });
