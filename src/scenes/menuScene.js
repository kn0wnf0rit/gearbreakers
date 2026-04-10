/**
 * Pause menu scene: Items, Equip, Skills, Status, Save tabs.
 * Rendered as a transparent overlay on top of the exploration scene.
 */

import { BASE_WIDTH, BASE_HEIGHT } from '../engine/renderer.js';
import { CONSUMABLES } from '../data/items.js';
import { CHARACTERS } from '../data/characters.js';
import { SKILL_TREES } from '../data/skills.js';
import { SaveSystem } from '../systems/save.js';

export class MenuScene {
  /**
   * @param {object} config
   * @param {Array} config.party - Array of PartyMember instances
   * @param {object} config.inventory - InventorySystem instance
   * @param {object} config.progressionSystem - ProgressionSystem instance
   * @param {Function} config.onClose - Called when the menu is dismissed
   */
  constructor({ party, inventory, progressionSystem, onClose }) {
    this.party = party;
    this.inventory = inventory;
    this.progressionSystem = progressionSystem;
    this.onClose = onClose;

    this.transparent = true;
    this.tabs = ['items', 'equip', 'skills', 'status', 'save'];
    this.currentTab = 'items';
    this._tabIndex = 0;

    // Per-tab selection state
    this.selectedIndex = 0;
    this.selectedCharacter = 0;

    // Sub-states
    this._selectingTarget = false;  // item use: picking target
    this._targetIndex = 0;
    this._equipSlotIndex = 0;      // equip: which slot
    this._equipListIndex = 0;      // equip: item in list
    this._inEquipList = false;     // equip: browsing gear list
    this._skillTreeIndex = 0;      // skills: which tree
    this._skillNodeIndex = 0;      // skills: which node
    this._inSkillTree = false;     // skills: browsing nodes
    this._saveMessage = '';
    this._saveMessageTimer = 0;
  }

  onEnter() {}
  onExit() {}
  onPause() {}
  onResume() {}

  /**
   * @param {number} dt
   * @param {object} input - InputManager
   */
  update(dt, input) {
    if (this._saveMessageTimer > 0) {
      this._saveMessageTimer -= dt;
    }

    // Cancel closes menu (unless in a sub-selection)
    if (input.isPressed('cancel')) {
      if (this._selectingTarget) {
        this._selectingTarget = false;
        return;
      }
      if (this._inEquipList) {
        this._inEquipList = false;
        return;
      }
      if (this._inSkillTree) {
        this._inSkillTree = false;
        return;
      }
      if (this.onClose) this.onClose();
      return;
    }

    // Tab switching with left/right (only at top level)
    if (!this._selectingTarget && !this._inEquipList && !this._inSkillTree) {
      if (input.isPressed('left')) {
        this._tabIndex = (this._tabIndex - 1 + this.tabs.length) % this.tabs.length;
        this.currentTab = this.tabs[this._tabIndex];
        this._resetTabState();
      }
      if (input.isPressed('right')) {
        this._tabIndex = (this._tabIndex + 1) % this.tabs.length;
        this.currentTab = this.tabs[this._tabIndex];
        this._resetTabState();
      }
    }

    // Dispatch to tab-specific logic
    switch (this.currentTab) {
      case 'items': this._updateItems(input); break;
      case 'equip': this._updateEquip(input); break;
      case 'skills': this._updateSkills(input); break;
      case 'status': this._updateStatus(input); break;
      case 'save': this._updateSave(input); break;
    }
  }

  /**
   * @param {object} renderer - Renderer
   */
  render(renderer) {
    // Dark overlay
    renderer.drawRect(0, 0, BASE_WIDTH, BASE_HEIGHT, 'rgba(0, 0, 0, 0.80)');

    // Tab bar
    this._renderTabBar(renderer);

    // Content area
    const contentY = 18;
    switch (this.currentTab) {
      case 'items': this._renderItems(renderer, contentY); break;
      case 'equip': this._renderEquip(renderer, contentY); break;
      case 'skills': this._renderSkills(renderer, contentY); break;
      case 'status': this._renderStatus(renderer, contentY); break;
      case 'save': this._renderSave(renderer, contentY); break;
    }
  }

  // ─── Tab Bar ───

