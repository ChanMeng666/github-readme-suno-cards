# Frontend Redesign Design Spec

## Context

The current frontend is a single vanilla HTML page rendered as a template string in `apps/web/app/route.ts`. It has a dark-only theme, basic configurator, linear style gallery, and inline CSS/JS — no React components. This redesign transforms it into a professional 3-page React app with dark/light mode, an expanded style gallery, and a full interactive card builder.

## Decisions

- **Framework**: Next.js 15 with `'use client'` pages (avoids known RSC + pnpm workspace bundler bug)
- **CSS**: Tailwind CSS with class-based dark mode
- **Visual**: Minimal flat design (Vercel/Stripe-like — clean borders, generous whitespace, high contrast)
- **Theme toggle**: `next-themes` with localStorage persistence
- **Pages**: Home (`/`), Gallery (`/gallery`), Builder (`/builder`)
- **No external state library**: Builder uses `useReducer`

## File Structure

```
apps/web/
  app/
    layout.tsx              # Root layout — ThemeProvider, Navbar, Footer
    page.tsx                # Home page ('use client')
    gallery/
      page.tsx              # Gallery page ('use client')
    builder/
      page.tsx              # Builder page ('use client')
    globals.css             # Tailwind directives + design tokens
    api/                    # UNCHANGED
      card/route.ts
      cards/route.ts
      profile/route.ts
    song/[id]/route.ts      # UNCHANGED

  components/
    Navbar.tsx
    Footer.tsx
    ThemeProvider.tsx        # Wraps next-themes
    ThemeToggle.tsx          # Sun/moon toggle button
    CardPreview.tsx          # Reusable <img> that builds /api/card URL
    CodeBlock.tsx            # Code display with copy button
    FilterBar.tsx            # Gallery filter controls
    GalleryCard.tsx          # Single gallery grid item with hover overlay
    ColorPicker.tsx          # Color input + hex text combo
    ToggleSwitch.tsx         # Labeled toggle switch
    SelectField.tsx          # Styled select dropdown

  lib/
    query.ts                # UNCHANGED
    errorSvg.ts             # UNCHANGED
    image.ts                # UNCHANGED
    cardParams.ts           # NEW — CardConfig type, URL builder, parser, embed generators
    galleryPresets.ts       # NEW — expanded curated preset data
    constants.ts            # NEW — ORIGIN_HINT, DEMO_UUID, DEMO_HANDLE
    cn.ts                   # NEW — clsx + tailwind-merge utility

  postcss.config.mjs        # NEW
  tailwind.config.ts        # NEW
```

## Design Tokens

```css
:root {
  --background: #ffffff;
  --foreground: #18181b;      /* zinc-900 */
  --muted: #71717a;           /* zinc-500 */
  --surface: #fafafa;         /* zinc-50 */
  --border: #e4e4e7;          /* zinc-200 */
  --accent: #7c3aed;          /* violet-600 */
  --accent-hover: #6d28d9;    /* violet-700 */
}
.dark {
  --background: #09090b;      /* zinc-950 */
  --foreground: #f4f4f5;      /* zinc-100 */
  --muted: #a1a1aa;           /* zinc-400 */
  --surface: #18181b;         /* zinc-900 */
  --border: #27272a;          /* zinc-800 */
  --accent: #a78bfa;          /* violet-400 */
  --accent-hover: #8b5cf6;    /* violet-500 */
}
```

## Pages

### Home (`/`)

1. **Hero** — Project title with gradient text (violet-to-pink), tagline, two animated card previews floating with subtle parallax on scroll
2. **Feature highlights** — 3-column grid: "Two Layouts", "Color Presets", "Full Customization", "Auto-Sync" — each with icon, title, short description
3. **Featured cards** — 4 curated styles (classic dark, player suno dark, classic light, player custom accent) displayed in a 2x2 grid with labels
4. **CTAs** — Two prominent buttons: "Browse Gallery" (outlined) and "Build Your Card" (filled accent)
5. **Footer** — GitHub link, MIT license, "Built with Next.js on Vercel Edge"

### Gallery (`/gallery`)

**Filter bar**: Horizontal row of segmented button groups:
- Layout: All | Classic | Player
- Preset: All | Default | Suno
- Theme: All | Dark | Light

**Card grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

Each `GalleryCard`:
- Live SVG preview in a bordered frame
- Title + one-line description below
- Hover overlay (fade in): "Copy Code" button + "Customize" link (opens Builder with params)
- Click anywhere on card to expand a detail panel showing all three embed formats

**Expanded preset list** (20+ combinations):

| # | Title | Layout | Preset | Theme | Special |
|---|-------|--------|--------|-------|---------|
| 1 | Classic Default Dark | classic | default | dark | — |
| 2 | Classic Default Light | classic | default | light | — |
| 3 | Classic Suno Dark | classic | suno | dark | — |
| 4 | Classic Suno Light | classic | suno | light | — |
| 5 | Player Default Dark | player | default | dark | — |
| 6 | Player Default Light | player | default | light | — |
| 7 | Player Suno Dark | player | suno | dark | — |
| 8 | Player Suno Light | player | suno | light | — |
| 9 | Minimal Classic | classic | default | dark | tags/plays/likes/model/equalizer off |
| 10 | Minimal Player | player | default | dark | tags/author off |
| 11 | Full Info Classic | classic | default | dark | all toggles on |
| 12 | Full Info Player | player | suno | dark | tags/author/plays/likes on |
| 13 | No Equalizer Player | player | suno | dark | equalizer off |
| 14 | Custom Red Accent | player | suno | dark | accent_color=ff6b6b |
| 15 | Custom Teal Accent | classic | default | dark | accent_color=2dd4bf |
| 16 | Custom Orange Accent | player | default | dark | accent_color=fb923c |
| 17 | Monochrome Dark | classic | default | dark | accent_color=e4e4e7, text_color=f4f4f5 |
| 18 | Warm Gold Classic | classic | suno | light | — |
| 19 | Tags Showcase | classic | default | dark | show_tags=true, max_tags=8 |
| 20 | Player With Stats | player | default | dark | show_plays=true, show_likes=true |

