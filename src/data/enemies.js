/**
 * Enemy definitions for both dungeons.
 */

export const ENEMIES = {
  // === Slagworks (Dungeon 1) ===
  scrap_drone: {
    id: 'scrap_drone',
    name: 'Scrap Drone',
    stats: { HP: 30, ATK: 8, DEF: 4, MAG: 0, SPD: 10 },
    element: 'voltaic',
    xpReward: 15,
    scrapReward: 10,
    lootTable: [
      { itemPool: 'weapon_common', weight: 20 },
      { itemPool: 'accessory_common', weight: 10 },
      { itemPool: 'consumable_health_stim', weight: 30 },
      { itemPool: 'none', weight: 40 }
    ],
    spriteId: 'enemy_scrap_drone',
    ai: 'basic_attacker'
  },
  rust_rat: {
    id: 'rust_rat',
    name: 'Rust Rat',
    stats: { HP: 20, ATK: 10, DEF: 3, MAG: 0, SPD: 14 },
    element: 'corrosion',
    xpReward: 12,
    scrapReward: 8,
    lootTable: [
      { itemPool: 'consumable_antidote', weight: 20 },
      { itemPool: 'consumable_health_stim', weight: 20 },
      { itemPool: 'none', weight: 60 }
    ],
    spriteId: 'enemy_rust_rat',
    ai: 'basic_attacker'
  },
  slag_golem: {
    id: 'slag_golem',
    name: 'Slag Golem',
    stats: { HP: 60, ATK: 12, DEF: 10, MAG: 0, SPD: 4 },
    element: 'thermal',
    xpReward: 25,
    scrapReward: 18,
    lootTable: [
      { itemPool: 'armor_common', weight: 25 },
      { itemPool: 'consumable_health_stim', weight: 25 },
      { itemPool: 'none', weight: 50 }
    ],
    spriteId: 'enemy_slag_golem',
    ai: 'basic_attacker'
  },
  scavenger_thug: {
    id: 'scavenger_thug',
    name: 'Scavenger Thug',
    stats: { HP: 40, ATK: 14, DEF: 6, MAG: 0, SPD: 8 },
    element: null,
    xpReward: 20,
    scrapReward: 15,
    lootTable: [
      { itemPool: 'weapon_common', weight: 20 },
      { itemPool: 'consumable_health_stim', weight: 20 },
      { itemPool: 'scrap_bonus', weight: 15 },
      { itemPool: 'none', weight: 45 }
    ],
    spriteId: 'enemy_scavenger_thug',
    ai: 'target_weakest'
  },

  // === Undercroft Vaults (Dungeon 2) ===
  cogwright_sentry: {
    id: 'cogwright_sentry',
    name: 'Cogwright Sentry',
    stats: { HP: 55, ATK: 16, DEF: 12, MAG: 0, SPD: 8 },
    element: null,
    xpReward: 35,
    scrapReward: 25,
    lootTable: [
      { itemPool: 'weapon_rare', weight: 10 },
      { itemPool: 'armor_common', weight: 20 },
      { itemPool: 'consumable_health_stim', weight: 20 },
      { itemPool: 'none', weight: 50 }
    ],
    spriteId: 'enemy_cogwright_sentry',
    ai: 'basic_attacker'
  },
  shock_turret: {
    id: 'shock_turret',
    name: 'Shock Turret',
    stats: { HP: 40, ATK: 10, DEF: 8, MAG: 14, SPD: 12 },
    element: 'voltaic',
    xpReward: 30,
    scrapReward: 20,
    lootTable: [
      { itemPool: 'accessory_common', weight: 15 },
      { itemPool: 'consumable_charge_cell', weight: 25 },
      { itemPool: 'none', weight: 60 }
    ],
    spriteId: 'enemy_shock_turret',
    ai: 'magic_attacker'
  },
  vault_crawler: {
    id: 'vault_crawler',
    name: 'Vault Crawler',
    stats: { HP: 35, ATK: 20, DEF: 5, MAG: 0, SPD: 16 },
    element: 'corrosion',
    xpReward: 28,
    scrapReward: 18,
    lootTable: [
      { itemPool: 'consumable_antidote', weight: 25 },
      { itemPool: 'consumable_health_stim', weight: 25 },
      { itemPool: 'none', weight: 50 }
    ],
    spriteId: 'enemy_vault_crawler',
    ai: 'target_weakest'
  },
  aether_wraith: {
    id: 'aether_wraith',
    name: 'Aether Wraith',
    stats: { HP: 45, ATK: 8, DEF: 6, MAG: 18, SPD: 14 },
    element: 'thermal',
    xpReward: 40,
    scrapReward: 30,
    lootTable: [
      { itemPool: 'accessory_rare', weight: 10 },
      { itemPool: 'consumable_charge_cell', weight: 20 },
      { itemPool: 'none', weight: 70 }
    ],
    spriteId: 'enemy_aether_wraith',
    ai: 'magic_attacker'
  },
  enforcer_mk2: {
    id: 'enforcer_mk2',
    name: 'Enforcer Mk.II',
    stats: { HP: 80, ATK: 20, DEF: 16, MAG: 0, SPD: 6 },
    element: null,
    xpReward: 50,
    scrapReward: 35,
    lootTable: [
      { itemPool: 'weapon_rare', weight: 15 },
      { itemPool: 'armor_rare', weight: 15 },
      { itemPool: 'consumable_health_stim', weight: 20 },
      { itemPool: 'none', weight: 50 }
    ],
    spriteId: 'enemy_enforcer_mk2',
    ai: 'basic_attacker'
  }
};

