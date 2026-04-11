# Gearbreakers -- Player Guide

Welcome to the Rustlands. This guide covers everything you need to know to survive.

## Controls

| Action           | Primary Key    | Alternate Key  |
|------------------|----------------|----------------|
| Move Up          | Arrow Up       | W              |
| Move Down        | Arrow Down     | S              |
| Move Left        | Arrow Left     | A              |
| Move Right       | Arrow Right    | D              |
| Confirm/Interact | Z              | Enter          |
| Cancel/Back      | X              | Escape         |
| Open Menu        | C              | Tab            |
| Run              | Shift (hold)   | --             |

All controls are keyboard-only. Use Confirm to interact with NPCs, open chests, activate save terminals, and advance dialogue. Use Cancel to back out of menus and close dialogue. Open Menu pauses the game and provides access to items, equipment, skills, status, and save options. Hold Run while moving to travel faster through explored areas.

## Getting Started

When you launch the game, you will see the title screen. Select **New Game** to begin or **Load Game** to continue from a previous save.

Starting a new game opens with a short dialogue scene introducing the four party members -- Sable, Rook, Pip, and Vesper -- at a tavern in Boxcar Hollow. The bartender Grizzle sends the party to retrieve an Aether Converter from the nearby Slagworks refinery. After the dialogue, you gain control in Boxcar Hollow and can explore the town, talk to NPCs, shop at Ticker's stall, and save your game before heading out.

## Exploration

Move your character through the world using the arrow keys or WASD. Your party moves as a single unit on the overworld. Interact with people, objects, and terminals by walking up to them and pressing the Confirm key.

**NPCs:** Talk to townsfolk for story context, hints, and flavor dialogue. Key NPCs like Grizzle (quest-giver) and Ticker (shopkeeper) advance the game.

**Chests:** Found throughout dungeons. Walk up and press Confirm to open. Each chest contains a randomly generated piece of equipment or a consumable item.

**Save Terminals:** Glowing consoles found in Boxcar Hollow and at specific dungeon locations. Interact with one to access the save menu, where you can write your progress to one of three save slots.

**Dungeons:** When exploring dungeon floors, random encounters trigger based on a step counter. Expect a battle roughly every 15 to 25 steps. Each floor has its own enemy pool, with harder enemies and larger groups appearing on deeper floors.

**Transitions:** Doors, staircases, and exits move you between areas. The exit to the Undercroft Vaults is locked until you clear the Slagworks.

## Combat

Combat is pure turn-based with a side-view layout. Your party appears on the right and enemies on the left. Each round, every combatant takes one action in speed order.

### Turn Order

All combatants are sorted by their SPD stat at the start of each round. Turn order is recalculated every round, meaning speed buffs and debuffs take effect immediately. When two combatants share the same SPD value, party members act before enemies. Among party members with tied speed, order is determined alphabetically.

### Actions

Each character chooses one action per turn:

**Attack** -- Perform a basic weapon attack against a single target. Damage is calculated from ATK, weapon power, the target's DEF, and armor rating. All attacks have a base 5% critical hit chance, dealing 1.5x damage on a crit.

**Skill** -- Use a learned ability from the character's skill tree. Skills cost Charge (the game's equivalent of MP). Skills range from powerful single-target strikes to party-wide heals, buffs, and debuffs. See the Characters section below for each character's full skill list.

**Item** -- Use a consumable from the party inventory on a chosen target. Items include healing stims, charge cells, antidote kits, revive coils, and more.

**Defend** -- Skip your action to gain 50% damage reduction until your next turn. Defending also grants +10 SPD for the next round's turn order calculation, letting the character act earlier next round.

**Flee** -- Attempt to escape a random encounter. The success rate depends on your party's average speed relative to the enemies' average speed. You cannot flee from boss fights. Smoke Bombs guarantee a successful escape from any non-boss encounter.

### Elements

Three elements form a rock-paper-scissors triangle:

| Element    | Strong Against | Weak Against |
|------------|----------------|--------------|
| Thermal    | Corrosion      | Voltaic      |
| Voltaic    | Thermal        | Corrosion    |
| Corrosion  | Voltaic        | Thermal      |

Hitting an enemy's weakness deals 1.5x damage. Hitting their resistance deals 0.5x damage. Neutral matchups deal standard damage. Many enemies have an elemental affinity, so pay attention to their type and exploit it.

### Status Effects

