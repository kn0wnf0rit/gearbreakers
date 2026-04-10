/**
 * Progression system: XP distribution, leveling, and skill tree management.
 */

import { SKILL_TREES, getSkillById } from '../data/skills.js';
import { CHARACTERS, XP_TABLE, MAX_LEVEL } from '../data/characters.js';

export class ProgressionSystem {
  /**
   * Distribute XP equally to all living party members, triggering level-ups.
   * @param {Array} party - Array of party member objects (must have id, level, xp, stats, isAlive, skillPoints, growthRates or characterId)
   * @param {number} amount - Total XP to distribute
   * @returns {Array} Array of level-up events: [{ characterId, newLevel, statsGained }]
   */
  awardXP(party, amount) {
    const livingMembers = party.filter(m => m.isAlive !== false);
    if (livingMembers.length === 0) return [];

    const share = Math.floor(amount / livingMembers.length);
    const events = [];

    for (const member of livingMembers) {
      member.xp = (member.xp || 0) + share;

      // Check for level-ups (may gain multiple levels)
      while (member.level < MAX_LEVEL) {
        const nextLevel = member.level + 1;
        const xpNeeded = XP_TABLE[nextLevel];
        if (member.xp >= xpNeeded) {
          member.level = nextLevel;
          member.skillPoints = (member.skillPoints || 0) + 1;

          const charData = CHARACTERS[member.characterId || member.id];
          const growth = charData ? charData.growthRates : {};
          const statsGained = {};

          for (const [stat, growthVal] of Object.entries(growth)) {
            const gain = Math.floor(growthVal * (1 + nextLevel * 0.05));
            statsGained[stat] = gain;
            member.stats[stat] = (member.stats[stat] || 0) + gain;
          }

          events.push({
            characterId: member.characterId || member.id,
            newLevel: nextLevel,
            statsGained
          });
        } else {
          break;
        }
      }
    }

    return events;
  }

  /**
   * Check whether a member can unlock a specific skill.
   * @param {object} member - Party member with skillPoints, unlockedSkills, characterId
   * @param {string} skillId - ID of the skill to check
   * @returns {boolean}
   */
  canUnlockSkill(member, skillId) {
    // Must have at least 1 SP
    if ((member.skillPoints || 0) < 1) return false;

    // Must not already be unlocked
    const unlocked = member.unlockedSkills || [];
    if (unlocked.includes(skillId)) return false;

    // The skill must exist and belong to a tree this character has access to
    const skillData = getSkillById(skillId);
    if (!skillData) return false;

    const charData = CHARACTERS[member.characterId || member.id];
    if (!charData || !charData.skillTrees.includes(skillData.treeId)) return false;

    // Skill must be next in tree sequence (linear unlock order)
    const tree = SKILL_TREES[skillData.treeId];
    const nodeIndex = tree.nodes.findIndex(n => n.id === skillId);
    if (nodeIndex < 0) return false;

    // All prior nodes in the tree must already be unlocked
    for (let i = 0; i < nodeIndex; i++) {
      if (!unlocked.includes(tree.nodes[i].id)) return false;
    }

    return true;
  }

  /**
   * Unlock a skill, spending 1 SP.
   * @param {object} member - Party member
   * @param {string} skillId - Skill to unlock
   * @returns {object|null} The skill data, or null if cannot unlock
   */
  unlockSkill(member, skillId) {
    if (!this.canUnlockSkill(member, skillId)) return null;

    member.skillPoints -= 1;
    if (!member.unlockedSkills) member.unlockedSkills = [];
    member.unlockedSkills.push(skillId);

    return getSkillById(skillId);
  }

  /**
   * Get the state of a skill tree for UI display.
   * @param {object} member - Party member
   * @param {string} treeId - Skill tree ID
   * @returns {Array} Nodes with state: 'locked' | 'available' | 'unlocked'
   */
  getSkillTreeState(member, treeId) {
    const tree = SKILL_TREES[treeId];
    if (!tree) return [];

    const unlocked = member.unlockedSkills || [];
    const results = [];

    for (let i = 0; i < tree.nodes.length; i++) {
      const node = tree.nodes[i];
      let state;

      if (unlocked.includes(node.id)) {
        state = 'unlocked';
      } else {
        // Available if all prior nodes are unlocked
        const allPriorUnlocked = tree.nodes
          .slice(0, i)
          .every(prior => unlocked.includes(prior.id));
        state = allPriorUnlocked ? 'available' : 'locked';
      }

      results.push({ ...node, state });
    }

    return results;
  }

  /**
   * Get all unlocked combat skills (excluding passives) for a member.
   * @param {object} member - Party member
   * @returns {Array} Array of skill data objects
   */
  getAvailableSkills(member) {
    const unlocked = member.unlockedSkills || [];
    return unlocked
      .map(id => getSkillById(id))
      .filter(skill => skill && skill.type !== 'passive');
  }
}
