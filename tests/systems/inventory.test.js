import { InventorySystem } from '../../src/systems/inventory.js';

function makeItem(overrides = {}) {
  return {
    id: 'item_test_' + Math.random().toString(36).slice(2, 8),
    name: 'Test Weapon',
    type: 'equipment',
    slot: 'weapon',
    rarity: 'common',
    stats: { ATK: 10 },
    affixes: [],
    equippableBy: ['sable'],
    value: 50,
    description: 'A test weapon.',
    ...overrides
  };
}

describe('InventorySystem', () => {
  let inv;

  beforeEach(() => {
    inv = new InventorySystem();
  });

  describe('equipment items', () => {
    test('add and retrieve equipment', () => {
      const item = makeItem();
      inv.addItem(item);
      expect(inv.items.length).toBe(1);
      expect(inv.items[0].id).toBe(item.id);
    });

    test('remove equipment by id', () => {
      const item1 = makeItem({ id: 'a1' });
      const item2 = makeItem({ id: 'a2' });
      inv.addItem(item1);
      inv.addItem(item2);

      const removed = inv.removeItem('a1');
      expect(removed.id).toBe('a1');
      expect(inv.items.length).toBe(1);
      expect(inv.items[0].id).toBe('a2');
    });

    test('remove returns null for missing item', () => {
      expect(inv.removeItem('nonexistent')).toBeNull();
    });
  });

  describe('consumables', () => {
    test('add consumables and stack counts', () => {
      inv.addConsumable('health_stim', 3);
      inv.addConsumable('health_stim', 2);
      expect(inv.getConsumableCount('health_stim')).toBe(5);
    });

    test('remove consumables', () => {
      inv.addConsumable('health_stim', 5);
      const result = inv.removeConsumable('health_stim', 3);
      expect(result).toBe(true);
      expect(inv.getConsumableCount('health_stim')).toBe(2);
    });

    test('remove returns false when not enough', () => {
      inv.addConsumable('health_stim', 2);
      expect(inv.removeConsumable('health_stim', 5)).toBe(false);
      expect(inv.getConsumableCount('health_stim')).toBe(2);
    });

    test('max 99 consumables', () => {
      inv.addConsumable('health_stim', 95);
      inv.addConsumable('health_stim', 10);
      expect(inv.getConsumableCount('health_stim')).toBe(99);
    });

    test('getConsumableCount returns 0 for missing consumable', () => {
      expect(inv.getConsumableCount('nonexistent')).toBe(0);
    });
  });

  describe('scrap (currency)', () => {
    test('starts with 100 scrap', () => {
      expect(inv.scrap).toBe(100);
    });

    test('add scrap', () => {
      inv.addScrap(50);
      expect(inv.scrap).toBe(150);
    });

    test('remove scrap succeeds when enough', () => {
      expect(inv.removeScrap(50)).toBe(true);
      expect(inv.scrap).toBe(50);
    });

    test('remove scrap fails when insufficient', () => {
      expect(inv.removeScrap(200)).toBe(false);
      expect(inv.scrap).toBe(100);
    });
  });

  describe('buyItem', () => {
    test('deducts scrap and adds item', () => {
      const item = makeItem();
      const result = inv.buyItem(item, 80);
      expect(result).toBe(true);
      expect(inv.scrap).toBe(20);
      expect(inv.items.length).toBe(1);
    });

    test('returns false when cannot afford', () => {
      const item = makeItem();
      const result = inv.buyItem(item, 200);
      expect(result).toBe(false);
      expect(inv.scrap).toBe(100);
      expect(inv.items.length).toBe(0);
    });
  });

  describe('sellItem', () => {
    test('removes item and adds scrap equal to sell value', () => {
      const item = makeItem({ id: 'sell1', value: 30 });
      inv.addItem(item);
      const gained = inv.sellItem('sell1');
      expect(gained).toBe(30);
      expect(inv.scrap).toBe(130);
      expect(inv.items.length).toBe(0);
    });

    test('returns false for non-existent item', () => {
      expect(inv.sellItem('nonexistent')).toBe(false);
    });
  });

  describe('getEquipmentForSlot', () => {
    test('filters by slot and character', () => {
      inv.addItem(makeItem({ id: 'w1', slot: 'weapon', equippableBy: ['sable'] }));
      inv.addItem(makeItem({ id: 'w2', slot: 'weapon', equippableBy: ['rook'] }));
      inv.addItem(makeItem({ id: 'a1', slot: 'armor', equippableBy: ['sable'] }));

      const sableWeapons = inv.getEquipmentForSlot('weapon', 'sable');
      expect(sableWeapons.length).toBe(1);
      expect(sableWeapons[0].id).toBe('w1');
    });

    test('includes items with empty equippableBy (universal)', () => {
      inv.addItem(makeItem({ id: 'u1', slot: 'weapon', equippableBy: [] }));
      const result = inv.getEquipmentForSlot('weapon', 'sable');
      expect(result.length).toBe(1);
    });
  });

  describe('serialize / deserialize', () => {
    test('roundtrip preserves state', () => {
      const item = makeItem({ id: 'persist1', value: 42 });
      inv.addItem(item);
      inv.addConsumable('health_stim', 5);
      inv.addScrap(200);

      const data = inv.serialize();
      const restored = InventorySystem.deserialize(data);

      expect(restored.items.length).toBe(1);
      expect(restored.items[0].id).toBe('persist1');
      expect(restored.items[0].value).toBe(42);
      expect(restored.getConsumableCount('health_stim')).toBe(5);
      expect(restored.scrap).toBe(300);
    });

    test('deserialize handles missing fields gracefully', () => {
      const restored = InventorySystem.deserialize({});
      expect(restored.items).toEqual([]);
      expect(restored.scrap).toBe(100);
    });
  });
});
