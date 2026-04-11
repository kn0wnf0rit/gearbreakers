/**
 * Battle scene: renders side-view combat, handles player input for actions,
 * delegates logic to CombatEngine.
 */

import { BASE_WIDTH, BASE_HEIGHT } from '../engine/renderer.js';
import { CombatEngine } from '../systems/combat.js';
import { Enemy } from '../entities/Enemy.js';
import { ENEMIES, BOSSES } from '../data/enemies.js';
import { SeededRNG } from '../engine/utils.js';

const BATTLE_STATES = {
  START: 'start',
  PLAYER_TURN: 'player_turn',
  SKILL_SELECT: 'skill_select',
  ITEM_SELECT: 'item_select',
  TARGET_SELECT: 'target_select',
  ENEMY_TURN: 'enemy_turn',
  ANIMATING: 'animating',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
};

export class BattleScene {
  /**
   * @param {object} config
   * @param {Array} config.party - Array of PartyMember instances
   * @param {Array} config.enemyIds - Array of enemy definition IDs
   * @param {boolean} config.isBoss - Whether this is a boss fight
   * @param {object} config.inventory - InventorySystem instance
   * @param {object} config.progressionSystem - ProgressionSystem instance
   * @param {Function} config.onVictory - Called with { xp, scrap, loot } on win
   * @param {Function} config.onDefeat - Called on party wipe
   * @param {Function} config.onFlee - Called on successful flee
   */
  constructor({ party, enemyIds, isBoss = false, inventory, progressionSystem, assets, mapId, onVictory, onDefeat, onFlee }) {
    this.party = party;
    this.inventory = inventory;
    this.progressionSystem = progressionSystem;
    this.assets = assets || null;
    this.mapId = mapId || '';
    this.onVictory = onVictory;
    this.onDefeat = onDefeat;
    this.onFlee = onFlee;

    // Create enemy instances
    this.enemies = enemyIds.map(id => {
      const def = BOSSES[id] || ENEMIES[id];
      if (!def) throw new Error(`Unknown enemy: ${id}`);
      return new Enemy(def);
    });

    this.isBoss = isBoss;

    // Combat engine
    this.combat = new CombatEngine({
      party: this.party,
      enemies: this.enemies,
      isBoss: this.isBoss,
      rng: new SeededRNG()
    });

    // UI state
    this.state = BATTLE_STATES.START;
    this.menuIndex = 0;
    this.skillList = [];
    this.skillIndex = 0;
    this.itemList = [];
    this.itemIndex = 0;
    this.targetList = [];
    this.targetIndex = 0;
    this._pendingAction = null;

    // Animation
    this._animTimer = 0;
    this._animDuration = 0.5; // seconds
    this._actionResult = null;
    this._message = '';
    this._messageTimer = 0;

    // Victory screen
    this._rewards = null;
    this._victoryTimer = 0;
  }

  onEnter() {
    this.combat.startBattle();
    this._advanceToNextTurn();
  }

  onExit() {}
  onPause() {}
  onResume() {}

  update(dt, input) {
    // Message display timer
    if (this._messageTimer > 0) {
      this._messageTimer -= dt;
      if (this._messageTimer <= 0) {
        this._message = '';
      }
      return; // Block input during message display
    }

    switch (this.state) {
      case BATTLE_STATES.PLAYER_TURN:
        this._updatePlayerTurn(input);
        break;
      case BATTLE_STATES.SKILL_SELECT:
        this._updateSkillSelect(input);
        break;
      case BATTLE_STATES.ITEM_SELECT:
        this._updateItemSelect(input);
        break;
      case BATTLE_STATES.TARGET_SELECT:
        this._updateTargetSelect(input);
        break;
      case BATTLE_STATES.ANIMATING:
        this._updateAnimation(dt);
        break;
      case BATTLE_STATES.ENEMY_TURN:
        this._processEnemyTurn();
        break;
      case BATTLE_STATES.VICTORY:
        this._updateVictory(dt, input);
        break;
      case BATTLE_STATES.DEFEAT:
        if (input.isPressed('confirm')) {
          if (this.onDefeat) this.onDefeat();
        }
        break;
    }
  }

