import {
  SeededRNG,
  calculateBaseDamage,
  getElementMultiplier,
  calculateFinalDamage,
  rollCrit,
  rollFlee,
  clamp,
  calculateTurnOrder
} from '../../src/engine/utils.js';

describe('SeededRNG', () => {
  test('produces deterministic results from the same seed', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);
    for (let i = 0; i < 20; i++) {
      expect(rng1.random()).toBe(rng2.random());
    }
  });

  test('different seeds produce different sequences', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(99);
    const results1 = Array.from({ length: 5 }, () => rng1.random());
    const results2 = Array.from({ length: 5 }, () => rng2.random());
    expect(results1).not.toEqual(results2);
  });

  test('random() returns values in [0, 1)', () => {
    const rng = new SeededRNG(123);
    for (let i = 0; i < 1000; i++) {
      const val = rng.random();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  test('randInt returns values in [min, max] inclusive', () => {
    const rng = new SeededRNG(456);
    const results = new Set();
    for (let i = 0; i < 1000; i++) {
      const val = rng.randInt(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
      results.add(val);
    }
    // Should have hit all values 1-6 in 1000 tries
    expect(results.size).toBe(6);
  });

  test('randFloat returns values in [min, max)', () => {
    const rng = new SeededRNG(789);
    for (let i = 0; i < 100; i++) {
      const val = rng.randFloat(5.0, 10.0);
      expect(val).toBeGreaterThanOrEqual(5.0);
      expect(val).toBeLessThan(10.0);
    }
  });

  test('pick returns elements from the array', () => {
    const rng = new SeededRNG(42);
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  test('pick returns undefined for empty array', () => {
    const rng = new SeededRNG(42);
    expect(rng.pick([])).toBeUndefined();
  });

  test('weightedPick respects weights', () => {
    const rng = new SeededRNG(42);
    const items = [
      { id: 'common', weight: 90 },
      { id: 'rare', weight: 10 }
    ];
    const counts = { common: 0, rare: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[rng.weightedPick(items).id]++;
    }
    // Common should vastly outnumber rare
    expect(counts.common).toBeGreaterThan(counts.rare * 3);
  });
});

describe('calculateBaseDamage', () => {
  test('basic damage calculation', () => {
    expect(calculateBaseDamage(10, 5, 8, 3)).toBe(14); // (10*2+5)-(8+3) = 14
  });

  test('minimum damage is 1', () => {
    expect(calculateBaseDamage(1, 0, 50, 50)).toBe(1);
  });

  test('zero defense', () => {
    expect(calculateBaseDamage(10, 5, 0, 0)).toBe(25); // 10*2+5 = 25
  });
});

describe('getElementMultiplier', () => {
  test('thermal beats corrosion', () => {
    expect(getElementMultiplier('thermal', 'corrosion')).toBe(1.5);
  });

  test('voltaic beats thermal', () => {
    expect(getElementMultiplier('voltaic', 'thermal')).toBe(1.5);
  });

  test('corrosion beats voltaic', () => {
    expect(getElementMultiplier('corrosion', 'voltaic')).toBe(1.5);
  });

  test('weak matchups return 0.5', () => {
    expect(getElementMultiplier('thermal', 'voltaic')).toBe(0.5);
    expect(getElementMultiplier('voltaic', 'corrosion')).toBe(0.5);
    expect(getElementMultiplier('corrosion', 'thermal')).toBe(0.5);
  });

  test('same element is neutral', () => {
    expect(getElementMultiplier('thermal', 'thermal')).toBe(1.0);
  });

  test('null elements are neutral', () => {
    expect(getElementMultiplier(null, 'thermal')).toBe(1.0);
    expect(getElementMultiplier('thermal', null)).toBe(1.0);
    expect(getElementMultiplier(null, null)).toBe(1.0);
  });
});

describe('calculateFinalDamage', () => {
  test('basic damage with fixed RNG', () => {
    const rng = new SeededRNG(42);
    const result = calculateFinalDamage({
      atk: 14, weaponPower: 8, def: 10, armorRating: 4,
      rng
    });
    expect(result.damage).toBeGreaterThanOrEqual(1);
    expect(result.isCrit).toBe(false);
    expect(result.elementEffect).toBe('neutral');
  });

  test('critical hit multiplies damage', () => {
    const rng = new SeededRNG(42);
    const normal = calculateFinalDamage({
      atk: 20, weaponPower: 10, def: 5, armorRating: 0,
      rng
    });
    const rng2 = new SeededRNG(42);
    const crit = calculateFinalDamage({
      atk: 20, weaponPower: 10, def: 5, armorRating: 0,
      isCrit: true, rng: rng2
    });
    expect(crit.damage).toBeGreaterThan(normal.damage);
  });

  test('elemental advantage increases damage', () => {
    const rng1 = new SeededRNG(42);
    const neutral = calculateFinalDamage({
      atk: 20, weaponPower: 10, def: 5, armorRating: 0,
      rng: rng1
    });
    const rng2 = new SeededRNG(42);
    const strong = calculateFinalDamage({
      atk: 20, weaponPower: 10, def: 5, armorRating: 0,
      attackElement: 'thermal', defenderElement: 'corrosion',
      rng: rng2
    });
    expect(strong.damage).toBeGreaterThan(neutral.damage);
    expect(strong.elementEffect).toBe('strong');
  });

  test('minimum damage is always 1', () => {
    const rng = new SeededRNG(42);
    const result = calculateFinalDamage({
      atk: 1, weaponPower: 0, def: 100, armorRating: 100,
      rng
    });
    expect(result.damage).toBe(1);
  });
});

describe('rollCrit', () => {
  test('never crits with 0% rate', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 100; i++) {
      expect(rollCrit(0, 0, rng)).toBe(false);
    }
  });

  test('always crits with 100% rate', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 100; i++) {
      expect(rollCrit(1.0, 0, rng)).toBe(true);
    }
  });
});

