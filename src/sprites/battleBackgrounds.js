/**
 * Battle background generation for Gearbreakers.
 * Uses fillRect() and canvas drawing commands for efficiency (not pixel arrays).
 * Each background is 256×140 pixels.
 */

import { fillRect } from './spriteGenerator.js';

/**
 * Slagworks: Industrial interior with conveyor belt, pipes, furnace glow, smoke, girders.
 */
function makeSlagworks() {
  const W = 256, H = 140;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // --- Base dark background ---
  fillRect(ctx, 0, 0, W, H, '#0a0a0e');

  // --- Furnace glow gradient in center-back ---
  const glowColors = [
    { color: '#1a0800', r: 60 },
    { color: '#2a1000', r: 50 },
    { color: '#3a1800', r: 40 },
    { color: '#4a2200', r: 30 },
    { color: '#663300', r: 20 },
    { color: '#884400', r: 12 },
    { color: '#aa5500', r: 6 },
  ];
  const cx = 128, cy = 50;
  for (const g of glowColors) {
    fillRect(ctx, cx - g.r * 2, cy - g.r, g.r * 4, g.r * 2, g.color);
  }

  // --- Dark edges vignette ---
  fillRect(ctx, 0, 0, 30, H, '#050508');
  fillRect(ctx, W - 30, 0, 30, H, '#050508');
  fillRect(ctx, 0, 0, 50, H, 'rgba(0,0,0,0.3)');
  fillRect(ctx, W - 50, 0, 50, H, 'rgba(0,0,0,0.3)');

  // --- Metal girders across top ---
  fillRect(ctx, 0, 0, W, 3, '#333');
  fillRect(ctx, 0, 3, W, 1, '#444');
  // Vertical girder supports
  for (let x = 32; x < W; x += 64) {
    fillRect(ctx, x, 0, 4, 20, '#2a2a2a');
    fillRect(ctx, x + 1, 0, 2, 20, '#3a3a3a');
  }
  // Cross-beams
  fillRect(ctx, 0, 18, W, 2, '#2a2a2a');
  fillRect(ctx, 0, 19, W, 1, '#333');

  // --- Vertical pipes on sides ---
  // Left pipes
  for (let px = 8; px <= 20; px += 6) {
    fillRect(ctx, px, 20, 3, H - 20, '#2a2a30');
    fillRect(ctx, px + 1, 20, 1, H - 20, '#3a3a44');
  }
  // Right pipes
  for (let px = W - 24; px <= W - 12; px += 6) {
    fillRect(ctx, px, 20, 3, H - 20, '#2a2a30');
    fillRect(ctx, px + 1, 20, 1, H - 20, '#3a3a44');
  }

  // --- Pipe joints/bands ---
  for (let py = 35; py < H; py += 30) {
    for (let px = 8; px <= 20; px += 6) {
      fillRect(ctx, px - 1, py, 5, 2, '#444');
    }
    for (let px = W - 24; px <= W - 12; px += 6) {
      fillRect(ctx, px - 1, py, 5, 2, '#444');
    }
  }

  // --- Back wall texture (industrial panels) ---
  for (let y = 22; y < 90; y += 18) {
    for (let x = 35; x < W - 35; x += 30) {
      fillRect(ctx, x, y, 28, 16, '#111118');
      fillRect(ctx, x + 1, y + 1, 26, 14, '#141420');
      // Rivet corners
      fillRect(ctx, x + 1, y + 1, 1, 1, '#333');
      fillRect(ctx, x + 26, y + 1, 1, 1, '#333');
      fillRect(ctx, x + 1, y + 14, 1, 1, '#333');
      fillRect(ctx, x + 26, y + 14, 1, 1, '#333');
    }
  }

  // --- Furnace opening in center ---
  fillRect(ctx, 108, 35, 40, 30, '#1a0a00');
  fillRect(ctx, 110, 37, 36, 26, '#2a1200');
  fillRect(ctx, 112, 39, 32, 22, '#442200');
  fillRect(ctx, 116, 42, 24, 16, '#663300');
  fillRect(ctx, 120, 45, 16, 10, '#884400');
  fillRect(ctx, 123, 47, 10, 6, '#aa5500');
  // Furnace grate bars
  for (let bx = 110; bx < 146; bx += 5) {
    fillRect(ctx, bx, 37, 1, 26, '#222');
  }

  // --- Conveyor belt lines at bottom ---
  fillRect(ctx, 30, 110, W - 60, 2, '#333');
  fillRect(ctx, 30, 118, W - 60, 2, '#333');
  fillRect(ctx, 30, 110, W - 60, 10, '#1a1a1a');
  // Conveyor rollers
  for (let rx = 35; rx < W - 35; rx += 12) {
    fillRect(ctx, rx, 112, 8, 6, '#222');
    fillRect(ctx, rx + 1, 113, 6, 4, '#2a2a2a');
    fillRect(ctx, rx + 3, 114, 2, 2, '#444');
  }

  // --- Floor ---
  fillRect(ctx, 0, 122, W, H - 122, '#0e0e12');
  // Floor grating pattern
  for (let fy = 124; fy < H; fy += 4) {
    for (let fx = 0; fx < W; fx += 8) {
      fillRect(ctx, fx, fy, 6, 1, '#181820');
      fillRect(ctx, fx + 2, fy + 2, 6, 1, '#181820');
    }
  }

  // --- Smoke wisps (scattered gray pixels) ---
  const smokePositions = [
    [100,28],[105,25],[110,22],[115,20],[120,18],[130,22],[135,25],
    [128,15],[132,12],[126,10],[80,30],[90,32],[140,28],[150,26],
    [95,35],[145,33],[70,38],[160,36],[85,24],[138,20],
  ];
  for (const [sx, sy] of smokePositions) {
    const shade = Math.floor(Math.random() * 30) + 50;
    fillRect(ctx, sx, sy, 1, 1, `rgb(${shade},${shade},${shade + 5})`);
  }
  // Larger smoke puffs near smokestack area
  fillRect(ctx, 118, 16, 2, 1, '#444');
  fillRect(ctx, 122, 13, 3, 1, '#3a3a3a');
  fillRect(ctx, 126, 10, 2, 2, '#333');
  fillRect(ctx, 130, 8, 3, 1, '#2a2a2a');

  return canvas;
}

