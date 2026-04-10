/**
 * Gearbreakers — Main entry point.
 * Boots the game, manages the game loop, and wires all systems together.
 */

import { Renderer } from './engine/renderer.js';
import { InputManager } from './engine/input.js';
import { SceneManager } from './engine/sceneManager.js';
import { AssetLoader } from './engine/assetLoader.js';

import { TitleScene } from './scenes/titleScene.js';
import { ExplorationScene } from './scenes/explorationScene.js';
import { BattleScene } from './scenes/battleScene.js';
import { DialogueScene } from './scenes/dialogueScene.js';
import { MenuScene } from './scenes/menuScene.js';

import { ProgressionSystem } from './systems/progression.js';
import { LootSystem } from './systems/loot.js';
import { InventorySystem } from './systems/inventory.js';
import { SaveSystem } from './systems/save.js';

import { PartyMember } from './entities/PartyMember.js';
import { CHARACTERS } from './data/characters.js';
import { getMap } from './data/maps.js';
import { DIALOGUE } from './data/dialogue.js';

class Game {
  constructor() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) throw new Error('Canvas element #game-canvas not found');

    this.renderer = new Renderer(canvas);
    this.input = new InputManager();
    this.sceneManager = new SceneManager();
    this.assets = new AssetLoader();

    // Game systems (initialized on new game / load)
    this.progression = new ProgressionSystem();
    this.loot = new LootSystem();
    this.inventory = null;
    this.party = [];

    // Shared game state
    this.gameState = {
      currentMap: null,
      playerPosition: { x: 0, y: 0 },
      storyFlags: {},
      chestsOpened: [],
      bossesDefeated: [],
      party: [],
      playtime: 0
    };

    // Timing
    this._lastTime = 0;
    this._running = false;
  }

  start() {
    this.input.bind(window);
    this._showTitleScreen();
    this._running = true;
    this._lastTime = performance.now();

    // Use RAF with setInterval fallback for environments where RAF doesn't fire
    // (e.g., hidden tabs, some preview tools)
    const tick = () => {
      if (!this._running) return;
      try {
        const now = performance.now();
        const dt = (now - this._lastTime) / 1000;
        this._lastTime = now;
        this.gameState.playtime += dt;

        this.input.update();
        this.sceneManager.update(dt, this.input);
        this.renderer.clear('#000');
        this.sceneManager.render(this.renderer);
      } catch (e) {
        console.error('[Gearbreakers] Loop error:', e);
        this._running = false;
      }
    };

    // Try RAF first; fall back to setInterval if RAF doesn't fire within 100ms
    let rafFired = false;
    const fallbackTimer = setTimeout(() => {
      if (!rafFired) {
        console.log('[Gearbreakers] RAF unavailable, using setInterval');
        setInterval(tick, 1000 / 60);
      }
    }, 100);

    const rafLoop = () => {
      rafFired = true;
      clearTimeout(fallbackTimer);
      tick();
      if (this._running) requestAnimationFrame(rafLoop);
    };
    requestAnimationFrame(rafLoop);
  }

  // ─── Title Screen ───

  _showTitleScreen() {
    const titleScene = new TitleScene({
      sceneManager: this.sceneManager,
      onNewGame: () => this._startNewGame(),
      onContinue: () => this._showLoadScreen()
    });
    this.sceneManager.clear();
    this.sceneManager.push(titleScene);
  }

  // ─── New Game ───

  _startNewGame() {
    // Create party
    this.party = [
      new PartyMember(CHARACTERS.sable),
      new PartyMember(CHARACTERS.rook),
      new PartyMember(CHARACTERS.pip),
      new PartyMember(CHARACTERS.vesper)
    ];

    // Initialize inventory with starting items
    this.inventory = new InventorySystem();
    this.inventory.addConsumable('health_stim', 5);
    this.inventory.addConsumable('charge_cell', 3);

    // Reset game state
    this.gameState = {
      currentMap: 'boxcar_hollow',
      playerPosition: { x: 5, y: 10 },
      storyFlags: {},
      chestsOpened: [],
      bossesDefeated: [],
      party: this.party,
      playtime: 0
    };

    // Load the starting map
    this._loadMap('boxcar_hollow');

    // Show intro dialogue
    const introDialogue = DIALOGUE['grizzle_intro'];
    if (introDialogue) {
      this._showDialogue(introDialogue);
    }
  }

  // ─── Map Loading ───

  _loadMap(mapId, entryX, entryY) {
    const mapData = getMap(mapId);
    if (!mapData) {
      console.error(`Map not found: ${mapId}`);
      return;
    }

    this.gameState.currentMap = mapId;

    const exploration = new ExplorationScene({
      mapData,
      sceneManager: this.sceneManager,
      gameState: this.gameState,

      onEncounter: (enemyIds) => {
        this._startBattle(enemyIds, false);
      },

      onDialogue: (dialogueNodes) => {
        this._showDialogue(dialogueNodes);
      },

      onMenu: () => {
        this._openMenu();
      },

      onTransition: (transition) => {
        this.sceneManager.pop(); // Remove current exploration
        this._loadMap(transition.targetMap, transition.targetX, transition.targetY);
      },

      onSave: () => {
        this._openMenu(); // Open menu on save tab
      },

      onChest: (contents) => {
        if (contents.scrap) {
          this.inventory.addScrap(contents.scrap);
        }
        if (contents.item) {
          this.inventory.addConsumable(contents.item, contents.count || 1);
        }
        this._showDialogue([
          { speaker: 'System', text: `Found: ${contents.scrap ? contents.scrap + ' Scrap' : contents.item || 'treasure'}!` }
        ]);
      }
    });

    // Set player position
    if (entryX !== undefined && entryY !== undefined) {
      exploration.setPlayerPosition(entryX, entryY);
      this.gameState.playerPosition = { x: entryX, y: entryY };
    }

    this.sceneManager.clear();
    this.sceneManager.push(exploration);
  }

  // ─── Battle ───

  _startBattle(enemyIds, isBoss = false) {
    const battleScene = new BattleScene({
      party: this.party,
      enemyIds,
      isBoss,
      inventory: this.inventory,
      progressionSystem: this.progression,

      onVictory: (rewards) => {
        // Award XP
        const levelUps = this.progression.awardXP(this.party, rewards.xp);
        if (levelUps.length > 0) {
          const messages = levelUps.map(lu =>
            ({ speaker: 'System', text: `${lu.characterId} reached level ${lu.newLevel}!` })
          );
          // Will show after battle scene pops
          this._pendingDialogue = messages;
        }

        // Award scrap
        this.inventory.addScrap(rewards.scrap);

        // Award loot
        if (rewards.loot) {
          for (const item of rewards.loot) {
            if (item.type === 'consumable') {
              this.inventory.addConsumable(item.id, 1);
            } else {
              this.inventory.addItem(item);
            }
          }
        }

        // Check for boss defeat story progression
        if (isBoss) {
          const bossId = enemyIds[0];
          if (!this.gameState.bossesDefeated.includes(bossId)) {
            this.gameState.bossesDefeated.push(bossId);
          }
          if (bossId === 'furnace_rex') {
            this.gameState.storyFlags['slagworks_cleared'] = true;
          }
          if (bossId === 'warden_kael') {
            this.gameState.storyFlags['undercroft_cleared'] = true;
          }
        }

        // Return to exploration
        this.sceneManager.pop();

        // Show level-up messages
        if (this._pendingDialogue) {
          this._showDialogue(this._pendingDialogue);
          this._pendingDialogue = null;
        }
      },

      onDefeat: () => {
        this.sceneManager.pop();
        this._showTitleScreen();
      },

      onFlee: () => {
        this.sceneManager.pop();
      }
    });

    this.sceneManager.push(battleScene);
  }

  // ─── Dialogue ───

  _showDialogue(dialogueNodes) {
    const dialogueScene = new DialogueScene({
      dialogueNodes,
      renderer: this.renderer,
      onComplete: () => {
        this.sceneManager.pop();
      }
    });
    this.sceneManager.push(dialogueScene);
  }

  // ─── Menu ───

  _openMenu() {
    const menuScene = new MenuScene({
      party: this.party,
      inventory: this.inventory,
      progressionSystem: this.progression,
      onClose: () => {
        this.sceneManager.pop();
      }
    });
    this.sceneManager.push(menuScene);
  }

  // ─── Save / Load ───

  _showLoadScreen() {
    const slots = SaveSystem.getSaveSlots();
    // For MVP, just load the first available save
    for (let i = 0; i < SaveSystem.MAX_SLOTS; i++) {
      if (slots[i]) {
        this._loadSave(i);
        return;
      }
    }
  }

  _loadSave(slot) {
    const data = SaveSystem.load(slot);
    if (!data) return;

    // Reconstruct party
    this.party = data.party.map(d => PartyMember.deserialize(d));

    // Reconstruct inventory
    this.inventory = InventorySystem.deserialize(data.inventory);

    // Restore game state
    this.gameState = {
      ...data.gameState,
      party: this.party,
      playtime: data.playtime || 0
    };

    // Load the saved map
    const mapId = data.gameState.currentMap || 'boxcar_hollow';
    const pos = data.gameState.playerPosition || { x: 5, y: 10 };
    this._loadMap(mapId, pos.x, pos.y);
  }
}

// ─── Boot ───
function boot() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas || canvas.dataset.booted) return;
  canvas.dataset.booted = 'true';
  try {
    const game = new Game();
    game.start();
  } catch (e) {
    console.error('[Gearbreakers] Boot failed:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
