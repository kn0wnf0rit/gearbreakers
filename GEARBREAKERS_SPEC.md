# GEARBREAKERS — Game Design Specification

## Document Purpose

This specification defines the complete design for **Gearbreakers**, a 2D turn-based RPG built for web browsers. It is written to be divided among multiple development agents, each responsible for a distinct system. Each section is self-contained with clear interfaces, data contracts, and dependencies.

---

## 1. Game Overview

| Field | Value |
|---|---|
| **Title** | Gearbreakers |
| **Genre** | Turn-Based RPG |
| **Platform** | Web Browser (HTML5 Canvas) |
| **Tech Stack** | HTML5, CSS3, JavaScript (vanilla or lightweight framework) |
| **Art Style** | 16-bit pixel art, steampunk-dystopian aesthetic |
| **Tone** | Dark humor + gritty (Borderlands meets Final Fantasy) |
| **Scope** | Prototype/MVP |
| **Target Play Time** | 30–60 minutes |

### Elevator Pitch

In a scorched, gear-driven dystopia where megacorps strip-mine the last living lands, four outcasts — a bruiser, a sharpshooter, a gadget-obsessed engineer, and a rogue psychic — band together to crack open the iron fist of the Cogwright Collective. Classic JRPG combat meets Borderlands-style loot and irreverent humor.

---

## 2. Setting & Lore

### World: The Rustlands

The world ran on **Aether** — a volatile energy source extracted from the planet's core. Fifty years ago, the Aether Wells ruptured in an event called **The Overheat**, scorching half the continent and poisoning the atmosphere with metallic ash. Survivors rebuilt using salvaged tech, steam power, and scavenged Aether fragments.

The **Cogwright Collective** — a megacorp oligarchy — controls the remaining Aether supply and rules from **Pinnacle Spire**, a towering fortress-city. Everyone else scrapes by in the wasteland settlements below.

### Key Locations (MVP)

1. **Boxcar Hollow** (Town Hub) — A shantytown built inside and around a derailed mega-train. NPCs, shops, a tavern for story beats, and a save point. Ramshackle aesthetic — corrugated metal, neon tube lighting, steam vents.

2. **The Slagworks** (Dungeon 1 — Introductory) — An abandoned Aether refinery, now overrun with malfunctioning automatons and scavenger gangs. 3 floors. Teaches core mechanics. Boss: **Furnace Rex** — a repurposed industrial smelter-bot gone haywire.

3. **Undercroft Vaults** (Dungeon 2 — Advanced) — Underground bunkers beneath a collapsed Cogwright facility. Harder enemies, environmental hazards (steam jets, electrified floors as narrative flavor). 4 floors. Boss: **Warden Kael** — a Cogwright enforcer in a massive exo-suit, the first human antagonist. Reveals the Collective knows about the party and is hunting them.

---

## 3. Characters

### 3.1 Party Members

Each character has a **role**, **stat profile**, **skill tree**, and **personality**.

#### Sable — The Tank

| Field | Value |
|---|---|
| **Role** | Frontline melee bruiser |
| **Weapon Type** | Pneumatic gauntlets, pipe wrenches, sledgehammers |
| **Personality** | Quiet, dry wit, protective. Ex-factory enforcer who turned on her bosses. |
| **Primary Stats** | High HP, high DEF, moderate ATK, low SPD |
| **Skill Tree Focus** | Taunt/aggro management, counter-attacks, self-healing via "Steam Vent" (vents built into her armor), AoE ground slams |

#### Rook — The Gunner

| Field | Value |
|---|---|
| **Role** | Ranged DPS |
| **Weapon Type** | Revolvers, rifles, jury-rigged cannons |
| **Personality** | Loud, cocky, never shuts up. Thinks he's the protagonist. Borderlands energy. |
| **Primary Stats** | High ATK, high SPD, low HP, low DEF |
| **Skill Tree Focus** | Single-target burst damage, critical hit bonuses, "Trick Shot" chain attacks, debuffs (armor shred, blind) |

#### Pip — The Techie

| Field | Value |
|---|---|
| **Role** | Support / Gadgeteer |
| **Weapon Type** | Wrench (melee), deployable gadgets |
| **Personality** | Manic, talks to her machines, disturbingly cheerful about explosions. |
| **Primary Stats** | Moderate across the board, high MP equivalent ("Charge") |
| **Skill Tree Focus** | Healing gadgets (med-drones), buffs (overclock allies), deployable turrets/mines, party-wide shields |

#### Vesper — The Psion

| Field | Value |
|---|---|
| **Role** | Magic/Psychic DPS + utility |
| **Weapon Type** | Aether-infused focus crystals, bare hands |
| **Personality** | Sardonic, fatalistic, sees visions she wishes she didn't. Dark humor about her own doom. |
| **Primary Stats** | Very high MAG (magic ATK), high MP, very low HP, low DEF |
| **Skill Tree Focus** | Elemental Aether attacks (fire/shock/corrosion), AoE damage, status effects (burn, stun, corrode), enemy debuffs, limited party buffs |

