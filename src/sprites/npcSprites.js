/**
 * NPC sprite definitions for Gearbreakers.
 * Static 16x16 sprites (single frame, facing down).
 */
import { drawPixelArt } from './spriteGenerator.js';

// ─── Grizzle ───
// Stocky, wide, one arm (right arm shorter/absent at shoulder), apron, beard

function generateGrizzle() {
  const palette = [
    'transparent',  // 0
    '#5a4030',      // 1 brown clothes
    '#6a5040',      // 2 mid brown
    '#3a2a1a',      // 3 dark brown shadow
    '#ccccaa',      // 4 white apron
    '#bbbb99',      // 5 apron shadow
    '#1a1a1a',      // 6 outline
    '#7a6050',      // 7 skin tone
    '#4a3020',      // 8 dark hair/beard
    '#8a7060',      // 9 light skin
    '#222222',      // 10 boot
    '#aaaaaa',      // 11 apron highlight
  ];

  const pixels = [
    [0,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0],
    [0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0],
    [0,0,0,0,0,7,6,7,7,6,7,0,0,0,0,0],
    [0,0,0,0,0,7,7,9,9,7,7,0,0,0,0,0],
    [0,0,0,0,0,8,8,7,7,8,8,0,0,0,0,0],
    [0,0,0,0,1,1,4,4,4,4,1,1,0,0,0,0],
    [0,0,0,1,1,4,4,4,4,4,4,1,3,0,0,0],
    [0,0,0,7,1,4,5,4,4,5,4,0,0,0,0,0],
    [0,0,0,7,1,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,0,1,1,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,10,10,10,0,0,10,10,10,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  return drawPixelArt(16, 16, pixels, palette);
}

// ─── Ticker ───
// Hunched, hooded, nervous posture, glinting eyes in shadow

function generateTicker() {
  const palette = [
    'transparent',  // 0
    '#3a3a3a',      // 1 dark gray clothes
    '#4a4a4a',      // 2 mid gray
    '#2a2020',      // 3 hood dark
    '#5a5a5a',      // 4 light gray
    '#1a1a1a',      // 5 deep shadow
    '#cccc44',      // 6 glinting yellow eyes
    '#6a5a5a',      // 7 pale skin
    '#2a2a2a',      // 8 very dark
    '#555555',      // 9 cloth highlight
    '#222222',      // 10 boot
    '#3a3030',      // 11 hood mid
  ];

  const pixels = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0],
    [0,0,0,0,0,3,3,11,11,3,3,0,0,0,0,0],
    [0,0,0,0,3,3,5,3,3,5,3,3,0,0,0,0],
    [0,0,0,0,3,5,6,5,5,6,5,3,0,0,0,0],
    [0,0,0,0,0,3,5,5,5,5,3,0,0,0,0,0],
    [0,0,0,0,0,3,3,7,7,3,3,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,7,1,2,1,1,2,1,7,0,0,0,0],
    [0,0,0,0,7,1,2,1,1,2,1,7,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,10,10,0,0,10,10,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  return drawPixelArt(16, 16, pixels, palette);
}

// ─── Generic Townsfolk ───
// Basic civilian: shirt, pants, muted earth tones

function generateTownsfolk() {
  const palette = [
    'transparent',  // 0
    '#6a5a4a',      // 1 brown shirt
    '#7a6a5a',      // 2 light brown
    '#4a3a2a',      // 3 dark pants
    '#5a4a3a',      // 4 mid pants
    '#3a3a3a',      // 5 shadow
    '#1a1a1a',      // 6 outline
    '#8a7060',      // 7 skin tone
    '#5a3a1a',      // 8 hair brown
    '#9a8070',      // 9 light skin
    '#222222',      // 10 boot
    '#6a6a5a',      // 11 shirt highlight
  ];

  const pixels = [
    [0,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0],
    [0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0],
    [0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0],
    [0,0,0,0,0,7,6,7,7,6,7,0,0,0,0,0],
    [0,0,0,0,0,0,7,9,9,7,0,0,0,0,0,0],
    [0,0,0,0,0,0,7,7,7,7,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,7,1,2,1,1,2,1,7,0,0,0,0],
    [0,0,0,0,7,1,2,1,1,2,1,7,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,3,3,3,3,3,3,0,0,0,0,0],
    [0,0,0,0,0,3,4,0,0,4,3,0,0,0,0,0],
    [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
    [0,0,0,0,10,10,10,0,0,10,10,10,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  return drawPixelArt(16, 16, pixels, palette);
}

// ─── Public API ───

export function generateNPCSprites() {
  return {
    npc_grizzle:   generateGrizzle(),
    npc_ticker:    generateTicker(),
    npc_townsfolk: generateTownsfolk()
  };
}
