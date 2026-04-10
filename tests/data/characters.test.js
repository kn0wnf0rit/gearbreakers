import { CHARACTERS, XP_TABLE, MAX_LEVEL } from '../../src/data/characters.js';

describe('Character definitions', () => {
  const characterIds = ['sable', 'rook', 'pip', 'vesper'];

  test('all 4 characters are defined', () => {
    for (const id of characterIds) {
      expect(CHARACTERS[id]).toBeDefined();
      expect(CHARACTERS[id].id).toBe(id);
    }
  });

  test('all characters have required base stats', () => {
    const requiredStats = ['HP', 'ATK', 'DEF', 'MAG', 'SPD', 'Charge'];
    for (const id of characterIds) {
      const char = CHARACTERS[id];
      for (const stat of requiredStats) {
        expect(char.baseStats[stat]).toBeDefined();
        expect(char.baseStats[stat]).toBeGreaterThan(0);
      }
    }
  });

  test('all characters have growth rates', () => {
    const requiredStats = ['HP', 'ATK', 'DEF', 'MAG', 'SPD', 'Charge'];
    for (const id of characterIds) {
      const char = CHARACTERS[id];
      for (const stat of requiredStats) {
        expect(char.growthRates[stat]).toBeDefined();
        expect(char.growthRates[stat]).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('each character has 3 skill trees', () => {
    for (const id of characterIds) {
      expect(CHARACTERS[id].skillTrees).toHaveLength(3);
    }
  });

  test('Sable has highest base HP', () => {
    const sableHP = CHARACTERS.sable.baseStats.HP;
    for (const id of ['rook', 'pip', 'vesper']) {
      expect(sableHP).toBeGreaterThan(CHARACTERS[id].baseStats.HP);
    }
  });

  test('Vesper has highest base MAG', () => {
    const vesperMAG = CHARACTERS.vesper.baseStats.MAG;
    for (const id of ['sable', 'rook', 'pip']) {
      expect(vesperMAG).toBeGreaterThan(CHARACTERS[id].baseStats.MAG);
    }
  });

  test('Rook has highest base SPD', () => {
    const rookSPD = CHARACTERS.rook.baseStats.SPD;
    for (const id of ['sable', 'pip', 'vesper']) {
      expect(rookSPD).toBeGreaterThan(CHARACTERS[id].baseStats.SPD);
    }
  });
});

describe('XP Table', () => {
  test('has entries for all levels 0 through MAX_LEVEL', () => {
    expect(XP_TABLE).toHaveLength(MAX_LEVEL + 1);
  });

  test('XP requirements are monotonically increasing', () => {
    for (let i = 2; i <= MAX_LEVEL; i++) {
      expect(XP_TABLE[i]).toBeGreaterThan(XP_TABLE[i - 1]);
    }
  });

  test('level 1 requires 0 XP', () => {
    expect(XP_TABLE[1]).toBe(0);
  });

  test('max level is 15', () => {
    expect(MAX_LEVEL).toBe(15);
  });
});