### 3.2 Key NPCs (MVP)

- **Grizzle** — Boxcar Hollow's bartender/quest-giver. Gruff, one-armed, knows everyone's business.
- **Ticker** — Black market gear dealer. Paranoid, speaks in half-sentences, sells rare loot.
- **Furnace Rex** — Boss 1. No dialogue, just mechanical screaming and fire.
- **Warden Kael** — Boss 2. Cold, professional Cogwright enforcer. Delivers exposition about the Collective's plans before the fight.

---

## 4. Core Systems

### 4.1 Combat System

**Type:** Pure turn-based, side-view (party on right, enemies on left).

#### Turn Order
- All combatants (party + enemies) are sorted by **SPD** stat at the start of each round.
- Ties broken by: party members first, then alphabetical.
- Turn order is recalculated each round (buffs/debuffs can change it).

#### Actions Per Turn
Each character can perform ONE action per turn:
1. **Attack** — Basic weapon attack. Damage = ATK × weapon modifier − target DEF.
2. **Skill** — Use an ability from their skill tree. Costs **Charge** (MP equivalent).
3. **Item** — Use a consumable item from inventory.
4. **Defend** — Skip turn, gain 50% damage reduction until next turn, gain +10 SPD for next round's turn order.
5. **Flee** — Attempt to escape (random encounters only). Success rate = party avg SPD / enemy avg SPD × 100%. Cannot flee from bosses.

#### Damage Formula
```
Base Damage = (ATK * 2 + Weapon Power) - (DEF + Armor Rating)
Final Damage = Base Damage * Element Modifier * Random(0.9, 1.1)
Minimum Damage = 1
```

#### Critical Hits
- Base crit rate: 5%
- Crit multiplier: 1.5×
- Modified by skills and equipment.

#### Elements
Three elements in a rock-paper-scissors triangle:
- **Thermal** (fire/heat) → strong vs **Corrosion**
- **Voltaic** (electricity/lightning) → strong vs **Thermal**
- **Corrosion** (acid/rust/decay) → strong vs **Voltaic**
- Strong = 1.5× damage, Weak = 0.5× damage, Neutral = 1.0×

#### Status Effects
| Effect | Duration | Description |
|---|---|---|
| **Burn** | 3 turns | Lose 5% max HP per turn |
| **Stun** | 1 turn | Skip next turn |
| **Corrode** | 3 turns | DEF reduced by 25% |
| **Blind** | 2 turns | 50% miss chance on attacks |
| **Overclock** | 2 turns | SPD and ATK increased by 20% |
| **Shield** | Until broken | Absorbs X points of damage |

#### Encounter Structure
- **Random encounters**: Triggered by step counter while exploring dungeons. Average 1 encounter per 15–25 steps (randomized).
- **Encounter pool**: Each dungeon floor has a defined enemy pool with weighted spawn rates.
- **Formation**: 1–4 enemies per encounter, selected from the floor's pool.

#### Victory Rewards
- **XP**: Distributed equally to all living party members.
- **Loot drops**: Each enemy has a loot table (see Section 4.3).
- **Currency**: "Scrap" — universal currency.

#### Game Over
- All party members reach 0 HP → Game Over screen.
- Options: Load last save, return to title.

### 4.2 Progression System — Skill Trees

Each character has a **skill tree** with 3 branches. Leveling up (XP thresholds) grants **1 Skill Point (SP)**.

#### XP Table (MVP — Level 1–15 cap)
| Level | Total XP Required |
|---|---|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 |
| 4 | 500 |
| 5 | 850 |
| 6 | 1300 |
| 7 | 1900 |
| 8 | 2600 |
| 9 | 3500 |
| 10 | 4600 |
| 11 | 5900 |
| 12 | 7500 |
| 13 | 9400 |
| 14 | 11600 |
| 15 | 14000 |

#### Stat Growth Per Level
Stats increase automatically per level. Each character has growth rates:

| Character | HP | ATK | DEF | MAG | SPD | Charge |
|---|---|---|---|---|---|---|
| Sable | +35 | +4 | +5 | +1 | +2 | +3 |
| Rook | +18 | +6 | +2 | +1 | +5 | +4 |
| Pip | +25 | +3 | +3 | +3 | +3 | +6 |
| Vesper | +15 | +1 | +2 | +7 | +3 | +5 |

#### Base Stats (Level 1)
| Character | HP | ATK | DEF | MAG | SPD | Charge |
|---|---|---|---|---|---|---|
| Sable | 120 | 14 | 16 | 4 | 8 | 10 |
| Rook | 70 | 18 | 8 | 5 | 16 | 15 |
| Pip | 90 | 10 | 12 | 12 | 10 | 25 |
| Vesper | 55 | 5 | 7 | 22 | 12 | 20 |

#### Skill Tree Structure

