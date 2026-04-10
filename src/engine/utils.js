/**
 * Core utility functions: RNG, math helpers, damage formulas.
 */

/** Seeded pseudo-random number generator (xorshift128) for reproducible results. */
export class SeededRNG {
  constructor(seed = Date.now()) {
    this.state = [seed, seed ^ 0xdeadbeef, seed ^ 0xcafebabe, seed ^ 0x12345678];
  }

  _next() {
    let t = this.state[3];
    t ^= t << 11;
    t ^= t >>> 8;
    this.state[3] = this.state[2];
    this.state[2] = this.state[1];
    this.state[1] = this.state[0];
    t ^= this.state[0];
    t ^= this.state[0] >>> 19;
    this.state[0] = t;
    return t >>> 0;
  }

  /** Returns a float in [0, 1). */
  random() {
    return this._next() / 0x100000000;
  }

  /** Returns an integer in [min, max] (inclusive). */
  randInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /** Returns a float in [min, max). */
  randFloat(min, max) {
    return this.random() * (max - min) + min;
  }

  /** Picks a random element from an array. */
  pick(array) {
    if (array.length === 0) return undefined;
    return array[Math.floor(this.random() * array.length)];
  }

  /** Weighted random selection. Items must have a `weight` property. Returns the item. */
  weightedPick(items) {
    if (items.length === 0) return undefined;
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = this.random() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }
}

/** Global unseeded RNG for general use. */
export const rng = new SeededRNG();

/**
 * Calculate base damage from an attack.
 * @param {number} atk - Attacker's ATK stat
 * @param {number} weaponPower - Weapon's power value
 * @param {number} def - Defender's DEF stat
 * @param {number} armorRating - Defender's armor rating
 * @returns {number} Base damage (minimum 1)
 */
export function calculateBaseDamage(atk, weaponPower, def, armorRating) {
  const raw = (atk * 2 + weaponPower) - (def + armorRating);
  return Math.max(1, raw);
}

/**
 * Get the elemental multiplier between attacker and defender elements.
 * Thermal > Corrosion > Voltaic > Thermal
 * @param {string|null} attackElement
 * @param {string|null} defenderElement
 * @returns {number} 1.5 (strong), 0.5 (weak), or 1.0 (neutral)
 */
export function getElementMultiplier(attackElement, defenderElement) {
  if (!attackElement || !defenderElement) return 1.0;

  const advantages = {
    thermal: 'corrosion',
    voltaic: 'thermal',
    corrosion: 'voltaic'
  };

  if (advantages[attackElement] === defenderElement) return 1.5;
  if (advantages[defenderElement] === attackElement) return 0.5;
  return 1.0;
}

/**
 * Calculate final damage with all modifiers applied.
 * @param {object} params
 * @param {number} params.atk - Attacker's ATK (or MAG for magic)
 * @param {number} params.weaponPower - Weapon power (or skill power)
 * @param {number} params.def - Defender's DEF
 * @param {number} params.armorRating - Defender's armor rating
 * @param {string|null} params.attackElement - Attack element
 * @param {string|null} params.defenderElement - Defender element
 * @param {boolean} params.isCrit - Whether this is a critical hit
 * @param {number} params.critMultiplier - Crit damage multiplier (default 1.5)
 * @param {number} params.damageModifier - Additional damage multiplier (default 1.0)
 * @param {SeededRNG} params.rng - RNG instance for variance
 * @returns {{ damage: number, isCrit: boolean, elementEffect: string }}
 */
export function calculateFinalDamage({
  atk,
  weaponPower = 0,
  def,
  armorRating = 0,
  attackElement = null,
  defenderElement = null,
  isCrit = false,
  critMultiplier = 1.5,
  damageModifier = 1.0,
  rng: rngInstance = rng
}) {
  const baseDamage = calculateBaseDamage(atk, weaponPower, def, armorRating);
  const elementMult = getElementMultiplier(attackElement, defenderElement);
  const variance = rngInstance.randFloat(0.9, 1.1);
  const critMult = isCrit ? critMultiplier : 1.0;

  let damage = Math.floor(baseDamage * elementMult * variance * critMult * damageModifier);
  damage = Math.max(1, damage);

  let elementEffect = 'neutral';
  if (elementMult > 1.0) elementEffect = 'strong';
  else if (elementMult < 1.0) elementEffect = 'weak';

  return { damage, isCrit, elementEffect };
}

/**
 * Check if a critical hit occurs.
 * @param {number} baseCritRate - Base crit rate (0.05 = 5%)
 * @param {number} bonusCritRate - Bonus from skills/equipment
 * @param {SeededRNG} rngInstance - RNG instance
 * @returns {boolean}
 */
export function rollCrit(baseCritRate = 0.05, bonusCritRate = 0, rngInstance = rng) {
  return rngInstance.random() < (baseCritRate + bonusCritRate);
}

/**
 * Check if an escape attempt succeeds.
 * @param {number} partyAvgSpd - Party's average SPD
 * @param {number} enemyAvgSpd - Enemies' average SPD
 * @param {SeededRNG} rngInstance - RNG instance
 * @returns {boolean}
 */
export function rollFlee(partyAvgSpd, enemyAvgSpd, rngInstance = rng) {
  if (enemyAvgSpd <= 0) return true;
  const rate = Math.min(1.0, partyAvgSpd / enemyAvgSpd);
  return rngInstance.random() < rate;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sort combatants by SPD for turn order.
 * Ties broken by: party members first, then by name alphabetically.
 * @param {Array} combatants - Array of { id, name, stats: { SPD }, isPartyMember }
 * @returns {Array} Sorted array (highest SPD first)
 */
export function calculateTurnOrder(combatants) {
  return [...combatants].sort((a, b) => {
    const spdDiff = b.stats.SPD - a.stats.SPD;
    if (spdDiff !== 0) return spdDiff;
    if (a.isPartyMember !== b.isPartyMember) return a.isPartyMember ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
