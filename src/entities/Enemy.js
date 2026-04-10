/**
 * Enemy entity — an opponent in combat.
 */

export class Enemy {
  /**
   * @param {object} enemyDef - Enemy definition from enemies.js
   */
  constructor(enemyDef) {
    this.id = enemyDef.id;
    this.name = enemyDef.name;
    this.maxHP = enemyDef.stats.HP;
    this.currentHP = this.maxHP;
    this.stats = {
      ATK: enemyDef.stats.ATK,
      DEF: enemyDef.stats.DEF,
      MAG: enemyDef.stats.MAG,
      SPD: enemyDef.stats.SPD,
    };
    this.element = enemyDef.element || null;
    this.xpReward = enemyDef.xpReward;
    this.scrapReward = enemyDef.scrapReward;
    this.lootTable = enemyDef.lootTable ? [...enemyDef.lootTable] : [];
    this.ai = enemyDef.ai || 'basic_attacker';
    this.statusEffects = [];
    this.isPartyMember = false;
    this.isDefending = false;
    this.isBoss = enemyDef.isBoss || false;
  }

  /**
   * Take damage, reducing HP to a minimum of 0.
   * @param {number} amount
   * @returns {number} Actual damage taken
   */
  takeDamage(amount) {
    const before = this.currentHP;
    this.currentHP = Math.max(0, this.currentHP - amount);
    return before - this.currentHP;
  }

  /**
   * Get effective stat value with status effect modifiers.
   * @param {string} statName - 'ATK', 'DEF', 'MAG', or 'SPD'
   * @returns {number}
   */
  getEffectiveStat(statName) {
    let value = this.stats[statName] || 0;

    for (const effect of this.statusEffects) {
      if (effect.type === 'corrode' && statName === 'DEF') {
        value = Math.floor(value * 0.75);
      }
      if (effect.type === 'overclock' && (statName === 'ATK' || statName === 'SPD')) {
        value = Math.floor(value * 1.2);
      }
    }

    return value;
  }

  /**
   * Choose an action based on AI type.
   * @param {object} battleState - Current battle state snapshot
   * @param {import('../../engine/utils.js').SeededRNG} [rng] - Optional RNG
   * @returns {object} Action object { type, target? }
   */
  chooseAction(battleState, rng) {
    const aliveParty = battleState.party.filter(p => p.currentHP > 0);
    if (aliveParty.length === 0) return { type: 'attack', target: null };

    const pickRandom = (arr) => {
      if (rng) return rng.pick(arr);
      return arr[Math.floor(Math.random() * arr.length)];
    };

    switch (this.ai) {
      case 'target_weakest': {
        // Pick the party member with the lowest current HP
        const target = aliveParty.reduce((weakest, member) =>
          member.currentHP < weakest.currentHP ? member : weakest
        , aliveParty[0]);
        return { type: 'attack', target };
      }

      case 'magic_attacker': {
        // Use MAG-based attack if MAG > ATK, otherwise normal attack
        if (this.stats.MAG > this.stats.ATK) {
          const target = pickRandom(aliveParty);
          return { type: 'magic_attack', target };
        }
        const target = pickRandom(aliveParty);
        return { type: 'attack', target };
      }

      case 'basic_attacker':
      default: {
        const target = pickRandom(aliveParty);
        return { type: 'attack', target };
      }
    }
  }
}
