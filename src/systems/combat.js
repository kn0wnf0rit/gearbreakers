/**
 * CombatEngine — core turn-based combat logic for Gearbreakers.
 */

import {
  calculateFinalDamage,
  rollCrit,
  rollFlee,
  calculateTurnOrder,
  SeededRNG,
  clamp,
} from '../engine/utils.js';
import { getSkillById } from '../data/skills.js';
import { CONSUMABLES } from '../data/items.js';

export class CombatEngine {
  /**
   * @param {object} params
   * @param {Array} params.party - Array of PartyMember instances
   * @param {Array} params.enemies - Array of Enemy instances
   * @param {boolean} [params.isBoss=false]
   * @param {SeededRNG} [params.rng]
   */
  constructor({ party, enemies, isBoss = false, rng }) {
    this.party = party;
    this.enemies = enemies;
    this.isBoss = isBoss;
    this.rng = rng || new SeededRNG();

    this.turnOrder = [];
    this.turnIndex = 0;
    this.round = 0;
    this.battleEnded = false;
    this.battleResult = null;
    this.log = [];
  }

  /**
   * Initialize battle state, calculate first turn order.
   */
  startBattle() {
    this.round = 1;
    this.turnIndex = 0;
    this.battleEnded = false;
    this.battleResult = null;
    this.log = [];

    // Reset defending flags
    for (const entity of [...this.party, ...this.enemies]) {
      entity.isDefending = false;
    }

    this._calculateTurnOrder();
    this.log.push({ type: 'battle_start', round: this.round });
  }

  /**
   * Get all living combatants and recalculate turn order.
   * @private
   */
  _calculateTurnOrder() {
    const alive = this._getAllAlive();
    // Use getEffectiveStat for SPD so status effects apply to turn order
    const withEffectiveSpd = alive.map(e => ({
      ...e,
      _entity: e,
      stats: { ...e.stats, SPD: e.getEffectiveStat('SPD') },
    }));
    const sorted = calculateTurnOrder(withEffectiveSpd);
    this.turnOrder = sorted.map(s => s._entity);
    this.turnIndex = 0;
  }

  /**
   * Return all living combatants.
   * @private
   */
  _getAllAlive() {
    return [
      ...this.party.filter(p => this.isEntityAlive(p)),
      ...this.enemies.filter(e => this.isEntityAlive(e)),
    ];
  }

  /**
   * Return the entity whose turn it is.
   * @returns {object|null}
   */
  getCurrentTurnEntity() {
    if (this.battleEnded) return null;
    if (this.turnIndex >= this.turnOrder.length) return null;
    return this.turnOrder[this.turnIndex];
  }

  /**
   * Return array of available action types for the given entity.
   * @param {object} entity
   * @returns {string[]}
   */
  getAvailableActions(entity) {
    const actions = ['Attack', 'Skill', 'Item', 'Defend'];
    if (!this.isBoss) {
      actions.push('Flee');
    }
    return actions;
  }

  /**
   * Execute an action and return a result object.
   * @param {object} action - { type, target?, skillId?, itemId? }
   * @returns {object} Result of the action
   */
  executeAction(action) {
    const actor = this.getCurrentTurnEntity();
    if (!actor || this.battleEnded) {
      return { success: false, reason: 'No active turn or battle ended' };
    }

    let result;

    switch (action.type) {
      case 'attack':
        result = this._executeAttack(actor, action.target);
        break;
      case 'defend':
        result = this._executeDefend(actor);
        break;
      case 'flee':
        result = this._executeFlee(actor);
        break;
      case 'skill':
        result = this._executeSkill(actor, action.skillId, action.target);
        break;
      case 'item':
        result = this._executeItem(actor, action.itemId, action.target);
        break;
      default:
        result = { success: false, reason: `Unknown action type: ${action.type}` };
    }

    this.log.push({ type: 'action', actor: actor.name, action: action.type, result });

    // Check battle end after action
    const endCheck = this.checkBattleEnd();
    if (endCheck.ended) {
      this.battleEnded = true;
      this.battleResult = endCheck.result;
    }

    return result;
  }

  /**
   * Execute a basic attack.
   * @private
   */
  _executeAttack(attacker, target) {
    if (!target || !this.isEntityAlive(target)) {
      return { success: false, reason: 'Invalid or dead target' };
    }

    // Blind check: 50% miss chance
    const hasBlind = attacker.statusEffects.some(e => e.type === 'blind');
    if (hasBlind && this.rng.random() < 0.5) {
      return { success: true, missed: true, damage: 0, target: target.name };
    }

    const atk = attacker.getEffectiveStat('ATK');
    const def = target.getEffectiveStat('DEF');
    const weaponPower = attacker.equipment?.weapon?.basePower || 0;
    const armorRating = target.equipment?.armor?.baseDEF || 0;

    const attackElement = attacker.equipment?.weapon?.element || null;
    const defenderElement = target.element || null;

    const isCrit = rollCrit(0.05, 0, this.rng);

    const damageResult = calculateFinalDamage({
      atk,
      weaponPower,
      def,
      armorRating,
      attackElement,
      defenderElement,
      isCrit,
      rng: this.rng,
    });

    const actualDamage = target.takeDamage(damageResult.damage);

    return {
      success: true,
      missed: false,
      damage: actualDamage,
      isCrit: damageResult.isCrit,
      elementEffect: damageResult.elementEffect,
      target: target.name,
    };
  }