Each tree branch has 5 nodes. Nodes must be unlocked in order (linear per branch). Each node costs 1 SP.

**Sable's Trees:**
- **Ironwall** (defense): Taunt → Iron Skin (+20% DEF, 3 turns) → Counter Stance (auto-counter on hit) → Fortress (party-wide 15% damage reduction, 2 turns) → Immovable (immune to stun/knockback, passive)
- **Wrecker** (offense): Power Strike (1.5× ATK) → Ground Slam (AoE, 0.8× ATK all enemies) → Armor Break (reduce target DEF 30%, 3 turns) → Juggernaut (ATK scales with missing HP) → Demolition (2.5× ATK, costs 50% current HP)
- **Steamworks** (sustain): Steam Vent (heal 20% HP) → Pressure Release (heal + cure status) → Overboil (heal 35% HP + Overclock self) → Venting Aura (party heals 5% HP/turn, 3 turns) → Full Pressure (revive self once per battle at 30% HP)

**Rook's Trees:**
- **Marksman** (single-target): Aimed Shot (1.8× ATK, -SPD priority) → Headshot (15% crit rate bonus, passive) → Armor Piercing (ignore 50% DEF) → Dead Eye (guaranteed crit, 1/battle) → Killshot (3× ATK, only usable on enemies below 25% HP)
- **Gunslinger** (speed/multi): Quick Draw (+30% SPD, 2 turns) → Double Tap (attack twice at 0.6× each) → Ricochet (hit random enemy 3 times at 0.5×) → Fan the Hammer (hit all enemies at 0.7×) → Bullet Time (act twice this turn)
- **Saboteur** (debuffs): Blind Shot (inflict Blind) → Corrosive Rounds (attacks inflict Corrode, 3 turns passive) → Crippling Shot (reduce SPD 50%, 2 turns) → Expose Weakness (target takes 25% more damage, 3 turns) → Shutdown (target skips 2 turns, boss: 1 turn)

