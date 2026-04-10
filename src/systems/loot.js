/**
 * Loot system: Borderlands-style randomized item generation, rarity rolling, and shop inventory.
 */

import {
  RARITY_TIERS, CONSUMABLES,
  BASE_WEAPONS, BASE_ARMORS, BASE_ACCESSORIES,
  AFFIXES, getAffixesForSlot
} from '../data/items.js';
import { SeededRNG } from '../engine/utils.js';

let idCounter = 0;

function generateId() {
  idCounter += 1;
  const timestamp = Date.now().toString(36);
  const counter = idCounter.toString(36).padStart(4, '0');
  const rand = Math.random().toString(36).slice(2, 6);
  return `item_${timestamp}_${counter}_${rand}`;
}

export class LootSystem {
  /**
   * @param {SeededRNG} [rng] - Optional seeded RNG for deterministic results
   */
  constructor(rng) {
    this.rng = rng || new SeededRNG();
  }

  /**
   * Roll a rarity tier using weighted random selection.
   * @param {number} [bonusLuck=0] - Shifts weights toward rarer tiers (0-1 range, e.g. 0.5 = 50% luck bonus)
   * @returns {string} Rarity key (e.g. 'common', 'rare', 'legendary')
   */
  rollRarity(bonusLuck = 0) {
    const tierKeys = Object.keys(RARITY_TIERS);
    const items = tierKeys.map((key, index) => {
      const tier = RARITY_TIERS[key];
      // bonusLuck shifts weight: lower tiers lose weight, higher tiers gain
      const luckShift = bonusLuck * index * 5;
      const weight = Math.max(1, tier.dropWeight + luckShift);
      return { key, weight };
    });

    const result = this.rng.weightedPick(items);
    return result.key;
  }

  /**
   * Generate a random equipment item.
   * @param {string} slot - 'weapon', 'armor', or 'accessory'
   * @param {string} rarity - Rarity key
   * @param {object} [options={}] - Additional generation options
   * @returns {object} Generated item
   */
  generateItem(slot, rarity, options = {}) {
    // 1. Pick a random base item from the appropriate pool
    const pool = this._getPoolForSlot(slot);
    const baseItems = Object.values(pool);
    if (baseItems.length === 0) return null;
    const base = this.rng.pick(baseItems);

    // 2. Apply rarity stat multiplier
    const rarityData = RARITY_TIERS[rarity];
    const statBonus = this.rng.randFloat(rarityData.statBonusMin, rarityData.statBonusMax);
    const stats = this._calculateStats(base, statBonus, slot);

    // 3. Roll 0-2 random affixes
    const validAffixes = getAffixesForSlot(slot);
    const numAffixes = this.rng.randInt(0, 2);
    const affixes = [];
    const usedNames = new Set();

    for (let i = 0; i < numAffixes && validAffixes.length > 0; i++) {
      const affix = this.rng.pick(validAffixes);
      if (!usedNames.has(affix.name)) {
        affixes.push({ ...affix });
        usedNames.add(affix.name);
      }
    }

    // 4. Generate name
    const prefix = affixes.length > 0 ? affixes[0].name + ' ' : '';
    const name = prefix + base.name;

    // 5. Calculate sell value
    const baseValue = base.baseValue || 0;
    const value = Math.floor(baseValue * rarityData.sellMultiplier);

    // 6. Build description
    const statEntries = Object.entries(stats)
      .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
      .join(', ');
    const affixDesc = affixes.length > 0
      ? ' | Affixes: ' + affixes.map(a => a.name).join(', ')
      : '';
    const description = `${rarityData.name} ${base.name}. ${statEntries}${affixDesc}`;

    return {
      id: generateId(),
      name,
      type: 'equipment',
      slot,
      rarity,
      stats,
      affixes,
      equippableBy: base.equippableBy ? [...base.equippableBy] : [],
      value,
      description
    };
  }

