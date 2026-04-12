import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Point file tracing at the monorepo root so Vercel bundles the workspace
  // packages (@suno-cards/parser, @suno-cards/render) along with this app.
  outputFileTracingRoot: resolve(__dirname, '../..'),
  // Parser and render packages are plain .ts sources without a build step.
  // transpilePackages makes Next's SWC compile them on the fly.
  transpilePackages: ['@suno-cards/parser', '@suno-cards/render'],
  webpack: (config) => {
    // TypeScript ESM convention uses `.js` extensions in source imports to
    // match what the compiled output will look like (e.g. `import './foo.js'`
    // in a `.ts` file that actually resolves to `./foo.ts`).
    // Next's webpack doesn't enable this resolution by default; extensionAlias
    // teaches it to try `.ts`/`.tsx` first when it sees a `.js`/`.jsx` import
    // that has no on-disk match. Required for the workspace packages
    // `@suno-cards/parser` and `@suno-cards/render` which use that convention.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