**Pip's Trees:**
- **Medic** (healing): Med-Drone (heal single ally 30% HP) → Repair Kit (cure all status effects, single) → Field Surgery (heal party 20% HP) → Emergency Protocol (auto-heal ally below 20% HP once/battle) → Resurrection Rig (revive ally at 50% HP)
- **Engineer** (buffs/shields): Overclock (buff single ally ATK+SPD 20%, 3 turns) → Barrier Projector (Shield ally, absorbs 50 + 10×level damage) → Turret (deployable, attacks each turn for 3 turns at Pip's MAG×1.5) → Party Overclock (buff all allies ATK+SPD 15%, 2 turns) → Masterwork (all buffs last +2 turns, passive)
- **Demolitionist** (offense): Frag Grenade (AoE Thermal damage, MAG×1.2) → Shock Mine (single target Voltaic, chance to Stun) → Acid Bomb (AoE Corrosion damage + Corrode status) → Chain Reaction (if enemy dies from Pip's attack, explosion hits adjacent) → Megabomb (AoE all elements, MAG×2.5, 3-turn cooldown)

**Vesper's Trees:**
- **Pyrokinetic** (Thermal): Ignite (single target Thermal, MAG×1.3) → Heatwave (AoE Thermal, MAG×0.9 + Burn) → Thermal Lance (single target, MAG×2.0) → Inferno (AoE, MAG×1.5 + Burn) → Supernova (AoE, MAG×3.0, Vesper takes 20% max HP recoil)
- **Stormcaller** (Voltaic): Spark (single Voltaic, MAG×1.2 + 20% Stun chance) → Arc Lightning (hits 2 random enemies) → Thunderclap (AoE Voltaic, MAG×1.0 + 30% Stun) → Chain Lightning (hits all, 50% more damage per enemy hit) → Tempest (AoE, MAG×2.5 + guaranteed Stun, costs 50% max Charge)
- **Entropy** (Corrosion/utility): Corrode (single Corrosion, MAG×1.1 + Corrode status) → Mind Fray (single target, chance to make enemy attack allies) → Rust Storm (AoE Corrosion, MAG×1.0) → Aether Drain (damage enemy, restore Charge to self) → Decay Field (AoE, enemies lose 10% max HP/turn + all stats reduced 15%, 3 turns)

### 4.3 Loot System

#### Rarity Tiers
| Tier | Color | Drop Rate | Stat Bonus Range |
|---|---|---|---|
| **Junk** | Gray | 45% | 0–5% |
| **Common** | White | 30% | 5–15% |
| **Rare** | Blue | 15% | 15–30% |
| **Epic** | Purple | 8% | 30–50% |
| **Legendary** | Orange | 2% | 50–80% |

#### Equipment Slots (Per Character)
1. **Weapon** — Primary stat: ATK (or MAG for Vesper)
2. **Armor** — Primary stat: DEF, secondary: HP
3. **Accessory** — Varied effects (SPD boost, crit rate, status resist, etc.)

#### Loot Generation Algorithm
When an item drops:
1. Roll rarity tier from the drop rate table.
2. Select base item type appropriate to the slot (e.g., "Revolver" for Rook's weapon).
3. Apply rarity modifier to base stats.
4. Roll 0–2 random bonus affixes from an affix pool.
5. Generate a name: `[Prefix from affix] [Base Item] [Suffix from rarity]`

#### Affix Pool (examples)
| Affix | Effect | Appears On |
|---|---|---|
| Scorching | +15% Thermal damage | Weapons |
| Galvanized | +10% Voltaic resist | Armor |
| Quick | +5 SPD | Any |
| Vampiric | Heal 3% damage dealt | Weapons |
| Fortified | +10% max HP | Armor |
| Lucky | +3% crit rate | Accessories |
| Charged | +10% max Charge | Accessories |
| Thorned | Reflect 5% damage taken | Armor |

#### Shop System
- **Buy**: Ticker sells a rotating stock of Common–Rare items, plus consumables. Stock refreshes after each dungeon completion.
- **Sell**: Players can sell any item for Scrap. Value = base value × rarity multiplier.
- **Consumables available**: Health Stim (heal 30% HP), Charge Cell (restore 30% Charge), Antidote Kit (cure status), Smoke Bomb (guaranteed flee from non-boss).

### 4.4 Inventory & Items

#### Inventory Limits
- **Equipment**: Unlimited storage (not expected to be large at MVP scale).
- **Consumables**: Stack up to 99 per item type. Max 10 distinct consumable types.

#### Consumable Items
| Item | Effect | Buy Price | Sell Price |
|---|---|---|---|
| Health Stim | Restore 30% max HP to one ally | 50 Scrap | 25 Scrap |
| Mega Stim | Restore 70% max HP to one ally | 150 Scrap | 75 Scrap |
| Charge Cell | Restore 30% max Charge to one ally | 60 Scrap | 30 Scrap |
| Mega Cell | Restore 70% max Charge to one ally | 180 Scrap | 90 Scrap |
| Antidote Kit | Cure all status effects on one ally | 40 Scrap | 20 Scrap |
| Revive Coil | Revive one KO'd ally at 25% HP | 200 Scrap | 100 Scrap |
| Smoke Bomb | Guarantee escape from non-boss battle | 80 Scrap | 40 Scrap |
| Aether Shard | Deal 100 fixed Thermal damage to one enemy | 100 Scrap | 50 Scrap |

---

## 5. World Design & Map Structure

### 5.1 Tile-Based Maps

All maps are tile-based (16×16 pixel tiles at base, rendered at 2× or 3× scale). Maps are defined as 2D arrays with tile type IDs.

#### Tile Types
- **Floor** — Walkable
- **Wall** — Impassable, blocks movement
- **Interactable** — Triggers event (NPC, chest, door, sign, save point)
- **Transition** — Moves player to another map (door, stairs, exit)
- **Hazard** — Visual only for MVP (steam vents, sparks — cosmetic flavor)

### 5.2 Boxcar Hollow (Town)

**Map Size:** ~40×30 tiles
**Zones:**
- **Tavern** (Grizzle's place) — Story scenes, quest info
- **Ticker's Stall** — Shop interface
- **Save Terminal** — Save point (glowing console)
- **Town Gate East** — Exit to Slagworks
- **Town Gate South** — Exit to Undercroft Vaults (locked until Slagworks clear)
- **Scattered NPCs** — 4–5 townsfolk with flavor dialogue

### 5.3 The Slagworks (Dungeon 1)

**Floors:** 3
**Map Size:** ~30×25 tiles per floor
**Enemy Pool:**
| Enemy | HP | ATK | DEF | MAG | SPD | Element | XP | Scrap |
|---|---|---|---|---|---|---|---|---|
| Scrap Drone | 30 | 8 | 4 | 0 | 10 | Voltaic | 15 | 10 |
| Rust Rat | 20 | 10 | 3 | 0 | 14 | Corrosion | 12 | 8 |
| Slag Golem | 60 | 12 | 10 | 0 | 4 | Thermal | 25 | 18 |
| Scavenger Thug | 40 | 14 | 6 | 0 | 8 | None | 20 | 15 |

**Floor Progression:**
- Floor 1: Scrap Drones + Rust Rats (1–2 enemies)
- Floor 2: All regular enemies (2–3 enemies)
- Floor 3: Heavier formations (3–4 enemies), leads to boss

**Boss: Furnace Rex**
| Stat | Value |
|---|---|
| HP | 500 |
| ATK | 22 |
| DEF | 15 |
| MAG | 10 |
| SPD | 6 |
| Element | Thermal |
| XP | 200 |
| Scrap | 150 |

**Boss Mechanics:**
- Phase 1 (100%–50% HP): Basic attacks + **Flame Belch** (AoE Thermal, party-wide Burn chance)
- Phase 2 (below 50% HP): Gains **Overheat** — ATK increases by 30% but takes 5% max HP self-damage per turn. Adds **Slag Spray** (AoE Corrosion + Corrode status).
- Drops: 1 guaranteed Rare+ weapon, 1 guaranteed Rare+ armor.

### 5.4 Undercroft Vaults (Dungeon 2)

**Floors:** 4
**Map Size:** ~35×30 tiles per floor
**Enemy Pool:**
| Enemy | HP | ATK | DEF | MAG | SPD | Element | XP | Scrap |
|---|---|---|---|---|---|---|---|---|
| Cogwright Sentry | 55 | 16 | 12 | 0 | 8 | None | 35 | 25 |
| Shock Turret | 40 | 10 | 8 | 14 | 12 | Voltaic | 30 | 20 |
| Vault Crawler | 35 | 20 | 5 | 0 | 16 | Corrosion | 28 | 18 |
| Aether Wraith | 45 | 8 | 6 | 18 | 14 | Thermal | 40 | 30 |
| Enforcer Mk.II | 80 | 20 | 16 | 0 | 6 | None | 50 | 35 |

**Floor Progression:**
- Floor 1–2: Sentries + Turrets (2–3 enemies)
- Floor 3: All types (3–4 enemies), mini-boss possible (Enforcer Mk.II solo)
- Floor 4: Boss arena

**Boss: Warden Kael**
| Stat | Value |
|---|---|
| HP | 900 |
| ATK | 28 |
| DEF | 20 |
| MAG | 15 |
| SPD | 10 |
| Element | None (shifts) |
| XP | 500 |
| Scrap | 300 |

**Boss Mechanics:**
- Phase 1 (100%–60% HP): **Exo-Strike** (heavy single target), **Shield Matrix** (gains Shield absorbing 100 damage). Dialogue taunts the party.
- Phase 2 (60%–30% HP): **Elemental Shift** — cycles between Thermal/Voltaic/Corrosion each turn, gaining that element's resistance and attacks. **Deploy Drones** — summons 2 Scrap Drones (if killed, re-summons next turn).
- Phase 3 (below 30% HP): **Overdrive** — acts twice per turn. **Desperation Blast** (AoE all elements, massive damage). Stops summoning drones.
- Drops: 1 guaranteed Epic+ item, story progression item ("Cogwright Access Key").

---

## 6. Story & Dialogue (MVP)

### 6.1 Story Arc

**Act 1 — Boxcar Hollow (Opening)**
- Party is already together (backstory revealed through dialogue, not a long intro).
- Grizzle tells them the Slagworks has a working Aether Converter that could power the town. Go get it.
- Character banter establishes personalities. Rook brags, Vesper sees a bad omen, Pip is excited about the old tech, Sable just wants to get moving.

**Act 2 — The Slagworks**
- Fight through the refinery. Environmental storytelling: old worker logs, graffiti, signs of the Overheat.
- Boss fight: Furnace Rex was the refinery's safety system, gone insane without maintenance.
- Retrieve the Aether Converter. Return to Boxcar Hollow.

**Act 3 — Revelation**
- Back in town, Grizzle reveals that a Cogwright patrol was spotted heading toward the Undercroft Vaults beneath the old facility south of town. They're looking for something.
- Party decides to get there first. Ticker offers gear upgrades. New dialogue from townsfolk about Cogwright sightings.

**Act 4 — Undercroft Vaults**
- Deeper, more dangerous. Find evidence the Cogwright Collective is building a weapon using concentrated Aether.
- Warden Kael confronts the party before the boss fight. Delivers exposition: the Collective knows about them, considers them a nuisance, and the weapon ("The Crucible") will be used to pacify all remaining free settlements.
- Boss fight. After defeating Kael, the party finds partial blueprints for The Crucible.

**Act 5 — Cliffhanger Ending**
- Return to Boxcar Hollow. Grizzle examines the blueprints. "This is worse than we thought." Vesper has a vision of Pinnacle Spire burning.
- End screen: "THE GEARBREAKERS WILL RETURN" — with stats summary (play time, battles won, items found).

### 6.2 Dialogue System

- Simple dialogue boxes with character portraits (pixel art headshots).
- NPC interaction: walk up and press interact button.
- Dialogue format: `[Character Name]: "Dialogue text."` — displayed in a bottom-screen text box.
- No branching dialogue in MVP. Linear story with optional NPC flavor text.
- Max ~50 dialogue nodes for the full MVP.

---

## 7. UI/UX Design

### 7.1 Screen Layout

**Exploration Mode:**
```
┌──────────────────────────────────────┐
│                                      │
│           MAP VIEWPORT               │
│        (centered on player)          │
│                                      │
│                                      │
├──────────────────────────────────────┤
│ [Party Status Bar]                   │
│ Sable: HP ███░ | Rook: HP ████░     │
│ Pip:   HP ████ | Vesper: HP ██░░    │
└──────────────────────────────────────┘
```

**Battle Mode:**
```
┌──────────────────────────────────────┐
│  [Enemy sprites]     [Party sprites] │
│  ┌────┐ ┌────┐       ┌────┐ ┌────┐ │
│  │ E1 │ │ E2 │       │ P1 │ │ P2 │ │
│  └────┘ └────┘       └────┘ └────┘ │
│           ┌────┐       ┌────┐ ┌────┐│
│           │ E3 │       │ P3 │ │ P4 ││
│           └────┘       └────┘ └────┘│
├──────────────────────────────────────┤
│ ┌─────────────┐ ┌──────────────────┐│
│ │ COMMAND MENU│ │ STATUS PANEL     ││
│ │ > Attack    │ │ Sable  HP 120/120││
│ │   Skill     │ │ Rook   HP  70/70 ││
│ │   Item      │ │ Pip    HP  90/90 ││
│ │   Defend    │ │ Vesper HP  55/55 ││
│ │   Flee      │ │                  ││
│ └─────────────┘ └──────────────────┘│
└──────────────────────────────────────┘
```

**Menu Screen (pause):**
- Tabs: Items, Equipment, Skills, Status, Save, Options
- Equipment screen shows current gear + inventory list with stat comparisons.
- Skills screen shows skill trees with unlocked/available/locked nodes.

### 7.2 Resolution & Scaling

- **Base resolution:** 256×224 (classic SNES-style)
- **Rendered at:** 3× scale → 768×672 in the browser canvas
- **Responsive:** Canvas centers in viewport with black letterboxing

### 7.3 Controls

| Action | Keyboard | Gamepad (optional/stretch) |
|---|---|---|
| Move | Arrow keys / WASD | D-pad / Left stick |
| Confirm/Interact | Z / Enter | A button |
| Cancel/Back | X / Escape | B button |
| Menu | C / Tab | Start |
| Run (in exploration) | Hold Shift | Hold B |

---

## 8. Audio (MVP)

For MVP, audio is optional but spec'd for inclusion if time allows.

- **Music:** Royalty-free chiptune tracks or generated. 4 tracks needed:
  1. Town theme (relaxed, jazzy-steampunk)
  2. Dungeon exploration (tense, industrial)
  3. Battle theme (energetic, driving)
  4. Boss battle theme (intense, urgent)
- **SFX:** Basic set — menu select, attack hit, magic cast, item use, critical hit, enemy death, level up, chest open.
- **Implementation:** HTML5 Audio API or Howler.js for cross-browser support.

---

## 9. Save System

### 9.1 Save Data Structure
```json
{
  "version": "1.0",
  "timestamp": "ISO-8601",
  "playtime_seconds": 0,
  "party": [
    {
      "id": "sable",
      "level": 1,
      "xp": 0,
      "currentHP": 120,
      "maxHP": 120,
      "currentCharge": 10,
      "stats": { "ATK": 14, "DEF": 16, "MAG": 4, "SPD": 8 },
      "skillPoints": 0,
      "unlockedSkills": [],
      "equipment": {
        "weapon": null,
        "armor": null,
        "accessory": null
      }
    }
  ],
  "inventory": {
    "items": [],
    "scrap": 100
  },
  "gameState": {
    "currentMap": "boxcar_hollow",
    "playerPosition": { "x": 5, "y": 10 },
    "storyFlags": {},
    "chestsOpened": [],
    "bossesDefeated": []
  }
}
```

### 9.2 Save/Load
- Save to **localStorage** with a slot system (3 save slots).
- Save only at save terminals (specific map tiles).
- Load from title screen or pause menu.

---

## 10. Technical Architecture

### 10.1 Module Structure

The codebase should be organized into independent modules that communicate through well-defined interfaces:

```
gearbreakers/
├── index.html              # Entry point
├── css/
│   └── styles.css          # UI styling for menus, HUD overlays
├── assets/
│   ├── sprites/            # Character, enemy, tile sprites (PNG)
│   ├── portraits/          # Character portrait art for dialogue
│   ├── ui/                 # Menu backgrounds, icons, borders
│   ├── audio/              # Music and SFX files
│   └── maps/               # Map data files (JSON)
├── src/
│   ├── main.js             # Boot, game loop, state machine
│   ├── engine/
│   │   ├── renderer.js     # Canvas rendering, sprite drawing, camera
│   │   ├── input.js        # Keyboard input handling
│   │   ├── audio.js        # Sound manager
│   │   └── utils.js        # RNG, math helpers, damage formulas
│   ├── scenes/
│   │   ├── titleScene.js   # Title screen
│   │   ├── explorationScene.js  # Overworld/dungeon exploration
│   │   ├── battleScene.js  # Combat scene
│   │   ├── menuScene.js    # Pause menu (items, equip, skills, save)
│   │   └── dialogueScene.js # Dialogue/cutscene overlay
│   ├── systems/
│   │   ├── combat.js       # Turn logic, damage calc, AI
│   │   ├── loot.js         # Item generation, rarity rolls, affixes
│   │   ├── progression.js  # XP, leveling, skill tree management
│   │   ├── inventory.js    # Item storage, equipment management
│   │   ├── encounter.js    # Random encounter trigger, enemy spawning
│   │   └── save.js         # Save/load to localStorage
│   ├── data/
│   │   ├── characters.js   # Party member base stats, growth rates
│   │   ├── enemies.js      # Enemy definitions, loot tables
│   │   ├── skills.js       # All skill definitions and trees
│   │   ├── items.js        # Consumable and base equipment definitions
│   │   ├── maps.js         # Map metadata, tile definitions
│   │   └── dialogue.js     # All dialogue scripts
│   └── entities/
│       ├── Player.js       # Player entity (position, movement, sprite)
│       ├── PartyMember.js  # Party member class (stats, skills, equipment)
│       ├── Enemy.js        # Enemy class (stats, AI behavior, drops)
│       └── NPC.js          # NPC entity (position, dialogue trigger)
```

### 10.2 Game Loop

```
Target: 60 FPS via requestAnimationFrame

Loop:
  1. Process input
  2. Update current scene (exploration, battle, menu, dialogue)
  3. Render current scene to canvas
```

### 10.3 Scene/State Machine

The game has a stack-based scene manager:
- **TitleScene** → push **ExplorationScene**
- **ExplorationScene** → push **BattleScene** (on encounter), push **DialogueScene** (on NPC), push **MenuScene** (on pause)
- Scenes can be pushed/popped. Top of stack gets update/render calls. Scenes below can optionally render (e.g., exploration visible behind a translucent menu).

### 10.4 Key Interfaces

#### PartyMember Interface
```javascript
{
  id: string,
  name: string,
  level: number,
  xp: number,
  currentHP: number,
  maxHP: number,
  currentCharge: number,
  maxCharge: number,
  stats: { ATK, DEF, MAG, SPD },
  growthRates: { HP, ATK, DEF, MAG, SPD, Charge },
  equipment: { weapon, armor, accessory },
  skillPoints: number,
  unlockedSkills: string[],
  statusEffects: StatusEffect[]
}
```

#### Enemy Interface
```javascript
{
  id: string,
  name: string,
  currentHP: number,
  maxHP: number,
  stats: { ATK, DEF, MAG, SPD },
  element: string | null,
  xpReward: number,
  scrapReward: number,
  lootTable: LootEntry[],
  ai: AIBehavior,
  statusEffects: StatusEffect[],
  spriteId: string
}
```

#### Item Interface
```javascript
{
  id: string,
  name: string,
  type: "weapon" | "armor" | "accessory" | "consumable",
  rarity: "junk" | "common" | "rare" | "epic" | "legendary",
  baseStats: { ... },
  affixes: Affix[],
  equippableBy: string[],   // character IDs
  value: number,             // sell price in Scrap
  description: string
}
```

---

## 11. Agent Assignment Breakdown

This section defines how the work should be divided among multiple development agents. Each agent has a clear scope, inputs, outputs, and dependencies.

### Agent 1: Engine & Core Infrastructure
**Scope:** Game loop, canvas renderer, input system, scene manager, asset loader.
**Delivers:** `main.js`, `engine/*`, scene manager framework, basic sprite rendering, keyboard input.
**Dependencies:** None (foundational layer).
**Acceptance Criteria:**
- Canvas renders at 768×672 with 3× pixel scaling
- 60 FPS game loop running
- Scene push/pop system working
- Keyboard input captured and dispatched
- Sprite sheet loading and frame rendering working

### Agent 2: Exploration & Maps
**Scope:** Tile-based map rendering, player movement, map transitions, NPC interaction triggers, random encounter step counter, collision detection.
**Delivers:** `explorationScene.js`, `Player.js`, `NPC.js`, map rendering, `encounter.js` (trigger only).
**Dependencies:** Agent 1 (engine/renderer).
**Accepts:** Map data from Agent 6 (data definitions).
**Acceptance Criteria:**
- Player moves on tile grid with collision
- Camera follows player, scrolls on larger maps
- Map transitions work (doors, stairs)
- Walking on floor tiles increments step counter
- NPCs are interactable (triggers dialogue event)
- Save terminals are interactable (triggers save event)
- Chests are interactable and can be opened once

### Agent 3: Combat System
**Scope:** Battle scene, turn order, action execution, damage calculation, status effects, enemy AI, battle rewards, victory/defeat conditions.
**Delivers:** `battleScene.js`, `combat.js`, `Enemy.js`, enemy AI behaviors.
**Dependencies:** Agent 1 (engine/renderer), Agent 6 (enemy data, skill data).
**Acceptance Criteria:**
- Side-view battle layout renders correctly
- Turn order calculated by SPD each round
- All 5 action types work (Attack, Skill, Item, Defend, Flee)
- Damage formula implemented correctly including elements
- Status effects apply and tick correctly
- Enemy AI makes reasonable decisions (target low HP allies, use skills)
- Boss phase transitions work
- Victory screen shows XP and loot rewards
- Game Over screen on party wipe

### Agent 4: Progression, Loot & Inventory
**Scope:** XP/leveling system, skill tree logic, loot generation, equipment management, inventory system, shop buy/sell.
**Delivers:** `progression.js`, `loot.js`, `inventory.js`, `PartyMember.js`, shop UI logic.
**Dependencies:** Agent 1 (engine), Agent 6 (data definitions).
**Acceptance Criteria:**
- XP awards level characters up correctly with stat growth
- Skill points are awarded and can be spent on skill tree nodes
- Loot generates with correct rarity distribution and random affixes
- Equipment can be equipped/unequipped with stat changes applied
- Inventory correctly tracks items and stacks consumables
- Shop buy/sell works with Scrap currency
- Stat comparison shown when equipping items

### Agent 5: UI, Menus & Dialogue
**Scope:** Title screen, pause menu (items/equip/skills/status/save tabs), dialogue box system, HUD overlays, save/load UI.
**Delivers:** `titleScene.js`, `menuScene.js`, `dialogueScene.js`, `save.js`, HUD rendering.
**Dependencies:** Agent 1 (engine/renderer), Agent 4 (inventory/progression data).
**Acceptance Criteria:**
- Title screen with New Game / Continue options
- Pause menu with all tabs functional
- Dialogue box displays character name, portrait, and text with typewriter effect
- HUD shows party HP bars during exploration
- Save system writes/reads 3 slots to localStorage
- Skill tree visual display with unlock state

### Agent 6: Data & Content
**Scope:** All game data definitions — character stats, enemy stats, skill definitions, item tables, loot tables, map tile data, dialogue scripts, NPC definitions.
**Delivers:** All files in `data/*`, map JSON files in `assets/maps/`.
**Dependencies:** None (can work in parallel with all other agents using this spec as the contract).
**Acceptance Criteria:**
- All 4 character base stats, growth rates, and skill trees defined
- All enemies for both dungeons defined with stats and loot tables
- All consumable items defined
- Base equipment types defined for loot generation
- Affix pool defined
- All map layouts created as tile arrays
- All dialogue scripts written (~50 nodes)
- NPC definitions with positions and dialogue triggers

### Agent 7: Art & Assets
**Scope:** Pixel art sprites, tilesets, portraits, UI elements. Can be done by a human artist or AI art generation.
**Delivers:** All files in `assets/*`.
**Dependencies:** None (works from character/enemy descriptions in this spec).
**Asset List:**
- 4 party member sprites (walk cycle: 4 directions × 3 frames + battle idle + attack frame)
- 4 party member portrait headshots (for dialogue)
- 9 enemy sprites (4 Slagworks + 5 Undercroft + 2 bosses, battle idle + attack)
- Tileset for town (16×16 tiles: floors, walls, objects, decorations)
- Tileset for dungeon 1 (industrial/refinery theme)
- Tileset for dungeon 2 (underground/vault theme)
- UI elements: menu borders, HP/Charge bars, cursor, icons for items
- Battle background: Slagworks, Undercroft Vaults
- Title screen art

---

## 12. Development Priorities & Milestones

### Milestone 1: Walking Around
- Engine renders canvas
- Player moves on a test map
- Camera works
- **Agents:** 1, then 2

### Milestone 2: First Fight
- Random encounter triggers
- Battle scene loads with test enemies
- Player can Attack and Defend
- Enemies take turns and attack
- Battle ends on victory or defeat
- **Agents:** 3 (using stub data)

### Milestone 3: It's an RPG
- XP and leveling works
- Skills can be used in combat
- Items can be used in combat
- Equipment changes stats
- Loot drops from enemies
- **Agents:** 4

### Milestone 4: Full Loop
- Town map with NPCs and shop
- Dungeon 1 fully playable start to finish
- Boss fight works
- Save/Load system
- Menus all functional
- **Agents:** 5, 6, 7

### Milestone 5: Complete MVP
- Dungeon 2 playable
- All story dialogue in
- All enemies and bosses
- Balance pass (XP rates, damage, shop prices)
- Title screen, Game Over screen, ending screen
- **All agents integrate**

---

## 13. Open Questions & Stretch Goals

### Open (to be decided during development)
- Exact enemy AI behavior rules (priority targeting, skill usage frequency)
- Exact loot table weights per enemy
- Map layout specifics (detailed tile-by-tile design vs. procedural)

### Stretch Goals (post-MVP)
- Gamepad support
- Music and SFX
- Animated battle sprites (attack animations, spell effects)
- Bestiary / item compendium
- New Game+ mode
- Additional dungeons and story content
- Particle effects for spells and abilities
- Screen shake on critical hits / boss attacks
- Mini-map in exploration
