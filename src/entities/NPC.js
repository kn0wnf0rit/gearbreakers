/**
 * NPC entity for the overworld. Stationary characters the player can interact with.
 */

const OPPOSITE_DIRECTION = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export class NPC {
  /**
   * @param {object} options
   * @param {string} options.id
   * @param {string} options.name
   * @param {number} options.gridX
   * @param {number} options.gridY
   * @param {string} options.spriteId
   * @param {string} options.dialogueId
   */
  constructor({ id, name, gridX, gridY, spriteId, dialogueId }) {
    this.id = id;
    this.name = name;
    this.gridX = gridX;
    this.gridY = gridY;
    this.spriteId = spriteId;
    this.dialogueId = dialogueId;
    this.facing = 'down';
  }

  /**
   * Check if the player is on an adjacent tile and facing toward this NPC.
   * @param {number} playerGridX
   * @param {number} playerGridY
   * @returns {boolean}
   */
  isAdjacentTo(playerGridX, playerGridY) {
    const dx = this.gridX - playerGridX;
    const dy = this.gridY - playerGridY;

    // Must be exactly one tile away in a cardinal direction
    if (Math.abs(dx) + Math.abs(dy) !== 1) return false;

    return true;
  }

  /**
   * Turn to face toward a given grid position.
   * @param {number} gridX
   * @param {number} gridY
   */
  faceToward(gridX, gridY) {
    const dx = gridX - this.gridX;
    const dy = gridY - this.gridY;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'down' : 'up';
    }
  }

  /**
   * Get interaction data for dialogue or event systems.
   * @returns {{ type: string, id: string, name: string, dialogueId: string }}
   */
  getInteractionData() {
    return {
      type: 'npc',
      id: this.id,
      name: this.name,
      dialogueId: this.dialogueId,
    };
  }
}
