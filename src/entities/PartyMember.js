/**
 * PartyMember entity — a playable character in the party.
 */

import { XP_TABLE, MAX_LEVEL } from '../data/characters.js';
import { getSkillById, getSkillTreesForCharacter } from '../data/skills.js';

export class PartyMember {
  /**
   * @param {object} charDef - Character definition from characters.js
   * @param {number} [level=1] - Starting level
   */
  constructor(charDef, level = 1) {
    this.id = charDef.id;
    this.name = charDef.name;
    this.role = charDef.role;
    this.weaponType = charDef.weaponType;
    this.growthRates = { ...charDef.growthRates };
    this.skillTreeIds = [...charDef.skillTrees];

    this.level = 1;
    this.xp = 0;
    this.skillPoints = 0;

    // Base stats from definition
    this.stats = {
      ATK: charDef.baseStats.ATK,
      DEF: charDef.baseStats.DEF,
      MAG: charDef.baseStats.MAG,
      SPD: charDef.baseStats.SPD,
    };
    this.maxHP = charDef.baseStats.HP;
    this.currentHP = this.maxHP;
    this.maxCharge = charDef.baseStats.Charge;
    this.currentCharge = this.maxCharge;

    this.equipment = { weapon: null, armor: null, accessory: null };
    this.unlockedSkills = [];
    this.statusEffects = [];
    this.isPartyMember = true;
    this.isDefending = false;

    // Apply level-ups if starting above 1
    for (let i = 1; i < level; i++) {
      this._applyGrowth();
      this.level++;
    }
    this.currentHP = this.maxHP;
    this.currentCharge = this.maxCharge;
  }

  /**
   * Apply one level's worth of growth to stats.
   * @private
   */
  _applyGrowth() {
    this.maxHP += this.growthRates.HP;
    this.maxCharge += this.growthRates.Charge;
    this.stats.ATK += this.growthRates.ATK;
    this.stats.DEF += this.growthRates.DEF;
    this.stats.MAG += this.growthRates.MAG;
    this.stats.SPD += this.growthRates.SPD;
  }

  /**
   * Level up: apply growth, gain 1 SP, cap HP/Charge.
   */
  levelUp() {
    if (this.level >= MAX_LEVEL) return;
    this._applyGrowth();
    this.level++;
    this.skillPoints++;
    this.currentHP = this.maxHP;
    this.currentCharge = this.maxCharge;
  }

  /**
   * Add XP, triggering level-ups as needed.
   * @param {number} amount
   */
  addXP(amount) {
    this.xp += amount;
    while (this.level < MAX_LEVEL && this.xp >= XP_TABLE[this.level + 1]) {
      this.levelUp();
    }
  }

  /**
   * Check if the character can use a given skill.
   * @param {string} skillId
   * @returns {boolean}
   */
  canUseSkill(skillId) {
    if (!this.unlockedSkills.includes(skillId)) return false;
    const skill = getSkillById(skillId);
    if (!skill) return false;
    if (skill.type === 'passive') return false;
    return this.currentCharge >= skill.chargeCost;
  }

  /**
   * Unlock a skill by spending 1 SP.
   * Validates that it is the next node in its tree sequence.
   * @param {string} skillId
   * @returns {boolean} Whether unlock succeeded
   */
  unlockSkill(skillId) {
    if (this.skillPoints <= 0) return false;
    if (this.unlockedSkills.includes(skillId)) return false;

    const skill = getSkillById(skillId);
    if (!skill) return false;

    // Check this character owns the tree
    if (!this.skillTreeIds.includes(skill.treeId)) return false;

    // Find the tree and validate sequence order
    const trees = getSkillTreesForCharacter(this.id);
    const tree = trees.find(t => t.id === skill.treeId);
    if (!tree) return false;

    const nodeIndex = tree.nodes.findIndex(n => n.id === skillId);
    if (nodeIndex < 0) return false;

    // All previous nodes in the tree must be unlocked
    for (let i = 0; i < nodeIndex; i++) {
      if (!this.unlockedSkills.includes(tree.nodes[i].id)) return false;
    }

    this.unlockedSkills.push(skillId);
    this.skillPoints--;
    return true;
  }

  /**
   * Equip an item to the correct slot.
   * @param {object} item - Item with a `slot` property ('weapon', 'armor', 'accessory')
   * @returns {object|null} Previously equipped item, or null
   */
  equipItem(item) {
    const slot = item.slot;
    if (!['weapon', 'armor', 'accessory'].includes(slot)) return null;
    const old = this.equipment[slot];
    this.equipment[slot] = item;
    return old;
  }

