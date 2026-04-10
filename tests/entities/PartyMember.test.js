import { jest } from '@jest/globals';
import { PartyMember } from '../../src/entities/PartyMember.js';
import { CHARACTERS, XP_TABLE, MAX_LEVEL } from '../../src/data/characters.js';

describe('PartyMember', () => {
  let member;

  beforeEach(() => {
    member = new PartyMember(CHARACTERS.sable);
  });

  describe('constructor', () => {
    it('creates with correct base stats from character data', () => {
      expect(member.id).toBe('sable');
      expect(member.name).toBe('Sable');
      expect(member.level).toBe(1);
      expect(member.maxHP).toBe(120);
      expect(member.currentHP).toBe(120);
      expect(member.stats.ATK).toBe(14);
      expect(member.stats.DEF).toBe(16);
      expect(member.stats.MAG).toBe(4);
      expect(member.stats.SPD).toBe(8);
      expect(member.maxCharge).toBe(10);
      expect(member.isPartyMember).toBe(true);
      expect(member.isDefending).toBe(false);
    });

    it('creates at a specified level with growth applied', () => {
      const lvl5 = new PartyMember(CHARACTERS.sable, 5);
      expect(lvl5.level).toBe(5);
      // 4 level-ups worth of HP growth: 120 + 4*35 = 260
      expect(lvl5.maxHP).toBe(260);
      expect(lvl5.currentHP).toBe(260);
      // ATK: 14 + 4*4 = 30
      expect(lvl5.stats.ATK).toBe(30);
    });

    it('initializes equipment slots as null', () => {
      expect(member.equipment.weapon).toBeNull();
      expect(member.equipment.armor).toBeNull();
      expect(member.equipment.accessory).toBeNull();
    });

    it('starts with empty skill and status arrays', () => {
      expect(member.unlockedSkills).toEqual([]);
      expect(member.statusEffects).toEqual([]);
    });
  });

  describe('levelUp', () => {
    it('applies growth rates on level up', () => {
      const hpBefore = member.maxHP;
      const atkBefore = member.stats.ATK;
      member.levelUp();
      expect(member.level).toBe(2);
      expect(member.maxHP).toBe(hpBefore + CHARACTERS.sable.growthRates.HP);
      expect(member.stats.ATK).toBe(atkBefore + CHARACTERS.sable.growthRates.ATK);
    });

    it('grants 1 skill point per level', () => {
      expect(member.skillPoints).toBe(0);
      member.levelUp();
      expect(member.skillPoints).toBe(1);
      member.levelUp();
      expect(member.skillPoints).toBe(2);
    });

    it('restores HP and Charge to max on level up', () => {
      member.currentHP = 10;
      member.currentCharge = 1;
      member.levelUp();
      expect(member.currentHP).toBe(member.maxHP);
      expect(member.currentCharge).toBe(member.maxCharge);
    });

    it('does not exceed MAX_LEVEL', () => {
      // Force to max level
      for (let i = 0; i < 20; i++) member.levelUp();
      expect(member.level).toBe(MAX_LEVEL);
      const hpAtMax = member.maxHP;
      member.levelUp();
      expect(member.level).toBe(MAX_LEVEL);
      expect(member.maxHP).toBe(hpAtMax);
    });
  });

  describe('addXP', () => {
    it('accumulates XP without level up when under threshold', () => {
      member.addXP(50);
      expect(member.xp).toBe(50);
      expect(member.level).toBe(1);
    });

    it('triggers level up at threshold', () => {
      member.addXP(XP_TABLE[2]); // Exactly enough for level 2
      expect(member.level).toBe(2);
    });

    it('chains multiple level ups with large XP gain', () => {
      member.addXP(XP_TABLE[4]); // Enough for level 4
      expect(member.level).toBe(4);
      expect(member.skillPoints).toBe(3);
    });
  });

  describe('unlockSkill', () => {
    beforeEach(() => {
      member.skillPoints = 3;
    });

    it('unlocks the first skill in a tree', () => {
      // Sable's ironwall tree first node is 'taunt'
      const result = member.unlockSkill('taunt');
      expect(result).toBe(true);
      expect(member.unlockedSkills).toContain('taunt');
      expect(member.skillPoints).toBe(2);
    });

    it('fails to unlock a skill without enough SP', () => {
      member.skillPoints = 0;
      expect(member.unlockSkill('taunt')).toBe(false);
    });

    it('fails to unlock out-of-sequence skill', () => {
      // Try to unlock 2nd node without 1st
      expect(member.unlockSkill('iron_skin')).toBe(false);
    });

    it('fails to unlock skill from another character tree', () => {
      expect(member.unlockSkill('aimed_shot')).toBe(false);
    });

    it('fails to unlock already-unlocked skill', () => {
      member.unlockSkill('taunt');
      expect(member.unlockSkill('taunt')).toBe(false);
    });
  });

  describe('equipItem', () => {
    it('equips a weapon and returns null when slot was empty', () => {
      const weapon = { slot: 'weapon', basePower: 10, name: 'Test Sword' };
      const old = member.equipItem(weapon);
      expect(old).toBeNull();
      expect(member.equipment.weapon).toBe(weapon);
    });

    it('returns old item when replacing equipment', () => {
      const weapon1 = { slot: 'weapon', basePower: 10, name: 'Old Sword' };
      const weapon2 = { slot: 'weapon', basePower: 20, name: 'New Sword' };
      member.equipItem(weapon1);
      const old = member.equipItem(weapon2);
      expect(old).toBe(weapon1);
      expect(member.equipment.weapon).toBe(weapon2);
    });

    it('equips armor to armor slot', () => {
      const armor = { slot: 'armor', baseDEF: 5, name: 'Test Armor' };
      member.equipItem(armor);
      expect(member.equipment.armor).toBe(armor);
    });
  });

  describe('takeDamage and heal', () => {
    it('reduces HP by damage amount', () => {
      const dmg = member.takeDamage(30);
      expect(member.currentHP).toBe(90);
      expect(dmg).toBe(30);
    });

    it('does not reduce HP below 0', () => {
      member.takeDamage(999);
      expect(member.currentHP).toBe(0);
    });

    it('halves damage when defending', () => {
      member.isDefending = true;
      const dmg = member.takeDamage(40);
      expect(dmg).toBe(20);
      expect(member.currentHP).toBe(100);
    });

    it('shield absorbs damage before HP', () => {
      member.statusEffects.push({ type: 'shield', amount: 50, duration: 3 });
      const dmg = member.takeDamage(30);
      expect(dmg).toBe(0);
      expect(member.currentHP).toBe(120);
      // Shield reduced
      expect(member.statusEffects[0].amount).toBe(20);
    });

    it('shield breaks and remaining damage hits HP', () => {
      member.statusEffects.push({ type: 'shield', amount: 20, duration: 3 });
      const dmg = member.takeDamage(50);
      expect(dmg).toBe(30);
      expect(member.currentHP).toBe(90);
      // Shield removed
      expect(member.statusEffects.find(e => e.type === 'shield')).toBeUndefined();
    });

    it('heals HP up to max', () => {
      member.currentHP = 50;
      const healed = member.heal(200);
      expect(member.currentHP).toBe(120);
      expect(healed).toBe(70);
    });

    it('heals by exact amount when not capped', () => {
      member.currentHP = 100;
      const healed = member.heal(10);
      expect(member.currentHP).toBe(110);
      expect(healed).toBe(10);
    });
  });

  describe('getEffectiveStat', () => {
    it('returns base stat with no modifiers', () => {
      expect(member.getEffectiveStat('ATK')).toBe(14);
    });

    it('adds weapon power to ATK', () => {
      member.equipment.weapon = { slot: 'weapon', basePower: 8 };
      expect(member.getEffectiveStat('ATK')).toBe(22);
    });

    it('adds armor DEF to DEF', () => {
      member.equipment.armor = { slot: 'armor', baseDEF: 5 };
      expect(member.getEffectiveStat('DEF')).toBe(21);
    });

    it('applies corrode (25% DEF reduction)', () => {
      member.statusEffects.push({ type: 'corrode', duration: 3 });
      expect(member.getEffectiveStat('DEF')).toBe(Math.floor(16 * 0.75));
    });

    it('applies overclock (20% ATK and SPD increase)', () => {
      member.statusEffects.push({ type: 'overclock', duration: 2 });
      expect(member.getEffectiveStat('ATK')).toBe(Math.floor(14 * 1.2));
      expect(member.getEffectiveStat('SPD')).toBe(Math.floor(8 * 1.2));
      // MAG should not be affected
      expect(member.getEffectiveStat('MAG')).toBe(4);
    });
  });

  describe('serialize / deserialize', () => {
    it('roundtrips correctly', () => {
      member.addXP(300);
      member.skillPoints = 2;
      member.unlockSkill('taunt');
      member.currentHP = 80;
      member.statusEffects.push({ type: 'burn', duration: 2 });
      member.equipment.weapon = { slot: 'weapon', basePower: 10, name: 'Test' };

      const data = member.serialize();
      const restored = PartyMember.deserialize(data);

      expect(restored.id).toBe(member.id);
      expect(restored.name).toBe(member.name);
      expect(restored.level).toBe(member.level);
      expect(restored.xp).toBe(member.xp);
      expect(restored.currentHP).toBe(80);
      expect(restored.maxHP).toBe(member.maxHP);
      expect(restored.stats).toEqual(member.stats);
      expect(restored.unlockedSkills).toEqual(member.unlockedSkills);
      expect(restored.skillPoints).toBe(member.skillPoints);
      expect(restored.statusEffects).toEqual(member.statusEffects);
      expect(restored.equipment.weapon.name).toBe('Test');
      expect(restored.isPartyMember).toBe(true);
    });
  });
});