  /**
   * Execute defend action.
   * @private
   */
  _executeDefend(actor) {
    actor.isDefending = true;
    return { success: true, defending: true };
  }

  /**
   * Execute flee attempt.
   * @private
   */
  _executeFlee(_actor) {
    if (this.isBoss) {
      return { success: false, reason: 'Cannot flee from boss battles' };
    }

    const aliveParty = this.party.filter(p => this.isEntityAlive(p));
    const aliveEnemies = this.enemies.filter(e => this.isEntityAlive(e));

    const partyAvgSpd = aliveParty.reduce((s, p) => s + p.getEffectiveStat('SPD'), 0) / (aliveParty.length || 1);
    const enemyAvgSpd = aliveEnemies.reduce((s, e) => s + e.getEffectiveStat('SPD'), 0) / (aliveEnemies.length || 1);

    const escaped = rollFlee(partyAvgSpd, enemyAvgSpd, this.rng);
    if (escaped) {
      this.battleEnded = true;
      this.battleResult = 'fled';
    }

    return { success: true, escaped };
  }

  /**
   * Execute a skill action.
   * @private
   */
  _executeSkill(actor, skillId, target) {
    if (!skillId) return { success: false, reason: 'No skill specified' };

    const skill = getSkillById(skillId);
    if (!skill) return { success: false, reason: 'Unknown skill' };

    // Check charge cost
    if (actor.currentCharge !== undefined && actor.currentCharge < skill.chargeCost) {
      return { success: false, reason: 'Not enough Charge' };
    }

    // Spend charge
    if (actor.currentCharge !== undefined) {
      actor.currentCharge -= skill.chargeCost;
    }

    const result = { success: true, skill: skill.name, effects: [] };

    if (skill.type === 'attack') {
      const stat = skill.effect.stat || 'ATK';
      const atkVal = actor.getEffectiveStat(stat);
      const multiplier = skill.effect.damageMultiplier || 1.0;
      const element = skill.effect.element || null;

      const targets = this._resolveTargets(skill.target, target);
      for (const t of targets) {
        if (!this.isEntityAlive(t)) continue;
        const def = t.getEffectiveStat('DEF');
        const isCrit = rollCrit(0.05, 0, this.rng);
        const damageResult = calculateFinalDamage({
          atk: atkVal,
          weaponPower: 0,
          def,
          armorRating: 0,
          attackElement: element,
          defenderElement: t.element || null,
          isCrit,
          damageModifier: multiplier,
          rng: this.rng,
        });
        const actual = t.takeDamage(damageResult.damage);
        result.effects.push({
          target: t.name,
          damage: actual,
          isCrit: damageResult.isCrit,
        });

        // Apply status if skill has one
        if (skill.effect.applyStatus) {
          const chance = skill.effect.statusChance !== undefined ? skill.effect.statusChance : 1.0;
          if (this.rng.random() < chance) {
            this.applyStatusEffect(t, {
              type: skill.effect.applyStatus,
              duration: skill.effect.statusDuration || 2,
            });
            result.effects[result.effects.length - 1].statusApplied = skill.effect.applyStatus;
          }
        }
      }
    } else if (skill.type === 'heal') {
      const targets = this._resolveTargets(skill.target, target);
      for (const t of targets) {
        if (!this.isEntityAlive(t)) continue;
        if (skill.effect.healPercent) {
          const amount = Math.floor(t.maxHP * skill.effect.healPercent);
          const healed = t.heal(amount);
          result.effects.push({ target: t.name, healed });
        }
        if (skill.effect.cureAll) {
          t.statusEffects = [];
          result.effects.push({ target: t.name, cured: true });
        }
      }
    } else if (skill.type === 'buff') {
      const targets = this._resolveTargets(skill.target, target || actor);
      for (const t of targets) {
        if (!this.isEntityAlive(t)) continue;
        if (skill.effect.status) {
          this.applyStatusEffect(t, {
            type: skill.effect.status,
            duration: skill.effect.duration || 2,
          });
        }
        if (skill.effect.stats) {
          // Apply overclock-style buff
          this.applyStatusEffect(t, {
            type: 'overclock',
            duration: skill.effect.duration || 2,
          });
        }
        result.effects.push({ target: t.name, buffed: true });
      }
    } else if (skill.type === 'debuff') {
      const targets = this._resolveTargets(skill.target, target);
      for (const t of targets) {
        if (!this.isEntityAlive(t)) continue;
        if (skill.effect.applyStatus) {
          this.applyStatusEffect(t, {
            type: skill.effect.applyStatus,
            duration: skill.effect.duration || skill.effect.statusDuration || 2,
          });
          result.effects.push({ target: t.name, debuffed: skill.effect.applyStatus });
        } else if (skill.effect.stat) {
          this.applyStatusEffect(t, {
            type: 'corrode',
            duration: skill.effect.duration || 3,
          });
          result.effects.push({ target: t.name, debuffed: 'stat_reduction' });
        }
      }
    }

    return result;
  }

