import { RARITY_TIERS, CONSUMABLES, BASE_WEAPONS, AFFIXES, getAffixesForSlot } from '../../src/data/items.js';

describe('Rarity tiers', () => {
  test('all 5 tiers defined', () => {
    const tiers = ['junk', 'common', 'rare', 'epic', 'legendary'];
    for (const tier of tiers) {
      expect(RARITY_TIERS[tier]).toBeDefined();
    }
  });

  test('drop weights sum to 100', () => {
    const total = Object.values(RARITY_TIERS).reduce((sum, t) => sum + t.dropWeight, 0);
    expect(total).toBe(100);
  });

  test('stat bonus ranges are ordered correctly', () => {
    const tiers = ['junk', 'common', 'rare', 'epic', 'legendary'];
    for (let i = 1; i < tiers.length; i++) {
      expect(RARITY_TIERS[tiers[i]].statBonusMin)
        .toBeGreaterThanOrEqual(RARITY_TIERS[tiers[i - 1]].statBonusMin);
    }
  });

  test('sell multipliers increase with rarity', () => {
    const tiers = ['junk', 'common', 'rare', 'epic', 'legendary'];
    for (let i = 1; i < tiers.length; i++) {
      expect(RARITY_TIERS[tiers[i]].sellMultiplier)
        .toBeGreaterThan(RARITY_TIERS[tiers[i - 1]].sellMultiplier);
    }
  });
});

describe('Consumables', () => {
  test('all consumables have required fields', () => {
    for (const item of Object.values(CONSUMABLES)) {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.type).toBe('consumable');
      expect(item.effect).toBeDefined();
      expect(item.buyPrice).toBeGreaterThan(0);
      expect(item.sellPrice).toBeGreaterThan(0);
    }
  });

  test('sell price is always less than buy price', () => {
    for (const item of Object.values(CONSUMABLES)) {
      expect(item.sellPrice).toBeLessThan(item.buyPrice);
    }
  });

  test('health_stim heals 30%', () => {
    expect(CONSUMABLES.health_stim.effect.healPercent).toBe(0.3);
  });
});

describe('Base weapons', () => {
  test('each weapon has equippableBy', () => {
    for (const weapon of Object.values(BASE_WEAPONS)) {
      expect(weapon.equippableBy).toBeDefined();
      expect(weapon.equippableBy.length).toBeGreaterThan(0);
    }
  });

  test('all weapon types present for each character', () => {
    const characters = ['sable', 'rook', 'pip', 'vesper'];
    for (const charId of characters) {
      const weapons = Object.values(BASE_WEAPONS).filter(w => w.equippableBy.includes(charId));
      expect(weapons.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('Affixes', () => {
  test('getAffixesForSlot returns correct affixes', () => {
    const weaponAffixes = getAffixesForSlot('weapon');
    // Should include weapon-specific + universal affixes
    expect(weaponAffixes.some(a => a.name === 'Scorching')).toBe(true);
    expect(weaponAffixes.some(a => a.name === 'Quick')).toBe(true);
    // Should not include armor-only affixes
    expect(weaponAffixes.some(a => a.name === 'Fortified')).toBe(false);
  });

  test('universal affixes appear for all slots', () => {
    const universalNames = ['Quick', 'Lucky', 'Charged', 'Sturdy'];
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const slotAffixes = getAffixesForSlot(slot);
      for (const name of universalNames) {
        expect(slotAffixes.some(a => a.name === name)).toBe(true);
      }
    }
  });
});