describe('rollFlee', () => {
  test('always flees when enemy SPD is 0', () => {
    const rng = new SeededRNG(42);
    expect(rollFlee(10, 0, rng)).toBe(true);
  });

  test('high party SPD increases flee chance', () => {
    const rng = new SeededRNG(42);
    let successes = 0;
    for (let i = 0; i < 1000; i++) {
      if (rollFlee(20, 5, new SeededRNG(i))) successes++;
    }
    // With 4x SPD advantage, should flee most of the time (capped at 100%)
    expect(successes).toBeGreaterThan(900);
  });
});

describe('clamp', () => {
  test('clamps to min', () => expect(clamp(-5, 0, 10)).toBe(0));
  test('clamps to max', () => expect(clamp(15, 0, 10)).toBe(10));
  test('returns value if in range', () => expect(clamp(5, 0, 10)).toBe(5));
});

describe('calculateTurnOrder', () => {
  test('sorts by SPD descending', () => {
    const combatants = [
      { id: 'a', name: 'A', stats: { SPD: 5 }, isPartyMember: true },
      { id: 'b', name: 'B', stats: { SPD: 15 }, isPartyMember: false },
      { id: 'c', name: 'C', stats: { SPD: 10 }, isPartyMember: true }
    ];
    const order = calculateTurnOrder(combatants);
    expect(order[0].id).toBe('b');
    expect(order[1].id).toBe('c');
    expect(order[2].id).toBe('a');
  });

  test('party members go first on ties', () => {
    const combatants = [
      { id: 'enemy', name: 'E', stats: { SPD: 10 }, isPartyMember: false },
      { id: 'hero', name: 'H', stats: { SPD: 10 }, isPartyMember: true }
    ];
    const order = calculateTurnOrder(combatants);
    expect(order[0].id).toBe('hero');
    expect(order[1].id).toBe('enemy');
  });

  test('alphabetical tiebreak within same type', () => {
    const combatants = [
      { id: 'z', name: 'Zebra', stats: { SPD: 10 }, isPartyMember: true },
      { id: 'a', name: 'Alpha', stats: { SPD: 10 }, isPartyMember: true }
    ];
    const order = calculateTurnOrder(combatants);
    expect(order[0].id).toBe('a');
    expect(order[1].id).toBe('z');
  });

  test('does not mutate original array', () => {
    const combatants = [
      { id: 'a', name: 'A', stats: { SPD: 5 }, isPartyMember: true },
      { id: 'b', name: 'B', stats: { SPD: 15 }, isPartyMember: true }
    ];
    const original = [...combatants];
    calculateTurnOrder(combatants);
    expect(combatants[0].id).toBe(original[0].id);
  });
});