  /**
   * Execute an item action.
   * @private
   */
  _executeItem(actor, itemId, target) {
    if (!itemId) return { success: false, reason: 'No item specified' };

    const itemDef = CONSUMABLES[itemId];
    if (!itemDef) return { success: false, reason: 'Unknown item' };

    const result = { success: true, item: itemDef.name, effects: [] };
    const effect = itemDef.effect;

    if (effect.type === 'heal' && target) {
      const amount = Math.floor(target.maxHP * effect.healPercent);
      const healed = target.heal(amount);
      result.effects.push({ target: target.name, healed });
    } else if (effect.type === 'restore_charge' && target) {
      const amount = Math.floor(target.maxCharge * effect.chargePercent);
      target.currentCharge = Math.min(target.maxCharge, target.currentCharge + amount);
      result.effects.push({ target: target.name, chargeRestored: amount });
    } else if (effect.type === 'cure_status' && target) {
      target.statusEffects = [];
      result.effects.push({ target: target.name, cured: true });
    } else if (effect.type === 'revive' && target) {
      if (target.currentHP <= 0) {
        target.currentHP = Math.floor(target.maxHP * effect.revivePercent);
        result.effects.push({ target: target.name, revived: true });
      }
    } else if (effect.type === 'damage' && target) {
      const dmg = target.takeDamage(effect.fixedDamage);
      result.effects.push({ target: target.name, damage: dmg });
    } else if (effect.type === 'flee') {
      if (this.isBoss && !effect.guaranteedFlee) {
        return { success: false, reason: 'Cannot flee from boss battles' };
      }
      if (effect.guaranteedFlee && !this.isBoss) {
        this.battleEnded = true;
        this.battleResult = 'fled';
        result.effects.push({ fled: true });
      }
    }

    return result;
  }

  /**
   * Resolve targets based on skill target type.
   * @private
   */
  _resolveTargets(targetType, specificTarget) {
    switch (targetType) {
      case 'single_enemy':
        return specificTarget ? [specificTarget] : [];
      case 'all_enemies':
        return this.enemies.filter(e => this.isEntityAlive(e));
      case 'random_enemies':
        return this.enemies.filter(e => this.isEntityAlive(e));
      case 'single_ally':
      case 'single_ally_ko':
        return specificTarget ? [specificTarget] : [];
      case 'party':
        return this.party.filter(p => this.isEntityAlive(p));
      case 'self':
        return specificTarget ? [specificTarget] : [];
      default:
        return specificTarget ? [specificTarget] : [];
    }
  }

  /**
   * Move to next turn. When all entities have acted, start a new round.
   */
  advanceTurn() {
    if (this.battleEnded) return;

    this.turnIndex++;

    // If all turns exhausted, start new round
    if (this.turnIndex >= this.turnOrder.length) {
      this._startNewRound();
      return;
    }

    // Skip dead entities
    while (
      this.turnIndex < this.turnOrder.length &&
      !this.isEntityAlive(this.turnOrder[this.turnIndex])
    ) {
      this.turnIndex++;
    }

    if (this.turnIndex >= this.turnOrder.length) {
      this._startNewRound();
      return;
    }

    // Check for stun
    const current = this.turnOrder[this.turnIndex];
    const stunIdx = current.statusEffects.findIndex(e => e.type === 'stun');
    if (stunIdx !== -1) {
      this.log.push({ type: 'stun_skip', entity: current.name });
      // Stun consumed on skip: reduce duration
      current.statusEffects[stunIdx].duration--;
      if (current.statusEffects[stunIdx].duration <= 0) {
        current.statusEffects.splice(stunIdx, 1);
      }
      this.advanceTurn();
    }
  }

