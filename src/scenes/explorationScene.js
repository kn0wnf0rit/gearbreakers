/**
 * Exploration scene: tile-based map rendering, player movement,
 * NPC interaction, random encounters, and map transitions.
 */

import { BASE_WIDTH, BASE_HEIGHT, TILE_SIZE } from '../engine/renderer.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { EncounterSystem } from '../systems/encounter.js';
import { ENCOUNTER_TABLES } from '../data/enemies.js';
import { DIALOGUE } from '../data/dialogue.js';

export class ExplorationScene {
  /**
   * @param {object} config
   * @param {object} config.mapData - Map definition from maps.js
   * @param {object} config.sceneManager - SceneManager instance
   * @param {object} config.gameState - Shared game state object
   * @param {Function} config.onEncounter - Called with enemy ID array when encounter triggers
   * @param {Function} config.onDialogue - Called with dialogue nodes array
   * @param {Function} config.onMenu - Called when player presses menu button
   * @param {Function} config.onTransition - Called with transition data for map changes
   * @param {Function} config.onSave - Called when player interacts with save terminal
   * @param {Function} config.onChest - Called with chest data when opening a chest
   */
  constructor({ mapData, sceneManager, gameState, onEncounter, onDialogue, onMenu, onTransition, onSave, onChest }) {
    this.mapData = mapData;
    this.sceneManager = sceneManager;
    this.gameState = gameState;
    this.onEncounter = onEncounter;
    this.onDialogue = onDialogue;
    this.onMenu = onMenu;
    this.onTransition = onTransition;
    this.onSave = onSave;
    this.onChest = onChest;

    // Player entity
    const start = mapData.playerStart || { x: 1, y: 1 };
    this.player = new Player({ x: start.x, y: start.y, speed: 2 });

    // NPCs
    this.npcs = (mapData.npcs || []).map(def => new NPC(def));

    // Encounter system (null for towns)
    this.encounterSystem = null;
    if (mapData.encounterTable && ENCOUNTER_TABLES[mapData.encounterTable]) {
      this.encounterSystem = new EncounterSystem({
        encounterTable: ENCOUNTER_TABLES[mapData.encounterTable],
        minSteps: 15,
        maxSteps: 25
      });
    }

    this._paused = false;
  }

  onEnter() {
    this._paused = false;
  }

  onExit() {}

  onPause() {
    this._paused = true;
  }

  onResume() {
    this._paused = false;
  }

  /**
   * @param {number} dt
   * @param {object} input - InputManager
   */
  update(dt, input) {
    if (this._paused) return;

    // Menu button
    if (input.isPressed('menu')) {
      if (this.onMenu) this.onMenu();
      return;
    }

    // Movement
    if (!this.player.isMoving) {
      let direction = null;
      if (input.isHeld('up')) direction = 'up';
      else if (input.isHeld('down')) direction = 'down';
      else if (input.isHeld('left')) direction = 'left';
      else if (input.isHeld('right')) direction = 'right';

      if (direction) {
        const moved = this.player.tryMove(direction, this.mapData);
        if (moved && this.encounterSystem) {
          const triggered = this.encounterSystem.step();
          if (triggered) {
            const enemies = this.encounterSystem.rollEncounter();
            this.encounterSystem.reset();
            if (this.onEncounter) this.onEncounter(enemies);
            return;
          }
        }
      }

      // Interact button — check NPCs, chests, save terminals, transitions
      if (input.isPressed('confirm')) {
        this._handleInteraction();
      }
    }

    // Update player smooth movement
    this.player.update(dt);

    // Check tile transitions (step onto transition tile)
    if (!this.player.isMoving) {
      this._checkTransition();
    }
  }

  /**
   * @param {object} renderer - Renderer
   */
  render(renderer) {
    // Center camera on player
    const mapPixelW = this.mapData.width * TILE_SIZE;
    const mapPixelH = this.mapData.height * TILE_SIZE;
    const worldPos = this.player.getWorldPosition();
    renderer.centerCamera(
      worldPos.x + TILE_SIZE / 2,
      worldPos.y + TILE_SIZE / 2,
      mapPixelW,
      mapPixelH
    );

    // Render tiles
    this._renderTiles(renderer);

    // Render NPCs
    for (const npc of this.npcs) {
      this._renderNPC(renderer, npc);
    }

    // Render interactables (chests, save terminals)
    this._renderInteractables(renderer);

    // Render player
    this._renderPlayer(renderer);

    // Render HUD
    this._renderHUD(renderer);
  }

  /**
   * Set player position (for map transitions / load game).
   */
  setPlayerPosition(gridX, gridY) {
    this.player.setPosition(gridX, gridY);
  }

  // ─── Private ───

  _handleInteraction() {
    const px = this.player.gridX;
    const py = this.player.gridY;
    const facing = this.player.facing;

    // Calculate the tile the player is facing
    const dx = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
    const dy = facing === 'up' ? -1 : facing === 'down' ? 1 : 0;
    const tx = px + dx;
    const ty = py + dy;

    // Check NPCs
    for (const npc of this.npcs) {
      if (npc.gridX === tx && npc.gridY === ty) {
        npc.faceToward(px, py);
        const dialogueNodes = DIALOGUE[npc.dialogueId];
        if (dialogueNodes && this.onDialogue) {
          this.onDialogue(dialogueNodes);
        }
        return;
      }
    }

    // Check interactables
    if (this.mapData.interactables) {
      for (const obj of this.mapData.interactables) {
        if (obj.gridX === tx && obj.gridY === ty) {
          if (obj.type === 'save_terminal') {
            if (this.onSave) this.onSave();
            return;
          }
          if (obj.type === 'chest') {
            if (this.gameState.chestsOpened && !this.gameState.chestsOpened.includes(obj.id)) {
              this.gameState.chestsOpened.push(obj.id);
              if (this.onChest) this.onChest(obj.contents);
            }
            return;
          }
        }
      }
    }
  }

