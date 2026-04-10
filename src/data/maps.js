/**
 * Map data for Gearbreakers MVP locations.
 *
 * Tile legend:
 *   0 = floor (walkable)
 *   1 = wall (blocked)
 *   2 = interactable
 *   3 = transition
 *   4 = hazard
 */

// ─── Helper: generate a 2D tile array filled with a value ─────────────────────
function makeTiles(width, height, fill = 0) {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

// ─── Helper: draw a rectangle of a given tile into a 2D array ─────────────────
function fillRect(tiles, x, y, w, h, value) {
  for (let row = y; row < y + h && row < tiles.length; row++) {
    for (let col = x; col < x + w && col < tiles[0].length; col++) {
      tiles[row][col] = value;
    }
  }
}

// ─── Helper: carve a horizontal corridor ──────────────────────────────────────
function hCorridor(tiles, x1, x2, y, width = 2) {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  for (let row = y; row < y + width && row < tiles.length; row++) {
    for (let col = startX; col <= endX && col < tiles[0].length; col++) {
      tiles[row][col] = 0;
    }
  }
}

// ─── Helper: carve a vertical corridor ────────────────────────────────────────
function vCorridor(tiles, y1, y2, x, width = 2) {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  for (let row = startY; row <= endY && row < tiles.length; row++) {
    for (let col = x; col < x + width && col < tiles[0].length; col++) {
      tiles[row][col] = 0;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOXCAR HOLLOW — 40x30, town, no random encounters
// ═══════════════════════════════════════════════════════════════════════════════

function buildBoxcarHollowTiles() {
  const tiles = makeTiles(40, 30, 1); // start with walls

  // Main town square (open area)
  fillRect(tiles, 2, 2, 36, 26, 0);

  // Buildings (walls inside the town to create structures)

  // Grizzle's workshop (top-left building)
  fillRect(tiles, 3, 3, 8, 5, 1);
  fillRect(tiles, 4, 4, 6, 3, 0); // interior
  tiles[7][7] = 0; // door

  // Shop building (top-right)
  fillRect(tiles, 22, 3, 8, 5, 1);
  fillRect(tiles, 23, 4, 6, 3, 0); // interior
  tiles[7][26] = 0; // door

  // Ticker's garage (middle-right)
  fillRect(tiles, 23, 12, 8, 5, 1);
  fillRect(tiles, 24, 13, 6, 3, 0); // interior
  tiles[16][27] = 0; // door

  // Residential block (bottom-left)
  fillRect(tiles, 3, 20, 6, 5, 1);
  fillRect(tiles, 4, 21, 4, 3, 0); // interior
  tiles[24][6] = 0; // door

  // Second residential (bottom-center)
  fillRect(tiles, 14, 20, 6, 5, 1);
  fillRect(tiles, 15, 21, 4, 3, 0); // interior
  tiles[24][17] = 0; // door

  // Town well / feature in center
  fillRect(tiles, 17, 10, 3, 3, 1);

  // Place interactable tiles
  tiles[5][5] = 2;   // save terminal inside Grizzle's workshop
  tiles[5][26] = 2;  // shop counter

  // Transition tiles (exits)
  tiles[15][39] = 3; // east exit -> slagworks
  tiles[29][20] = 3; // south exit -> undercroft

  return tiles;
}

const boxcar_hollow = {
  id: 'boxcar_hollow',
  name: 'Boxcar Hollow',
  width: 40,
  height: 30,
  tilesetId: 'tileset_town',
  encounterTable: null,
  tiles: buildBoxcarHollowTiles(),
  npcs: [
    { id: 'grizzle', name: 'Grizzle', gridX: 5, gridY: 5, spriteId: 'npc_grizzle', dialogueId: 'grizzle_intro' },
    { id: 'ticker', name: 'Ticker', gridX: 25, gridY: 14, spriteId: 'npc_ticker', dialogueId: 'ticker_intro' },
    { id: 'townsfolk_1', name: 'Rusty', gridX: 12, gridY: 10, spriteId: 'npc_townsfolk', dialogueId: 'townsfolk_rusty' },
    { id: 'townsfolk_2', name: 'Patches', gridX: 30, gridY: 18, spriteId: 'npc_townsfolk', dialogueId: 'townsfolk_patches' },
    { id: 'townsfolk_3', name: 'Cogsworth', gridX: 5, gridY: 22, spriteId: 'npc_townsfolk', dialogueId: 'townsfolk_cogsworth' },
    { id: 'townsfolk_4', name: 'Bellows', gridX: 16, gridY: 22, spriteId: 'npc_townsfolk', dialogueId: 'townsfolk_bellows' },
  ],
  interactables: [
    { gridX: 5, gridY: 5, type: 'save_terminal' },
    { gridX: 26, gridY: 5, type: 'shop', id: 'shop_main' },
  ],
  transitions: [
    { gridX: 39, gridY: 15, targetMap: 'slagworks_f1', targetX: 1, targetY: 12 },
    { gridX: 20, gridY: 29, targetMap: 'undercroft_f1', targetX: 10, targetY: 1, requires: 'slagworks_cleared' },
  ],
  playerStart: { x: 15, y: 14 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLAGWORKS FLOOR 1 — 30x25, dungeon with encounters
// ═══════════════════════════════════════════════════════════════════════════════

function buildSlagworksF1Tiles() {
  const tiles = makeTiles(30, 25, 1);

  // Entrance room (west side)
  fillRect(tiles, 1, 9, 7, 7, 0);

  // Central corridor connecting entrance to main room
  hCorridor(tiles, 7, 12, 12, 2);

  // Main hall (center)
  fillRect(tiles, 12, 6, 8, 12, 0);

  // North side room (chest)
  fillRect(tiles, 14, 2, 5, 4, 0);
  vCorridor(tiles, 5, 6, 16, 2);

  // South side room (chest)
  fillRect(tiles, 14, 19, 5, 4, 0);
  vCorridor(tiles, 17, 19, 16, 2);

  // East corridor to exit stairs
  hCorridor(tiles, 19, 26, 11, 3);

  // Exit stairwell (east)
  fillRect(tiles, 26, 9, 3, 7, 0);

  // Hazard tiles in main hall
  tiles[10][15] = 4;
  tiles[13][17] = 4;

  // Interactable tiles for chests
  tiles[3][16] = 2;  // north room chest
  tiles[21][16] = 2; // south room chest

  // Transition: entrance from town
  tiles[12][0] = 3;
  // Transition: stairs down to F2
  tiles[12][28] = 3;

  return tiles;
}

const slagworks_f1 = {
  id: 'slagworks_f1',
  name: 'Slagworks - Floor 1',
  width: 30,
  height: 25,
  tilesetId: 'tileset_dungeon',
  encounterTable: 'slagworks_f1',
  tiles: buildSlagworksF1Tiles(),
  npcs: [],
  interactables: [
    { gridX: 16, gridY: 3, type: 'chest', contents: { scrap: 75 }, id: 'slag_f1_chest_01' },
    { gridX: 16, gridY: 21, type: 'chest', contents: { item: 'repair_kit' }, id: 'slag_f1_chest_02' },
  ],
  transitions: [
    { gridX: 0, gridY: 12, targetMap: 'boxcar_hollow', targetX: 38, targetY: 15 },
    { gridX: 28, gridY: 12, targetMap: 'slagworks_f2', targetX: 1, targetY: 12 },
  ],
  playerStart: { x: 1, y: 12 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLAGWORKS FLOOR 2 — 30x25
// ═══════════════════════════════════════════════════════════════════════════════

function buildSlagworksF2Tiles() {
  const tiles = makeTiles(30, 25, 1);

  // West entry room (stairs up)
  fillRect(tiles, 1, 10, 5, 5, 0);

  // West corridor
  hCorridor(tiles, 5, 10, 12, 2);

  // North loop room
  fillRect(tiles, 10, 3, 6, 6, 0);
  vCorridor(tiles, 8, 10, 12, 2);

  // South loop room
  fillRect(tiles, 10, 16, 6, 6, 0);
  vCorridor(tiles, 14, 16, 12, 2);

  // Central junction
  fillRect(tiles, 15, 10, 4, 5, 0);
  hCorridor(tiles, 15, 16, 8, 2);  // connect north loop
  hCorridor(tiles, 15, 16, 15, 2); // connect south loop

  // East corridor to exit
  hCorridor(tiles, 18, 26, 12, 2);

  // East exit room (stairs down)
  fillRect(tiles, 26, 10, 3, 5, 0);

  // Chest in south loop
  tiles[19][13] = 2;

  // Hazard tiles
  tiles[5][12] = 4;
  tiles[18][11] = 4;

  // Transitions
  tiles[12][0] = 3;  // stairs up to F1
  tiles[12][28] = 3; // stairs down to F3

  return tiles;
}

const slagworks_f2 = {
  id: 'slagworks_f2',
  name: 'Slagworks - Floor 2',
  width: 30,
  height: 25,
  tilesetId: 'tileset_dungeon',
  encounterTable: 'slagworks_f2',
  tiles: buildSlagworksF2Tiles(),
  npcs: [],
  interactables: [
    { gridX: 13, gridY: 19, type: 'chest', contents: { scrap: 120, item: 'voltaic_coil' }, id: 'slag_f2_chest_01' },
  ],
  transitions: [
    { gridX: 0, gridY: 12, targetMap: 'slagworks_f1', targetX: 27, targetY: 12 },
    { gridX: 28, gridY: 12, targetMap: 'slagworks_f3', targetX: 1, targetY: 12 },
  ],
  playerStart: { x: 1, y: 12 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLAGWORKS FLOOR 3 — 30x25, boss floor
// ═══════════════════════════════════════════════════════════════════════════════

function buildSlagworksF3Tiles() {
  const tiles = makeTiles(30, 25, 1);

  // West entry room (stairs up)
  fillRect(tiles, 1, 10, 5, 5, 0);

  // Winding corridor west to center
  hCorridor(tiles, 5, 10, 12, 2);
  vCorridor(tiles, 7, 12, 10, 2);
  hCorridor(tiles, 10, 15, 7, 2);
  vCorridor(tiles, 8, 12, 15, 2);

  // Pre-boss room
  fillRect(tiles, 15, 6, 6, 6, 0);

  // Corridor to boss arena
  hCorridor(tiles, 20, 23, 8, 2);

  // Boss arena (large room)
  fillRect(tiles, 23, 4, 6, 17, 0);

  // Hazard tiles in corridor
  tiles[9][8] = 4;
  tiles[8][13] = 4;
  tiles[11][13] = 4;

  // Transitions
  tiles[12][0] = 3;  // stairs up to F2
  tiles[12][28] = 3; // boss door (locked until boss defeated)

  return tiles;
}

const slagworks_f3 = {
  id: 'slagworks_f3',
  name: 'Slagworks - Floor 3',
  width: 30,
  height: 25,
  tilesetId: 'tileset_dungeon',
  encounterTable: 'slagworks_f3',
  tiles: buildSlagworksF3Tiles(),
  npcs: [],
  interactables: [],
  transitions: [
    { gridX: 0, gridY: 12, targetMap: 'slagworks_f2', targetX: 27, targetY: 12 },
    { gridX: 28, gridY: 12, targetMap: 'boxcar_hollow', targetX: 38, targetY: 15, requires: 'slagworks_boss_defeated' },
  ],
  playerStart: { x: 1, y: 12 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════════

export const MAPS = {
  boxcar_hollow,
  slagworks_f1,
  slagworks_f2,
  slagworks_f3,
};

/**
 * Retrieve a map by its ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getMap(id) {
  return MAPS[id];
}
