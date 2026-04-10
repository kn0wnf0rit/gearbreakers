import { jest } from '@jest/globals';
import { CombatEngine } from '../../src/systems/combat.js';
import { PartyMember } from '../../src/entities/PartyMember.js';
import { Enemy } from '../../src/entities/Enemy.js';
import { CHARACTERS } from '../../src/data/characters.js';
import { ENEMIES } from '../../src/data/enemies.js';
import { SeededRNG } from '../../src/engine/utils.js';

/**
 * Helper to create a basic combat engine with one party member and one enemy.
 */
function createBasicEngine(opts = {}) {
  const rng = new SeededRNG(opts.seed || 12345);
  const party = opts.party || [new PartyMember(CHARACTERS.sable, 3)];
  const enemies = opts.enemies || [new Enemy(ENEMIES.scrap_drone)];
  const isBoss = opts.isBoss || false;
  return new CombatEngine({ party, enemies, isBoss, rng });
}

describe('CombatEngine', () => {
  describe('initialization and startBattle', () => {
    it('sets up initial state correctly', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      expect(engine.round).toBe(1);
      expect(engine.battleEnded).toBe(false);
      expect(engine.battleResult).toBeNull();
      expect(engine.turnOrder.length).toBeGreaterThan(0);
    });

    it('calculates turn order by SPD (highest first)', () => {
      // Rook (SPD 16) should go before Sable (SPD 8)
      const rook = new PartyMember(CHARACTERS.rook, 1);
      const sable = new PartyMember(CHARACTERS.sable, 1);
      const enemy = new Enemy(ENEMIES.scrap_drone); // SPD 10
      const engine = createBasicEngine({
        party: [sable, rook],
        enemies: [enemy],
      });
      engine.startBattle();

      const names = engine.turnOrder.map(e => e.name);
      const rookIdx = names.indexOf('Rook');
      const sableIdx = names.indexOf('Sable');
      const droneIdx = names.indexOf('Scrap Drone');
      expect(rookIdx).toBeLessThan(droneIdx);
      expect(droneIdx).toBeLessThan(sableIdx);
    });

    it('battle is not ended at start', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const result = engine.checkBattleEnd();
      expect(result.ended).toBe(false);
      expect(result.result).toBeNull();
    });
  });

  describe('getAvailableActions', () => {
    it('includes Flee for non-boss battles', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const entity = engine.getCurrentTurnEntity();
      const actions = engine.getAvailableActions(entity);
      expect(actions).toContain('Flee');
      expect(actions).toContain('Attack');
      expect(actions).toContain('Defend');
      expect(actions).toContain('Skill');
      expect(actions).toContain('Item');
    });

    it('excludes Flee for boss battles', () => {
      const engine = createBasicEngine({ isBoss: true });
      engine.startBattle();
      const entity = engine.getCurrentTurnEntity();
      const actions = engine.getAvailableActions(entity);
      expect(actions).not.toContain('Flee');
    });
  });

  describe('attack action', () => {
    it('deals damage to the target', () => {
      const engine = createBasicEngine();
      engine.startBattle();

      const attacker = engine.getCurrentTurnEntity();
      const target = attacker.isPartyMember
        ? engine.enemies[0]
        : engine.party[0];

      const hpBefore = target.currentHP;
      const result = engine.executeAction({ type: 'attack', target });
      expect(result.success).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      expect(target.currentHP).toBeLessThan(hpBefore);
    });

    it('fails on dead target', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      engine.enemies[0].currentHP = 0;
      const result = engine.executeAction({
        type: 'attack',
        target: engine.enemies[0],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('defend action', () => {
    it('sets isDefending flag', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const actor = engine.getCurrentTurnEntity();
      const result = engine.executeAction({ type: 'defend' });
      expect(result.success).toBe(true);
      expect(actor.isDefending).toBe(true);
    });

    it('reduces incoming damage by 50%', () => {
      const sable = new PartyMember(CHARACTERS.sable, 5);
      sable.isDefending = true;
      const hpBefore = sable.currentHP;
      sable.takeDamage(100);
      const dmgTaken = hpBefore - sable.currentHP;
      expect(dmgTaken).toBe(50);
    });
  });

  describe('flee action', () => {
    it('works in non-boss battles', () => {
      // Use a seed that gives a high RNG roll and very fast party
      const sable = new PartyMember(CHARACTERS.rook, 10); // very high SPD
      const enemy = new Enemy(ENEMIES.slag_golem); // very low SPD (4)
      const engine = createBasicEngine({
        party: [sable],
        enemies: [enemy],
        seed: 999,
      });
      engine.startBattle();

      // The party member should go first (higher SPD)
      // Try fleeing multiple times with different seeds to verify the mechanic works
      let succeeded = false;
      for (let seed = 1; seed <= 20; seed++) {
        const eng = createBasicEngine({
          party: [new PartyMember(CHARACTERS.rook, 10)],
          enemies: [new Enemy(ENEMIES.slag_golem)],
          seed,
        });
        eng.startBattle();
        const actor = eng.getCurrentTurnEntity();
        if (actor.isPartyMember) {
          const res = eng.executeAction({ type: 'flee' });
          if (res.escaped) {
            succeeded = true;
            expect(eng.battleEnded).toBe(true);
            expect(eng.battleResult).toBe('fled');
            break;
          }
        }
      }
      expect(succeeded).toBe(true);
    });

    it('fails in boss battles', () => {
      const engine = createBasicEngine({ isBoss: true });
      engine.startBattle();

      // Advance to a party member turn
      let actor = engine.getCurrentTurnEntity();
      while (actor && !actor.isPartyMember) {
        engine.advanceTurn();
        actor = engine.getCurrentTurnEntity();
      }
      if (actor) {
        const result = engine.executeAction({ type: 'flee' });
        expect(result.escaped).toBeUndefined();
        expect(result.reason).toBe('Cannot flee from boss battles');
      }
    });
  });

  describe('status effects', () => {
    it('burn deals 5% max HP damage per turn tick', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const target = engine.party[0];
      engine.applyStatusEffect(target, { type: 'burn', duration: 3 });

      const hpBefore = target.currentHP;
      engine.tickStatusEffects(target);

      const expectedDamage = Math.floor(target.maxHP * 0.05);
      expect(target.currentHP).toBe(hpBefore - expectedDamage);
    });

    it('stun causes turn skip', () => {
      // Create engine with known turn order
      const sable = new PartyMember(CHARACTERS.sable, 1); // SPD 8
      const enemy = new Enemy(ENEMIES.rust_rat); // SPD 14
      const engine = createBasicEngine({
        party: [sable],
        enemies: [enemy],
      });
      engine.startBattle();

      // Enemy goes first (higher SPD)
      // Apply stun to sable
      engine.applyStatusEffect(sable, { type: 'stun', duration: 1 });

      // Execute enemy action
      const firstActor = engine.getCurrentTurnEntity();
      expect(firstActor.name).toBe('Rust Rat');
      engine.executeAction({ type: 'attack', target: sable });
      engine.advanceTurn();

      // Sable's turn should be skipped due to stun
      // The engine calls advanceTurn recursively on stun, so we end up in new round
      // Verify via log that stun skip occurred
      const stunSkips = engine.log.filter(l => l.type === 'stun_skip');
      expect(stunSkips.length).toBeGreaterThan(0);
      expect(stunSkips[0].entity).toBe('Sable');
    });

    it('corrode reduces DEF by 25%', () => {
      const enemy = new Enemy(ENEMIES.scrap_drone); // DEF 4
      enemy.statusEffects.push({ type: 'corrode', duration: 3 });
      expect(enemy.getEffectiveStat('DEF')).toBe(Math.floor(4 * 0.75));
    });

    it('status effects expire after duration', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const target = engine.party[0];
      engine.applyStatusEffect(target, { type: 'burn', duration: 1 });
      expect(target.statusEffects.length).toBe(1);

      engine.tickStatusEffects(target);
      // Duration was 1, after tick it becomes 0 and is removed
      expect(target.statusEffects.length).toBe(0);
    });

    it('status effects persist until expired', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const target = engine.party[0];
      engine.applyStatusEffect(target, { type: 'corrode', duration: 3 });

      engine.tickStatusEffects(target);
      expect(target.statusEffects.length).toBe(1);
      expect(target.statusEffects[0].duration).toBe(2);

      engine.tickStatusEffects(target);
      expect(target.statusEffects[0].duration).toBe(1);

      engine.tickStatusEffects(target);
      expect(target.statusEffects.length).toBe(0);
    });

    it('refreshes duration when reapplying same effect', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const target = engine.party[0];
      engine.applyStatusEffect(target, { type: 'burn', duration: 2 });
      engine.applyStatusEffect(target, { type: 'burn', duration: 5 });
      expect(target.statusEffects.length).toBe(1);
      expect(target.statusEffects[0].duration).toBe(5);
    });
  });

  describe('battle end conditions', () => {
    it('victory when all enemies dead', () => {
      const engine = createBasicEngine();
      engine.startBattle();

      // Kill the enemy
      engine.enemies[0].currentHP = 0;
      const result = engine.checkBattleEnd();
      expect(result.ended).toBe(true);
      expect(result.result).toBe('victory');
    });

    it('defeat when all party dead', () => {
      const engine = createBasicEngine();
      engine.startBattle();

      // Kill the party
      engine.party[0].currentHP = 0;
      const result = engine.checkBattleEnd();
      expect(result.ended).toBe(true);
      expect(result.result).toBe('defeat');
    });

    it('not ended while both sides have living members', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const result = engine.checkBattleEnd();
      expect(result.ended).toBe(false);
    });
  });

  describe('rewards calculation', () => {
    it('calculates XP and scrap from defeated enemies', () => {
      const enemy1 = new Enemy(ENEMIES.scrap_drone);
      const enemy2 = new Enemy(ENEMIES.rust_rat);
      const engine = createBasicEngine({ enemies: [enemy1, enemy2] });
      engine.startBattle();

      // Kill both
      enemy1.currentHP = 0;
      enemy2.currentHP = 0;

      const rewards = engine.calculateRewards();
      expect(rewards.xp).toBe(
        ENEMIES.scrap_drone.xpReward + ENEMIES.rust_rat.xpReward
      );
      expect(rewards.scrap).toBe(
        ENEMIES.scrap_drone.scrapReward + ENEMIES.rust_rat.scrapReward
      );
    });

    it('does not include rewards for living enemies', () => {
      const enemy1 = new Enemy(ENEMIES.scrap_drone);
      const enemy2 = new Enemy(ENEMIES.rust_rat);
      const engine = createBasicEngine({ enemies: [enemy1, enemy2] });
      engine.startBattle();

      // Kill only one
      enemy1.currentHP = 0;

      const rewards = engine.calculateRewards();
      expect(rewards.xp).toBe(ENEMIES.scrap_drone.xpReward);
      expect(rewards.scrap).toBe(ENEMIES.scrap_drone.scrapReward);
    });

    it('includes loot from defeated enemies', () => {
      const engine = createBasicEngine({ seed: 1 });
      engine.startBattle();
      engine.enemies[0].currentHP = 0;

      const rewards = engine.calculateRewards();
      // loot is an array; may or may not contain items depending on RNG
      expect(Array.isArray(rewards.loot)).toBe(true);
    });
  });

  describe('turn advancement', () => {
    it('advances to the next entity', () => {
      const sable = new PartyMember(CHARACTERS.sable, 1);
      const rook = new PartyMember(CHARACTERS.rook, 1);
      const enemy = new Enemy(ENEMIES.scrap_drone);
      const engine = createBasicEngine({
        party: [sable, rook],
        enemies: [enemy],
      });
      engine.startBattle();

      const first = engine.getCurrentTurnEntity();
      engine.executeAction({
        type: 'attack',
        target: first.isPartyMember ? enemy : sable,
      });
      engine.advanceTurn();

      const second = engine.getCurrentTurnEntity();
      expect(second).not.toBe(first);
    });

    it('recalculates turn order each new round', () => {
      const sable = new PartyMember(CHARACTERS.sable, 1);
      const enemy = new Enemy(ENEMIES.scrap_drone);
      const engine = createBasicEngine({
        party: [sable],
        enemies: [enemy],
      });
      engine.startBattle();
      expect(engine.round).toBe(1);

      // Execute and advance through all turns
      for (let i = 0; i < engine.turnOrder.length; i++) {
        const actor = engine.getCurrentTurnEntity();
        if (actor) {
          engine.executeAction({
            type: 'attack',
            target: actor.isPartyMember ? enemy : sable,
          });
          engine.advanceTurn();
        }
      }

      // Should be round 2 now
      expect(engine.round).toBe(2);
      const newRoundLog = engine.log.filter(l => l.type === 'new_round');
      expect(newRoundLog.length).toBeGreaterThan(0);
    });

    it('skips dead entities in turn order', () => {
      const sable = new PartyMember(CHARACTERS.sable, 1);
      const enemy1 = new Enemy(ENEMIES.scrap_drone);
      const enemy2 = new Enemy(ENEMIES.rust_rat);
      const engine = createBasicEngine({
        party: [sable],
        enemies: [enemy1, enemy2],
      });
      engine.startBattle();

      // Kill enemy1
      enemy1.currentHP = 0;

      // Advance turns — dead enemy should be skipped
      const visited = [];
      for (let i = 0; i < 10; i++) {
        const actor = engine.getCurrentTurnEntity();
        if (!actor || engine.battleEnded) break;
        visited.push(actor.name);
        engine.executeAction({
          type: 'attack',
          target: actor.isPartyMember ? enemy2 : sable,
        });
        engine.advanceTurn();
      }
      expect(visited).not.toContain('Scrap Drone');
    });
  });

  describe('getBattleState', () => {
    it('returns a complete state snapshot', () => {
      const engine = createBasicEngine();
      engine.startBattle();
      const state = engine.getBattleState();

      expect(state.round).toBe(1);
      expect(state.party.length).toBe(1);
      expect(state.enemies.length).toBe(1);
      expect(state.party[0].name).toBe('Sable');
      expect(state.enemies[0].name).toBe('Scrap Drone');
      expect(state.turnOrder.length).toBeGreaterThan(0);
      expect(state.battleEnded).toBe(false);
      expect(state.battleResult).toBeNull();
      expect(typeof state.party[0].currentHP).toBe('number');
      expect(typeof state.party[0].maxHP).toBe('number');
      expect(typeof state.party[0].alive).toBe('boolean');
    });
  });
});
