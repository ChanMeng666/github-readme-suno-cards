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

// ---------------------------------------------------------------------------
// Card showcase data
// ---------------------------------------------------------------------------

type CardDemo = {
  title: string;
  description: string;
  params: string;
  width: number;
};

const CARD_DEMOS: CardDemo[] = [
  // Layout + Preset combinations
  {
    title: 'Classic + Default',
    description: 'Info-dense layout with purple accent — the original style.',
    params: `id=${DEMO_UUID}`,
    width: 480,
  },
  {
    title: 'Classic + Suno Preset',
    description: 'Info-dense layout with Suno official navy + gold palette.',
    params: `id=${DEMO_UUID}&preset=suno`,
    width: 480,
  },
  {
    title: 'Player + Default',
    description: 'Suno-style player with progress bar, using default purple theme.',
    params: `id=${DEMO_UUID}&layout=player`,
    width: 640,
  },
  {
    title: 'Player + Suno Preset',
    description: 'Full Suno official look — player layout with navy + gold palette.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno`,
    width: 640,
  },
  // Theme variants
  {
    title: 'Player + Suno (Dark)',
    description: 'Suno player pinned to dark theme.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&theme=dark`,
    width: 640,
  },
  {
    title: 'Classic + Default (Light)',
    description: 'Classic card pinned to light theme.',
    params: `id=${DEMO_UUID}&theme=light`,
    width: 480,
  },
  // Toggle showcases
  {
    title: 'Player — No Equalizer',
    description: 'Player layout with equalizer bars hidden.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&show_equalizer=false`,
    width: 640,
  },
  {
    title: 'Player — With Tags & Author',
    description: 'Player layout with tags and author info enabled.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&show_tags=true&show_author=true`,
    width: 640,
  },
  {
    title: 'Classic — Minimal',
    description: 'Classic layout stripped to title + cover only.',
    params: `id=${DEMO_UUID}&show_tags=false&show_plays=false&show_likes=false&show_model_badge=false&show_equalizer=false`,
    width: 480,
  },
  {
    title: 'Player — Custom Accent',
    description: 'Player layout with a custom red accent color override.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&accent_color=ff6b6b`,
    width: 640,
  },
];

// ---------------------------------------------------------------------------
// HTML renderer
// ---------------------------------------------------------------------------