| Effect    | Duration | Description                                      |
|-----------|----------|--------------------------------------------------|
| Burn      | 3 turns  | Target loses 5% of max HP at the end of each turn |
| Stun      | 1 turn   | Target skips their next turn entirely             |
| Corrode   | 3 turns  | Target's DEF is reduced by 25%                   |
| Blind     | 2 turns  | Target has a 50% chance to miss basic attacks     |
| Overclock | 2 turns  | Target's SPD and ATK are increased by 20%        |
| Shield    | Until broken | Absorbs a fixed amount of damage before breaking |

Status effects can be cured with Antidote Kits or Pip's healing skills. Overclock and Shield are beneficial effects applied to your own party members through skills and items.

### Victory and Defeat

Defeating all enemies in a battle awards XP (split equally among living party members), Scrap (currency), and loot drops. Each enemy has its own loot table with weighted drop rates.

If all four party members reach 0 HP, it is game over. You will be given the option to load your last save or return to the title screen. Save often.

## Menu System

Press C or Tab during exploration to open the pause menu. The menu has five tabs.

### Items Tab

View all consumable items in your inventory. Select an item to use it, then choose a target party member. Items can only be used outside of combat from this menu if they are non-combat items. Combat consumables are used via the Item action during battle.

### Equipment Tab

View and change each party member's gear. Each character has three equipment slots: Weapon, Armor, and Accessory. Selecting a slot shows all compatible items in your inventory. Stat changes are previewed before you confirm the swap, showing which stats go up or down.

### Skills Tab

View each character's three-branch skill tree. Nodes that can be unlocked (you have enough SP and have unlocked the prerequisite) are highlighted. Select a node and confirm to spend 1 SP and learn that skill. Nodes within each branch must be unlocked in order from top to bottom.

### Status Tab

View detailed stats for each party member, including current and max HP, Charge, ATK, DEF, MAG, SPD, current level, total XP, XP to next level, and any active status effects.

### Save Tab

Save your game to one of three save slots. Saving is only available when you are standing at a save terminal in the game world. Each slot displays the save's timestamp, party level, and current location.

## Loot and Equipment

All equipment in Gearbreakers is procedurally generated. When an item drops, the game rolls a rarity tier, selects a base item type appropriate to the equipment slot and character, applies stat bonuses based on rarity, and adds zero to two random bonus affixes.

### Rarity Tiers

| Tier      | Color  | Drop Rate | Stat Bonus Range |
|-----------|--------|-----------|------------------|
| Junk      | Gray   | 45%       | 0-5%             |
| Common    | White  | 30%       | 5-15%            |
| Rare      | Blue   | 15%       | 15-30%           |
| Epic      | Purple | 8%        | 30-50%           |
| Legendary | Orange | 2%        | 50-80%           |

### Equipment Slots

- **Weapon** -- Increases ATK (or MAG for Vesper). Determines base damage output.
- **Armor** -- Increases DEF with a secondary HP bonus. Reduces incoming damage.
- **Accessory** -- Provides varied effects such as SPD boosts, crit rate bonuses, status resistance, or elemental bonuses.

### Affixes

Higher-rarity items can roll random bonus properties called affixes. Examples include Scorching (+15% Thermal damage), Quick (+5 SPD), Vampiric (heal 3% of damage dealt), Fortified (+10% max HP), and Lucky (+3% crit rate). These appear as prefixes or suffixes in the item's generated name.

### Shopping

Ticker runs a black market stall in Boxcar Hollow. His stock includes Common through Rare equipment and all consumable items. His inventory refreshes after you complete each dungeon. You can sell any equipment or excess items for Scrap. Junk-tier gear is worth selling immediately -- it provides minimal stat benefit and is better converted to currency.

### Consumable Items

| Item         | Effect                                          | Buy Price  |
|--------------|--------------------------------------------------|------------|
| Health Stim  | Restore 30% max HP to one ally                  | 50 Scrap   |
| Mega Stim    | Restore 70% max HP to one ally                  | 150 Scrap  |
| Charge Cell  | Restore 30% max Charge to one ally              | 60 Scrap   |
| Mega Cell    | Restore 70% max Charge to one ally              | 180 Scrap  |
| Antidote Kit | Cure all status effects on one ally              | 40 Scrap   |
| Revive Coil  | Revive one KO'd ally at 25% HP                  | 200 Scrap  |
| Smoke Bomb   | Guarantee escape from any non-boss battle        | 80 Scrap   |
| Aether Shard | Deal 100 fixed Thermal damage to one enemy       | 100 Scrap  |