  /**
   * Take damage, considering shield status effects and defending.
   * @param {number} amount - Raw incoming damage
   * @returns {number} Actual damage taken
   */
  takeDamage(amount) {
    let remaining = amount;

    // Defending halves incoming damage
    if (this.isDefending) {
      remaining = Math.floor(remaining * 0.5);
    }

    // Shield absorbs damage first
    const shieldIdx = this.statusEffects.findIndex(e => e.type === 'shield');
    if (shieldIdx !== -1) {
      const shield = this.statusEffects[shieldIdx];
      if (shield.amount >= remaining) {
        shield.amount -= remaining;
        if (shield.amount <= 0) {
          this.statusEffects.splice(shieldIdx, 1);
        }
        return 0;
      } else {
        remaining -= shield.amount;
        this.statusEffects.splice(shieldIdx, 1);
      }
    }

    this.currentHP = Math.max(0, this.currentHP - remaining);
    return remaining;
  }

  /**
   * Heal HP up to max.
   * @param {number} amount
   * @returns {number} Actual amount healed
   */
  heal(amount) {
    const before = this.currentHP;
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    return this.currentHP - before;
  }

  /**
   * Get effective stat value with equipment and status effect modifiers.
   * @param {string} statName - 'ATK', 'DEF', 'MAG', or 'SPD'
   * @returns {number}
   */
  getEffectiveStat(statName) {
    let value = this.stats[statName] || 0;

    // Equipment bonuses
    const weapon = this.equipment.weapon;
    const armor = this.equipment.armor;
    const accessory = this.equipment.accessory;

    if (weapon) {
      if (statName === 'ATK' && weapon.basePower) value += weapon.basePower;
      if (weapon.affixes) {
        for (const affix of weapon.affixes) {
          if (affix.effect && affix.effect[statName]) value += affix.effect[statName];
        }
      }
    }
    if (armor) {
      if (statName === 'DEF' && armor.baseDEF) value += armor.baseDEF;
      if (armor.affixes) {
        for (const affix of armor.affixes) {
          if (affix.effect && affix.effect[statName]) value += affix.effect[statName];
        }
      }
    }
    if (accessory && accessory.affixes) {
      for (const affix of accessory.affixes) {
        if (affix.effect && affix.effect[statName]) value += affix.effect[statName];
      }
    }

    // Status effect modifiers
    for (const effect of this.statusEffects) {
      if (effect.type === 'corrode' && statName === 'DEF') {
        value = Math.floor(value * 0.75);
      }
      if (effect.type === 'overclock' && (statName === 'ATK' || statName === 'SPD')) {
        value = Math.floor(value * 1.2);
      }
    }

    return value;
  }

  /**
   * Serialize for save/load.
   * @returns {object}
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      weaponType: this.weaponType,
      level: this.level,
      xp: this.xp,
      currentHP: this.currentHP,
      maxHP: this.maxHP,
      currentCharge: this.currentCharge,
      maxCharge: this.maxCharge,
      stats: { ...this.stats },
      growthRates: { ...this.growthRates },
      skillTreeIds: [...this.skillTreeIds],
      equipment: {
        weapon: this.equipment.weapon ? { ...this.equipment.weapon } : null,
        armor: this.equipment.armor ? { ...this.equipment.armor } : null,
        accessory: this.equipment.accessory ? { ...this.equipment.accessory } : null,
      },
      unlockedSkills: [...this.unlockedSkills],
      skillPoints: this.skillPoints,
      statusEffects: this.statusEffects.map(e => ({ ...e })),
    };
  }

  /**
   * Deserialize from saved data.
   * @param {object} data
   * @returns {PartyMember}
   */
  static deserialize(data) {
    // Create a minimal charDef to bootstrap the constructor at level 1
    const charDef = {
      id: data.id,
      name: data.name,
      role: data.role,
      weaponType: data.weaponType,
      baseStats: {
        HP: data.maxHP,
        ATK: data.stats.ATK,
        DEF: data.stats.DEF,
        MAG: data.stats.MAG,
        SPD: data.stats.SPD,
        Charge: data.maxCharge,
      },
      growthRates: data.growthRates,
      skillTrees: data.skillTreeIds,
    };

    const member = new PartyMember(charDef, 1);
    // Overwrite all fields from serialized data
    member.level = data.level;
    member.xp = data.xp;
    member.currentHP = data.currentHP;
    member.maxHP = data.maxHP;
    member.currentCharge = data.currentCharge;
    member.maxCharge = data.maxCharge;
    member.stats = { ...data.stats };
    member.equipment = {
      weapon: data.equipment.weapon ? { ...data.equipment.weapon } : null,
      armor: data.equipment.armor ? { ...data.equipment.armor } : null,
      accessory: data.equipment.accessory ? { ...data.equipment.accessory } : null,
    };
    member.unlockedSkills = [...data.unlockedSkills];
    member.skillPoints = data.skillPoints;
    member.statusEffects = data.statusEffects.map(e => ({ ...e }));
    return member;
  }
}
