import { ProgressionSystem } from '../../src/systems/progression.js';
import { XP_TABLE, MAX_LEVEL, CHARACTERS } from '../../src/data/characters.js';
import { SKILL_TREES } from '../../src/data/skills.js';

function makeMember(id, overrides = {}) {
  const charData = CHARACTERS[id];
  return {
    id,
    characterId: id,
    name: charData.name,
    level: 1,
    xp: 0,
    skillPoints: 0,
    stats: { ...charData.baseStats },
    unlockedSkills: [],
    isAlive: true,
    ...overrides
  };
}

describe('ProgressionSystem', () => {
  let sys;

  beforeEach(() => {
    sys = new ProgressionSystem();
  });

  describe('awardXP', () => {
    test('distributes XP equally to living members and triggers level up', () => {
      const party = [makeMember('sable'), makeMember('rook')];
      // XP_TABLE[2] = 100, so giving 200 total => 100 each => both should level to 2
      const events = sys.awardXP(party, 200);

      expect(events.length).toBe(2);
      expect(events[0].characterId).toBe('sable');
      expect(events[0].newLevel).toBe(2);
      expect(events[1].characterId).toBe('rook');
      expect(events[1].newLevel).toBe(2);

      expect(party[0].level).toBe(2);
      expect(party[1].level).toBe(2);
      expect(party[0].xp).toBe(100);
      expect(party[1].xp).toBe(100);
    });

    test('does not award XP to dead members', () => {
      const party = [
        makeMember('sable'),
        makeMember('rook', { isAlive: false })
      ];
      const events = sys.awardXP(party, 200);

      // All 200 goes to sable (only living member)
      expect(party[0].xp).toBe(200);
      expect(party[1].xp).toBe(0);
      // Sable reaches level 2 (needs 100) and level 3 (needs 250) — only level 2
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0].newLevel).toBe(2);
    });

    test('multiple level ups from large XP award', () => {
      const party = [makeMember('pip')];
      // XP_TABLE: level2=100, level3=250, level4=500
      // Give 600 XP => should reach level 4
      const events = sys.awardXP(party, 600);

      expect(events.length).toBe(3); // levels 2, 3, 4
      expect(events[0].newLevel).toBe(2);
      expect(events[1].newLevel).toBe(3);
      expect(events[2].newLevel).toBe(4);
      expect(party[0].level).toBe(4);
    });

    test('level up awards skill points', () => {
      const party = [makeMember('vesper')];
      sys.awardXP(party, 600); // 3 level-ups
      expect(party[0].skillPoints).toBe(3);
    });

    test('level up grants stat gains from growth rates', () => {
      const party = [makeMember('sable')];
      const origHP = party[0].stats.HP;
      sys.awardXP(party, 100); // level 2
      expect(party[0].stats.HP).toBeGreaterThan(origHP);
      expect(party[0].level).toBe(2);
    });
  });

  describe('canUnlockSkill', () => {
    test('returns true when member has SP and skill is first in tree', () => {
      const member = makeMember('sable', { skillPoints: 1 });
      expect(sys.canUnlockSkill(member, 'taunt')).toBe(true);
    });

    test('returns false when member has no SP', () => {
      const member = makeMember('sable', { skillPoints: 0 });
      expect(sys.canUnlockSkill(member, 'taunt')).toBe(false);
    });

    test('returns false when skill is already unlocked', () => {
      const member = makeMember('sable', { skillPoints: 2, unlockedSkills: ['taunt'] });
      expect(sys.canUnlockSkill(member, 'taunt')).toBe(false);
    });

    test('returns false when prior tree nodes are not unlocked (tree order)', () => {
      const member = makeMember('sable', { skillPoints: 1 });
      // iron_skin is second in ironwall tree, needs taunt first
      expect(sys.canUnlockSkill(member, 'iron_skin')).toBe(false);
    });

    test('returns true when prior nodes are unlocked', () => {
      const member = makeMember('sable', { skillPoints: 1, unlockedSkills: ['taunt'] });
      expect(sys.canUnlockSkill(member, 'iron_skin')).toBe(true);
    });

    test('returns false for a skill from another character tree', () => {
      const member = makeMember('sable', { skillPoints: 1 });
      // aimed_shot belongs to rook's marksman tree
      expect(sys.canUnlockSkill(member, 'aimed_shot')).toBe(false);
    });
  });

  describe('unlockSkill', () => {
    test('spends 1 SP and adds skill to unlockedSkills', () => {
      const member = makeMember('rook', { skillPoints: 2 });
      const result = sys.unlockSkill(member, 'aimed_shot');

      expect(result).not.toBeNull();
      expect(result.id).toBe('aimed_shot');
      expect(member.skillPoints).toBe(1);
      expect(member.unlockedSkills).toContain('aimed_shot');
    });

    test('returns null when cannot unlock', () => {
      const member = makeMember('rook', { skillPoints: 0 });
      const result = sys.unlockSkill(member, 'aimed_shot');
      expect(result).toBeNull();
    });
  });

  describe('getSkillTreeState', () => {
    test('shows correct lock states for partially unlocked tree', () => {
      const member = makeMember('sable', { unlockedSkills: ['taunt'] });
      const state = sys.getSkillTreeState(member, 'ironwall');

      expect(state.length).toBe(5);
      expect(state[0].id).toBe('taunt');
      expect(state[0].state).toBe('unlocked');
      expect(state[1].id).toBe('iron_skin');
      expect(state[1].state).toBe('available');
      expect(state[2].state).toBe('locked');
      expect(state[3].state).toBe('locked');
      expect(state[4].state).toBe('locked');
    });

    test('first node is available when nothing is unlocked', () => {
      const member = makeMember('sable');
      const state = sys.getSkillTreeState(member, 'ironwall');
      expect(state[0].state).toBe('available');
      expect(state[1].state).toBe('locked');
    });

    test('returns empty array for invalid tree', () => {
      const member = makeMember('sable');
      const state = sys.getSkillTreeState(member, 'nonexistent');
      expect(state).toEqual([]);
    });
  });

  describe('getAvailableSkills', () => {
    test('returns only non-passive unlocked skills', () => {
      // immovable is a passive, taunt is a buff
      const member = makeMember('sable', {
        unlockedSkills: ['taunt', 'iron_skin', 'counter_stance', 'fortress', 'immovable']
      });
      const skills = sys.getAvailableSkills(member);
      const ids = skills.map(s => s.id);

      expect(ids).toContain('taunt');
      expect(ids).toContain('iron_skin');
      expect(ids).not.toContain('immovable');
    });
  });

  describe('MAX_LEVEL cap', () => {
    test('does not level past MAX_LEVEL', () => {
      const member = makeMember('sable', { level: MAX_LEVEL, xp: 99999 });
      const events = sys.awardXP([member], 50000);
      expect(events.length).toBe(0);
      expect(member.level).toBe(MAX_LEVEL);
    });
  });
});
