export type CardLayout = 'classic' | 'player';
export type PresetName = 'default' | 'suno';
export type ThemeMode = 'auto' | 'dark' | 'light';

export type CardConfig = {
  id: string;
  layout: CardLayout;
  preset: PresetName;
  theme: ThemeMode;
  bgColor: string;
  textColor: string;
  accentColor: string;
  showEqualizer: boolean;
  showTags: boolean;
  showPlays: boolean;
  showLikes: boolean;
  showAuthor: boolean;
  showDuration: boolean;
  showModelBadge: boolean;
  showNewBadge: boolean;
  showProgress: boolean;
  showLogo: boolean;
  showLinkIcon: boolean;
};

type ToggleDefaults = Omit<
  CardConfig,
  'id' | 'layout' | 'preset' | 'theme' | 'bgColor' | 'textColor' | 'accentColor'
>;

const CLASSIC_DEFAULTS: ToggleDefaults = {
  showEqualizer: true,
  showTags: true,
  showPlays: true,
  showLikes: true,
  showAuthor: true,
  showDuration: true,
  showModelBadge: true,
  showNewBadge: true,
  showProgress: false,
  showLogo: false,
  showLinkIcon: false,
};

const PLAYER_DEFAULTS: ToggleDefaults = {
  showEqualizer: true,
  showTags: false,
  showPlays: false,
  showLikes: false,
  showAuthor: false,
  showDuration: false,
  showModelBadge: false,
  showNewBadge: false,
  showProgress: true,
  showLogo: true,
  showLinkIcon: true,
};

export function getLayoutDefaults(layout: CardLayout): ToggleDefaults {
  return layout === 'player' ? { ...PLAYER_DEFAULTS } : { ...CLASSIC_DEFAULTS };
}

export function getDefaultConfig(id: string): CardConfig {
  return {
    id,
    layout: 'classic',
    preset: 'default',
    theme: 'auto',
    bgColor: '',
    textColor: '',
    accentColor: '',
    ...CLASSIC_DEFAULTS,
  };
}

const TOGGLE_MAP: Record<string, keyof ToggleDefaults> = {
  show_equalizer: 'showEqualizer',
  show_tags: 'showTags',
  show_plays: 'showPlays',
  show_likes: 'showLikes',
  show_author: 'showAuthor',
  show_duration: 'showDuration',
  show_model_badge: 'showModelBadge',
  show_new_badge: 'showNewBadge',
  show_progress: 'showProgress',
  show_logo: 'showLogo',
  show_link_icon: 'showLinkIcon',
};

const REVERSE_TOGGLE_MAP: Record<keyof ToggleDefaults, string> = Object.fromEntries(
  Object.entries(TOGGLE_MAP).map(([k, v]) => [v, k]),
) as Record<keyof ToggleDefaults, string>;

/** Build the query string portion (no leading ?) for a card config. */
export function buildCardQueryString(config: CardConfig): string {
  const defaults = getLayoutDefaults(config.layout);
  const params: string[] = [`id=${encodeURIComponent(config.id)}`];

  if (config.layout !== 'classic') params.push(`layout=${config.layout}`);
  if (config.preset !== 'default') params.push(`preset=${config.preset}`);
  if (config.theme !== 'auto') params.push(`theme=${config.theme}`);

  if (config.bgColor) params.push(`bg_color=${encodeURIComponent(config.bgColor)}`);
  if (config.textColor) params.push(`text_color=${encodeURIComponent(config.textColor)}`);
  if (config.accentColor) params.push(`accent_color=${encodeURIComponent(config.accentColor)}`);

  for (const [key, configKey] of Object.entries(REVERSE_TOGGLE_MAP)) {
    const val = config[configKey as keyof ToggleDefaults];
    if (val !== defaults[configKey as keyof ToggleDefaults]) {
      params.push(`${key}=${val}`);
    }
  }

  return params.join('&');
}

/** Build full API URL for a card. */
export function buildCardUrl(config: CardConfig, origin = ''): string {
  return `${origin}/api/card?${buildCardQueryString(config)}`;
}

/** Parse URL search params back into a partial CardConfig. */
export function parseCardConfig(params: URLSearchParams): Partial<CardConfig> {
  const result: Partial<CardConfig> = {};

  const id = params.get('id');
  if (id) result.id = id;

  const layout = params.get('layout');
  if (layout === 'classic' || layout === 'player') result.layout = layout;

  const preset = params.get('preset');
  if (preset === 'default' || preset === 'suno') result.preset = preset;

  const theme = params.get('theme');
  if (theme === 'auto' || theme === 'dark' || theme === 'light') result.theme = theme;

  const bgColor = params.get('bg_color');
  if (bgColor) result.bgColor = bgColor;
  const textColor = params.get('text_color');
  if (textColor) result.textColor = textColor;
  const accentColor = params.get('accent_color');
  if (accentColor) result.accentColor = accentColor;

  for (const [paramKey, configKey] of Object.entries(TOGGLE_MAP)) {
    const v = params.get(paramKey);
    if (v === 'true' || v === '1') (result as Record<string, boolean>)[configKey] = true;
    else if (v === 'false' || v === '0') (result as Record<string, boolean>)[configKey] = false;
  }

  return result;
}

/** Build markdown embed string. */
export function buildMarkdownEmbed(config: CardConfig, origin: string): string {
  const url = buildCardUrl(config, origin);
  const songId = extractSongId(config.id);
  return `[![](${url})](https://suno.com/song/${songId})`;
}

/** Build HTML img tag. */
export function buildHtmlEmbed(config: CardConfig, origin: string): string {
  const url = buildCardUrl(config, origin);
  const songId = extractSongId(config.id);
  return `<a href="https://suno.com/song/${songId}"><img src="${url}" alt="Suno music card" /></a>`;
}

function extractSongId(input: string): string {
  const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : input;
}