  _renderTabBar(renderer) {
    const tabW = Math.floor(BASE_WIDTH / this.tabs.length);
    for (let i = 0; i < this.tabs.length; i++) {
      const x = i * tabW;
      const isActive = i === this._tabIndex;
      renderer.drawRect(x, 0, tabW, 14, isActive ? '#444' : '#222');
      renderer.drawRectOutline(x, 0, tabW, 14, '#666');
      renderer.drawText(
        this.tabs[i].toUpperCase(),
        x + tabW / 2, 3,
        { color: isActive ? '#ffcc00' : '#888', size: 7, align: 'center' }
      );
    }
  }

  _resetTabState() {
    this.selectedIndex = 0;
    this.selectedCharacter = 0;
    this._selectingTarget = false;
    this._targetIndex = 0;
    this._equipSlotIndex = 0;
    this._equipListIndex = 0;
    this._inEquipList = false;
    this._skillTreeIndex = 0;
    this._skillNodeIndex = 0;
    this._inSkillTree = false;
  }

  // ─── Items Tab ───

  _getConsumableList() {
    return Object.entries(this.inventory.consumables)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => ({ id, count, data: CONSUMABLES[id] }))
      .filter(entry => entry.data);
  }

  _updateItems(input) {
    const list = this._getConsumableList();

    if (this._selectingTarget) {
      if (input.isPressed('up')) this._targetIndex = Math.max(0, this._targetIndex - 1);
      if (input.isPressed('down')) this._targetIndex = Math.min(this.party.length - 1, this._targetIndex + 1);
      if (input.isPressed('confirm') && list.length > 0) {
        const item = list[this.selectedIndex];
        if (item) {
          this.inventory.removeConsumable(item.id, 1);
          // Apply effect would happen in a real system; here we mark it used
        }
        this._selectingTarget = false;
      }
      return;
    }

    if (input.isPressed('up')) this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    if (input.isPressed('down')) this.selectedIndex = Math.min(Math.max(0, list.length - 1), this.selectedIndex + 1);
    if (input.isPressed('confirm') && list.length > 0) {
      this._selectingTarget = true;
      this._targetIndex = 0;
    }
  }

  _renderItems(renderer, y) {
    const list = this._getConsumableList();

    if (list.length === 0) {
      renderer.drawText('No items.', 10, y + 10, { color: '#888' });
      return;
    }

    const maxVisible = 10;
    const startIdx = Math.max(0, this.selectedIndex - maxVisible + 1);
    for (let i = startIdx; i < Math.min(list.length, startIdx + maxVisible); i++) {
      const entry = list[i];
      const rowY = y + (i - startIdx) * 12;
      const cursor = i === this.selectedIndex ? '>' : ' ';
      const color = i === this.selectedIndex ? '#fff' : '#aaa';
      renderer.drawText(`${cursor} ${entry.data.name}`, 8, rowY, { color });
      renderer.drawText(`x${entry.count}`, BASE_WIDTH - 40, rowY, { color });
    }

    // Description of selected item
    if (list[this.selectedIndex]) {
      renderer.drawText(
        list[this.selectedIndex].data.description,
        8, y + maxVisible * 12 + 6,
        { color: '#ccc', size: 7 }
      );
    }

    // Target selection overlay
    if (this._selectingTarget) {
      const boxX = BASE_WIDTH / 2 - 50;
      const boxY = y + 30;
      renderer.drawRect(boxX, boxY, 100, this.party.length * 14 + 8, 'rgba(0,0,0,0.9)');
      renderer.drawRectOutline(boxX, boxY, 100, this.party.length * 14 + 8, '#ffcc00');
      renderer.drawText('Use on:', boxX + 4, boxY + 2, { color: '#ffcc00', size: 7 });
      for (let i = 0; i < this.party.length; i++) {
        const c = i === this._targetIndex ? '>' : ' ';
        const col = i === this._targetIndex ? '#fff' : '#aaa';
        renderer.drawText(
          `${c} ${this.party[i].name}`,
          boxX + 8, boxY + 14 + i * 14,
          { color: col }
        );
      }
    }
  }

  // ─── Equip Tab ───

  _updateEquip(input) {
    const slots = ['weapon', 'armor', 'accessory'];

    if (this._inEquipList) {
      const member = this.party[this.selectedCharacter];
      const slot = slots[this._equipSlotIndex];
      const available = this.inventory.getEquipmentForSlot(slot, member.id);
      if (input.isPressed('up')) this._equipListIndex = Math.max(0, this._equipListIndex - 1);
      if (input.isPressed('down')) this._equipListIndex = Math.min(Math.max(0, available.length - 1), this._equipListIndex + 1);
      if (input.isPressed('confirm') && available.length > 0) {
        const newItem = available[this._equipListIndex];
        const oldItem = member.equipItem(newItem);
        this.inventory.removeItem(newItem.id);
        if (oldItem) this.inventory.addItem(oldItem);
        this._inEquipList = false;
      }
      return;
    }

    // Character + slot selection combined: up/down for slots, left/right handled by tab
    if (input.isPressed('up')) {
      if (this._equipSlotIndex > 0) {
        this._equipSlotIndex--;
      } else {
        this.selectedCharacter = Math.max(0, this.selectedCharacter - 1);
        this._equipSlotIndex = 0;
      }
    }
    if (input.isPressed('down')) {
      if (this._equipSlotIndex < slots.length - 1) {
        this._equipSlotIndex++;
      } else {
        if (this.selectedCharacter < this.party.length - 1) {
          this.selectedCharacter++;
          this._equipSlotIndex = 0;
        }
      }
    }
    if (input.isPressed('confirm')) {
      this._inEquipList = true;
      this._equipListIndex = 0;
    }
  }

  _renderEquip(renderer, y) {
    const slots = ['weapon', 'armor', 'accessory'];
    const member = this.party[this.selectedCharacter];

    // Character selector
    for (let i = 0; i < this.party.length; i++) {
      const col = i === this.selectedCharacter ? '#ffcc00' : '#666';
      renderer.drawText(this.party[i].name, 8 + i * 50, y, { color: col, size: 7 });
    }

    // Equipment slots
    const slotY = y + 14;
    for (let i = 0; i < slots.length; i++) {
      const cursor = (!this._inEquipList && i === this._equipSlotIndex) ? '>' : ' ';
      const color = (!this._inEquipList && i === this._equipSlotIndex) ? '#fff' : '#aaa';
      const equipped = member.equipment[slots[i]];
      const name = equipped ? equipped.name : '(empty)';
      renderer.drawText(`${cursor} ${slots[i].toUpperCase()}: ${name}`, 8, slotY + i * 12, { color });
    }

    // Equipment list for selected slot
    if (this._inEquipList) {
      const slot = slots[this._equipSlotIndex];
      const available = this.inventory.getEquipmentForSlot(slot, member.id);
      const listX = BASE_WIDTH / 2;
      const listY = slotY;
      renderer.drawRect(listX, listY - 2, BASE_WIDTH / 2 - 4, Math.max(available.length, 1) * 12 + 6, 'rgba(0,0,0,0.9)');
      renderer.drawRectOutline(listX, listY - 2, BASE_WIDTH / 2 - 4, Math.max(available.length, 1) * 12 + 6, '#ffcc00');

      if (available.length === 0) {
        renderer.drawText('No items.', listX + 4, listY, { color: '#888', size: 7 });
      } else {
        for (let i = 0; i < available.length; i++) {
          const c = i === this._equipListIndex ? '>' : ' ';
          const col = i === this._equipListIndex ? '#fff' : '#aaa';
          renderer.drawText(`${c} ${available[i].name}`, listX + 4, listY + i * 12, { color: col, size: 7 });
        }
      }
    }
  }

  // ─── Skills Tab ───

  _updateSkills(input) {
    const member = this.party[this.selectedCharacter];
    const treeIds = member.skillTreeIds || [];

    if (this._inSkillTree) {
      const treeId = treeIds[this._skillTreeIndex];
      const treeState = this.progressionSystem.getSkillTreeState(member, treeId);
      if (input.isPressed('up')) this._skillNodeIndex = Math.max(0, this._skillNodeIndex - 1);
      if (input.isPressed('down')) this._skillNodeIndex = Math.min(Math.max(0, treeState.length - 1), this._skillNodeIndex + 1);
      if (input.isPressed('confirm') && treeState[this._skillNodeIndex]) {
        const node = treeState[this._skillNodeIndex];
        if (node.state === 'available') {
          this.progressionSystem.unlockSkill(member, node.id);
        }
      }
      return;
    }

    // Character selection + tree selection
    if (input.isPressed('up')) {
      if (this._skillTreeIndex > 0) {
        this._skillTreeIndex--;
      } else {
        this.selectedCharacter = Math.max(0, this.selectedCharacter - 1);
        this._skillTreeIndex = 0;
      }
    }
    if (input.isPressed('down')) {
      if (this._skillTreeIndex < treeIds.length - 1) {
        this._skillTreeIndex++;
      } else {
        if (this.selectedCharacter < this.party.length - 1) {
          this.selectedCharacter++;
          this._skillTreeIndex = 0;
        }
      }
    }
    if (input.isPressed('confirm')) {
      this._inSkillTree = true;
      this._skillNodeIndex = 0;
    }
  }

  _renderSkills(renderer, y) {
    const member = this.party[this.selectedCharacter];
    const treeIds = member.skillTreeIds || [];

    // Character selector
    for (let i = 0; i < this.party.length; i++) {
      const col = i === this.selectedCharacter ? '#ffcc00' : '#666';
      renderer.drawText(this.party[i].name, 8 + i * 50, y, { color: col, size: 7 });
    }

    renderer.drawText(`SP: ${member.skillPoints || 0}`, BASE_WIDTH - 50, y, { color: '#0f0', size: 7 });

    // Skill trees list
    const treeY = y + 14;
    for (let i = 0; i < treeIds.length; i++) {
      const tree = SKILL_TREES[treeIds[i]];
      const cursor = (!this._inSkillTree && i === this._skillTreeIndex) ? '>' : ' ';
      const color = (!this._inSkillTree && i === this._skillTreeIndex) ? '#fff' : '#aaa';
      renderer.drawText(`${cursor} ${tree.name}`, 8, treeY + i * 12, { color });
    }

    // Expanded tree nodes
    if (this._inSkillTree && treeIds[this._skillTreeIndex]) {
      const treeId = treeIds[this._skillTreeIndex];
      const treeState = this.progressionSystem.getSkillTreeState(member, treeId);
      const nodeX = BASE_WIDTH / 2 - 20;
      const nodeY = treeY;

      renderer.drawRect(nodeX - 2, nodeY - 2, BASE_WIDTH / 2 + 16, treeState.length * 12 + 6, 'rgba(0,0,0,0.9)');
      renderer.drawRectOutline(nodeX - 2, nodeY - 2, BASE_WIDTH / 2 + 16, treeState.length * 12 + 6, '#ffcc00');

      for (let i = 0; i < treeState.length; i++) {
        const node = treeState[i];
        const cursor = i === this._skillNodeIndex ? '>' : ' ';
        let color;
        switch (node.state) {
          case 'unlocked': color = '#0f0'; break;
          case 'available': color = '#ffcc00'; break;
          default: color = '#666'; break;
        }
        renderer.drawText(`${cursor} ${node.name}`, nodeX + 2, nodeY + i * 12, { color, size: 7 });
      }

      // Description of selected node
      if (treeState[this._skillNodeIndex]) {
        renderer.drawText(
          treeState[this._skillNodeIndex].description,
          8, y + 14 + treeIds.length * 12 + 8,
          { color: '#ccc', size: 7 }
        );
      }
    }
  }

  // ─── Status Tab ───

  _updateStatus(input) {
    if (input.isPressed('up')) this.selectedCharacter = Math.max(0, this.selectedCharacter - 1);
    if (input.isPressed('down')) this.selectedCharacter = Math.min(this.party.length - 1, this.selectedCharacter + 1);
  }

  _renderStatus(renderer, y) {
    // Character selector
    for (let i = 0; i < this.party.length; i++) {
      const col = i === this.selectedCharacter ? '#ffcc00' : '#666';
      renderer.drawText(this.party[i].name, 8 + i * 50, y, { color: col, size: 7 });
    }

    const member = this.party[this.selectedCharacter];
    const sx = 8;
    let sy = y + 16;

    renderer.drawText(`${member.name}  Lv.${member.level}  ${member.role}`, sx, sy, { color: '#fff' });
    sy += 12;

    renderer.drawText(`HP`, sx, sy, { color: '#aaa', size: 7 });
    renderer.drawBar(sx + 20, sy, 80, 6, member.currentHP, member.maxHP, '#0a0');
    renderer.drawText(`${member.currentHP}/${member.maxHP}`, sx + 104, sy, { color: '#aaa', size: 7 });
    sy += 10;

    renderer.drawText(`CP`, sx, sy, { color: '#aaa', size: 7 });
    renderer.drawBar(sx + 20, sy, 80, 6, member.currentCharge, member.maxCharge, '#08f');
    renderer.drawText(`${member.currentCharge}/${member.maxCharge}`, sx + 104, sy, { color: '#aaa', size: 7 });
    sy += 10;

    renderer.drawText(`XP: ${member.xp}`, sx, sy, { color: '#aaa', size: 7 });
    renderer.drawText(`SP: ${member.skillPoints || 0}`, sx + 80, sy, { color: '#aaa', size: 7 });
    sy += 14;

    const stats = ['ATK', 'DEF', 'MAG', 'SPD'];
    for (const stat of stats) {
      const base = member.stats[stat];
      const effective = member.getEffectiveStat(stat);
      const bonus = effective - base;
      const bonusStr = bonus > 0 ? ` (+${bonus})` : bonus < 0 ? ` (${bonus})` : '';
      const color = bonus > 0 ? '#0f0' : bonus < 0 ? '#f44' : '#aaa';
      renderer.drawText(`${stat}: ${effective}${bonusStr}`, sx, sy, { color, size: 7 });
      sy += 10;
    }

    // Equipment
    sy += 4;
    renderer.drawText('Equipment:', sx, sy, { color: '#ffcc00', size: 7 });
    sy += 10;
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const item = member.equipment[slot];
      renderer.drawText(
        `${slot}: ${item ? item.name : '(empty)'}`,
        sx + 4, sy,
        { color: '#aaa', size: 7 }
      );
      sy += 10;
    }
  }

  // ─── Save Tab ───

  _updateSave(input) {
    if (input.isPressed('up')) this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    if (input.isPressed('down')) this.selectedIndex = Math.min(SaveSystem.MAX_SLOTS - 1, this.selectedIndex + 1);
    if (input.isPressed('confirm')) {
      const gameState = {
        party: this.party.map(m => m.serialize()),
        inventory: this.inventory.serialize(),
        gameState: {
          currentMap: 'hub', // will be set by caller in a real scenario
          playerPosition: { x: 0, y: 0 },
          storyFlags: {},
          chestsOpened: [],
          bossesDefeated: [],
        },
        playtime: 0,
      };
      SaveSystem.save(this.selectedIndex, gameState);
      this._saveMessage = 'Saved!';
      this._saveMessageTimer = 2;
    }
  }

  _renderSave(renderer, y) {
    renderer.drawText('Save Game', 8, y, { color: '#ffcc00' });

    const slots = SaveSystem.getSaveSlots();
    for (let i = 0; i < SaveSystem.MAX_SLOTS; i++) {
      const rowY = y + 16 + i * 30;
      const cursor = i === this.selectedIndex ? '>' : ' ';
      const color = i === this.selectedIndex ? '#fff' : '#aaa';

      renderer.drawRectOutline(6, rowY - 2, BASE_WIDTH - 12, 26, i === this.selectedIndex ? '#ffcc00' : '#444');

      if (slots[i]) {
        const date = new Date(slots[i].timestamp);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        const minutes = Math.floor(slots[i].playtime / 60);
        const seconds = slots[i].playtime % 60;
        const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
        renderer.drawText(`${cursor} Slot ${i + 1} - Lv.${slots[i].level}`, 10, rowY, { color });
        renderer.drawText(`${dateStr}  ${timeStr}`, 10, rowY + 11, { color: '#888', size: 7 });
      } else {
        renderer.drawText(`${cursor} Slot ${i + 1} - Empty`, 10, rowY, { color });
      }
    }

    if (this._saveMessageTimer > 0) {
      renderer.drawText(this._saveMessage, BASE_WIDTH / 2, y + 16 + SaveSystem.MAX_SLOTS * 30 + 4, {
        color: '#0f0', align: 'center'
      });
    }
  }
}