  render(renderer) {
    renderer.clear('#0f0f1a');

    // Battle background
    const bgKey = this.mapId.startsWith('undercroft') ? 'bg_undercroft' : 'bg_slagworks';
    const bg = this.assets && this.assets.get(bgKey);
    if (bg) {
      renderer.drawRect(0, 0, BASE_WIDTH, 140, '#000');
      renderer.ctx.drawImage(bg, 0, 0);
    }

    // Battle field
    this._renderEnemies(renderer);
    this._renderParty(renderer);

    // UI panel
    this._renderBattleUI(renderer);

    // Message overlay
    if (this._message) {
      renderer.drawRect(20, 70, BASE_WIDTH - 40, 20, 'rgba(0,0,0,0.85)');
      renderer.drawText(this._message, BASE_WIDTH / 2, 74, {
        color: '#ffcc00', size: 8, align: 'center'
      });
    }
  }

  // ─── Turn Management ───

  _advanceToNextTurn() {
    const result = this.combat.checkBattleEnd();
    if (result.ended) {
      if (result.result === 'victory') {
        this._rewards = this.combat.calculateRewards();
        this.state = BATTLE_STATES.VICTORY;
        this._victoryTimer = 0;
      } else {
        this.state = BATTLE_STATES.DEFEAT;
      }
      return;
    }

    this.combat.advanceTurn();
    const current = this.combat.getCurrentTurnEntity();

    if (!current) {
      // All entities acted this round — new round
      this.combat.advanceTurn();
      this._advanceToNextTurn();
      return;
    }

    if (current.isPartyMember) {
      this.state = BATTLE_STATES.PLAYER_TURN;
      this.menuIndex = 0;
    } else {
      this.state = BATTLE_STATES.ENEMY_TURN;
    }
  }

  // ─── Player Turn ───

