// Vite plugin: preload the Inter subset (brief §8.5: self-hosted, preload Inter only). The font is
// imported through @skipa/tokens/fonts.css, so its file name is hashed at build time; this adds
// <link rel="preload"> for that exact file, so the preload and the @font-face use one download.
import type { Plugin } from 'vite';

import { FONT_FILES } from './src/pipeline.ts';

export function preloadInter(): Plugin {
  const stem = FONT_FILES.inter.replace(/\.woff2$/, '');
  return {
    name: 'skipa-preload-inter',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => f.includes(stem) && f.endsWith('.woff2'));
        if (file === undefined) return [];
        return [{ tag: 'link', attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head-prepend' }];
      },
    },
  };
}
