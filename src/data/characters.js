/**
 * Party member definitions: base stats, growth rates, and metadata.
 */

export const CHARACTERS = {
  sable: {
    id: 'sable',
    name: 'Sable',
    role: 'Tank',
    description: 'Ex-factory enforcer. Quiet, dry wit, protective.',
    weaponType: 'melee',
    baseStats: {
      HP: 120, ATK: 14, DEF: 16, MAG: 4, SPD: 8, Charge: 10
    },
    growthRates: {
      HP: 35, ATK: 4, DEF: 5, MAG: 1, SPD: 2, Charge: 3
    },
    skillTrees: ['ironwall', 'wrecker', 'steamworks']
  },
  rook: {
    id: 'rook',
    name: 'Rook',
    role: 'Gunner',
    description: 'Loud, cocky, never shuts up. Thinks he\'s the protagonist.',
    weaponType: 'ranged',
    baseStats: {
      HP: 70, ATK: 18, DEF: 8, MAG: 5, SPD: 16, Charge: 15
    },
    growthRates: {
      HP: 18, ATK: 6, DEF: 2, MAG: 1, SPD: 5, Charge: 4
    },
    skillTrees: ['marksman', 'gunslinger', 'saboteur']
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    role: 'Techie',
    description: 'Manic, talks to her machines, disturbingly cheerful about explosions.',
    weaponType: 'gadget',
    baseStats: {
      HP: 90, ATK: 10, DEF: 12, MAG: 12, SPD: 10, Charge: 25
    },
    growthRates: {
      HP: 25, ATK: 3, DEF: 3, MAG: 3, SPD: 3, Charge: 6
    },
    skillTrees: ['medic', 'engineer', 'demolitionist']
  },
  vesper: {
    id: 'vesper',
    name: 'Vesper',
    role: 'Psion',
    description: 'Sardonic, fatalistic, sees visions she wishes she didn\'t.',
    weaponType: 'focus',
    baseStats: {
      HP: 55, ATK: 5, DEF: 7, MAG: 22, SPD: 12, Charge: 20
    },
    growthRates: {
      HP: 15, ATK: 1, DEF: 2, MAG: 7, SPD: 3, Charge: 5
    },
    skillTrees: ['pyrokinetic', 'stormcaller', 'entropy']
  }
};

/**
 * XP required for each level. Index = level (0 unused, 1-15).
 */
export const XP_TABLE = [
  0,     // level 0 (unused)
  0,     // level 1
  100,   // level 2
  250,   // level 3
  500,   // level 4
  850,   // level 5
  1300,  // level 6
  1900,  // level 7
  2600,  // level 8
  3500,  // level 9
  4600,  // level 10
  5900,  // level 11
  7500,  // level 12
  9400,  // level 13
  11600, // level 14
  14000  // level 15
];

export const MAX_LEVEL = 15;
