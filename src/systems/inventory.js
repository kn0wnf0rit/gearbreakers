/**
 * Inventory system: equipment management, consumables, currency, buy/sell.
 */

export class InventorySystem {
  constructor() {
    /** @type {Array} Equipment items */
    this.items = [];
    /** @type {Object} Consumable counts keyed by id */
    this.consumables = {};
    /** @type {number} Currency (scrap) */
    this.scrap = 100;
  }

  /**
   * Add an equipment item to inventory.
   * @param {object} item - Item with at least an id
   */
  addItem(item) {
    this.items.push(item);
  }

  /**
   * Remove an equipment item by its generated id.
   * @param {string} itemId
   * @returns {object|null} The removed item, or null if not found
   */
  removeItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index === -1) return null;
    return this.items.splice(index, 1)[0];
  }

  /**
   * Add consumables (stacking, max 99).
   * @param {string} consumableId
   * @param {number} count
   */
  addConsumable(consumableId, count) {
    const current = this.consumables[consumableId] || 0;
    this.consumables[consumableId] = Math.min(99, current + count);
  }

  /**
   * Remove consumables.
   * @param {string} consumableId
   * @param {number} count
   * @returns {boolean} false if not enough
   */
  removeConsumable(consumableId, count) {
    const current = this.consumables[consumableId] || 0;
    if (current < count) return false;
    this.consumables[consumableId] = current - count;
    if (this.consumables[consumableId] <= 0) {
      delete this.consumables[consumableId];
    }
    return true;
  }

  /**
   * Get the current count of a consumable.
   * @param {string} consumableId
   * @returns {number}
   */
  getConsumableCount(consumableId) {
    return this.consumables[consumableId] || 0;
  }

  /**
   * Add currency.
   * @param {number} amount
   */
  addScrap(amount) {
    this.scrap += amount;
  }

  /**
   * Remove currency.
   * @param {number} amount
   * @returns {boolean} false if not enough
   */
  removeScrap(amount) {
    if (this.scrap < amount) return false;
    this.scrap -= amount;
    return true;
  }

  /**
   * Buy an item: deduct scrap, add item to inventory.
   * @param {object} item - Item to buy
   * @param {number} price - Price in scrap
   * @returns {boolean} false if can't afford
   */
  buyItem(item, price) {
    if (this.scrap < price) return false;
    this.scrap -= price;
    this.addItem(item);
    return true;
  }

  /**
   * Sell an item: remove from inventory, gain scrap equal to sell value.
   * @param {string} itemId - Item id to sell
   * @returns {number|false} Scrap gained, or false if item not found
   */
  sellItem(itemId) {
    const item = this.removeItem(itemId);
    if (!item) return false;
    const value = item.value || 0;
    this.scrap += value;
    return value;
  }

  /**
   * Filter inventory for items equippable by a character in a given slot.
   * @param {string} slot - Equipment slot ('weapon', 'armor', 'accessory')
   * @param {string} characterId - Character ID
   * @returns {Array} Matching items
   */
  getEquipmentForSlot(slot, characterId) {
    return this.items.filter(item =>
      item.slot === slot &&
      (!item.equippableBy || item.equippableBy.length === 0 || item.equippableBy.includes(characterId))
    );
  }

  /**
   * Serialize inventory state for save/load.
   * @returns {object}
   */
  serialize() {
    return {
      items: this.items.map(item => ({ ...item })),
      consumables: { ...this.consumables },
      scrap: this.scrap
    };
  }

  /**
   * Deserialize inventory state.
   * @param {object} data - Serialized data
   * @returns {InventorySystem}
   */
  static deserialize(data) {
    const inv = new InventorySystem();
    inv.items = (data.items || []).map(item => ({ ...item }));
    inv.consumables = { ...(data.consumables || {}) };
    inv.scrap = data.scrap !== undefined ? data.scrap : 100;
    return inv;
  }
}