  /**
   * Given an enemy loot table, roll for drops.
   * @param {object} enemyLootTable - { drops: [{ type, chance, ... }], scrap: { min, max } }
   * @param {object} [options={}] - { bonusLuck }
   * @returns {Array} Array of items (could be empty)
   */
  generateLootDrop(enemyLootTable, options = {}) {
    if (!enemyLootTable || !enemyLootTable.drops) return [];

    const results = [];
    const bonusLuck = options.bonusLuck || 0;

    for (const drop of enemyLootTable.drops) {
      const roll = this.rng.random();
      if (roll > (drop.chance || 0)) continue;

      if (drop.type === 'consumable' && drop.itemId) {
        const consumable = CONSUMABLES[drop.itemId];
        if (consumable) {
          results.push({ ...consumable, count: drop.count || 1 });
        }
      } else if (drop.type === 'equipment' || drop.slot) {
        const rarity = this.rollRarity(bonusLuck);
        const slot = drop.slot || this.rng.pick(['weapon', 'armor', 'accessory']);
        const item = this.generateItem(slot, rarity, options);
        if (item) results.push(item);
      }
    }

    return results;
  }

  /**
   * Generate a guaranteed drop (for bosses).
   * @param {object} spec - { type: 'equipment', slot, minRarity }
   * @returns {object} Generated item
   */
  generateGuaranteedDrop(spec) {
    const rarityKeys = Object.keys(RARITY_TIERS);
    const minIndex = rarityKeys.indexOf(spec.minRarity || 'common');

    // Roll rarity but ensure at least minRarity
    let rarity = this.rollRarity(0);
    let rolledIndex = rarityKeys.indexOf(rarity);
    if (rolledIndex < minIndex) {
      rarity = rarityKeys[minIndex];
    }

    const slot = spec.slot || this.rng.pick(['weapon', 'armor', 'accessory']);
    return this.generateItem(slot, rarity);
  }

  /**
   * Generate a shop inventory for a given tier.
   * @param {number} tier - Shop tier (1 = up to Common, 2 = up to Rare)
   * @returns {object} { weapons: [], armors: [], accessories: [], consumables: [] }
   */
  generateShopInventory(tier) {
    const rarityKeys = Object.keys(RARITY_TIERS);
    const maxRarityIndex = tier === 1 ? 1 : 2; // 1 = common, 2 = rare

    const generateForSlot = (slot, count) => {
      const items = [];
      for (let i = 0; i < count; i++) {
        // Roll rarity capped by tier
        let rarity = this.rollRarity(0);
        let rolledIndex = rarityKeys.indexOf(rarity);
        if (rolledIndex > maxRarityIndex) {
          rarity = rarityKeys[maxRarityIndex];
        }
        const item = this.generateItem(slot, rarity);
        if (item) {
          // Shop items use buy price (higher than sell value)
          item.buyPrice = Math.floor(item.value * 2.5);
          items.push(item);
        }
      }
      return items;
    };

    return {
      weapons: generateForSlot('weapon', 3),
      armors: generateForSlot('armor', 3),
      accessories: generateForSlot('accessory', 2),
      consumables: Object.values(CONSUMABLES).map(c => ({ ...c }))
    };
  }

  /**
   * Get the base item pool for a given slot.
   * @private
   */
  _getPoolForSlot(slot) {
    switch (slot) {
      case 'weapon': return BASE_WEAPONS;
      case 'armor': return BASE_ARMORS;
      case 'accessory': return BASE_ACCESSORIES;
      default: return {};
    }
  }

  /**
   * Calculate item stats from base + rarity bonus.
   * @private
   */
  _calculateStats(base, statBonus, slot) {
    const stats = {};
    if (slot === 'weapon') {
      const power = base.basePower || 0;
      stats.ATK = Math.floor(power * (1 + statBonus));
    } else if (slot === 'armor') {
      const def = base.baseDEF || 0;
      const hp = base.baseHP || 0;
      stats.DEF = Math.floor(def * (1 + statBonus));
      stats.HP = Math.floor(hp * (1 + statBonus));
    } else if (slot === 'accessory') {
      // Accessories get a small stat bonus based on rarity
      stats.bonusStat = Math.floor(3 * (1 + statBonus));
    }
    return stats;
  }
}
