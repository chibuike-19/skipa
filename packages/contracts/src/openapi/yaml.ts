// Minimal, deterministic YAML writer for JSON-like data (block style; strings double-quoted
// unless plainly safe). Avoids a YAML dependency; every output is also checked by parsing it
// back in CI (scripts/contract_diff.py).
const PLAIN_KEY = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const PLAIN_VALUE = /^[A-Za-z_/][A-Za-z0-9 _./#()-]*$/;
const RESERVED = new Set(['y', 'n', 'yes', 'no', 'on', 'off', 'true', 'false', 'null', '~']);

function scalar(value: unknown, isKey = false): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value !== 'string') throw new Error(`cannot write ${typeof value} as YAML scalar`);
  const plain = isKey ? PLAIN_KEY : PLAIN_VALUE;
  if (
    plain.test(value) &&
    !RESERVED.has(value.toLowerCase()) &&
    !value.endsWith(' ') &&
    !value.includes(' #') &&
    !value.includes(': ')
  ) {
    return value;
  }
  return JSON.stringify(value);
}

function isEmptyCollection(value: unknown) {
  return (
    (Array.isArray(value) && value.length === 0) ||
    (value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0)
  );
}

function write(value: unknown, indent: number, lines: string[]) {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item !== null && typeof item === 'object' && !isEmptyCollection(item)) {
        const inner: string[] = [];
        write(item, indent + 2, inner);
        lines.push(`${pad}- ${(inner[0] ?? '').trimStart()}`, ...inner.slice(1));
      } else {
        lines.push(
          `${pad}- ${isEmptyCollection(item) ? (Array.isArray(item) ? '[]' : '{}') : scalar(item)}`,
        );
      }
    }
    return;
  }
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    const k = scalar(key, true);
    if (isEmptyCollection(inner)) lines.push(`${pad}${k}: ${Array.isArray(inner) ? '[]' : '{}'}`);
    else if (inner !== null && typeof inner === 'object') {
      lines.push(`${pad}${k}:`);
      write(inner, Array.isArray(inner) ? indent : indent + 2, lines);
    } else lines.push(`${pad}${k}: ${scalar(inner)}`);
  }
}

export function toYaml(document: Record<string, unknown>, header = ''): string {
  const lines: string[] = header ? [header] : [];
  write(document, 0, lines);
  return `${lines.join('\n')}\n`;
}
