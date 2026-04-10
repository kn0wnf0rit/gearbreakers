/**
 * Tests for Player entity.
 */

import { Player } from '../../src/entities/Player.js';
import { TILE_SIZE } from '../../src/engine/renderer.js';

// A small test map: 5x5, walls on borders, floor inside
function makeTestMap() {
  const tiles = [];
  for (let y = 0; y < 5; y++) {
    tiles[y] = [];
    for (let x = 0; x < 5; x++) {
      tiles[y][x] = (x === 0 || x === 4 || y === 0 || y === 4) ? 1 : 0;
    }
  }
  return { width: 5, height: 5, tiles };
}

describe('Player', () => {
  let player;
  let mapData;

  beforeEach(() => {
    player = new Player({ x: 2, y: 2, speed: 2 });
    mapData = makeTestMap();
  });

  describe('initial position', () => {
    test('sets grid position correctly', () => {
      expect(player.gridX).toBe(2);
      expect(player.gridY).toBe(2);
    });

    test('sets pixel position from grid position', () => {
      expect(player.pixelX).toBe(2 * TILE_SIZE);
      expect(player.pixelY).toBe(2 * TILE_SIZE);
    });

    test('defaults to facing down', () => {
      expect(player.facing).toBe('down');
    });

    test('is not moving initially', () => {
      expect(player.isMoving).toBe(false);
    });
  });

  describe('tryMove', () => {
    test('succeeds on floor tiles', () => {
      const result = player.tryMove('up', mapData);
      expect(result).toBe(true);
      expect(player.gridX).toBe(2);
      expect(player.gridY).toBe(1);
      expect(player.isMoving).toBe(true);
    });

    test('fails on wall tiles', () => {
      // Move to (1,2) first — floor
      player.tryMove('left', mapData);
      // Complete the movement
      for (let i = 0; i < TILE_SIZE; i++) player.update(16);

      // Now at (1,2), try moving left into wall at (0,2)
      const result = player.tryMove('left', mapData);
      expect(result).toBe(false);
    });

    test('fails on out-of-bounds', () => {
      player.setPosition(0, 0);
      const result = player.tryMove('up', mapData);
      expect(result).toBe(false);

      const result2 = player.tryMove('left', mapData);
      expect(result2).toBe(false);
    });

    test('fails while already moving', () => {
      player.tryMove('up', mapData);
      expect(player.isMoving).toBe(true);
      const result = player.tryMove('down', mapData);
      expect(result).toBe(false);
    });

    test('updates facing direction even on blocked move', () => {
      player.setPosition(1, 1);
      player.tryMove('left', mapData); // wall at (0,1)
      expect(player.facing).toBe('left');
    });
  });

  describe('update (smooth movement)', () => {
    test('updates pixel position during movement', () => {
      player.tryMove('right', mapData);
      const startPixelX = 2 * TILE_SIZE;

      player.update(16);
      expect(player.pixelX).toBeGreaterThan(startPixelX);
      expect(player.isMoving).toBe(true);
    });

    test('completes movement after enough updates', () => {
      player.tryMove('right', mapData);
      const targetX = 3 * TILE_SIZE;

      // With speed=2, need TILE_SIZE/speed = 8 frames to complete
      for (let i = 0; i < TILE_SIZE; i++) {
        player.update(16);
      }

      expect(player.pixelX).toBe(targetX);
      expect(player.isMoving).toBe(false);
    });

    test('does nothing when not moving', () => {
      const px = player.pixelX;
      const py = player.pixelY;
      player.update(16);
      expect(player.pixelX).toBe(px);
      expect(player.pixelY).toBe(py);
    });
  });

  describe('isOnTile', () => {
    test('returns true for current tile', () => {
      expect(player.isOnTile(2, 2)).toBe(true);
    });

    test('returns false for different tile', () => {
      expect(player.isOnTile(3, 3)).toBe(false);
    });

    test('reflects position after tryMove', () => {
      player.tryMove('down', mapData);
      expect(player.isOnTile(2, 3)).toBe(true);
      expect(player.isOnTile(2, 2)).toBe(false);
    });
  });

  describe('setPosition', () => {
    test('teleports to a new grid position', () => {
      player.setPosition(1, 3);
      expect(player.gridX).toBe(1);
      expect(player.gridY).toBe(3);
      expect(player.pixelX).toBe(1 * TILE_SIZE);
      expect(player.pixelY).toBe(3 * TILE_SIZE);
    });

    test('cancels any in-progress movement', () => {
      player.tryMove('up', mapData);
      expect(player.isMoving).toBe(true);

      player.setPosition(3, 3);
      expect(player.isMoving).toBe(false);
      expect(player.gridX).toBe(3);
      expect(player.gridY).toBe(3);
    });
  });

  describe('getWorldPosition', () => {
    test('returns pixel coordinates', () => {
      const pos = player.getWorldPosition();
      expect(pos).toEqual({ x: 2 * TILE_SIZE, y: 2 * TILE_SIZE });
    });
  });
});
