/**
 * Core sprite generation utility.
 * Converts 2D arrays of palette indices into HTMLImageElement objects
 * that can be used with the Renderer's drawSprite/drawTile methods.
 */

/**
 * Draw pixel art from a 2D palette-indexed array onto a canvas.
 * @param {number} width - Pixel width
 * @param {number} height - Pixel height
 * @param {number[][]} pixels - 2D array [row][col] of palette indices (0 = transparent)
 * @param {string[]} palette - Array of CSS color strings. Index 0 is always transparent.
 * @returns {HTMLCanvasElement}
 */
export function drawPixelArt(width, height, pixels, palette) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < height && y < pixels.length; y++) {
    const row = pixels[y];
    for (let x = 0; x < width && x < row.length; x++) {
      const idx = row[x];
      if (idx === 0) continue; // transparent
      ctx.fillStyle = palette[idx];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas;
}

/**
 * Mirror a canvas horizontally.
 * @param {HTMLCanvasElement} source
 * @returns {HTMLCanvasElement}
 */
export function mirrorHorizontal(source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

/**
 * Assemble multiple canvases into a single spritesheet (horizontal strip).
 * @param {HTMLCanvasElement[]} frames - Array of same-sized canvases
 * @returns {HTMLCanvasElement}
 */
export function createSpritesheetH(frames) {
  if (frames.length === 0) return document.createElement('canvas');
  const fw = frames[0].width;
  const fh = frames[0].height;
  const canvas = document.createElement('canvas');
  canvas.width = fw * frames.length;
  canvas.height = fh;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < frames.length; i++) {
    ctx.drawImage(frames[i], i * fw, 0);
  }
  return canvas;
}

/**
 * Assemble frames into a grid spritesheet (rows × columns).
 * @param {HTMLCanvasElement[][]} grid - 2D array [row][col] of canvases
 * @param {number} frameWidth
 * @param {number} frameHeight
 * @returns {HTMLCanvasElement}
 */
export function createSpritesheetGrid(grid, frameWidth, frameHeight) {
  const rows = grid.length;
  const cols = Math.max(...grid.map(r => r.length));
  const canvas = document.createElement('canvas');
  canvas.width = cols * frameWidth;
  canvas.height = rows * frameHeight;
  const ctx = canvas.getContext('2d');
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      ctx.drawImage(grid[r][c], c * frameWidth, r * frameHeight);
    }
  }
  return canvas;
}

/**
 * Recolor a canvas by replacing one palette with another.
 * @param {HTMLCanvasElement} source
 * @param {Object<string, string>} colorMap - { oldColor: newColor } hex pairs
 * @returns {HTMLCanvasElement}
 */
export function recolor(source, colorMap) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Build lookup from hex → RGBA
  const lookup = new Map();
  for (const [oldHex, newHex] of Object.entries(colorMap)) {
    lookup.set(hexToKey(oldHex), parseHex(newHex));
  }

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    const replacement = lookup.get(key);
    if (replacement) {
      data[i] = replacement[0];
      data[i + 1] = replacement[1];
      data[i + 2] = replacement[2];
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Convert a canvas to an HTMLImageElement (async).
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<HTMLImageElement>}
 */
export function canvasToImage(canvas) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to convert canvas to image'));
    img.src = canvas.toDataURL('image/png');
  });
}

/**
 * Draw a filled rectangle on a canvas (for procedural backgrounds).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} color
 */
export function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ─── Helpers ───

function parseHex(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
}

function hexToKey(hex) {
  const [r, g, b] = parseHex(hex);
  return `${r},${g},${b}`;
}
