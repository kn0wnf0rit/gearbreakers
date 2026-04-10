import { jest } from '@jest/globals';
import { Enemy } from '../../src/entities/Enemy.js';
import { ENEMIES, BOSSES } from '../../src/data/enemies.js';
import { SeededRNG } from '../../src/engine/utils.js';

describe('Enemy', () => {
  let enemy;

  beforeEach(() => {
    enemy = new Enemy(ENEMIES.scrap_drone);
  });

  describe('constructor', () => {
    it('creates from enemy data with correct properties', () => {
      expect(enemy.id).toBe('scrap_drone');
      expect(enemy.name).toBe('Scrap Drone');
      expect(enemy.maxHP).toBe(30);
      expect(enemy.currentHP).toBe(30);
      expect(enemy.stats.ATK).toBe(8);
      expect(enemy.stats.DEF).toBe(4);
      expect(enemy.stats.SPD).toBe(10);
      expect(enemy.element).toBe('voltaic');
      expect(enemy.xpReward).toBe(15);
      expect(enemy.scrapReward).toBe(10);
      expect(enemy.ai).toBe('basic_attacker');
      expect(enemy.isPartyMember).toBe(false);
      expect(enemy.isBoss).toBe(false);
      expect(enemy.statusEffects).toEqual([]);
    });

    it('sets isBoss from definition', () => {
      const boss = new Enemy(BOSSES.furnace_rex);
      expect(boss.isBoss).toBe(true);
    });

    it('handles null element', () => {
      const e = new Enemy(ENEMIES.scavenger_thug);
      expect(e.element).toBeNull();
    });
  });

  describe('takeDamage', () => {
    it('reduces HP by damage amount', () => {
      const actual = enemy.takeDamage(10);
      expect(enemy.currentHP).toBe(20);
      expect(actual).toBe(10);
    });

    it('does not reduce HP below 0', () => {
      const actual = enemy.takeDamage(999);
      expect(enemy.currentHP).toBe(0);
      expect(actual).toBe(30);
    });

    it('returns 0 when already at 0 HP', () => {
      enemy.currentHP = 0;
      const actual = enemy.takeDamage(10);
      expect(actual).toBe(0);
    });
  });

  describe('getEffectiveStat', () => {
    it('returns base stat with no effects', () => {
      expect(enemy.getEffectiveStat('ATK')).toBe(8);
      expect(enemy.getEffectiveStat('DEF')).toBe(4);
    });

    it('applies corrode to DEF (25% reduction)', () => {
      enemy.statusEffects.push({ type: 'corrode', duration: 3 });
      expect(enemy.getEffectiveStat('DEF')).toBe(Math.floor(4 * 0.75));
      // ATK unaffected
      expect(enemy.getEffectiveStat('ATK')).toBe(8);
    });

    it('applies overclock to ATK and SPD (20% increase)', () => {
      enemy.statusEffects.push({ type: 'overclock', duration: 2 });
      expect(enemy.getEffectiveStat('ATK')).toBe(Math.floor(8 * 1.2));
      expect(enemy.getEffectiveStat('SPD')).toBe(Math.floor(10 * 1.2));
      // DEF unaffected
      expect(enemy.getEffectiveStat('DEF')).toBe(4);
    });
  });

  describe('chooseAction', () => {
    const makeAliveParty = () => [
      { id: 'a', name: 'Alice', currentHP: 100, maxHP: 100 },
      { id: 'b', name: 'Bob', currentHP: 30, maxHP: 100 },
      { id: 'c', name: 'Carol', currentHP: 60, maxHP: 100 },
    ];

    it('basic_attacker picks a random target', () => {
      const rng = new SeededRNG(42);
      const state = { party: makeAliveParty(), enemies: [enemy] };
      const action = enemy.chooseAction(state, rng);
      expect(action.type).toBe('attack');
      expect(action.target).toBeDefined();
      expect(state.party).toContain(action.target);
    });

    it('target_weakest picks the lowest HP party member', () => {
      const weakestEnemy = new Enemy(ENEMIES.scavenger_thug);
      const party = makeAliveParty();
      const state = { party, enemies: [weakestEnemy] };
      const action = weakestEnemy.chooseAction(state);
      expect(action.type).toBe('attack');
      expect(action.target.id).toBe('b'); // Bob has lowest HP (30)
    });

    it('magic_attacker uses magic_attack when MAG > ATK', () => {
      const magEnemy = new Enemy(ENEMIES.shock_turret); // MAG 14 > ATK 10
      const rng = new SeededRNG(42);
      const state = { party: makeAliveParty(), enemies: [magEnemy] };
      const action = magEnemy.chooseAction(state, rng);
      expect(action.type).toBe('magic_attack');
    });

    it('magic_attacker falls back to attack when ATK >= MAG', () => {
      const normalEnemy = new Enemy(ENEMIES.scrap_drone); // ATK 8, MAG 0
      normalEnemy.ai = 'magic_attacker';
      const rng = new SeededRNG(42);
      const state = { party: makeAliveParty(), enemies: [normalEnemy] };
      const action = normalEnemy.chooseAction(state, rng);
      expect(action.type).toBe('attack');
    });

    it('returns null target when all party dead', () => {
      const state = { party: [{ currentHP: 0 }, { currentHP: 0 }], enemies: [enemy] };
      const action = enemy.chooseAction(state);
      expect(action.target).toBeNull();
    });
  });
});