  _getMenuOptions() {
    const actions = this.combat.getAvailableActions(this.combat.getCurrentTurnEntity());
    return actions.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), action: a }));
  }

  _updatePlayerTurn(input) {
    const options = this._getMenuOptions();

    if (input.isPressed('up')) this.menuIndex = Math.max(0, this.menuIndex - 1);
    if (input.isPressed('down')) this.menuIndex = Math.min(options.length - 1, this.menuIndex + 1);

    if (input.isPressed('confirm')) {
      const selected = options[this.menuIndex];
      switch (selected.action) {
        case 'attack':
          this._pendingAction = { type: 'attack' };
          this._setupTargetSelect(this._getAliveEnemies());
          break;
        case 'skill':
          this._setupSkillSelect();
          break;
        case 'item':
          this._setupItemSelect();
          break;
        case 'defend':
          this._executeAction({ type: 'defend' });
          break;
        case 'flee':
          this._executeAction({ type: 'flee' });
          break;
      }
    }
  }

  // ─── Skill Select ───

  _setupSkillSelect() {
    const current = this.combat.getCurrentTurnEntity();
    this.skillList = this.progressionSystem
      ? this.progressionSystem.getAvailableSkills(current)
      : [];
    this.skillIndex = 0;
    this.state = BATTLE_STATES.SKILL_SELECT;
  }

  _updateSkillSelect(input) {
    if (input.isPressed('cancel')) {
      this.state = BATTLE_STATES.PLAYER_TURN;
      return;
    }
    if (this.skillList.length === 0) return;

    if (input.isPressed('up')) this.skillIndex = Math.max(0, this.skillIndex - 1);
    if (input.isPressed('down')) this.skillIndex = Math.min(this.skillList.length - 1, this.skillIndex + 1);

    if (input.isPressed('confirm')) {
      const skill = this.skillList[this.skillIndex];
      const current = this.combat.getCurrentTurnEntity();
      if (current.currentCharge >= skill.chargeCost) {
        this._pendingAction = { type: 'skill', skillId: skill.id };

        if (skill.target === 'single_enemy') {
          this._setupTargetSelect(this._getAliveEnemies());
        } else if (skill.target === 'single_ally' || skill.target === 'single_ally_ko') {
          this._setupTargetSelect(this.party);
        } else {
          // AoE or self — no target needed
          this._executeAction(this._pendingAction);
        }
      }
    }
  }

  // ─── Item Select ───

  _setupItemSelect() {
    this.itemList = Object.entries(this.inventory.consumables)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => ({ id, count }));
    this.itemIndex = 0;
    this.state = BATTLE_STATES.ITEM_SELECT;
  }

  _updateItemSelect(input) {
    if (input.isPressed('cancel')) {
      this.state = BATTLE_STATES.PLAYER_TURN;
      return;
    }
    if (this.itemList.length === 0) return;

    if (input.isPressed('up')) this.itemIndex = Math.max(0, this.itemIndex - 1);
    if (input.isPressed('down')) this.itemIndex = Math.min(this.itemList.length - 1, this.itemIndex + 1);

    if (input.isPressed('confirm')) {
      const item = this.itemList[this.itemIndex];
      this._pendingAction = { type: 'item', itemId: item.id };
      this._setupTargetSelect(this.party);
    }
  }

  // ─── Target Select ───

  _setupTargetSelect(targets) {
    this.targetList = targets.filter(t => t.currentHP > 0 || this._pendingAction?.type === 'item');
    this.targetIndex = 0;
    this.state = BATTLE_STATES.TARGET_SELECT;
  }

  _updateTargetSelect(input) {
    if (input.isPressed('cancel')) {
      this.state = BATTLE_STATES.PLAYER_TURN;
      return;
    }

    if (input.isPressed('up')) this.targetIndex = Math.max(0, this.targetIndex - 1);
    if (input.isPressed('down')) this.targetIndex = Math.min(this.targetList.length - 1, this.targetIndex + 1);

    if (input.isPressed('confirm')) {
      const target = this.targetList[this.targetIndex];
      this._pendingAction.target = target;
      this._executeAction(this._pendingAction);
    }
  }

  // ─── Action Execution ───

  _executeAction(action) {
    const result = this.combat.executeAction(action);
    this._actionResult = result;
    this._pendingAction = null;

    // Build message
    if (result) {
      if (result.fled) {
        if (this.onFlee) this.onFlee();
        return;
      }
      if (result.fleeFailed) {
        this._message = 'Couldn\'t escape!';
      } else if (result.defended) {
        this._message = `${result.actor} is defending.`;
      } else if (result.damage !== undefined) {
        const critText = result.isCrit ? ' CRITICAL!' : '';
        const elemText = result.elementEffect === 'strong' ? ' Super effective!' :
                         result.elementEffect === 'weak' ? ' Not very effective...' : '';
        this._message = `${result.actor} deals ${result.damage} damage!${critText}${elemText}`;
      } else if (result.healed) {
        this._message = `${result.actor} heals ${result.target} for ${result.healAmount}!`;
      } else {
        this._message = `${result.actor} acts!`;
      }
    }

    this._messageTimer = 1.0;
    this.state = BATTLE_STATES.ANIMATING;
    this._animTimer = 0;
  }

  // ─── Enemy Turn ───

  _processEnemyTurn() {
    const current = this.combat.getCurrentTurnEntity();
    if (!current || current.isPartyMember) {
      this._advanceToNextTurn();
      return;
    }

    const battleState = this.combat.getBattleState();
    const action = current.chooseAction(battleState);
    const result = this.combat.executeAction(action);
    this._actionResult = result;

    if (result && result.damage !== undefined) {
      this._message = `${current.name} attacks ${result.target} for ${result.damage}!`;
    } else {
      this._message = `${current.name} acts!`;
    }

    this._messageTimer = 0.8;
    this.state = BATTLE_STATES.ANIMATING;
    this._animTimer = 0;
  }

  // ─── Animation ───

  _updateAnimation(dt) {
    this._animTimer += dt;
    if (this._animTimer >= this._animDuration && this._messageTimer <= 0) {
      this._advanceToNextTurn();
    }
  }

  // ─── Victory ───

  _updateVictory(dt, input) {
    this._victoryTimer += dt;
    if (input.isPressed('confirm') && this._victoryTimer > 0.5) {
      // Award XP and loot
      if (this._rewards && this.onVictory) {
        this.onVictory(this._rewards);
      }
    }
  }

  // ─── Helpers ───

  _getAliveEnemies() {
    return this.enemies.filter(e => e.currentHP > 0);
  }

  // ─── Rendering ───

  _renderEnemies(renderer) {
    const aliveEnemies = this.enemies.filter(e => e.currentHP > 0);
    const spacing = Math.min(50, (BASE_WIDTH / 2 - 20) / Math.max(1, aliveEnemies.length));

    for (let i = 0; i < aliveEnemies.length; i++) {
      const e = aliveEnemies[i];
      const spriteW = e.isBoss ? 32 : 24;
      const spriteH = e.isBoss ? 32 : 24;
      const x = 20 + i * spacing;
      const y = (e.isBoss ? 30 : 40) + (i % 2) * 25;

      const sprite = this.assets && this.assets.get(e.spriteId);
      if (sprite) {
        // Idle frame at sx=0, attack frame at sx=spriteW
        renderer.ctx.drawImage(sprite, 0, 0, spriteW, spriteH,
          x * 3, y * 3, spriteW * 3, spriteH * 3);
      } else {
        const color = e.isBoss ? '#ff4444' : '#cc6666';
        renderer.drawRect(x, y, spriteW, spriteH, color);
        renderer.drawRectOutline(x, y, spriteW, spriteH, '#fff');
        renderer.drawText(e.name.substring(0, 3), x + 2, y + 8, { color: '#fff', size: 6 });
      }

      // HP bar
      renderer.drawBar(x, y + spriteH + 2, spriteW, 3, e.currentHP, e.maxHP, '#f44', '#333');

      // Target indicator
      if (this.state === BATTLE_STATES.TARGET_SELECT && this.targetList[this.targetIndex] === e) {
        renderer.drawText('\u25bc', x + spriteW / 2 - 2, y - 10, { color: '#ffcc00', size: 8 });
      }
    }
  }

  _renderParty(renderer) {
    for (let i = 0; i < this.party.length; i++) {
      const m = this.party[i];
      const x = BASE_WIDTH - 80 + (i % 2) * 30;
      const y = 30 + Math.floor(i / 2) * 40;

      const sprite = this.assets && this.assets.get('battle_' + m.id);
      if (sprite && m.currentHP > 0) {
        // Battle spritesheet: 40×24 (idle at sx=0, attack at sx=20)
        renderer.ctx.drawImage(sprite, 0, 0, 20, 24,
          x * 3, y * 3, 20 * 3, 24 * 3);
      } else {
        const color = m.currentHP > 0 ? '#4488ff' : '#444';
        renderer.drawRect(x, y, 20, 24, color);
        renderer.drawRectOutline(x, y, 20, 24, '#aaa');
        renderer.drawText(m.name.substring(0, 3), x + 1, y + 8, { color: '#fff', size: 6 });
      }

      // Active turn indicator
      const current = this.combat.getCurrentTurnEntity();
      if (current === m) {
        renderer.drawText('\u25b6', x - 10, y + 8, { color: '#ffcc00', size: 8 });
      }

      // Target indicator
      if (this.state === BATTLE_STATES.TARGET_SELECT && this.targetList[this.targetIndex] === m) {
        renderer.drawText('\u25c0', x + 24, y + 8, { color: '#ffcc00', size: 8 });
      }
    }
  }

  _renderBattleUI(renderer) {
    const panelY = 140;
    const panelH = BASE_HEIGHT - panelY;

    // Background panel
    renderer.drawRect(0, panelY, BASE_WIDTH, panelH, 'rgba(0, 0, 10, 0.9)');
    renderer.drawRectOutline(0, panelY, BASE_WIDTH, panelH, '#555');

    // Left: command menu
    const menuX = 8;
    const menuY = panelY + 4;

    switch (this.state) {
      case BATTLE_STATES.PLAYER_TURN:
        this._renderCommandMenu(renderer, menuX, menuY);
        break;
      case BATTLE_STATES.SKILL_SELECT:
        this._renderSkillMenu(renderer, menuX, menuY);
        break;
      case BATTLE_STATES.ITEM_SELECT:
        this._renderItemMenu(renderer, menuX, menuY);
        break;
      case BATTLE_STATES.TARGET_SELECT:
        renderer.drawText('Select target', menuX, menuY, { color: '#ffcc00', size: 7 });
        break;
      case BATTLE_STATES.ENEMY_TURN:
        renderer.drawText('Enemy turn...', menuX, menuY, { color: '#888', size: 7 });
        break;
      case BATTLE_STATES.VICTORY:
        this._renderVictoryScreen(renderer, menuX, menuY);
        break;
      case BATTLE_STATES.DEFEAT:
        renderer.drawText('DEFEATED', menuX, menuY, { color: '#f44', size: 10 });
        renderer.drawText('Press Z to continue', menuX, menuY + 16, { color: '#888', size: 7 });
        break;
    }

    // Right: party status
    this._renderPartyStatus(renderer, BASE_WIDTH / 2 + 10, panelY + 4);
  }

  _renderCommandMenu(renderer, x, y) {
    const options = this._getMenuOptions();
    for (let i = 0; i < options.length; i++) {
      const cursor = i === this.menuIndex ? '>' : ' ';
      const color = i === this.menuIndex ? '#fff' : '#aaa';
      renderer.drawText(`${cursor} ${options[i].label}`, x, y + i * 12, { color, size: 8 });
    }
  }

  _renderSkillMenu(renderer, x, y) {
    if (this.skillList.length === 0) {
      renderer.drawText('No skills learned', x, y, { color: '#888', size: 7 });
      return;
    }
    const current = this.combat.getCurrentTurnEntity();
    for (let i = 0; i < this.skillList.length; i++) {
      const skill = this.skillList[i];
      const cursor = i === this.skillIndex ? '>' : ' ';
      const canUse = current.currentCharge >= skill.chargeCost;
      const color = !canUse ? '#666' : i === this.skillIndex ? '#fff' : '#aaa';
      renderer.drawText(`${cursor} ${skill.name} [${skill.chargeCost}]`, x, y + i * 10, { color, size: 7 });
    }
  }

  _renderItemMenu(renderer, x, y) {
    if (this.itemList.length === 0) {
      renderer.drawText('No items', x, y, { color: '#888', size: 7 });
      return;
    }
    for (let i = 0; i < this.itemList.length; i++) {
      const item = this.itemList[i];
      const cursor = i === this.itemIndex ? '>' : ' ';
      const color = i === this.itemIndex ? '#fff' : '#aaa';
      renderer.drawText(`${cursor} ${item.id} x${item.count}`, x, y + i * 10, { color, size: 7 });
    }
  }

  _renderVictoryScreen(renderer, x, y) {
    renderer.drawText('VICTORY!', x, y, { color: '#ffcc00', size: 10 });
    if (this._rewards) {
      renderer.drawText(`XP: +${this._rewards.xp}`, x, y + 16, { color: '#0f0', size: 8 });
      renderer.drawText(`Scrap: +${this._rewards.scrap}`, x, y + 28, { color: '#ff8', size: 8 });
      if (this._rewards.loot && this._rewards.loot.length > 0) {
        renderer.drawText(`Loot: ${this._rewards.loot.length} item(s)`, x, y + 40, { color: '#88f', size: 8 });
      }
      renderer.drawText('Press Z to continue', x, y + 56, { color: '#888', size: 7 });
    }
  }

  _renderPartyStatus(renderer, x, y) {
    for (let i = 0; i < this.party.length; i++) {
      const m = this.party[i];
      const rowY = y + i * 18;
      const nameColor = m.currentHP > 0 ? '#ccc' : '#666';
      renderer.drawText(m.name, x, rowY, { color: nameColor, size: 7 });
      renderer.drawBar(x + 40, rowY + 1, 50, 4, m.currentHP, m.maxHP, '#0a0');
      renderer.drawText(`${m.currentHP}`, x + 94, rowY, { color: '#aaa', size: 6 });
      renderer.drawBar(x + 40, rowY + 7, 50, 3, m.currentCharge, m.maxCharge, '#08f');
    }
  }
}