## Characters

### Sable -- The Tank

Sable is the party's frontline. A quiet ex-factory enforcer with dry wit and a protective streak, she turned on her former bosses and never looked back. She wields pneumatic gauntlets, pipe wrenches, and sledgehammers.

**Stat Profile:** High HP, high DEF, moderate ATK, low SPD. Sable takes hits so the rest of the party does not have to.

**Skill Trees:**

**Ironwall (Defense)** -- Focused on drawing enemy attention and reducing damage. Starts with Taunt (force enemies to target Sable), progressing through Iron Skin (+20% DEF for 3 turns), Counter Stance (automatically counter-attack when hit), Fortress (party-wide 15% damage reduction for 2 turns), and culminating in Immovable (passive immunity to stun and knockback effects).

**Wrecker (Offense)** -- Turns Sable into a heavy hitter at the cost of survivability. Begins with Power Strike (1.5x ATK single target), then Ground Slam (AoE hitting all enemies at 0.8x ATK), Armor Break (reduce target DEF by 30% for 3 turns), Juggernaut (ATK scales up as Sable's HP drops), and Demolition (devastating 2.5x ATK blow that costs 50% of Sable's current HP).

**Steamworks (Sustain)** -- Self-healing and party support through Sable's built-in steam venting system. Steam Vent heals 20% HP, Pressure Release heals and cures status effects, Overboil heals 35% HP and applies Overclock to Sable, Venting Aura heals the entire party for 5% HP per turn for 3 turns, and Full Pressure allows Sable to automatically revive herself once per battle at 30% HP.

---

### Rook -- The Gunner

Rook is the party's primary damage dealer. Loud, cocky, and fully convinced he is the main character, he never misses an opportunity to remind everyone. He fights with revolvers, rifles, and jury-rigged cannons.

**Stat Profile:** High ATK, high SPD, low HP, low DEF. Rook hits hard and fast but goes down quickly if left unprotected.

**Skill Trees:**

