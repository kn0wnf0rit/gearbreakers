/**
 * Skill tree definitions for all party members.
 * Each skill has: id, name, description, chargeCost, target, effect details.
 */

export const SKILL_TREES = {
  // === SABLE ===
  ironwall: {
    id: 'ironwall',
    name: 'Ironwall',
    character: 'sable',
    nodes: [
      {
        id: 'taunt', name: 'Taunt', chargeCost: 5,
        description: 'Force all enemies to target Sable for 2 turns.',
        target: 'self', type: 'buff',
        effect: { status: 'taunt', duration: 2 }
      },
      {
        id: 'iron_skin', name: 'Iron Skin', chargeCost: 8,
        description: 'Increase DEF by 20% for 3 turns.',
        target: 'self', type: 'buff',
        effect: { stat: 'DEF', modifier: 1.2, duration: 3 }
      },
      {
        id: 'counter_stance', name: 'Counter Stance', chargeCost: 10,
        description: 'Auto-counter any attack received this turn.',
        target: 'self', type: 'buff',
        effect: { status: 'counter', duration: 1, counterDamage: 0.8 }
      },
      {
        id: 'fortress', name: 'Fortress', chargeCost: 15,
        description: 'Reduce all damage to the party by 15% for 2 turns.',
        target: 'party', type: 'buff',
        effect: { damageReduction: 0.15, duration: 2 }
      },
      {
        id: 'immovable', name: 'Immovable', chargeCost: 0,
        description: 'Passive: Immune to stun and knockback.',
        target: 'self', type: 'passive',
        effect: { immunities: ['stun'] }
      }
    ]
  },
  wrecker: {
    id: 'wrecker',
    name: 'Wrecker',
    character: 'sable',
    nodes: [
      {
        id: 'power_strike', name: 'Power Strike', chargeCost: 6,
        description: 'Deal 1.5x ATK damage to one enemy.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.5, stat: 'ATK' }
      },
      {
        id: 'ground_slam', name: 'Ground Slam', chargeCost: 10,
        description: 'Deal 0.8x ATK damage to all enemies.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 0.8, stat: 'ATK' }
      },
      {
        id: 'armor_break', name: 'Armor Break', chargeCost: 8,
        description: 'Reduce target DEF by 30% for 3 turns.',
        target: 'single_enemy', type: 'debuff',
        effect: { stat: 'DEF', modifier: 0.7, duration: 3 }
      },
      {
        id: 'juggernaut', name: 'Juggernaut', chargeCost: 0,
        description: 'Passive: ATK increases as HP decreases.',
        target: 'self', type: 'passive',
        effect: { atkScaleWithMissingHP: true, maxBonus: 0.5 }
      },
      {
        id: 'demolition', name: 'Demolition', chargeCost: 12,
        description: 'Deal 2.5x ATK damage. Costs 50% of current HP.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 2.5, stat: 'ATK', hpCost: 0.5 }
      }
    ]
  },
  steamworks: {
    id: 'steamworks',
    name: 'Steamworks',
    character: 'sable',
    nodes: [
      {
        id: 'steam_vent', name: 'Steam Vent', chargeCost: 6,
        description: 'Heal self for 20% max HP.',
        target: 'self', type: 'heal',
        effect: { healPercent: 0.2 }
      },
      {
        id: 'pressure_release', name: 'Pressure Release', chargeCost: 10,
        description: 'Heal self + cure all status effects.',
        target: 'self', type: 'heal',
        effect: { healPercent: 0.15, cureAll: true }
      },
      {
        id: 'overboil', name: 'Overboil', chargeCost: 14,
        description: 'Heal self 35% HP + gain Overclock.',
        target: 'self', type: 'heal',
        effect: { healPercent: 0.35, applyBuff: 'overclock', buffDuration: 2 }
      },
      {
        id: 'venting_aura', name: 'Venting Aura', chargeCost: 18,
        description: 'Party heals 5% HP per turn for 3 turns.',
        target: 'party', type: 'heal',
        effect: { hotPercent: 0.05, duration: 3 }
      },
      {
        id: 'full_pressure', name: 'Full Pressure', chargeCost: 0,
        description: 'Passive: Revive self once per battle at 30% HP.',
        target: 'self', type: 'passive',
        effect: { autoRevive: true, reviveHPPercent: 0.3, usesPerBattle: 1 }
      }
    ]
  },

  // === ROOK ===
  marksman: {
    id: 'marksman',
    name: 'Marksman',
    character: 'rook',
    nodes: [
      {
        id: 'aimed_shot', name: 'Aimed Shot', chargeCost: 7,
        description: 'Deal 1.8x ATK damage. Acts last in turn order.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.8, stat: 'ATK', actLast: true }
      },
      {
        id: 'headshot', name: 'Headshot', chargeCost: 0,
        description: 'Passive: +15% crit rate.',
        target: 'self', type: 'passive',
        effect: { critRateBonus: 0.15 }
      },
      {
        id: 'armor_piercing', name: 'Armor Piercing', chargeCost: 10,
        description: 'Attack ignoring 50% of target DEF.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.2, stat: 'ATK', defIgnore: 0.5 }
      },
      {
        id: 'dead_eye', name: 'Dead Eye', chargeCost: 15,
        description: 'Guaranteed critical hit. Once per battle.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.5, stat: 'ATK', guaranteedCrit: true, usesPerBattle: 1 }
      },
      {
        id: 'killshot', name: 'Killshot', chargeCost: 12,
        description: 'Deal 3x ATK damage. Only on enemies below 25% HP.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 3.0, stat: 'ATK', requireTargetBelow: 0.25 }
      }
    ]
  },
  gunslinger: {
    id: 'gunslinger',
    name: 'Gunslinger',
    character: 'rook',
    nodes: [
      {
        id: 'quick_draw', name: 'Quick Draw', chargeCost: 5,
        description: '+30% SPD for 2 turns.',
        target: 'self', type: 'buff',
        effect: { stat: 'SPD', modifier: 1.3, duration: 2 }
      },
      {
        id: 'double_tap', name: 'Double Tap', chargeCost: 8,
        description: 'Attack twice at 0.6x damage each.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 0.6, stat: 'ATK', hits: 2 }
      },
      {
        id: 'ricochet', name: 'Ricochet', chargeCost: 10,
        description: 'Hit random enemies 3 times at 0.5x.',
        target: 'random_enemies', type: 'attack',
        effect: { damageMultiplier: 0.5, stat: 'ATK', hits: 3 }
      },
      {
        id: 'fan_the_hammer', name: 'Fan the Hammer', chargeCost: 14,
        description: 'Hit all enemies at 0.7x damage.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 0.7, stat: 'ATK' }
      },
      {
        id: 'bullet_time', name: 'Bullet Time', chargeCost: 20,
        description: 'Act twice this turn.',
        target: 'self', type: 'buff',
        effect: { extraAction: true }
      }
    ]
  },
  saboteur: {
    id: 'saboteur',
    name: 'Saboteur',
    character: 'rook',
    nodes: [
      {
        id: 'blind_shot', name: 'Blind Shot', chargeCost: 6,
        description: 'Attack + inflict Blind for 2 turns.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.0, stat: 'ATK', applyStatus: 'blind', statusDuration: 2 }
      },
      {
        id: 'corrosive_rounds', name: 'Corrosive Rounds', chargeCost: 0,
        description: 'Passive: Attacks inflict Corrode for 3 turns.',
        target: 'self', type: 'passive',
        effect: { onAttackStatus: 'corrode', statusDuration: 3 }
      },
      {
        id: 'crippling_shot', name: 'Crippling Shot', chargeCost: 8,
        description: 'Attack + reduce SPD 50% for 2 turns.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.0, stat: 'ATK', applyDebuff: { stat: 'SPD', modifier: 0.5, duration: 2 } }
      },
      {
        id: 'expose_weakness', name: 'Expose Weakness', chargeCost: 10,
        description: 'Target takes 25% more damage for 3 turns.',
        target: 'single_enemy', type: 'debuff',
        effect: { damageTakenMultiplier: 1.25, duration: 3 }
      },
      {
        id: 'shutdown', name: 'Shutdown', chargeCost: 16,
        description: 'Target skips 2 turns (bosses: 1 turn).',
        target: 'single_enemy', type: 'debuff',
        effect: { applyStatus: 'stun', duration: 2, bossDuration: 1 }
      }
    ]
  },

  // === PIP ===
  medic: {
    id: 'medic',
    name: 'Medic',
    character: 'pip',
    nodes: [
      {
        id: 'med_drone', name: 'Med-Drone', chargeCost: 8,
        description: 'Heal one ally for 30% max HP.',
        target: 'single_ally', type: 'heal',
        effect: { healPercent: 0.3 }
      },
      {
        id: 'repair_kit', name: 'Repair Kit', chargeCost: 6,
        description: 'Cure all status effects on one ally.',
        target: 'single_ally', type: 'heal',
        effect: { cureAll: true }
      },
      {
        id: 'field_surgery', name: 'Field Surgery', chargeCost: 16,
        description: 'Heal entire party for 20% max HP.',
        target: 'party', type: 'heal',
        effect: { healPercent: 0.2 }
      },
      {
        id: 'emergency_protocol', name: 'Emergency Protocol', chargeCost: 0,
        description: 'Passive: Auto-heal ally below 20% HP once per battle.',
        target: 'party', type: 'passive',
        effect: { autoHealThreshold: 0.2, autoHealPercent: 0.25, usesPerBattle: 1 }
      },
      {
        id: 'resurrection_rig', name: 'Resurrection Rig', chargeCost: 25,
        description: 'Revive one KO\'d ally at 50% HP.',
        target: 'single_ally_ko', type: 'heal',
        effect: { revive: true, reviveHPPercent: 0.5 }
      }
    ]
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    character: 'pip',
    nodes: [
      {
        id: 'overclock', name: 'Overclock', chargeCost: 8,
        description: 'Buff ally ATK+SPD by 20% for 3 turns.',
        target: 'single_ally', type: 'buff',
        effect: { stats: { ATK: 1.2, SPD: 1.2 }, duration: 3 }
      },
      {
        id: 'barrier_projector', name: 'Barrier Projector', chargeCost: 10,
        description: 'Shield one ally (absorbs 50 + 10*level damage).',
        target: 'single_ally', type: 'buff',
        effect: { shield: true, shieldBase: 50, shieldPerLevel: 10 }
      },
      {
        id: 'turret', name: 'Turret', chargeCost: 14,
        description: 'Deploy turret that attacks each turn for 3 turns.',
        target: 'field', type: 'summon',
        effect: { summonId: 'turret', duration: 3, damageMultiplier: 1.5, stat: 'MAG' }
      },
      {
        id: 'party_overclock', name: 'Party Overclock', chargeCost: 18,
        description: 'Buff all allies ATK+SPD by 15% for 2 turns.',
        target: 'party', type: 'buff',
        effect: { stats: { ATK: 1.15, SPD: 1.15 }, duration: 2 }
      },
      {
        id: 'masterwork', name: 'Masterwork', chargeCost: 0,
        description: 'Passive: All buffs Pip applies last 2 extra turns.',
        target: 'self', type: 'passive',
        effect: { buffDurationBonus: 2 }
      }
    ]
  },
  demolitionist: {
    id: 'demolitionist',
    name: 'Demolitionist',
    character: 'pip',
    nodes: [
      {
        id: 'frag_grenade', name: 'Frag Grenade', chargeCost: 8,
        description: 'AoE Thermal damage (MAGx1.2).',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 1.2, stat: 'MAG', element: 'thermal' }
      },
      {
        id: 'shock_mine', name: 'Shock Mine', chargeCost: 10,
        description: 'Single Voltaic damage + Stun chance.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.3, stat: 'MAG', element: 'voltaic', applyStatus: 'stun', statusChance: 0.4, statusDuration: 1 }
      },
      {
        id: 'acid_bomb', name: 'Acid Bomb', chargeCost: 12,
        description: 'AoE Corrosion damage + Corrode status.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 1.0, stat: 'MAG', element: 'corrosion', applyStatus: 'corrode', statusDuration: 3 }
      },
      {
        id: 'chain_reaction', name: 'Chain Reaction', chargeCost: 0,
        description: 'Passive: If Pip kills an enemy, explosion hits others.',
        target: 'self', type: 'passive',
        effect: { onKillAoE: true, onKillDamageMultiplier: 0.5 }
      },
      {
        id: 'megabomb', name: 'Megabomb', chargeCost: 25,
        description: 'Massive AoE all-element damage (MAGx2.5). 3-turn cooldown.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 2.5, stat: 'MAG', element: 'all', cooldown: 3 }
      }
    ]
  },

  // === VESPER ===
  pyrokinetic: {
    id: 'pyrokinetic',
    name: 'Pyrokinetic',
    character: 'vesper',
    nodes: [
      {
        id: 'ignite', name: 'Ignite', chargeCost: 6,
        description: 'Single target Thermal damage (MAGx1.3).',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.3, stat: 'MAG', element: 'thermal' }
      },
      {
        id: 'heatwave', name: 'Heatwave', chargeCost: 10,
        description: 'AoE Thermal (MAGx0.9) + Burn.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 0.9, stat: 'MAG', element: 'thermal', applyStatus: 'burn', statusDuration: 3 }
      },
      {
        id: 'thermal_lance', name: 'Thermal Lance', chargeCost: 14,
        description: 'Single target Thermal (MAGx2.0).',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 2.0, stat: 'MAG', element: 'thermal' }
      },
      {
        id: 'inferno', name: 'Inferno', chargeCost: 20,
        description: 'AoE Thermal (MAGx1.5) + Burn.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 1.5, stat: 'MAG', element: 'thermal', applyStatus: 'burn', statusDuration: 3 }
      },
      {
        id: 'supernova', name: 'Supernova', chargeCost: 30,
        description: 'AoE Thermal (MAGx3.0). Vesper takes 20% max HP recoil.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 3.0, stat: 'MAG', element: 'thermal', hpCost: 0.2 }
      }
    ]
  },
  stormcaller: {
    id: 'stormcaller',
    name: 'Stormcaller',
    character: 'vesper',
    nodes: [
      {
        id: 'spark', name: 'Spark', chargeCost: 5,
        description: 'Single Voltaic (MAGx1.2) + 20% Stun chance.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.2, stat: 'MAG', element: 'voltaic', applyStatus: 'stun', statusChance: 0.2, statusDuration: 1 }
      },
      {
        id: 'arc_lightning', name: 'Arc Lightning', chargeCost: 10,
        description: 'Hits 2 random enemies.',
        target: 'random_enemies', type: 'attack',
        effect: { damageMultiplier: 1.2, stat: 'MAG', element: 'voltaic', hits: 2 }
      },
      {
        id: 'thunderclap', name: 'Thunderclap', chargeCost: 14,
        description: 'AoE Voltaic (MAGx1.0) + 30% Stun.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 1.0, stat: 'MAG', element: 'voltaic', applyStatus: 'stun', statusChance: 0.3, statusDuration: 1 }
      },
      {
        id: 'chain_lightning', name: 'Chain Lightning', chargeCost: 18,
        description: 'Hits all. +50% damage per enemy.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 0.8, stat: 'MAG', element: 'voltaic', damageScalesWithTargets: 0.5 }
      },
      {
        id: 'tempest', name: 'Tempest', chargeCost: 0,
        description: 'AoE Voltaic (MAGx2.5) + guaranteed Stun. Costs 50% max Charge.',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 2.5, stat: 'MAG', element: 'voltaic', applyStatus: 'stun', statusDuration: 1, chargeCostPercent: 0.5 }
      }
    ]
  },
  entropy: {
    id: 'entropy',
    name: 'Entropy',
    character: 'vesper',
    nodes: [
      {
        id: 'corrode_skill', name: 'Corrode', chargeCost: 5,
        description: 'Single Corrosion (MAGx1.1) + Corrode status.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.1, stat: 'MAG', element: 'corrosion', applyStatus: 'corrode', statusDuration: 3 }
      },
      {
        id: 'mind_fray', name: 'Mind Fray', chargeCost: 10,
        description: 'Chance to make enemy attack its allies.',
        target: 'single_enemy', type: 'debuff',
        effect: { applyStatus: 'confuse', statusChance: 0.5, statusDuration: 2 }
      },
      {
        id: 'rust_storm', name: 'Rust Storm', chargeCost: 14,
        description: 'AoE Corrosion (MAGx1.0).',
        target: 'all_enemies', type: 'attack',
        effect: { damageMultiplier: 1.0, stat: 'MAG', element: 'corrosion' }
      },
      {
        id: 'aether_drain', name: 'Aether Drain', chargeCost: 0,
        description: 'Damage enemy, restore Charge to self.',
        target: 'single_enemy', type: 'attack',
        effect: { damageMultiplier: 1.0, stat: 'MAG', element: 'corrosion', restoreCharge: 0.3 }
      },
      {
        id: 'decay_field', name: 'Decay Field', chargeCost: 22,
        description: 'AoE: enemies lose 10% HP/turn + stats reduced 15% for 3 turns.',
        target: 'all_enemies', type: 'debuff',
        effect: { dotPercent: 0.1, statReduction: 0.85, duration: 3 }
      }
    ]
  }
};

/** Get all skill trees for a character. */
export function getSkillTreesForCharacter(characterId) {
  return Object.values(SKILL_TREES).filter(tree => tree.character === characterId);
}

/** Get a specific skill by ID across all trees. */
export function getSkillById(skillId) {
  for (const tree of Object.values(SKILL_TREES)) {
    const node = tree.nodes.find(n => n.id === skillId);
    if (node) return { ...node, treeId: tree.id };
  }
  return null;
}
