# GEARBREAKERS

In a scorched, gear-driven dystopia where megacorp oligarchies strip-mine the last living lands, four outcasts band together to crack open the iron fist of the Cogwright Collective. Gearbreakers is a 2D turn-based RPG built entirely for the browser, blending classic JRPG combat with Borderlands-style loot and irreverent humor. Explore a steampunk wasteland, fight through procedurally populated dungeons, collect randomized gear across five rarity tiers, and level up four distinct characters -- each with their own three-branch skill tree.

## Quick Start

**Prerequisites:**
- Node.js (v18 or later)
- npm

**Install and run:**

```bash
git clone <repository-url>
cd GAme
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## How to Play

| Action           | Keys                  |
|------------------|-----------------------|
| Move             | Arrow keys / WASD     |
| Confirm/Interact | Z / Enter             |
| Cancel/Back      | X / Escape            |
| Pause Menu       | C / Tab               |
| Run              | Shift (hold)          |

See [HELP.md](HELP.md) for the full player guide including combat mechanics, skill trees, and loot details.

## Tech Stack

- Vanilla JavaScript (ES modules, no framework)
- HTML5 Canvas renderer at 256x224 base resolution, 3x scaled
- Programmatic pixel art -- all sprites generated at runtime via the Canvas API
- Jest for testing (247 tests across 15 suites)

## Project Structure

```
src/
  main.js                   Entry point, game loop initialization
  data/
    characters.js           Party member definitions and base stats
    dialogue.js             All NPC and story dialogue scripts
    enemies.js              Enemy stat blocks and encounter pools
    items.js                Consumable and equipment item data
    maps.js                 Tile-based map layouts
    skills.js               Skill tree definitions for all characters
  engine/
    assetLoader.js          Loads and caches generated sprite assets
    input.js                Keyboard input manager with per-frame press detection
    renderer.js             Canvas rendering pipeline (256x224 base, 3x scale)
    sceneManager.js         Scene stack manager (push/pop for overlays)
    utils.js                Seeded RNG, math helpers, general utilities
  entities/
    Enemy.js                Enemy combat entity
    NPC.js                  Non-player character (town interactions)
    PartyMember.js          Party member with stats, equipment, skills
    Player.js               Overworld player entity (movement, collision)
  scenes/
    battleScene.js          Turn-based combat UI and logic
    dialogueScene.js        Dialogue overlay with text progression
    explorationScene.js     Overworld movement and map rendering
    menuScene.js            Pause menu (items, equipment, skills, save)
    titleScene.js           Title screen and new game / load game flow
  sprites/
    spriteGenerator.js      Programmatic pixel art generator
    spriteManifest.js       Sprite definitions and color palettes
  systems/
    combat.js               Damage formulas, turn order, status effects
    encounter.js            Random encounter triggering and formation
    inventory.js            Item storage, stacking, use logic
    loot.js                 Randomized loot generation with rarity and affixes
    progression.js          XP, leveling, skill point allocation
    save.js                 localStorage save/load with 3 slots
tests/                      Jest test suites mirroring src/ structure
css/styles.css              Minimal page styling for the canvas host
index.html                  Single-page HTML shell
```

## Architecture

Key design decisions:

- **Scene stack manager** -- Scenes are managed via a push/pop stack. Exploration can push a battle scene, which can push a dialogue overlay, and each pops back cleanly when complete.
- **Data-driven design** -- All characters, enemies, skills, items, maps, and dialogue are defined as plain JavaScript objects in `src/data/`. Game logic reads from these definitions rather than hard-coding values.
- **Seeded RNG** -- Combat rolls use a seeded random number generator for reproducible results during testing and debugging.
- **Borderlands-style loot** -- Equipment drops use a five-tier rarity system (Junk, Common, Rare, Epic, Legendary) with procedurally generated names, stat bonuses, and random affixes.
- **Programmatic sprites** -- All pixel art is generated at runtime using the Canvas API. No external image assets are required.
- **localStorage save system** -- Three save slots stored in the browser's localStorage, accessible from save terminals in the game world.

## Running Tests

```bash
npm test
```

Runs the full Jest test suite (247 tests across 15 suites) covering data integrity, engine systems, entity behavior, and game systems including combat, loot generation, inventory, progression, encounters, and save/load.

Additional test commands:

```bash
npm run test:watch      # Re-run tests on file changes
npm run test:coverage   # Generate coverage report
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run the test suite (`npm test`) and ensure all 247 tests pass
5. Follow the existing code style (ES modules, no semicolons in data files, JSDoc comments on public methods)
6. Submit a pull request with a clear description of your changes

## License

MIT