### Builder (`/builder`)

**Desktop layout**: `grid-cols-[420px_1fr]` — controls left, preview right (sticky)

**Controls panel** (collapsible sections):

1. **Song Input** (always open)
   - Text input for song ID/URL
   - Helper text: "Paste a Suno song UUID, short code, or full URL"

2. **Layout & Theme**
   - Layout: segmented control (Classic | Player)
   - Preset: segmented control (Default | Suno)
   - Theme: segmented control (Dark | Light | Auto)

3. **Colors**
   - Background: color picker + hex input
   - Text: color picker + hex input
   - Accent: color picker + hex input
   - "Reset to preset defaults" link

4. **Element Toggles**
   - Grid of toggle switches, 2 per row
   - Layout-aware defaults (switching layout resets toggles)
   - Toggles: Equalizer, Tags, Plays, Likes, Author, Duration, Model Badge, NEW Badge, Progress Bar, SUNO Logo, Link Icon

**Preview panel** (right, sticky on desktop):
- Card preview in a bordered frame with subtle checkerboard background (shows transparency)
- Loading skeleton while SVG loads
- Below preview: tab group for embed formats
  - Tab 1: "Markdown" — `[![](url)](suno-link)` with copy button
  - Tab 2: "URL Only" — raw URL with copy button
  - Tab 3: "HTML" — `<img>` tag with copy button

**State management**:
- `useReducer` with `CardConfig` type
- URL params read on mount (Gallery -> Builder handoff)
- State synced to URL via `replaceState` on every change
- Preview image debounced 300ms for text inputs, instant for selects/toggles

## CardConfig Type

```typescript
type CardLayout = 'classic' | 'player';
type PresetName = 'default' | 'suno';
type ThemeMode = 'auto' | 'dark' | 'light';

type CardConfig = {
  id: string;
  layout: CardLayout;
  preset: PresetName;
  theme: ThemeMode;
  bgColor: string;        // hex without '#', empty = auto
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
```

Functions: `buildCardUrl(config)`, `parseCardConfig(params)`, `buildMarkdownEmbed(config, origin)`, `buildHtmlEmbed(config, origin)`, `getLayoutDefaults(layout)`.

## Animations & Transitions

### Page-level
- **Page transitions**: CSS `@starting-style` + `view-transition-name` for smooth cross-page transitions (Next.js App Router supports this natively)
- **Scroll reveal**: Elements fade in and slide up as they enter the viewport using `IntersectionObserver` with staggered delays

### Component-level
- **Card hover**: `transition-all duration-200` — slight scale up (`scale-[1.02]`), shadow elevation, overlay fade-in
- **Filter bar**: Active filter pill has animated underline indicator that slides between options
- **Toggle switches**: Smooth 200ms slide transition with background color change
- **Copy button feedback**: Button text briefly changes to "Copied!" with a checkmark, green flash, then reverts after 1.5s
- **Card preview loading**: Pulse skeleton animation while SVG loads, smooth fade-in when image arrives
- **Collapsible sections**: `max-height` + `opacity` transition for smooth open/close
- **Navbar**: Active page indicator underline with slide transition
- **Theme toggle**: Sun/moon icon rotation transition on toggle

### Hero-specific
- **Floating cards**: Two card previews with subtle CSS `translate` animation (slow float up/down, offset timing)
- **Gradient text**: Animated gradient shift on the title (slow hue rotation via `background-position`)
- **Staggered entry**: Hero elements appear in sequence (title -> tagline -> cards -> CTAs) with 100ms delays

## Dependencies to Add

```json
{
  "dependencies": {
    "next-themes": "^0.4.4",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

Note: Using Tailwind v3.4 (not v4) for proven Next.js 15 compatibility.

## Migration Plan

1. **Infrastructure**: Add deps, create Tailwind/PostCSS config, globals.css, utility files
2. **Shared components**: ThemeProvider, Navbar, Footer, CardPreview, CodeBlock
3. **Layout shell**: Create `layout.tsx` with providers and chrome
4. **Pages**: Build Home, Gallery, Builder pages with their sub-components
5. **Cutover**: Delete old `route.ts`, verify all API routes still work
6. **Polish**: Animations, loading states, metadata, accessibility pass

## Key Constraints

- All page files use `'use client'` (RSC bundler bug workaround)
- API routes (`app/api/`) remain completely unchanged
- Card previews always load as `<img src="/api/card?...">` — never import render package in client
- `layout.tsx` must use `suppressHydrationWarning` on `<html>` (next-themes requirement)
- Old `route.ts` and new `page.tsx` cannot coexist at `app/` root — atomic switchover

## Verification

1. `pnpm dev` — all three pages render correctly
2. Dark/light toggle works, persists across page navigations
3. Gallery filters correctly show/hide card combinations
4. Gallery "Customize" button opens Builder with correct params pre-filled
5. Builder preview updates live on every control change
6. Builder URL updates on state change (shareable link)
7. Copy buttons work for all embed formats
8. All API routes (`/api/card`, `/api/profile`, `/api/cards`) return SVGs unchanged
9. Responsive: all pages work on mobile (375px), tablet (768px), desktop (1280px)
10. `pnpm build` succeeds without errors
11. `pnpm typecheck` passes
