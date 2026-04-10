import { LootSystem } from '../../src/systems/loot.js';
import { SeededRNG } from '../../src/engine/utils.js';
import { RARITY_TIERS, CONSUMABLES, getAffixesForSlot } from '../../src/data/items.js';

describe('LootSystem', () => {
  let loot;

  beforeEach(() => {
    loot = new LootSystem(new SeededRNG(42));
  });

  describe('rollRarity', () => {
    test('returns a valid rarity tier', () => {
      const validTiers = Object.keys(RARITY_TIERS);
      for (let i = 0; i < 50; i++) {
        const rarity = loot.rollRarity(0);
        expect(validTiers).toContain(rarity);
      }
    });

    test('bonusLuck shifts results toward rarer tiers', () => {
      const noLuck = new LootSystem(new SeededRNG(100));
      const highLuck = new LootSystem(new SeededRNG(100));

      const tierOrder = Object.keys(RARITY_TIERS);
      let noLuckSum = 0;
      let highLuckSum = 0;

      for (let i = 0; i < 200; i++) {
        noLuckSum += tierOrder.indexOf(noLuck.rollRarity(0));
        highLuckSum += tierOrder.indexOf(highLuck.rollRarity(1.0));
      }

      // Higher average index means rarer items on average
      expect(highLuckSum).toBeGreaterThan(noLuckSum);
    });
  });

  describe('generateItem', () => {
    test('produces a valid item for weapon slot', () => {
      const item = loot.generateItem('weapon', 'common');
      expect(item).toBeDefined();
      expect(item.slot).toBe('weapon');
      expect(item.rarity).toBe('common');
      expect(item.type).toBe('equipment');
      expect(item.id).toBeTruthy();
      expect(item.equippableBy).toBeInstanceOf(Array);
      expect(item.equippableBy.length).toBeGreaterThan(0);
    });

    test('produces a valid item for armor slot', () => {
      const item = loot.generateItem('armor', 'rare');
      expect(item.slot).toBe('armor');
      expect(item.stats).toBeDefined();
      expect(item.stats.DEF).toBeDefined();
      expect(item.stats.HP).toBeDefined();
    });

    test('produces a valid item for accessory slot', () => {
      const item = loot.generateItem('accessory', 'epic');
      expect(item.slot).toBe('accessory');
      expect(item.stats).toBeDefined();
    });

    test('generated items have names', () => {
      for (let i = 0; i < 10; i++) {
        const item = loot.generateItem('weapon', 'common');
        expect(typeof item.name).toBe('string');
        expect(item.name.length).toBeGreaterThan(0);
      }
    });

    test('rarity affects stat bonuses (legendary > common)', () => {
      // Generate many items and compare averages
      const commonLoot = new LootSystem(new SeededRNG(1));
      const legendaryLoot = new LootSystem(new SeededRNG(1));

      let commonTotal = 0;
      let legendaryTotal = 0;
      const count = 20;

      for (let i = 0; i < count; i++) {
        const c = commonLoot.generateItem('weapon', 'common');
        const l = legendaryLoot.generateItem('weapon', 'legendary');
        commonTotal += c.stats.ATK || 0;
        legendaryTotal += l.stats.ATK || 0;
      }

      expect(legendaryTotal / count).toBeGreaterThan(commonTotal / count);
    });

    test('affixes are valid for the item slot', () => {
      for (let i = 0; i < 30; i++) {
        const item = loot.generateItem('weapon', 'rare');
        const validAffixes = getAffixesForSlot('weapon');
        const validNames = validAffixes.map(a => a.name);
        for (const affix of item.affixes) {
          expect(validNames).toContain(affix.name);
        }
      }
    });

    test('items have a sell value', () => {
      const item = loot.generateItem('weapon', 'rare');
      expect(typeof item.value).toBe('number');
      expect(item.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateGuaranteedDrop', () => {
    test('respects minRarity', () => {
      const tierKeys = Object.keys(RARITY_TIERS);

      for (let i = 0; i < 20; i++) {
        const item = loot.generateGuaranteedDrop({ type: 'equipment', minRarity: 'rare' });
        const index = tierKeys.indexOf(item.rarity);
        const minIndex = tierKeys.indexOf('rare');
        expect(index).toBeGreaterThanOrEqual(minIndex);
      }
    });

    test('always returns an item', () => {
      const item = loot.generateGuaranteedDrop({ type: 'equipment', minRarity: 'legendary' });
      expect(item).toBeDefined();
      expect(item.id).toBeTruthy();
      expect(item.rarity).toBe('legendary');
    });
  });

  describe('generateShopInventory', () => {
    test('returns correct item counts', () => {
      const shop = loot.generateShopInventory(1);
      expect(shop.weapons.length).toBe(3);
      expect(shop.armors.length).toBe(3);
      expect(shop.accessories.length).toBe(2);
      expect(shop.consumables.length).toBe(Object.keys(CONSUMABLES).length);
    });

    test('tier 1 shop has no items above common rarity', () => {
      const shop = loot.generateShopInventory(1);
      const allEquipment = [...shop.weapons, ...shop.armors, ...shop.accessories];
      const tierKeys = Object.keys(RARITY_TIERS);
      for (const item of allEquipment) {
        const idx = tierKeys.indexOf(item.rarity);
        expect(idx).toBeLessThanOrEqual(1); // junk or common
      }
    });

    test('tier 2 shop has no items above rare rarity', () => {
      const shop = loot.generateShopInventory(2);
      const allEquipment = [...shop.weapons, ...shop.armors, ...shop.accessories];
      const tierKeys = Object.keys(RARITY_TIERS);
      for (const item of allEquipment) {
        const idx = tierKeys.indexOf(item.rarity);
        expect(idx).toBeLessThanOrEqual(2); // junk, common, or rare
      }
    });
  });

  describe('generateLootDrop', () => {
    test('handles empty loot tables', () => {
      const result = loot.generateLootDrop({ drops: [] });
      expect(result).toEqual([]);
    });

    test('handles null/undefined loot table', () => {
      expect(loot.generateLootDrop(null)).toEqual([]);
      expect(loot.generateLootDrop(undefined)).toEqual([]);
    });

    test('can generate consumable drops', () => {
      const table = {
        drops: [
          { type: 'consumable', itemId: 'health_stim', chance: 1.0, count: 2 }
        ]
      };
      const result = loot.generateLootDrop(table);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('health_stim');
      expect(result[0].count).toBe(2);
    });

    test('can generate equipment drops', () => {
      const table = {
        drops: [
          { type: 'equipment', slot: 'weapon', chance: 1.0 }
        ]
      };
      const result = loot.generateLootDrop(table);
      expect(result.length).toBe(1);
      expect(result[0].slot).toBe('weapon');
      expect(result[0].type).toBe('equipment');
    });

    test('respects drop chance (0 chance = no drops)', () => {
      const table = {
        drops: [
          { type: 'equipment', slot: 'weapon', chance: 0 }
        ]
      };
      const result = loot.generateLootDrop(table);
      expect(result.length).toBe(0);
    });
  });
});
