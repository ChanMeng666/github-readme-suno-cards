export const runtime = 'edge';

/**
 * Landing page served as a plain HTML Response from an Edge route handler.
 *
 * Written as a route handler (not a React component / app/page.tsx) to
 * sidestep a known Next.js 15 + pnpm workspace + transpilePackages bug in
 * the React Server Components bundler that fails to resolve Next's internal
 * `layout-router.js` / `client-page.js` when our parser/render packages are
 * transpiled on the fly. API routes work fine because they never enter RSC.
 * The landing page is purely static showcase content so RSC gives us nothing
 * anyway.
 */

const DEMO_HANDLE = 'chanmeng';
const DEMO_UUID = 'a885e43c-6918-456f-a5f0-0e8e29e61066';
const ORIGIN_HINT = 'https://sunocards.vercel.app';

export async function GET(): Promise<Response> {
  return new Response(renderHomePage(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}

function renderHomePage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>github-readme-suno-cards</title>
  <meta name="description" content="Display your Suno AI-generated music as dynamic cards in your GitHub README." />
  <style>${GLOBAL_CSS}</style>
</head>
<body>
  <main class="page">
    <header>
      <h1>github-readme-suno-cards</h1>
      <p class="tagline">Display your Suno AI-generated music as dynamic cards in your GitHub README.</p>
    </header>

    <section>
      <h2>Live preview — single song</h2>
      <img class="card" src="/api/card?id=${DEMO_UUID}" alt="Demo Suno song card" width="480" />
    </section>

    <section>
      <h2>Live preview — profile summary</h2>
      <img class="card" src="/api/profile?handle=${DEMO_HANDLE}" alt="Demo Suno profile card" width="480" />
    </section>

    <section>
      <h2>Live preview — auto-discovered top 5 by play count</h2>
      <img class="card" src="/api/cards?handle=${DEMO_HANDLE}&amp;sort=play_count&amp;max=5" alt="Demo Suno card stack" width="480" />
    </section>

    <section>
      <h2>Embed in your README</h2>
      <p class="dim">Single song card:</p>
      <pre><code>[![](${ORIGIN_HINT}/api/card?id=${DEMO_UUID})](https://suno.com/song/${DEMO_UUID})</code></pre>
      <p class="dim">All your public songs (handle-based auto-discovery):</p>
      <pre><code>![](${ORIGIN_HINT}/api/cards?handle=YOUR_HANDLE&amp;sort=play_count&amp;max=6)</code></pre>
      <p class="dim">Profile summary:</p>
      <pre><code>![](${ORIGIN_HINT}/api/profile?handle=YOUR_HANDLE)</code></pre>
    </section>

    <section>
      <h2>Query parameters</h2>
      <ul>
        <li><code>theme</code> — <code>auto</code> (default), <code>dark</code>, or <code>light</code></li>
        <li><code>lang</code> — <code>en</code>, <code>zh</code>, or <code>ja</code></li>
        <li><code>sort</code> — <code>created_at</code>, <code>play_count</code>, <code>upvote_count</code>, <code>name</code></li>
        <li><code>max</code> — how many song cards to render (1–20)</li>
        <li><code>include_tags</code> / <code>exclude_tags</code> — comma-separated tag filters</li>
        <li><code>featured</code> — comma-separated UUIDs pinned to the top</li>
        <li><code>bg_color</code>, <code>text_color</code>, <code>accent_color</code> — color overrides (hex)</li>
      </ul>
    </section>

    <footer>Built with Next.js 15 on Vercel Edge Runtime · MIT License</footer>
  </main>
</body>
</html>`;
}

const GLOBAL_CSS = `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
    background: #0a0a0f;
    color: #f5f5f7;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  .page { max-width: 820px; margin: 0 auto; padding: 60px 24px 80px; line-height: 1.6; }
  h1 {
    font-size: 38px;
    margin: 0 0 8px;
    background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .tagline { color: #a1a1aa; margin: 0; font-size: 16px; }
  section { margin-top: 40px; }
  h2 { font-size: 20px; margin: 0 0 16px; }
  .card { display: block; border-radius: 14px; max-width: 100%; height: auto; }
  .dim { color: #a1a1aa; margin: 12px 0 8px; }
  pre {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 14px 16px;
    overflow-x: auto;
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    margin: 0;
  }
  pre code { color: inherit; background: transparent; padding: 0; }
  code {
    background: rgba(139, 92, 246, 0.14);
    color: #c4b5fd;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
  }
  ul { color: #d4d4d8; padding-left: 20px; }
  a { color: #a78bfa; }
  footer {
    margin-top: 60px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: #71717a;
    font-size: 13px;
  }
`;
