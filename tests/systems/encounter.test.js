/**
 * Tests for EncounterSystem.
 */

import { EncounterSystem } from '../../src/systems/encounter.js';
import { SeededRNG } from '../../src/engine/utils.js';

const TEST_TABLE = [
  { enemies: ['scrap_drone'], weight: 5 },
  { enemies: ['scrap_drone', 'scrap_drone'], weight: 3 },
  { enemies: ['rust_hulk'], weight: 2 },
];

describe('EncounterSystem', () => {
  let rng;
  let encounter;

  beforeEach(() => {
    rng = new SeededRNG(42);
    encounter = new EncounterSystem({
      encounterTable: TEST_TABLE,
      minSteps: 15,
      maxSteps: 25,
      rng,
    });
  });

  describe('step counter', () => {
    test('increments step count on each step', () => {
      expect(encounter.getStepCount()).toBe(0);
      encounter.step();
      expect(encounter.getStepCount()).toBe(1);
      encounter.step();
      expect(encounter.getStepCount()).toBe(2);
    });

    test('does not trigger encounter before threshold', () => {
      for (let i = 0; i < 14; i++) {
        expect(encounter.step()).toBe(false);
      }
    });
  });

  describe('encounter triggering', () => {
    test('triggers encounter between minSteps and maxSteps', () => {
      let triggered = false;
      let stepsTaken = 0;

      for (let i = 0; i < 30; i++) {
        stepsTaken++;
        if (encounter.step()) {
          triggered = true;
          break;
        }
      }

      expect(triggered).toBe(true);
      expect(stepsTaken).toBeGreaterThanOrEqual(15);
      expect(stepsTaken).toBeLessThanOrEqual(25);
    });
  });

  describe('rollEncounter', () => {
    test('returns a valid enemy formation from the table', () => {
      const result = encounter.rollEncounter();
      expect(Array.isArray(result)).toBe(true);

      const validFormations = TEST_TABLE.map((e) => e.enemies);
      const matches = validFormations.some(
        (formation) =>
          formation.length === result.length &&
          formation.every((enemy, idx) => enemy === result[idx])
      );
      expect(matches).toBe(true);
    });

    test('returns enemies array, not the table entry itself', () => {
      const result = encounter.rollEncounter();
      expect(result).not.toHaveProperty('weight');
    });
  });

  describe('reset', () => {
    test('resets step counter to zero', () => {
      encounter.step();
      encounter.step();
      encounter.step();
      expect(encounter.getStepCount()).toBe(3);

      encounter.reset();
      expect(encounter.getStepCount()).toBe(0);
    });

    test('rolls a new threshold on reset', () => {
      const oldThreshold = encounter.threshold;
      let foundDifferent = false;
      for (let i = 0; i < 20; i++) {
        encounter.step();
        encounter.reset();
        if (encounter.threshold !== oldThreshold) {
          foundDifferent = true;
          break;
        }
      }
      expect(foundDifferent).toBe(true);
    });

    test('new threshold is within minSteps and maxSteps', () => {
      for (let i = 0; i < 50; i++) {
        encounter.reset();
        expect(encounter.threshold).toBeGreaterThanOrEqual(15);
        expect(encounter.threshold).toBeLessThanOrEqual(25);
      }
    });
  });

  describe('setEncounterTable', () => {
    test('changes the encounter table', () => {
      const newTable = [{ enemies: ['boss_mech'], weight: 1 }];
      encounter.setEncounterTable(newTable);

      const result = encounter.rollEncounter();
      expect(result).toEqual(['boss_mech']);
    });
  });

  describe('weighted selection distribution', () => {
    test('gives higher-weight entries more selections over many rolls', () => {
      const counts = { scrap_drone_1: 0, scrap_drone_2: 0, rust_hulk: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const result = encounter.rollEncounter();
        if (result.length === 1 && result[0] === 'scrap_drone') {
          counts.scrap_drone_1++;
        } else if (result.length === 2) {
          counts.scrap_drone_2++;
        } else if (result.length === 1 && result[0] === 'rust_hulk') {
          counts.rust_hulk++;
        }
      }

      // Weight 5 should appear most often, then weight 3, then weight 2
      expect(counts.scrap_drone_1).toBeGreaterThan(counts.rust_hulk);
      expect(counts.scrap_drone_1).toBeGreaterThan(counts.scrap_drone_2);
      expect(counts.scrap_drone_2).toBeGreaterThan(counts.rust_hulk * 0.5);
    });
  });
});