  /**
   * Start a new round: reset defending, tick status effects, recalculate turn order.
   * @private
   */
  _startNewRound() {
    this.round++;

    // Reset defend flags and tick status effects for all living entities
    for (const entity of this._getAllAlive()) {
      entity.isDefending = false;
      this.tickStatusEffects(entity);
    }

    this._calculateTurnOrder();
    this.log.push({ type: 'new_round', round: this.round });

    // Check for stun on the first entity of the new round
    const current = this.turnOrder[this.turnIndex];
    if (current) {
      const stunIdx = current.statusEffects.findIndex(e => e.type === 'stun');
      if (stunIdx !== -1) {
        this.log.push({ type: 'stun_skip', entity: current.name });
        current.statusEffects[stunIdx].duration--;
        if (current.statusEffects[stunIdx].duration <= 0) {
          current.statusEffects.splice(stunIdx, 1);
        }
        this.advanceTurn();
      }
    }
  }

  /**
   * Tick status effects for an entity: apply damage, reduce durations, remove expired.
   * @param {object} entity
   */
  tickStatusEffects(entity) {
    const toRemove = [];

    for (let i = 0; i < entity.statusEffects.length; i++) {
      const effect = entity.statusEffects[i];

      // Burn: 5% max HP damage per turn
      if (effect.type === 'burn') {
        const burnDamage = Math.floor(entity.maxHP * 0.05);
        entity.currentHP = Math.max(0, entity.currentHP - burnDamage);
        this.log.push({
          type: 'status_tick',
          entity: entity.name,
          status: 'burn',
          damage: burnDamage,
        });
      }

      // Corrode: debuff already applied via getEffectiveStat, just tick duration

      // Reduce duration
      effect.duration--;
      if (effect.duration <= 0) {
        toRemove.push(i);
      }
    }

    // Remove expired effects in reverse order to keep indices valid
    for (let i = toRemove.length - 1; i >= 0; i--) {
      entity.statusEffects.splice(toRemove[i], 1);
    }
  }

  /**
   * Apply a status effect to a target.
   * @param {object} target
   * @param {object} effect - { type, duration, ... }
   */
  applyStatusEffect(target, effect) {
    // If the target already has this effect, refresh duration
    const existing = target.statusEffects.find(e => e.type === effect.type);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
      if (effect.amount !== undefined) existing.amount = effect.amount;
    } else {
      target.statusEffects.push({ ...effect });
    }
  }

  /**
   * Check if an entity is alive (HP > 0).
   * @param {object} entity
   * @returns {boolean}
   */
  isEntityAlive(entity) {
    return entity.currentHP > 0;
  }

  /**
   * Check if the battle has ended.
   * @returns {{ ended: boolean, result: 'victory'|'defeat'|null }}
   */
  checkBattleEnd() {
    const allEnemiesDead = this.enemies.every(e => !this.isEntityAlive(e));
    if (allEnemiesDead) {
      return { ended: true, result: 'victory' };
    }

    const allPartyDead = this.party.every(p => !this.isEntityAlive(p));
    if (allPartyDead) {
      return { ended: true, result: 'defeat' };
    }

    return { ended: false, result: null };
  }

  /**
   * Calculate rewards based on defeated enemies.
   * @returns {{ xp: number, scrap: number, loot: Array }}
   */
  calculateRewards() {
    let xp = 0;
    let scrap = 0;
    const loot = [];

    for (const enemy of this.enemies) {
      if (!this.isEntityAlive(enemy)) {
        xp += enemy.xpReward;
        scrap += enemy.scrapReward;

        // Roll loot table
        if (enemy.lootTable && enemy.lootTable.length > 0) {
          const drop = this.rng.weightedPick(enemy.lootTable);
          if (drop && drop.itemPool !== 'none') {
            loot.push({ itemPool: drop.itemPool, fromEnemy: enemy.name });
          }
        }
      }
    }

    return { xp, scrap, loot };
  }

  /**
   * Return a snapshot of the current battle state for rendering.
   * @returns {object}
   */
  getBattleState() {
    return {
      round: this.round,
      turnIndex: this.turnIndex,
      currentTurn: this.getCurrentTurnEntity()?.name || null,
      party: this.party.map(p => ({
        id: p.id,
        name: p.name,
        currentHP: p.currentHP,
        maxHP: p.maxHP,
        currentCharge: p.currentCharge,
        maxCharge: p.maxCharge,
        statusEffects: [...p.statusEffects],
        isDefending: p.isDefending,
        alive: this.isEntityAlive(p),
      })),
      enemies: this.enemies.map(e => ({
        id: e.id,
        name: e.name,
        currentHP: e.currentHP,
        maxHP: e.maxHP,
        statusEffects: [...e.statusEffects],
        isDefending: e.isDefending,
        alive: this.isEntityAlive(e),
      })),
      turnOrder: this.turnOrder.map(e => e.name),
      battleEnded: this.battleEnded,
      battleResult: this.battleResult,
      isBoss: this.isBoss,
    };
  }
}
