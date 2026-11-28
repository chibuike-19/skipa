// Stylelint for frontend CSS (brief §8.2): colours only through tokens. tokens.css (the one place
// colours are defined) and the gallery's test logos are excluded.
export default {
  ignoreFiles: ['**/node_modules/**', '**/dist/**', 'packages/tokens/src/tokens.css', 'docs/**'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'oklab', 'lab', 'lch'],
  },
};