function renderHomePage(): string {
  const cardSections = CARD_DEMOS.map(
    (demo) => `
    <div class="demo-card">
      <div class="demo-header">
        <h3>${demo.title}</h3>
        <p class="dim">${demo.description}</p>
      </div>
      <img class="card" src="/api/card?${demo.params}" alt="${demo.title}" width="${demo.width}" loading="lazy" />
      <div class="code-block">
        <button class="copy-btn" onclick="copyCode(this)" title="Copy to clipboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <pre><code>[![](${ORIGIN_HINT}/api/card?${escapeHtml(demo.params)})](https://suno.com/song/${DEMO_UUID})</code></pre>
      </div>
    </div>`,
  ).join('\n');

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

    <!-- ── Style Gallery ──────────────────────────────────── -->
    <section>
      <h2>Style Gallery</h2>
      <p class="dim">All layout + preset + toggle combinations. Click the copy button to grab the embed code.</p>
      <div class="gallery">
        ${cardSections}
      </div>
    </section>

    <!-- ── Profile & Stack ────────────────────────────────── -->
    <section>
      <h2>Profile summary card</h2>
      <img class="card" src="/api/profile?handle=${DEMO_HANDLE}" alt="Demo Suno profile card" width="480" loading="lazy" />
      <div class="code-block">
        <button class="copy-btn" onclick="copyCode(this)" title="Copy to clipboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <pre><code>![](${ORIGIN_HINT}/api/profile?handle=YOUR_HANDLE)</code></pre>
      </div>
    </section>

    <section>
      <h2>Auto-discovered card stack (top 3)</h2>
      <img class="card" src="/api/cards?handle=${DEMO_HANDLE}&amp;sort=play_count&amp;max=3" alt="Demo Suno card stack" width="480" loading="lazy" />
      <div class="code-block">
        <button class="copy-btn" onclick="copyCode(this)" title="Copy to clipboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <pre><code>![](${ORIGIN_HINT}/api/cards?handle=YOUR_HANDLE&amp;sort=play_count&amp;max=6)</code></pre>
      </div>
    </section>

    <!-- ── Query Parameters ───────────────────────────────── -->
    <section>
      <h2>Query parameters</h2>
      <table>
        <thead><tr><th>Parameter</th><th>Values</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>layout</code></td><td><code>classic</code> | <code>player</code></td><td>Card layout style (default: <code>classic</code>)</td></tr>
          <tr><td><code>preset</code></td><td><code>default</code> | <code>suno</code></td><td>Color palette (default: <code>default</code> purple)</td></tr>
          <tr><td><code>theme</code></td><td><code>auto</code> | <code>dark</code> | <code>light</code></td><td>Theme mode (default: <code>auto</code>)</td></tr>
          <tr><td><code>lang</code></td><td><code>en</code> | <code>zh</code> | <code>ja</code></td><td>Language</td></tr>
          <tr><td><code>show_progress</code></td><td><code>true</code> | <code>false</code></td><td>Progress bar + play button</td></tr>
          <tr><td><code>show_logo</code></td><td><code>true</code> | <code>false</code></td><td>SUNO logo (bottom-right)</td></tr>
          <tr><td><code>show_link_icon</code></td><td><code>true</code> | <code>false</code></td><td>Link icon (top-right)</td></tr>
          <tr><td><code>show_equalizer</code></td><td><code>true</code> | <code>false</code></td><td>Animated equalizer bars on cover</td></tr>
          <tr><td><code>show_tags</code></td><td><code>true</code> | <code>false</code></td><td>Genre/mood tag chips</td></tr>
          <tr><td><code>show_plays</code></td><td><code>true</code> | <code>false</code></td><td>Play count stat</td></tr>
          <tr><td><code>show_likes</code></td><td><code>true</code> | <code>false</code></td><td>Like count stat</td></tr>
          <tr><td><code>show_author</code></td><td><code>true</code> | <code>false</code></td><td>Author byline</td></tr>
          <tr><td><code>show_duration</code></td><td><code>true</code> | <code>false</code></td><td>Duration pill on cover</td></tr>
          <tr><td><code>show_model_badge</code></td><td><code>true</code> | <code>false</code></td><td>Suno model badge</td></tr>
          <tr><td><code>show_new_badge</code></td><td><code>true</code> | <code>false</code></td><td>NEW ribbon</td></tr>
          <tr><td><code>bg_color</code></td><td>hex</td><td>Card background color override</td></tr>
          <tr><td><code>text_color</code></td><td>hex</td><td>Text color override</td></tr>
          <tr><td><code>accent_color</code></td><td>hex</td><td>Accent color override</td></tr>
          <tr><td><code>width</code></td><td>200–1200</td><td>Card width in pixels</td></tr>
        </tbody>
      </table>
    </section>

    <footer>
      Built with Next.js 15 on Vercel Edge Runtime &middot; MIT License &middot;
      <a href="https://github.com/ChanMeng666/github-readme-suno-cards">GitHub</a>
    </footer>
  </main>
  <script>${COPY_SCRIPT}</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const COPY_SCRIPT = `
function copyCode(btn) {
  const code = btn.parentElement.querySelector('code');
  const text = code.textContent;
  navigator.clipboard.writeText(text).then(function() {
    btn.classList.add('copied');
    setTimeout(function() { btn.classList.remove('copied'); }, 1500);
  });
}`;

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
  .page { max-width: 860px; margin: 0 auto; padding: 60px 24px 80px; line-height: 1.6; }
  h1 {
    font-size: 38px;
    margin: 0 0 8px;
    background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .tagline { color: #a1a1aa; margin: 0; font-size: 16px; }
  section { margin-top: 48px; }
  h2 { font-size: 22px; margin: 0 0 12px; }
  h3 { font-size: 16px; margin: 0 0 4px; color: #e4e4e7; }
  .card { display: block; border-radius: 14px; max-width: 100%; height: auto; }
  .dim { color: #a1a1aa; margin: 4px 0 8px; font-size: 14px; }

  /* Gallery grid */
  .gallery { display: flex; flex-direction: column; gap: 32px; }
  .demo-card {
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 20px;
  }
  .demo-header { margin-bottom: 14px; }

  /* Code block with copy button */
  .code-block {
    position: relative;
    margin-top: 12px;
  }
  .copy-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px;
    color: #a1a1aa;
    padding: 5px 7px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.15s;
    z-index: 1;
  }
  .copy-btn:hover { background: rgba(255,255,255,0.14); color: #f5f5f7; }
  .copy-btn.copied { background: rgba(139,92,246,0.3); color: #c4b5fd; }

  pre {
    background: #0a0a0f;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 14px 16px;
    padding-right: 48px;
    overflow-x: auto;
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    margin: 0;
    line-height: 1.5;
  }
  pre code { color: #a1a1aa; background: transparent; padding: 0; }
  code {
    background: rgba(139, 92, 246, 0.14);
    color: #c4b5fd;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-top: 12px;
  }
  thead th {
    text-align: left;
    color: #a1a1aa;
    font-weight: 600;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  tbody td {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #d4d4d8;
  }
  tbody td code {
    font-size: 12px;
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
