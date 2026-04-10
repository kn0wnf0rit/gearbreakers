/**
 * Tests for the SaveSystem.
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { SaveSystem } from '../../src/systems/save.js';

// ─── Helpers ───

function makeGameState(overrides = {}) {
  return {
    party: [
      { id: 'sable', name: 'Sable', level: 5, xp: 850 },
      { id: 'rook', name: 'Rook', level: 4, xp: 500 },
    ],
    inventory: { items: [], consumables: { health_stim: 3 }, scrap: 200 },
    gameState: {
      currentMap: 'hub',
      playerPosition: { x: 10, y: 20 },
      storyFlags: { grizzle_intro: true },
      chestsOpened: ['chest_1'],
      bossesDefeated: ['furnace_rex'],
    },
    playtime: 3600,
    ...overrides,
  };
}

// ─── Tests ───

beforeEach(() => {
  localStorage.clear();
});

describe('SaveSystem', () => {
  test('MAX_SLOTS is 3', () => {
    expect(SaveSystem.MAX_SLOTS).toBe(3);
  });

  test('save writes to localStorage with correct key', () => {
    const state = makeGameState();
    SaveSystem.save(0, state);

    const raw = localStorage.getItem('gearbreakers_save_0');
    expect(raw).not.toBeNull();
    expect(typeof raw).toBe('string');
  });

  test('save stores version and timestamp', () => {
    const state = makeGameState();
    SaveSystem.save(1, state);

    const raw = localStorage.getItem('gearbreakers_save_1');
    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe('1.0');
    expect(typeof parsed.timestamp).toBe('number');
  });

  test('load reads and parses correctly', () => {
    const state = makeGameState();
    SaveSystem.save(0, state);

    const loaded = SaveSystem.load(0);
    expect(loaded).not.toBeNull();
    expect(loaded.party).toHaveLength(2);
    expect(loaded.party[0].id).toBe('sable');
    expect(loaded.inventory.scrap).toBe(200);
    expect(loaded.gameState.currentMap).toBe('hub');
    expect(loaded.playtime).toBe(3600);
    expect(loaded.version).toBe('1.0');
  });

  test('load returns null for missing slot', () => {
    const loaded = SaveSystem.load(2);
    expect(loaded).toBeNull();
  });

  test('deleteSave removes from localStorage', () => {
    const state = makeGameState();
    SaveSystem.save(0, state);
    expect(SaveSystem.hasSave(0)).toBe(true);

    SaveSystem.deleteSave(0);
    expect(localStorage.getItem('gearbreakers_save_0')).toBeNull();
    expect(SaveSystem.hasSave(0)).toBe(false);
  });

  test('getSaveSlots returns correct metadata', () => {
    SaveSystem.save(0, makeGameState());
    SaveSystem.save(2, makeGameState({ party: [{ id: 'pip', name: 'Pip', level: 7 }], playtime: 7200 }));

    const slots = SaveSystem.getSaveSlots();
    expect(slots).toHaveLength(3);

    // Slot 0: exists
    expect(slots[0]).not.toBeNull();
    expect(slots[0].exists).toBe(true);
    expect(slots[0].level).toBe(5);
    expect(slots[0].playtime).toBe(3600);
    expect(typeof slots[0].timestamp).toBe('number');

    // Slot 1: empty
    expect(slots[1]).toBeNull();

    // Slot 2: exists
    expect(slots[2]).not.toBeNull();
    expect(slots[2].exists).toBe(true);
    expect(slots[2].level).toBe(7);
    expect(slots[2].playtime).toBe(7200);
  });

  test('hasSave returns correct boolean', () => {
    expect(SaveSystem.hasSave(0)).toBe(false);

    SaveSystem.save(0, makeGameState());
    expect(SaveSystem.hasSave(0)).toBe(true);

    expect(SaveSystem.hasSave(1)).toBe(false);
  });

  test('handles corrupted data gracefully', () => {
    localStorage.setItem('gearbreakers_save_0', 'not valid json {{{');
    const loaded = SaveSystem.load(0);
    expect(loaded).toBeNull();
  });

  test('getSaveSlots handles corrupted slot gracefully', () => {
    localStorage.setItem('gearbreakers_save_1', '!!!corrupted!!!');
    const slots = SaveSystem.getSaveSlots();
    expect(slots[1]).toBeNull();
  });
});
