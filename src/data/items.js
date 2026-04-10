/**
 * Item definitions: consumables, base equipment types, rarity tiers, affix pool.
 */

export const RARITY_TIERS = {
  junk:      { name: 'Junk',      color: '#888',    dropWeight: 45, statBonusMin: 0,    statBonusMax: 0.05, sellMultiplier: 0.25 },
  common:    { name: 'Common',    color: '#fff',    dropWeight: 30, statBonusMin: 0.05, statBonusMax: 0.15, sellMultiplier: 0.5 },
  rare:      { name: 'Rare',      color: '#4488ff', dropWeight: 15, statBonusMin: 0.15, statBonusMax: 0.30, sellMultiplier: 1.0 },
  epic:      { name: 'Epic',      color: '#aa44ff', dropWeight: 8,  statBonusMin: 0.30, statBonusMax: 0.50, sellMultiplier: 2.0 },
  legendary: { name: 'Legendary', color: '#ff8800', dropWeight: 2,  statBonusMin: 0.50, statBonusMax: 0.80, sellMultiplier: 4.0 }
};

export const CONSUMABLES = {
  health_stim: {
    id: 'health_stim', name: 'Health Stim', type: 'consumable',
    description: 'Restore 30% max HP to one ally.',
    effect: { type: 'heal', target: 'single_ally', healPercent: 0.3 },
    buyPrice: 50, sellPrice: 25
  },
  mega_stim: {
    id: 'mega_stim', name: 'Mega Stim', type: 'consumable',
    description: 'Restore 70% max HP to one ally.',
    effect: { type: 'heal', target: 'single_ally', healPercent: 0.7 },
    buyPrice: 150, sellPrice: 75
  },
  charge_cell: {
    id: 'charge_cell', name: 'Charge Cell', type: 'consumable',
    description: 'Restore 30% max Charge to one ally.',
    effect: { type: 'restore_charge', target: 'single_ally', chargePercent: 0.3 },
    buyPrice: 60, sellPrice: 30
  },
  mega_cell: {
    id: 'mega_cell', name: 'Mega Cell', type: 'consumable',
    description: 'Restore 70% max Charge to one ally.',
    effect: { type: 'restore_charge', target: 'single_ally', chargePercent: 0.7 },
    buyPrice: 180, sellPrice: 90
  },
  antidote_kit: {
    id: 'antidote_kit', name: 'Antidote Kit', type: 'consumable',
    description: 'Cure all status effects on one ally.',
    effect: { type: 'cure_status', target: 'single_ally' },
    buyPrice: 40, sellPrice: 20
  },
  revive_coil: {
    id: 'revive_coil', name: 'Revive Coil', type: 'consumable',
    description: 'Revive one KO\'d ally at 25% HP.',
    effect: { type: 'revive', target: 'single_ally_ko', revivePercent: 0.25 },
    buyPrice: 200, sellPrice: 100
  },
  smoke_bomb: {
    id: 'smoke_bomb', name: 'Smoke Bomb', type: 'consumable',
    description: 'Guaranteed escape from non-boss battle.',
    effect: { type: 'flee', guaranteedFlee: true },
    buyPrice: 80, sellPrice: 40
  },
  aether_shard: {
    id: 'aether_shard', name: 'Aether Shard', type: 'consumable',
    description: 'Deal 100 fixed Thermal damage to one enemy.',
    effect: { type: 'damage', target: 'single_enemy', fixedDamage: 100, element: 'thermal' },
    buyPrice: 100, sellPrice: 50
  }
};

export const BASE_WEAPONS = {
  pneumatic_gauntlet: { name: 'Pneumatic Gauntlet', slot: 'weapon', equippableBy: ['sable'], basePower: 8, baseValue: 40 },
  pipe_wrench:        { name: 'Pipe Wrench',        slot: 'weapon', equippableBy: ['sable'], basePower: 12, baseValue: 60 },
  sledgehammer:       { name: 'Sledgehammer',       slot: 'weapon', equippableBy: ['sable'], basePower: 16, baseValue: 80 },
  revolver:           { name: 'Revolver',           slot: 'weapon', equippableBy: ['rook'], basePower: 10, baseValue: 50 },
  rifle:              { name: 'Rifle',              slot: 'weapon', equippableBy: ['rook'], basePower: 14, baseValue: 70 },
  jury_cannon:        { name: 'Jury-Rigged Cannon', slot: 'weapon', equippableBy: ['rook'], basePower: 18, baseValue: 90 },
  tech_wrench:        { name: 'Tech Wrench',        slot: 'weapon', equippableBy: ['pip'], basePower: 6, baseValue: 35 },
  arc_spanner:        { name: 'Arc Spanner',        slot: 'weapon', equippableBy: ['pip'], basePower: 10, baseValue: 55 },
  plasma_driver:      { name: 'Plasma Driver',      slot: 'weapon', equippableBy: ['pip'], basePower: 14, baseValue: 75 },
  focus_shard:        { name: 'Focus Shard',        slot: 'weapon', equippableBy: ['vesper'], basePower: 8, baseValue: 45 },
  aether_prism:       { name: 'Aether Prism',       slot: 'weapon', equippableBy: ['vesper'], basePower: 13, baseValue: 65 },
  void_crystal:       { name: 'Void Crystal',       slot: 'weapon', equippableBy: ['vesper'], basePower: 18, baseValue: 85 }
};

