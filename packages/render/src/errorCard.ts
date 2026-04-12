import { escapeXml } from './escape.js';
import { type Lang, t } from './i18n/index.js';

export type ErrorKind = 'not_found' | 'private' | 'not_ready' | 'error';

export type ErrorCardOptions = {
  width?: number;
  height?: number;
  lang?: Lang;
  detail?: string;
  x?: number;
  y?: number;
};

const ICONS: Record<ErrorKind, string> = {
  not_found: '🔍',
  private: '🔒',
  not_ready: '⏳',
  error: '⚠️',
};

export function renderErrorCard(kind: ErrorKind, opts: ErrorCardOptions = {}): string {
  const width = opts.width ?? 480;
  const height = opts.height ?? 140;
  const lang = opts.lang ?? 'en';
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;

  const title = t(lang, kind);
  const detailLine = opts.detail ?? '';
  const icon = ICONS[kind];

  const foreignObject = `<foreignObject x="${width / 2 - 160}" y="${height / 2 - 30}" width="320" height="60">
    <div xmlns="http://www.w3.org/1999/xhtml" class="error-box" style="text-align:center">
      <p class="error-title">${icon} ${escapeXml(title)}</p>
      ${detailLine ? `<p class="error-subtitle">${escapeXml(detailLine)}</p>` : ''}
    </div>
  </foreignObject>`;

  return `<g class="error-card" transform="translate(${x}, ${y})">
    <rect class="card-bg" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="14" />
    ${foreignObject}
  </g>`;
}
