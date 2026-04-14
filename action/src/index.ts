import * as core from '@actions/core';
import {
  type SunoProfile,
  type SunoSong,
  fetchAllClips,
  fetchProfile,
  fetchSong,
} from '@suno-cards/parser';

import { type ActionInputs, readInputs } from './inputs.js';
import { renderLocalBlock } from './localRender.js';
import { loadManifest } from './manifest.js';
import { MarkersNotFoundError, updateReadmeFile } from './readmeUpdater.js';
import { renderServiceBlock } from './template.js';

// Re-expose classifyError without pulling in errorSvg from apps/web
function classifyError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

async function resolveSongs(
  inputs: ActionInputs,
): Promise<{ profile: SunoProfile | null; songs: SunoSong[] }> {
  // Mode 1: handle-based auto-discovery
  if (inputs.handle) {
    core.info(`Fetching @${inputs.handle}'s library via /api/profiles/...`);
    const result = await fetchAllClips(inputs.handle, {
      sortBy: inputs.sort,
      max: inputs.max,
      includeTags: inputs.includeTags ?? undefined,
      excludeTags: inputs.excludeTags ?? undefined,
      minDurationSeconds: inputs.minDuration ?? undefined,
      maxDurationSeconds: inputs.maxDuration ?? undefined,
      minPlays: inputs.minPlays ?? undefined,
      minLikes: inputs.minLikes ?? undefined,
      pinnedFirst: inputs.pinnedFirst,
      allowExplicit: inputs.allowExplicit,
      featured: inputs.featured ?? undefined,
    });
    core.info(
      `  → ${result.clips.length} songs after filters (of ${result.profile.totalClips} total)`,
    );
    return {
      profile: inputs.showProfileCard ? result.profile : null,
      songs: result.clips,
    };
  }

  // Mode 2: manifest file
  if (inputs.manifestPath) {
    core.info(`Loading manifest from ${inputs.manifestPath}`);
    const manifest = loadManifest(inputs.manifestPath);
    core.info(`  → ${manifest.songs.length} song entries in manifest`);
    const songs: SunoSong[] = [];
    for (const entry of manifest.songs) {
      try {
        const song = await fetchSong(entry.id);
        songs.push(song);
      } catch (err) {
        core.warning(`Failed to fetch song ${entry.id}: ${classifyError(err)}`);
      }
    }
    // No profile endpoint is called in manifest mode unless show_profile_card
    // is explicitly set AND a handle can be inferred from song author.
    let profile: SunoProfile | null = null;
    if (inputs.showProfileCard && songs[0]?.author.handle) {
      try {
        profile = await fetchProfile(songs[0].author.handle);
      } catch (err) {
        core.warning(
          `Failed to fetch profile for inferred handle @${songs[0].author.handle}: ${classifyError(err)}`,
        );
      }
    }
    return { profile, songs: songs.slice(0, inputs.max) };
  }

  // Mode 3: inline song_ids CSV
  if (inputs.songIds && inputs.songIds.length > 0) {
    core.info(`Fetching ${inputs.songIds.length} inline song IDs`);
    const songs: SunoSong[] = [];
    for (const id of inputs.songIds) {
      try {
        songs.push(await fetchSong(id));
      } catch (err) {
        core.warning(`Failed to fetch song ${id}: ${classifyError(err)}`);
      }
    }
    return { profile: null, songs: songs.slice(0, inputs.max) };
  }

  throw new Error('No data source provided — set one of `handle`, `manifest_path`, or `song_ids`.');
}

async function run(): Promise<void> {
  try {
    const inputs = readInputs();
    core.info(`Running github-readme-suno-cards (${inputs.renderMode} mode)`);

    // 1. Fetch data
    const { profile, songs } = await resolveSongs(inputs);
    if (songs.length === 0 && !profile) {
      core.warning('No songs survived filtering — nothing to render.');
      core.setOutput('clips', JSON.stringify([]));
      core.setOutput('cards_block', '');
      return;
    }
    core.info(`Rendering ${profile ? 'profile + ' : ''}${songs.length} song card(s)`);

    // 2. Build the block
    let block: string;
    let writtenFiles: string[] = [];
    if (inputs.renderMode === 'local') {
      const result = await renderLocalBlock(profile, songs, {
        cardsDir: inputs.localCardsDir,
        readmePath: inputs.readmePath,
        theme: inputs.theme,
        lang: inputs.lang,
        ...(inputs.width != null && { width: inputs.width }),
        layout: inputs.layout,
        preset: inputs.preset,
        showProgress: inputs.showProgress,
        showLogo: inputs.showLogo,
        showLinkIcon: inputs.showLinkIcon,
        colorOverrides: {
          ...(inputs.bgColor && { bg: inputs.bgColor }),
          ...(inputs.textColor && { text: inputs.textColor }),
          ...(inputs.accentColor && { accent: inputs.accentColor }),
        },
      });
      block = result.block;
      writtenFiles = result.writtenFiles;
      core.info(`Wrote ${writtenFiles.length} SVG file(s) to ${inputs.localCardsDir}/`);
    } else {
      block = renderServiceBlock(profile, songs, {
        baseUrl: inputs.baseUrl,
        theme: inputs.theme,
        outputType: inputs.outputType,
        lang: inputs.lang,
        ...(inputs.width != null && { width: inputs.width }),
        ...(inputs.bgColor && { bgColor: inputs.bgColor }),
        ...(inputs.textColor && { textColor: inputs.textColor }),
        ...(inputs.accentColor && { accentColor: inputs.accentColor }),
        layout: inputs.layout,
        preset: inputs.preset,
        showProgress: inputs.showProgress,
        showLogo: inputs.showLogo,
        showLinkIcon: inputs.showLinkIcon,
      });
    }

    // 3. Emit outputs (for chained workflow steps)
    core.setOutput('profile', profile ? JSON.stringify(profile) : '');
    core.setOutput('clips', JSON.stringify(songs));
    core.setOutput('cards_block', block);
    core.setOutput('rendered_files', JSON.stringify(writtenFiles));

    // 4. Update README (unless output_only)
    if (inputs.outputOnly) {
      core.info('output_only=true — skipping README write');
      return;
    }

    try {
      const result = updateReadmeFile({
        readmePath: inputs.readmePath,
        commentTagName: inputs.commentTagName,
        replacement: block,
      });
      if (result.changed) {
        core.info(
          `Updated ${inputs.readmePath} between <!-- ${inputs.commentTagName}:START/END --> markers`,
        );
      } else {
        core.info(`${inputs.readmePath} already up to date — no changes written`);
      }
    } catch (err) {
      if (err instanceof MarkersNotFoundError) {
        core.setFailed(
          `README markers not found. Add these two lines to ${inputs.readmePath}:\n` +
            `  <!-- ${inputs.commentTagName}:START -->\n` +
            `  <!-- ${inputs.commentTagName}:END -->`,
        );
        return;
      }
      throw err;
    }
  } catch (err) {
    core.setFailed(classifyError(err));
  }
}

void run();
