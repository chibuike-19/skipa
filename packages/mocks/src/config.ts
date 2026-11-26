// Which API areas are mocked (brief §5). Locally VITE_USE_MOCKS=true mocks everything; as each
// backend milestone lands on staging, add its OpenAPI tags to LIVE_TAGS (one-line PR) so those
// requests go to VITE_API_URL while the rest stay mocked. VITE_MOCK_LIVE_TAGS (comma list) does the
// same for one run without a commit.
import { TAGS, type Tag } from './generated/operations.ts';

/** Tags served by the real API even when mocks are on. */
export const LIVE_TAGS: readonly Tag[] = [];

export interface MockEnv {
  VITE_USE_MOCKS?: string;
  VITE_MOCK_LIVE_TAGS?: string;
}

export interface MockConfig {
  enabled: boolean;
  liveTags: ReadonlySet<Tag>;
}

const isTag = (value: string): value is Tag => (TAGS as readonly string[]).includes(value);

export function readMockConfig(env: MockEnv): MockConfig {
  const extra = (env.VITE_MOCK_LIVE_TAGS ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t !== '');
  const unknown = extra.filter((t) => !isTag(t));
  if (unknown.length > 0) {
    throw new Error(
      `VITE_MOCK_LIVE_TAGS has unknown tags: ${unknown.join(', ')}. Known: ${TAGS.join(', ')}`,
    );
  }
  return {
    enabled: env.VITE_USE_MOCKS === 'true',
    liveTags: new Set<Tag>([...LIVE_TAGS, ...extra.filter(isTag)]),
  };
}
