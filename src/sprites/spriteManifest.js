/**
 * Sprite manifest: orchestrates generation of all game sprites
 * and registers them in the AssetLoader for use by scenes.
 */

import { canvasToImage } from './spriteGenerator.js';
import { generateTilesets } from './tilesets.js';
import { generateCharacterSprites } from './characters.js';
import { generateNPCSprites } from './npcSprites.js';
import { generateBattleSprites } from './battleSprites.js';
import { generatePortraits } from './portraits.js';
import { generateUISprites } from './uiSprites.js';
import { generateBattleBackgrounds } from './battleBackgrounds.js';

/**
 * Generate all game sprites and register them in the asset loader.
 * Call this once at boot before any scenes render.
 * @param {import('../engine/assetLoader.js').AssetLoader} assets
 */
export async function generateAllSprites(assets) {
  // Generate all canvases synchronously
  const tilesets = generateTilesets();
  const characters = generateCharacterSprites();
  const npcs = generateNPCSprites();
  const battle = generateBattleSprites();
  const portraits = generatePortraits();
  const ui = generateUISprites();
  const backgrounds = generateBattleBackgrounds();

  // Collect all canvases with their asset keys
  const entries = {
    ...tilesets,
    ...characters,
    ...npcs,
    ...battle,
    ...portraits,
    ...ui,
    ...backgrounds
  };

  // Convert all canvases to HTMLImageElement and register in asset loader
  const conversions = Object.entries(entries).map(async ([key, canvas]) => {
    const image = await canvasToImage(canvas);
    assets._cache.set(key, image);
  });

  await Promise.all(conversions);
}
