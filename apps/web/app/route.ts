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

// All gallery demos pin theme=dark since the landing page has a dark background.
// The Light variant is the only exception to showcase the light mode.
const CARD_DEMOS: CardDemo[] = [
  {
    title: 'Classic + Default (Dark)',
    description: 'Info-dense layout with purple accent — the original style.',
    params: `id=${DEMO_UUID}&theme=dark`,
    width: 480,
  },
  {
    title: 'Classic + Suno Preset (Dark)',
    description: 'Info-dense layout with Suno official navy + gold palette.',
    params: `id=${DEMO_UUID}&preset=suno&theme=dark`,
    width: 480,
  },
  {
    title: 'Player + Default (Dark)',
    description: 'Suno-style player with progress bar, using default purple theme.',
    params: `id=${DEMO_UUID}&layout=player&theme=dark`,
    width: 640,
  },
  {
    title: 'Player + Suno Preset (Dark)',
    description: 'Full Suno official look — player layout with navy + gold palette.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&theme=dark`,
    width: 640,
  },
  {
    title: 'Classic + Default (Light)',
    description: 'Classic card in light theme — for light-background READMEs.',
    params: `id=${DEMO_UUID}&theme=light`,
    width: 480,
  },
  {
    title: 'Classic + Suno Preset (Light)',
    description: 'Suno navy + gold in light mode.',
    params: `id=${DEMO_UUID}&preset=suno&theme=light`,
    width: 480,
  },
  {
    title: 'Player — No Equalizer',
    description: 'Player layout with equalizer bars hidden.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&theme=dark&show_equalizer=false`,
    width: 640,
  },
  {
    title: 'Player — With Tags & Author',
    description: 'Player layout with tags and author info enabled.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&theme=dark&show_tags=true&show_author=true`,
    width: 640,
  },
  {
    title: 'Classic — Minimal',
    description: 'Classic layout stripped to title + cover only.',
    params: `id=${DEMO_UUID}&theme=dark&show_tags=false&show_plays=false&show_likes=false&show_model_badge=false&show_equalizer=false`,
    width: 480,
  },
  {
    title: 'Player — Custom Accent',
    description: 'Player layout with a custom red accent color override.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&theme=dark&accent_color=ff6b6b`,
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

    <!-- ── Card Configurator ──────────────────────────────── -->
    <section id="configurator">
      <h2>Card Configurator</h2>
      <p class="dim">Customize your card, preview it live, then copy the embed code.</p>

      <div class="cfg-layout">
        <div class="cfg-panel">
          <!-- Song ID -->
          <label class="cfg-label">Song ID or URL
            <input id="cfg-id" type="text" class="cfg-input" value="${DEMO_UUID}" placeholder="Song UUID, short code, or full URL" />
          </label>

          <!-- Layout & Preset -->
          <div class="cfg-row">
            <label class="cfg-label">Layout
              <select id="cfg-layout" class="cfg-select">
                <option value="classic">Classic</option>
                <option value="player">Player</option>
              </select>
            </label>
            <label class="cfg-label">Preset
              <select id="cfg-preset" class="cfg-select">
                <option value="default">Default (purple)</option>
                <option value="suno">Suno (navy + gold)</option>
              </select>
            </label>
            <label class="cfg-label">Theme
              <select id="cfg-theme" class="cfg-select">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </label>
          </div>

          <!-- Color overrides -->
          <div class="cfg-row">
            <label class="cfg-label">Background
              <div class="cfg-color-wrap">
                <input id="cfg-bg" type="color" class="cfg-color" value="#12121a" />
                <input id="cfg-bg-hex" type="text" class="cfg-hex" placeholder="auto" maxlength="7" />
              </div>
            </label>
            <label class="cfg-label">Text
              <div class="cfg-color-wrap">
                <input id="cfg-text" type="color" class="cfg-color" value="#f5f5f7" />
                <input id="cfg-text-hex" type="text" class="cfg-hex" placeholder="auto" maxlength="7" />
              </div>
            </label>
            <label class="cfg-label">Accent
              <div class="cfg-color-wrap">
                <input id="cfg-accent" type="color" class="cfg-color" value="#a78bfa" />
                <input id="cfg-accent-hex" type="text" class="cfg-hex" placeholder="auto" maxlength="7" />
              </div>
            </label>
          </div>

          <!-- Toggles -->
          <p class="cfg-section-title">Element toggles</p>
          <div class="cfg-toggles">
            <label class="cfg-toggle"><input type="checkbox" id="cfg-equalizer" checked /> Equalizer</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-tags" /> Tags</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-plays" /> Plays</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-likes" /> Likes</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-author" /> Author</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-duration" /> Duration</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-model-badge" /> Model badge</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-new-badge" /> NEW badge</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-progress" /> Progress bar</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-logo" /> SUNO logo</label>
            <label class="cfg-toggle"><input type="checkbox" id="cfg-link-icon" /> Link icon</label>
          </div>

          <p class="cfg-hint">Preview updates automatically as you change settings.</p>
        </div>

        <!-- Live preview -->
        <div class="cfg-preview">
          <div class="cfg-preview-frame">
            <img id="cfg-preview-img" src="/api/card?id=${DEMO_UUID}&theme=dark" alt="Card preview" />
          </div>

          <!-- Generated code -->
          <p class="cfg-section-title" style="margin-top:16px">Embed code</p>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode(this)" title="Copy to clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <pre><code id="cfg-code">[![](${ORIGIN_HINT}/api/card?id=${DEMO_UUID})](https://suno.com/song/${DEMO_UUID})</code></pre>
          </div>
          <p class="dim" style="margin-top:8px">URL only:</p>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode(this)" title="Copy to clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <pre><code id="cfg-url">${ORIGIN_HINT}/api/card?id=${DEMO_UUID}</code></pre>
          </div>
        </div>
      </div>
    </section>

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
  <script>${CONFIGURATOR_SCRIPT}</script>
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

// ---------------------------------------------------------------------------
// Client-side configurator logic
// ---------------------------------------------------------------------------

const CONFIGURATOR_SCRIPT = `
var ORIGIN = '${ORIGIN_HINT}';

// Layout-aware default states for toggles
var CLASSIC_DEFAULTS = {
  equalizer:true, tags:true, plays:true, likes:true, author:true,
  duration:true, 'model-badge':true, 'new-badge':true,
  progress:false, logo:false, 'link-icon':false
};
var PLAYER_DEFAULTS = {
  equalizer:true, tags:false, plays:false, likes:false, author:false,
  duration:false, 'model-badge':false, 'new-badge':false,
  progress:true, logo:true, 'link-icon':true
};

// Debounce helper — waits for user to stop typing before firing
var _debounceTimer;
function debounce(fn, ms) {
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(fn, ms || 400);
}

// Sync color picker ↔ hex text input, and auto-update preview
document.querySelectorAll('.cfg-color').forEach(function(picker) {
  var hex = picker.parentElement.querySelector('.cfg-hex');
  picker.addEventListener('input', function() {
    hex.value = picker.value;
    updatePreview();
  });
  hex.addEventListener('input', function() {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
    debounce(updatePreview, 500);
  });
});

// When layout changes, apply default toggle states then update
document.getElementById('cfg-layout').addEventListener('change', function() {
  var defs = this.value === 'player' ? PLAYER_DEFAULTS : CLASSIC_DEFAULTS;
  Object.keys(defs).forEach(function(k) {
    var cb = document.getElementById('cfg-' + k);
    if (cb) cb.checked = defs[k];
  });
  updatePreview();
});

// Auto-update on any select change
['cfg-preset', 'cfg-theme'].forEach(function(id) {
  document.getElementById(id).addEventListener('change', function() { updatePreview(); });
});

// Auto-update on any toggle change
document.querySelectorAll('.cfg-toggles input[type="checkbox"]').forEach(function(cb) {
  cb.addEventListener('change', function() { updatePreview(); });
});

// Auto-update when song ID changes (debounced)
document.getElementById('cfg-id').addEventListener('input', function() {
  debounce(updatePreview, 600);
});

function copyCode(btn) {
  var code = btn.parentElement.querySelector('code');
  navigator.clipboard.writeText(code.textContent).then(function() {
    btn.classList.add('copied');
    setTimeout(function() { btn.classList.remove('copied'); }, 1500);
  });
}

function updatePreview() {
  var id = document.getElementById('cfg-id').value.trim();
  if (!id) return;

  var layout = document.getElementById('cfg-layout').value;
  var preset = document.getElementById('cfg-preset').value;
  var theme = document.getElementById('cfg-theme').value;
  var defs = layout === 'player' ? PLAYER_DEFAULTS : CLASSIC_DEFAULTS;

  var params = ['id=' + encodeURIComponent(id)];

  if (layout !== 'classic') params.push('layout=' + layout);
  if (preset !== 'default') params.push('preset=' + preset);
  if (theme !== 'auto') params.push('theme=' + theme);

  // Color overrides (only if user typed a value)
  var bgHex = document.getElementById('cfg-bg-hex').value.trim();
  var textHex = document.getElementById('cfg-text-hex').value.trim();
  var accentHex = document.getElementById('cfg-accent-hex').value.trim();
  if (bgHex) params.push('bg_color=' + encodeURIComponent(bgHex.replace('#','')));
  if (textHex) params.push('text_color=' + encodeURIComponent(textHex.replace('#','')));
  if (accentHex) params.push('accent_color=' + encodeURIComponent(accentHex.replace('#','')));

  // Toggles — only emit if different from layout default
  var toggleMap = {
    'equalizer':'show_equalizer', 'tags':'show_tags', 'plays':'show_plays',
    'likes':'show_likes', 'author':'show_author', 'duration':'show_duration',
    'model-badge':'show_model_badge', 'new-badge':'show_new_badge',
    'progress':'show_progress', 'logo':'show_logo', 'link-icon':'show_link_icon'
  };
  Object.keys(toggleMap).forEach(function(k) {
    var cb = document.getElementById('cfg-' + k);
    if (cb && cb.checked !== defs[k]) {
      params.push(toggleMap[k] + '=' + cb.checked);
    }
  });

  var qs = params.join('&');
  // Cache-bust so browser always fetches fresh SVG
  var localUrl = '/api/card?' + qs + '&_t=' + Date.now();
  var fullUrl = ORIGIN + '/api/card?' + qs;

  // Extract a clean song id for the suno link (strip full URLs)
  var songId = id;
  var m = id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (m) songId = m[0];

  document.getElementById('cfg-preview-img').src = localUrl;
  document.getElementById('cfg-url').textContent = fullUrl;
  document.getElementById('cfg-code').textContent =
    '[![](' + fullUrl + ')](https://suno.com/song/' + songId + ')';
}
`;

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

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
  .page { max-width: 900px; margin: 0 auto; padding: 60px 24px 80px; line-height: 1.6; }
  h1 {
    font-size: 38px;
    margin: 0 0 8px;
    background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .tagline { color: #b4b4bd; margin: 0; font-size: 16px; }
  section { margin-top: 48px; }
  h2 { font-size: 22px; margin: 0 0 12px; }
  h3 { font-size: 16px; margin: 0 0 4px; color: #e4e4e7; }
  .card { display: block; border-radius: 14px; max-width: 100%; height: auto; }
  .dim { color: #b4b4bd; margin: 4px 0 8px; font-size: 14px; }

  /* Gallery */
  .gallery { display: flex; flex-direction: column; gap: 32px; }
  .demo-card {
    background: #12121a;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px;
  }
  .demo-header { margin-bottom: 14px; }

  /* Code blocks */
  .code-block { position: relative; margin-top: 12px; }
  .copy-btn {
    position: absolute; top: 10px; right: 10px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px; color: #b4b4bd;
    padding: 5px 7px; cursor: pointer;
    display: flex; align-items: center;
    transition: all 0.15s; z-index: 1;
  }
  .copy-btn:hover { background: rgba(255,255,255,0.14); color: #f5f5f7; }
  .copy-btn.copied { background: rgba(167,139,250,0.3); color: #ddd0fe; }
  pre {
    background: #0a0a0f;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 14px 16px; padding-right: 48px;
    overflow-x: auto;
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 12px; margin: 0; line-height: 1.5;
  }
  pre code { color: #b4b4bd; background: transparent; padding: 0; word-break: break-all; white-space: pre-wrap; }
  code {
    background: rgba(167,139,250,0.14); color: #ddd0fe;
    padding: 2px 6px; border-radius: 4px;
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
  }

  /* Table */
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
  thead th {
    text-align: left; color: #b4b4bd; font-weight: 600;
    padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  tbody td {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #d4d4d8;
  }
  tbody td code { font-size: 12px; }
  a { color: #a78bfa; }
  footer {
    margin-top: 60px; padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,0.08);
    color: #71717a; font-size: 13px;
  }

  /* ── Configurator ─────────────────────────────────── */
  .cfg-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 16px;
  }
  @media (max-width: 760px) {
    .cfg-layout { grid-template-columns: 1fr; }
  }
  .cfg-panel {
    background: #12121a;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px;
  }
  .cfg-label {
    display: flex; flex-direction: column; gap: 4px;
    font-size: 12px; font-weight: 600; color: #b4b4bd;
  }
  .cfg-row {
    display: flex; gap: 12px; margin-top: 12px;
  }
  .cfg-row .cfg-label { flex: 1; }
  .cfg-input, .cfg-select {
    background: #0a0a0f;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #f5f5f7; font-size: 13px;
    padding: 8px 10px;
    outline: none;
    width: 100%;
  }
  .cfg-select { cursor: pointer; }
  .cfg-input:focus, .cfg-select:focus {
    border-color: rgba(167,139,250,0.5);
  }
  .cfg-color-wrap {
    display: flex; gap: 6px; align-items: center;
  }
  .cfg-color {
    width: 32px; height: 32px; border: none; border-radius: 6px;
    cursor: pointer; background: none; padding: 0;
  }
  .cfg-hex {
    background: #0a0a0f;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #f5f5f7; font-size: 12px;
    padding: 6px 8px; width: 80px;
    font-family: "SF Mono", Menlo, monospace;
  }
  .cfg-hex:focus { border-color: rgba(167,139,250,0.5); outline: none; }

  .cfg-section-title {
    font-size: 12px; font-weight: 700; color: #b4b4bd;
    margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .cfg-toggles {
    display: flex; flex-wrap: wrap; gap: 6px 12px;
  }
  .cfg-toggle {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: #d4d4d8; cursor: pointer;
    user-select: none;
  }
  .cfg-toggle input[type="checkbox"] {
    accent-color: #a78bfa;
    width: 14px; height: 14px; cursor: pointer;
  }
  .cfg-hint {
    margin-top: 16px; font-size: 12px; color: #71717a;
    text-align: center; font-style: italic;
  }

  .cfg-preview {
    display: flex; flex-direction: column;
  }
  .cfg-preview-frame {
    background: #0a0a0f;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 16px;
    display: flex; align-items: center; justify-content: center;
    min-height: 180px;
  }
  .cfg-preview-frame img {
    max-width: 100%; height: auto; border-radius: 14px;
  }
`;
