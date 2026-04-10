/**
 * Canvas renderer. Handles pixel-scaled rendering, sprite drawing, and camera.
 */

export const BASE_WIDTH = 256;
export const BASE_HEIGHT = 224;
export const SCALE = 3;
export const TILE_SIZE = 16;

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = BASE_WIDTH * SCALE;
    this.canvas.height = BASE_HEIGHT * SCALE;
    this.ctx.imageSmoothingEnabled = false;

    this.camera = { x: 0, y: 0 };
    this._spriteCache = new Map();
  }

  /** Clear the entire canvas. */
  clear(color = '#000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a sprite from a spritesheet.
   * @param {HTMLImageElement} image - The spritesheet image
   * @param {number} sx - Source x in the spritesheet
   * @param {number} sy - Source y in the spritesheet
   * @param {number} sw - Source width
   * @param {number} sh - Source height
   * @param {number} dx - Destination x in world coords
   * @param {number} dy - Destination y in world coords
   * @param {number} dw - Destination width in base pixels (pre-scale)
   * @param {number} dh - Destination height in base pixels (pre-scale)
   */
  drawSprite(image, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh) {
    const screenX = (dx - this.camera.x) * SCALE;
    const screenY = (dy - this.camera.y) * SCALE;
    this.ctx.drawImage(image, sx, sy, sw, sh, screenX, screenY, dw * SCALE, dh * SCALE);
  }

  /**
   * Draw a tile from a tileset at grid coordinates.
   * @param {HTMLImageElement} tileset
   * @param {number} tileId - Tile index in the tileset (row-major)
   * @param {number} gridX - Grid x position
   * @param {number} gridY - Grid y position
   * @param {number} tilesetColumns - Number of columns in the tileset
   */
  drawTile(tileset, tileId, gridX, gridY, tilesetColumns = 16) {
    const sx = (tileId % tilesetColumns) * TILE_SIZE;
    const sy = Math.floor(tileId / tilesetColumns) * TILE_SIZE;
    this.drawSprite(tileset, sx, sy, TILE_SIZE, TILE_SIZE, gridX * TILE_SIZE, gridY * TILE_SIZE);
  }

  /**
   * Draw text at a position (in base resolution coordinates).
   * @param {string} text
   * @param {number} x - Base resolution x
   * @param {number} y - Base resolution y
   * @param {object} options
   */
  drawText(text, x, y, { color = '#fff', size = 8, font = 'monospace', align = 'left' } = {}) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size * SCALE}px ${font}`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x * SCALE, y * SCALE);
  }

  /**
   * Draw a filled rectangle (in base resolution coordinates).
   */
  drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
  }

  /**
   * Draw a rectangle outline (in base resolution coordinates).
   */
  drawRectOutline(x, y, w, h, color, lineWidth = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth * SCALE;
    this.ctx.strokeRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
  }

  /**
   * Draw an HP/Charge bar.
   * @param {number} x - Base x
   * @param {number} y - Base y
   * @param {number} w - Total width
   * @param {number} h - Height
   * @param {number} current - Current value
   * @param {number} max - Max value
   * @param {string} fillColor - Fill color
   * @param {string} bgColor - Background color
   */
  drawBar(x, y, w, h, current, max, fillColor = '#0f0', bgColor = '#333') {
    this.drawRect(x, y, w, h, bgColor);
    const fillW = max > 0 ? (current / max) * w : 0;
    this.drawRect(x, y, fillW, h, fillColor);
    this.drawRectOutline(x, y, w, h, '#fff');
  }

  /**
   * Center camera on a world position, clamped to map bounds.
   * @param {number} worldX - Target x in base pixels
   * @param {number} worldY - Target y in base pixels
   * @param {number} mapWidth - Map width in base pixels
   * @param {number} mapHeight - Map height in base pixels
   */
  centerCamera(worldX, worldY, mapWidth, mapHeight) {
    this.camera.x = Math.max(0, Math.min(worldX - BASE_WIDTH / 2, mapWidth - BASE_WIDTH));
    this.camera.y = Math.max(0, Math.min(worldY - BASE_HEIGHT / 2, mapHeight - BASE_HEIGHT));
  }

  /** Get base resolution width. */
  get width() { return BASE_WIDTH; }

  /** Get base resolution height. */
  get height() { return BASE_HEIGHT; }
}