**Marksman (Single-Target)** -- Precision shooting for maximum damage against one enemy. Aimed Shot (1.8x ATK but acts later in turn order), Headshot (passive +15% crit rate), Armor Piercing (ignore 50% of target's DEF), Dead Eye (guaranteed critical hit, usable once per battle), and Killshot (3x ATK, only usable on enemies below 25% HP).

**Gunslinger (Speed/Multi-Hit)** -- Speed buffs and multi-target attacks. Quick Draw (+30% SPD for 2 turns), Double Tap (attack twice at 0.6x each), Ricochet (hit 3 random enemies at 0.5x each), Fan the Hammer (hit all enemies at 0.7x), and Bullet Time (take two full actions in a single turn).

**Saboteur (Debuffs)** -- Weakening enemies through status effects. Blind Shot (inflict Blind), Corrosive Rounds (passive: basic attacks inflict Corrode for 3 turns), Crippling Shot (reduce target SPD by 50% for 2 turns), Expose Weakness (target takes 25% more damage from all sources for 3 turns), and Shutdown (target skips 2 turns, reduced to 1 turn against bosses).

---

### Pip -- The Techie

Pip is the party's support specialist and gadgeteer. Manic, disturbingly cheerful about explosions, and known for talking to her machines, she keeps the team alive and buffed. She fights with a wrench and deployable gadgets.

**Stat Profile:** Moderate stats across the board with high Charge. Pip is versatile -- she can heal, buff, shield, or deal area damage depending on how you build her.

**Skill Trees:**

**Medic (Healing)** -- The party's primary healing branch. Med-Drone heals a single ally for 30% HP, Repair Kit cures all status effects on one ally, Field Surgery heals the entire party for 20% HP, Emergency Protocol passively auto-heals any ally who drops below 20% HP (once per battle), and Resurrection Rig revives a fallen ally at 50% HP.

**Engineer (Buffs/Shields)** -- Strengthening the party through technology. Overclock buffs a single ally's ATK and SPD by 20% for 3 turns, Barrier Projector grants a Shield to one ally absorbing 50 + 10 per level damage, Turret deploys an automated turret that attacks each turn for 3 turns using Pip's MAG, Party Overclock buffs all allies' ATK and SPD by 15% for 2 turns, and Masterwork passively extends the duration of all buffs by 2 turns.

**Demolitionist (Offense)** -- Explosive area damage across all elements. Frag Grenade deals AoE Thermal damage at MAG x 1.2, Shock Mine hits a single target with Voltaic damage with a chance to Stun, Acid Bomb deals AoE Corrosion damage and applies Corrode, Chain Reaction causes an explosion hitting adjacent enemies if Pip's attack kills a target, and Megabomb unleashes AoE damage of all three elements at MAG x 2.5 with a 3-turn cooldown.

---

### Vesper -- The Psion

Vesper is the party's magic damage dealer and elemental specialist. Sardonic and fatalistic, she sees visions she wishes she did not and copes with dark humor about her own impending doom. She channels Aether energy through focus crystals.

**Stat Profile:** Very high MAG, high Charge, very low HP, very low DEF. Vesper deals the most damage in the party but is extremely fragile. Keep her protected.

**Skill Trees:**

**Pyrokinetic (Thermal)** -- Fire and heat-based destruction. Ignite deals single-target Thermal damage at MAG x 1.3, Heatwave deals AoE Thermal damage at MAG x 0.9 and inflicts Burn, Thermal Lance is a powerful single-target hit at MAG x 2.0, Inferno deals AoE Thermal at MAG x 1.5 with Burn, and Supernova unleashes AoE devastation at MAG x 3.0 but Vesper takes 20% of her max HP as recoil damage.

**Stormcaller (Voltaic)** -- Lightning and electrical attacks with crowd control. Spark deals single-target Voltaic damage at MAG x 1.2 with a 20% Stun chance, Arc Lightning hits 2 random enemies, Thunderclap deals AoE Voltaic at MAG x 1.0 with a 30% Stun chance, Chain Lightning hits all enemies with damage scaling up by 50% for each additional target, and Tempest deals AoE Voltaic at MAG x 2.5 with guaranteed Stun at the cost of 50% of Vesper's max Charge.

**Entropy (Corrosion/Utility)** -- Corrosive damage and disruptive psychic abilities. Corrode deals single-target Corrosion damage at MAG x 1.1 and applies the Corrode status, Mind Fray has a chance to make an enemy attack its own allies, Rust Storm deals AoE Corrosion at MAG x 1.0, Aether Drain damages an enemy and restores Charge to Vesper, and Decay Field creates a zone that drains 10% max HP per turn from all enemies while reducing all their stats by 15% for 3 turns.

## Tips and Strategy

- **Save often.** There is no autosave. Use save terminals in town and in dungeons whenever you find them. A single unlucky encounter can end a run.

- **Taunt with Sable to protect Vesper.** Vesper has the highest damage output in the party but the lowest HP and DEF. Use Sable's Taunt from the Ironwall tree to force enemies to attack Sable instead.

- **Exploit elemental weaknesses.** Dealing 1.5x damage through elemental advantage is one of the most efficient ways to win fights. Check enemy types and match your attacks accordingly -- Thermal beats Corrosion, Voltaic beats Thermal, Corrosion beats Voltaic.

- **Pip's heals are essential.** Do not neglect the Medic skill tree. Field Surgery (party-wide 20% heal) and Emergency Protocol (auto-heal at low HP) can be the difference between victory and a game over screen.

- **Grind earlier floors if stuck.** If a boss or a dungeon floor is giving you trouble, go back to earlier floors and fight random encounters for XP and loot. Even a level or two can make a significant difference.

- **Smoke Bombs guarantee escape.** Keep a few Smoke Bombs in your inventory at all times. If a fight goes badly, using a Smoke Bomb lets you flee from any non-boss encounter with 100% success rate.

- **Sell Junk gear for Scrap.** Junk-tier (gray) equipment provides negligible stat bonuses. Sell it to Ticker immediately and use the Scrap to buy consumables or better gear.

- **Upgrade equipment at Ticker's shop between dungeons.** Ticker's stock refreshes after you complete each dungeon. Check back for new Common, Rare, and sometimes better equipment before heading into the next area.

- **Use Defend strategically.** Defending is not just about reducing damage -- it also gives +10 SPD for the next round, letting a slow character act earlier. This can be useful for setting up a heal or a critical buff before the enemy acts.

- **Watch for boss phase transitions.** Both bosses in the game change behavior at HP thresholds. Furnace Rex becomes more dangerous below 50% HP, and Warden Kael shifts elements and eventually acts twice per turn below 30% HP. Plan your resources accordingly and do not burn everything in the first phase.
