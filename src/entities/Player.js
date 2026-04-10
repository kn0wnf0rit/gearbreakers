/**
 * Overworld player entity. Handles grid-based movement with smooth pixel interpolation.
 */

import { TILE_SIZE } from '../engine/renderer.js';

const DIRECTION_OFFSETS = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
};

export class Player {
  /**
   * @param {object} options
   * @param {number} options.x - Starting grid X
   * @param {number} options.y - Starting grid Y
   * @param {number} [options.speed=2] - Pixels per frame at base resolution
   */
  constructor({ x, y, speed = 2 }) {
    this.gridX = x;
    this.gridY = y;
    this.pixelX = x * TILE_SIZE;
    this.pixelY = y * TILE_SIZE;
    this.speed = speed;
    this.facing = 'down';
    this.isMoving = false;
    this.spriteId = 'player';

    // Movement animation state
    this._targetPixelX = this.pixelX;
    this._targetPixelY = this.pixelY;
    this._startPixelX = this.pixelX;
    this._startPixelY = this.pixelY;
    this._moveProgress = 0;
  }

  /**
   * Attempt to move one tile in a direction.
   * Checks collision with map walls and bounds.
   * @param {'up'|'down'|'left'|'right'} direction
   * @param {object} mapData - Map object with width, height, and tiles[y][x]
   * @returns {boolean} True if movement started
   */
  tryMove(direction, mapData) {
    if (this.isMoving) return false;

    this.facing = direction;

    const offset = DIRECTION_OFFSETS[direction];
    if (!offset) return false;

    const newGridX = this.gridX + offset.dx;
    const newGridY = this.gridY + offset.dy;

    // Bounds check
    if (newGridX < 0 || newGridX >= mapData.width || newGridY < 0 || newGridY >= mapData.height) {
      return false;
    }

    // Collision check — tile value 1 is a wall
    const tile = mapData.tiles[newGridY][newGridX];
    if (tile === 1) {
      return false;
    }

    // Begin smooth movement
    this.isMoving = true;
    this._startPixelX = this.pixelX;
    this._startPixelY = this.pixelY;
    this._targetPixelX = newGridX * TILE_SIZE;
    this._targetPixelY = newGridY * TILE_SIZE;
    this._moveProgress = 0;
    this.gridX = newGridX;
    this.gridY = newGridY;

    return true;
  }

  /**
   * Update pixel position during smooth movement.
   * @param {number} dt - Delta time (not used directly; speed is per-frame)
   */
  update(dt) {
    if (!this.isMoving) return;

    this._moveProgress += this.speed;
    const totalDist = TILE_SIZE;

    if (this._moveProgress >= totalDist) {
      // Movement complete
      this.pixelX = this._targetPixelX;
      this.pixelY = this._targetPixelY;
      this.isMoving = false;
      this._moveProgress = 0;
    } else {
      // Lerp between start and target
      const t = this._moveProgress / totalDist;
      this.pixelX = this._startPixelX + (this._targetPixelX - this._startPixelX) * t;
      this.pixelY = this._startPixelY + (this._targetPixelY - this._startPixelY) * t;
    }
  }

  /**
   * Get the player's world position in pixel coordinates.
   * @returns {{ x: number, y: number }}
   */
  getWorldPosition() {
    return { x: this.pixelX, y: this.pixelY };
  }

  /**
   * Teleport the player to a grid position immediately.
   * @param {number} gridX
   * @param {number} gridY
   */
  setPosition(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.pixelX = gridX * TILE_SIZE;
    this.pixelY = gridY * TILE_SIZE;
    this._targetPixelX = this.pixelX;
    this._targetPixelY = this.pixelY;
    this.isMoving = false;
    this._moveProgress = 0;
  }

  /**
   * Check if the player is currently on a specific tile.
   * @param {number} gridX
   * @param {number} gridY
   * @returns {boolean}
   */
  isOnTile(gridX, gridY) {
    return this.gridX === gridX && this.gridY === gridY;
  }
}
