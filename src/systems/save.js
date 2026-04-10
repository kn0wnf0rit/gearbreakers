/**
 * Save system: localStorage-based save/load with multiple slots.
 */

export class SaveSystem {
  static MAX_SLOTS = 3;

  /**
   * Save game state to a slot.
   * @param {number} slot - Slot index (0-based)
   * @param {object} gameState - Full game state to save
   * @param {Array} gameState.party - Array of serialized party members
   * @param {object} gameState.inventory - Serialized inventory
   * @param {object} gameState.gameState - Map, position, flags, chests, bosses
   * @param {number} gameState.playtime - Total playtime in seconds
   */
  static save(slot, gameState) {
    const saveData = {
      party: gameState.party,
      inventory: gameState.inventory,
      gameState: {
        currentMap: gameState.gameState.currentMap,
        playerPosition: gameState.gameState.playerPosition,
        storyFlags: gameState.gameState.storyFlags,
        chestsOpened: gameState.gameState.chestsOpened,
        bossesDefeated: gameState.gameState.bossesDefeated,
      },
      playtime: gameState.playtime,
      version: '1.0',
      timestamp: Date.now(),
    };

    localStorage.setItem(
      `gearbreakers_save_${slot}`,
      JSON.stringify(saveData)
    );
  }

  /**
   * Load game state from a slot.
   * @param {number} slot - Slot index
   * @returns {object|null} Parsed game state, or null if missing/corrupted
   */
  static load(slot) {
    const raw = localStorage.getItem(`gearbreakers_save_${slot}`);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Delete a save slot.
   * @param {number} slot - Slot index
   */
  static deleteSave(slot) {
    localStorage.removeItem(`gearbreakers_save_${slot}`);
  }

  /**
   * Get metadata for all save slots.
   * @returns {Array} Array of slot metadata objects or null per slot
   */
  static getSaveSlots() {
    const slots = [];
    for (let i = 0; i < SaveSystem.MAX_SLOTS; i++) {
      const data = SaveSystem.load(i);
      if (data) {
        const firstChar = data.party && data.party.length > 0 ? data.party[0] : null;
        slots.push({
          exists: true,
          timestamp: data.timestamp,
          playtime: data.playtime,
          level: firstChar ? firstChar.level : 1,
        });
      } else {
        slots.push(null);
      }
    }
    return slots;
  }

  /**
   * Check if a save exists in a slot.
   * @param {number} slot - Slot index
   * @returns {boolean}
   */
  static hasSave(slot) {
    return localStorage.getItem(`gearbreakers_save_${slot}`) !== null;
  }
}