  _checkTransition() {
    if (!this.mapData.transitions) return;
    const px = this.player.gridX;
    const py = this.player.gridY;

    for (const t of this.mapData.transitions) {
      if (t.gridX === px && t.gridY === py) {
        // Check requirements
        if (t.requires && this.gameState.storyFlags && !this.gameState.storyFlags[t.requires]) {
          return; // locked
        }
        if (this.onTransition) {
          this.onTransition(t);
        }
        return;
      }
    }
  }

  _renderTiles(renderer) {
    const camX = renderer.camera.x;
    const camY = renderer.camera.y;

    // Only render visible tiles
    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
    const endCol = Math.min(this.mapData.width, Math.ceil((camX + BASE_WIDTH) / TILE_SIZE) + 1);
    const endRow = Math.min(this.mapData.height, Math.ceil((camY + BASE_HEIGHT) / TILE_SIZE) + 1);

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tile = this.mapData.tiles[row]?.[col] ?? 1;
        const color = this._getTileColor(tile);
        const worldX = col * TILE_SIZE;
        const worldY = row * TILE_SIZE;
        const screenX = worldX - camX;
        const screenY = worldY - camY;
        renderer.drawRect(screenX, screenY, TILE_SIZE, TILE_SIZE, color);

        // Tile border for walls
        if (tile === 1) {
          renderer.drawRectOutline(screenX, screenY, TILE_SIZE, TILE_SIZE, '#333');
        }
      }
    }
  }

  _getTileColor(tileId) {
    switch (tileId) {
      case 0: return '#2a2a3a'; // floor
      case 1: return '#1a1a2a'; // wall
      case 2: return '#2a3a2a'; // interactable
      case 3: return '#3a2a2a'; // transition
      case 4: return '#3a3a1a'; // hazard
      default: return '#1a1a2a';
    }
  }

  _renderPlayer(renderer) {
    const worldPos = this.player.getWorldPosition();
    const screenX = worldPos.x - renderer.camera.x;
    const screenY = worldPos.y - renderer.camera.y;

    // Placeholder: colored rectangle for the player
    renderer.drawRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4, '#4488ff');

    // Direction indicator
    const cx = screenX + TILE_SIZE / 2;
    const cy = screenY + TILE_SIZE / 2;
    const indicatorSize = 2;
    let ix = cx, iy = cy;
    switch (this.player.facing) {
      case 'up': iy = screenY + 1; break;
      case 'down': iy = screenY + TILE_SIZE - 3; break;
      case 'left': ix = screenX + 1; break;
      case 'right': ix = screenX + TILE_SIZE - 3; break;
    }
    renderer.drawRect(ix - indicatorSize / 2, iy - indicatorSize / 2, indicatorSize, indicatorSize, '#fff');
  }

  _renderNPC(renderer, npc) {
    const screenX = npc.gridX * TILE_SIZE - renderer.camera.x;
    const screenY = npc.gridY * TILE_SIZE - renderer.camera.y;

    // Only render if on screen
    if (screenX < -TILE_SIZE || screenX > BASE_WIDTH || screenY < -TILE_SIZE || screenY > BASE_HEIGHT) return;

    renderer.drawRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4, '#ffaa00');
    renderer.drawText(npc.name[0], screenX + 4, screenY + 3, { color: '#000', size: 7 });
  }

  _renderInteractables(renderer) {
    if (!this.mapData.interactables) return;

    for (const obj of this.mapData.interactables) {
      const screenX = obj.gridX * TILE_SIZE - renderer.camera.x;
      const screenY = obj.gridY * TILE_SIZE - renderer.camera.y;
      if (screenX < -TILE_SIZE || screenX > BASE_WIDTH || screenY < -TILE_SIZE || screenY > BASE_HEIGHT) continue;

      if (obj.type === 'save_terminal') {
        renderer.drawRect(screenX + 3, screenY + 3, TILE_SIZE - 6, TILE_SIZE - 6, '#00ff88');
        renderer.drawText('S', screenX + 5, screenY + 3, { color: '#000', size: 7 });
      } else if (obj.type === 'chest') {
        const opened = this.gameState.chestsOpened?.includes(obj.id);
        const color = opened ? '#555' : '#ffcc00';
        renderer.drawRect(screenX + 3, screenY + 3, TILE_SIZE - 6, TILE_SIZE - 6, color);
        renderer.drawText(opened ? 'o' : 'C', screenX + 5, screenY + 3, { color: '#000', size: 7 });
      }
    }
  }

  _renderHUD(renderer) {
    if (!this.gameState.party) return;

    const hudY = BASE_HEIGHT - 28;
    renderer.drawRect(0, hudY, BASE_WIDTH, 28, 'rgba(0, 0, 0, 0.7)');

    const party = this.gameState.party;
    const memberWidth = Math.floor(BASE_WIDTH / party.length);

    for (let i = 0; i < party.length; i++) {
      const m = party[i];
      const x = i * memberWidth + 4;
      renderer.drawText(m.name, x, hudY + 2, { color: '#ccc', size: 6 });
      renderer.drawBar(x, hudY + 10, memberWidth - 12, 4, m.currentHP, m.maxHP, '#0a0', '#333');
      renderer.drawBar(x, hudY + 16, memberWidth - 12, 3, m.currentCharge, m.maxCharge, '#08f', '#333');
    }
  }
}