/**
 * Undercroft: Underground vault with stone walls, cables, dim lighting, vault door, floor grating.
 */
function makeUndercroft() {
  const W = 256, H = 140;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // --- Base dark background ---
  fillRect(ctx, 0, 0, W, H, '#080810');

  // --- Slight center lighting ---
  fillRect(ctx, 60, 10, 136, 100, '#0a0a14');
  fillRect(ctx, 80, 20, 96, 70, '#0c0c18');
  fillRect(ctx, 100, 30, 56, 50, '#0e0e1c');

  // --- Dark edges ---
  fillRect(ctx, 0, 0, 25, H, '#040408');
  fillRect(ctx, W - 25, 0, 25, H, '#040408');
  fillRect(ctx, 0, 0, 45, H, 'rgba(0,0,0,0.25)');
  fillRect(ctx, W - 45, 0, 45, H, 'rgba(0,0,0,0.25)');

  // --- Stone wall texture (gray/blue rectangles) ---
  const stoneColors = ['#1a1a24', '#181822', '#1c1c28', '#161620', '#1e1e2a'];
  for (let y = 5; y < 95; y += 10) {
    const offset = (Math.floor(y / 10) % 2) * 12;
    for (let x = 5 + offset; x < W - 5; x += 24) {
      const c = stoneColors[(x + y) % stoneColors.length];
      fillRect(ctx, x, y, 22, 8, c);
      // Mortar lines
      fillRect(ctx, x, y, 22, 1, '#111118');
      fillRect(ctx, x, y, 1, 8, '#111118');
    }
  }

  // --- Vault door silhouette in center-back ---
  fillRect(ctx, 103, 15, 50, 70, '#111118');
  fillRect(ctx, 105, 17, 46, 66, '#141420');
  fillRect(ctx, 107, 19, 42, 62, '#161624');
  // Door frame
  fillRect(ctx, 103, 15, 50, 2, '#222230');
  fillRect(ctx, 103, 83, 50, 2, '#222230');
  fillRect(ctx, 103, 15, 2, 70, '#222230');
  fillRect(ctx, 151, 15, 2, 70, '#222230');
  // Door handle/wheel
  fillRect(ctx, 124, 42, 8, 8, '#2a2a38');
  fillRect(ctx, 125, 43, 6, 6, '#333344');
  fillRect(ctx, 127, 45, 2, 2, '#444455');
  // Rivets on door
  for (let dy = 22; dy < 80; dy += 12) {
    fillRect(ctx, 108, dy, 2, 2, '#2a2a35');
    fillRect(ctx, 146, dy, 2, 2, '#2a2a35');
  }
  // Horizontal bands on door
  fillRect(ctx, 107, 30, 42, 1, '#1a1a28');
  fillRect(ctx, 107, 55, 42, 1, '#1a1a28');
  fillRect(ctx, 107, 70, 42, 1, '#1a1a28');

  // --- Cables running along ceiling ---
  // Cable 1 - thick
  for (let x = 0; x < W; x++) {
    const y = 4 + Math.floor(Math.sin(x * 0.03) * 2);
    fillRect(ctx, x, y, 1, 2, '#1a1a1a');
    // Cyan highlight every few pixels
    if (x % 16 === 0) {
      fillRect(ctx, x, y, 1, 1, '#00aaaa');
    }
  }
  // Cable 2
  for (let x = 0; x < W; x++) {
    const y = 8 + Math.floor(Math.sin(x * 0.05 + 1) * 1.5);
    fillRect(ctx, x, y, 1, 1, '#181818');
    if (x % 20 === 5) {
      fillRect(ctx, x, y, 1, 1, '#008888');
    }
  }
  // Cable 3 - thin
  for (let x = 0; x < W; x++) {
    const y = 11 + Math.floor(Math.cos(x * 0.04) * 1);
    fillRect(ctx, x, y, 1, 1, '#151515');
    if (x % 24 === 10) {
      fillRect(ctx, x, y, 1, 1, '#006666');
    }
  }

  // --- Cable brackets ---
  for (let bx = 30; bx < W; bx += 50) {
    fillRect(ctx, bx, 2, 3, 12, '#222');
    fillRect(ctx, bx, 2, 3, 1, '#333');
  }

  // --- Side wall details (conduits, panels) ---
  // Left wall conduits
  for (let py = 20; py < 90; py += 25) {
    fillRect(ctx, 28, py, 10, 20, '#111118');
    fillRect(ctx, 29, py + 1, 8, 18, '#141420');
    fillRect(ctx, 31, py + 5, 1, 10, '#006060');
    fillRect(ctx, 34, py + 3, 2, 14, '#1a1a28');
  }
  // Right wall conduits
  for (let py = 15; py < 90; py += 25) {
    fillRect(ctx, W - 38, py, 10, 20, '#111118');
    fillRect(ctx, W - 37, py + 1, 8, 18, '#141420');
    fillRect(ctx, W - 35, py + 5, 1, 10, '#006060');
    fillRect(ctx, W - 32, py + 3, 2, 14, '#1a1a28');
  }

  // --- Floor area ---
  fillRect(ctx, 0, 95, W, 2, '#222230');
  fillRect(ctx, 0, 97, W, H - 97, '#0a0a12');

  // --- Floor grating pattern ---
  for (let fy = 99; fy < H; fy += 4) {
    for (let fx = 0; fx < W; fx += 6) {
      fillRect(ctx, fx, fy, 4, 1, '#141420');
    }
    for (let fx = 3; fx < W; fx += 6) {
      fillRect(ctx, fx, fy + 2, 4, 1, '#141420');
    }
  }

  // --- Floor rivets/bolts ---
  for (let fx = 20; fx < W; fx += 32) {
    fillRect(ctx, fx, 97, 2, 2, '#2a2a35');
  }

  // --- Dim overhead lights ---
  // Center light
  fillRect(ctx, 124, 0, 8, 3, '#222');
  fillRect(ctx, 125, 3, 6, 2, '#333');
  fillRect(ctx, 126, 5, 4, 1, '#445566');
  // Light cone (faint)
  for (let ly = 6; ly < 20; ly++) {
    const spread = Math.floor((ly - 6) * 0.8);
    fillRect(ctx, 127 - spread, ly, 2 + spread * 2, 1, 'rgba(40,50,60,0.08)');
  }

  // Side lights
  for (const lx of [60, 196]) {
    fillRect(ctx, lx, 0, 4, 2, '#222');
    fillRect(ctx, lx, 2, 4, 1, '#334');
  }

  return canvas;
}

// ─── MAIN EXPORT ───

export function generateBattleBackgrounds() {
  return {
    bg_slagworks: makeSlagworks(),
    bg_undercroft: makeUndercroft()
  };
}
