import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Bundle the GitHub Action entry point into a single Node 20 file that can
 * be committed to `dist/index.js` and referenced by `action.yml`.
 *
 * Inlines @suno-cards/parser and @suno-cards/render so the Action runs
 * standalone without needing `pnpm install` at Action-runtime.
 */
await esbuild.build({
  entryPoints: [resolve(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: resolve(__dirname, 'dist/index.js'),
  sourcemap: false,
  minify: false,
  treeShaking: true,
  banner: {
    // ESM file needs createRequire for any CommonJS deps (e.g. @actions/core)
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  // @suno-cards/* are resolved via the pnpm workspace symlinks and their
  // internal .js imports map to .ts source. esbuild handles this with the
  // `resolveExtensions` option + the built-in TS loader.
  resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  loader: { '.ts': 'ts', '.json': 'json' },
  logLevel: 'info',
});

console.log('✓ built action/dist/index.js');