export const BASE_ARMORS = {
  scrap_vest:       { name: 'Scrap Vest',       slot: 'armor', equippableBy: ['sable', 'rook', 'pip', 'vesper'], baseDEF: 4,  baseHP: 10, baseValue: 30 },
  iron_plate:       { name: 'Iron Plate',       slot: 'armor', equippableBy: ['sable', 'pip'],                  baseDEF: 8,  baseHP: 20, baseValue: 60 },
  combat_harness:   { name: 'Combat Harness',   slot: 'armor', equippableBy: ['rook', 'pip'],                   baseDEF: 6,  baseHP: 15, baseValue: 50 },
  aether_robe:      { name: 'Aether Robe',      slot: 'armor', equippableBy: ['vesper', 'pip'],                 baseDEF: 3,  baseHP: 5,  baseValue: 45 },
  reinforced_plate: { name: 'Reinforced Plate',  slot: 'armor', equippableBy: ['sable'],                        baseDEF: 12, baseHP: 30, baseValue: 90 },
  stealth_suit:     { name: 'Stealth Suit',     slot: 'armor', equippableBy: ['rook'],                          baseDEF: 5,  baseHP: 10, baseValue: 55 }
};

export const BASE_ACCESSORIES = {
  spark_ring:     { name: 'Spark Ring',     slot: 'accessory', equippableBy: ['sable', 'rook', 'pip', 'vesper'], baseValue: 40 },
  cog_pendant:    { name: 'Cog Pendant',    slot: 'accessory', equippableBy: ['sable', 'rook', 'pip', 'vesper'], baseValue: 40 },
  aether_badge:   { name: 'Aether Badge',   slot: 'accessory', equippableBy: ['sable', 'rook', 'pip', 'vesper'], baseValue: 50 },
  iron_brace:     { name: 'Iron Brace',     slot: 'accessory', equippableBy: ['sable', 'rook', 'pip', 'vesper'], baseValue: 35 },
  reflex_coil:    { name: 'Reflex Coil',    slot: 'accessory', equippableBy: ['sable', 'rook', 'pip', 'vesper'], baseValue: 55 }
};

export const AFFIXES = {
  // Weapon affixes
  scorching:  { name: 'Scorching',  slot: 'weapon',    effect: { thermalDamageBonus: 0.15 } },
  galvanic:   { name: 'Galvanic',   slot: 'weapon',    effect: { voltaicDamageBonus: 0.15 } },
  caustic:    { name: 'Caustic',    slot: 'weapon',    effect: { corrosionDamageBonus: 0.15 } },
  vampiric:   { name: 'Vampiric',   slot: 'weapon',    effect: { lifesteal: 0.03 } },
  brutal:     { name: 'Brutal',     slot: 'weapon',    effect: { critDamageBonus: 0.25 } },
  // Armor affixes
  galvanized: { name: 'Galvanized', slot: 'armor',     effect: { voltaicResist: 0.10 } },
  fireproof:  { name: 'Fireproof',  slot: 'armor',     effect: { thermalResist: 0.10 } },
  sealed:     { name: 'Sealed',     slot: 'armor',     effect: { corrosionResist: 0.10 } },
  fortified:  { name: 'Fortified',  slot: 'armor',     effect: { hpBonus: 0.10 } },
  thorned:    { name: 'Thorned',    slot: 'armor',     effect: { damageReflect: 0.05 } },
  // Universal affixes
  quick:      { name: 'Quick',      slot: 'any',       effect: { SPD: 5 } },
  lucky:      { name: 'Lucky',      slot: 'any',       effect: { critRate: 0.03 } },
  charged:    { name: 'Charged',    slot: 'any',       effect: { chargeBonus: 0.10 } },
  sturdy:     { name: 'Sturdy',     slot: 'any',       effect: { DEF: 3 } }
};

/** Get affixes valid for a given equipment slot. */
export function getAffixesForSlot(slot) {
  return Object.values(AFFIXES).filter(a => a.slot === slot || a.slot === 'any');
}