/**
 * Boss definitions. Separate from regular enemies due to phase mechanics.
 */
export const BOSSES = {
  furnace_rex: {
    id: 'furnace_rex',
    name: 'Furnace Rex',
    stats: { HP: 500, ATK: 22, DEF: 15, MAG: 10, SPD: 6 },
    element: 'thermal',
    xpReward: 200,
    scrapReward: 150,
    isBoss: true,
    spriteId: 'boss_furnace_rex',
    phases: [
      {
        name: 'phase1',
        hpThreshold: 0.5,
        skills: ['attack', 'flame_belch'],
        ai: 'boss_phase1'
      },
      {
        name: 'phase2',
        hpThreshold: 0,
        skills: ['attack', 'flame_belch', 'slag_spray'],
        buffs: { ATK: 1.3 },
        selfDamagePerTurn: 0.05,
        ai: 'boss_phase2'
      }
    ],
    guaranteedDrops: [
      { type: 'weapon', minRarity: 'rare' },
      { type: 'armor', minRarity: 'rare' }
    ]
  },
  warden_kael: {
    id: 'warden_kael',
    name: 'Warden Kael',
    stats: { HP: 900, ATK: 28, DEF: 20, MAG: 15, SPD: 10 },
    element: null,
    xpReward: 500,
    scrapReward: 300,
    isBoss: true,
    spriteId: 'boss_warden_kael',
    phases: [
      {
        name: 'phase1',
        hpThreshold: 0.6,
        skills: ['exo_strike', 'shield_matrix'],
        ai: 'boss_kael_p1'
      },
      {
        name: 'phase2',
        hpThreshold: 0.3,
        skills: ['elemental_shift_attack', 'deploy_drones'],
        elementCycle: ['thermal', 'voltaic', 'corrosion'],
        ai: 'boss_kael_p2'
      },
      {
        name: 'phase3',
        hpThreshold: 0,
        skills: ['exo_strike', 'desperation_blast'],
        actionsPerTurn: 2,
        ai: 'boss_kael_p3'
      }
    ],
    guaranteedDrops: [
      { type: 'any', minRarity: 'epic' }
    ]
  }
};

/**
 * Encounter tables per dungeon floor.
 * Each entry: { enemies: string[], weight: number }
 */
export const ENCOUNTER_TABLES = {
  slagworks_f1: [
    { enemies: ['scrap_drone'], weight: 30 },
    { enemies: ['rust_rat'], weight: 30 },
    { enemies: ['scrap_drone', 'rust_rat'], weight: 25 },
    { enemies: ['scrap_drone', 'scrap_drone'], weight: 15 }
  ],
  slagworks_f2: [
    { enemies: ['scrap_drone', 'rust_rat'], weight: 20 },
    { enemies: ['slag_golem'], weight: 15 },
    { enemies: ['scavenger_thug', 'rust_rat'], weight: 20 },
    { enemies: ['slag_golem', 'scrap_drone'], weight: 15 },
    { enemies: ['scavenger_thug', 'scrap_drone', 'rust_rat'], weight: 20 },
    { enemies: ['slag_golem', 'rust_rat', 'rust_rat'], weight: 10 }
  ],
  slagworks_f3: [
    { enemies: ['slag_golem', 'scavenger_thug'], weight: 20 },
    { enemies: ['scavenger_thug', 'scavenger_thug', 'scrap_drone'], weight: 20 },
    { enemies: ['slag_golem', 'scrap_drone', 'rust_rat', 'rust_rat'], weight: 25 },
    { enemies: ['scavenger_thug', 'scavenger_thug', 'rust_rat', 'scrap_drone'], weight: 20 },
    { enemies: ['slag_golem', 'slag_golem'], weight: 15 }
  ],
  undercroft_f1: [
    { enemies: ['cogwright_sentry', 'shock_turret'], weight: 30 },
    { enemies: ['cogwright_sentry', 'cogwright_sentry'], weight: 25 },
    { enemies: ['shock_turret', 'shock_turret'], weight: 20 },
    { enemies: ['vault_crawler', 'shock_turret'], weight: 25 }
  ],
  undercroft_f2: [
    { enemies: ['cogwright_sentry', 'shock_turret', 'vault_crawler'], weight: 25 },
    { enemies: ['aether_wraith', 'shock_turret'], weight: 20 },
    { enemies: ['vault_crawler', 'vault_crawler', 'shock_turret'], weight: 25 },
    { enemies: ['cogwright_sentry', 'aether_wraith'], weight: 20 },
    { enemies: ['cogwright_sentry', 'cogwright_sentry', 'shock_turret'], weight: 10 }
  ],
  undercroft_f3: [
    { enemies: ['enforcer_mk2'], weight: 15 },
    { enemies: ['aether_wraith', 'cogwright_sentry', 'shock_turret'], weight: 20 },
    { enemies: ['vault_crawler', 'vault_crawler', 'aether_wraith', 'shock_turret'], weight: 25 },
    { enemies: ['cogwright_sentry', 'enforcer_mk2'], weight: 20 },
    { enemies: ['aether_wraith', 'aether_wraith', 'vault_crawler'], weight: 20 }
  ],
  undercroft_f4: [] // Boss floor - no random encounters
};
