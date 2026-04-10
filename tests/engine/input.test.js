import { InputManager } from '../../src/engine/input.js';

describe('InputManager', () => {
  let input;
  let mockTarget;

  beforeEach(() => {
    input = new InputManager();
    mockTarget = {
      _listeners: {},
      addEventListener(event, fn) { this._listeners[event] = fn; },
      removeEventListener(event) { delete this._listeners[event]; }
    };
    input.bind(mockTarget);
  });

  afterEach(() => {
    input.unbind();
  });

  function pressKey(key) {
    mockTarget._listeners.keydown({ key, preventDefault: () => {} });
  }

  function releaseKey(key) {
    mockTarget._listeners.keyup({ key, preventDefault: () => {} });
  }

  test('detects key press on first frame', () => {
    pressKey('z');
    input.update();
    expect(input.isPressed('confirm')).toBe(true);
    expect(input.isHeld('confirm')).toBe(true);
  });

  test('isPressed is only true for one frame', () => {
    pressKey('z');
    input.update();
    expect(input.isPressed('confirm')).toBe(true);
    // Next frame without new input
    input.update();
    expect(input.isPressed('confirm')).toBe(false);
    expect(input.isHeld('confirm')).toBe(true);
  });

  test('detects key release', () => {
    pressKey('z');
    input.update();
    releaseKey('z');
    input.update();
    expect(input.isReleased('confirm')).toBe(true);
    expect(input.isHeld('confirm')).toBe(false);
  });

  test('WASD maps correctly', () => {
    pressKey('w');
    input.update();
    expect(input.isPressed('up')).toBe(true);

    pressKey('a');
    input.update();
    expect(input.isHeld('left')).toBe(true);
  });

  test('arrow keys map correctly', () => {
    pressKey('ArrowDown');
    input.update();
    expect(input.isPressed('down')).toBe(true);
  });

  test('ignores unmapped keys', () => {
    pressKey('q');
    input.update();
    expect(input.isPressed('confirm')).toBe(false);
    expect(input.isHeld('confirm')).toBe(false);
  });

  test('reset clears all state', () => {
    pressKey('z');
    input.update();
    input.reset();
    expect(input.isHeld('confirm')).toBe(false);
    expect(input.isPressed('confirm')).toBe(false);
  });

  test('holding key does not re-trigger press', () => {
    pressKey('z');
    input.update();
    expect(input.isPressed('confirm')).toBe(true);
    // Simulate holding (keydown fires again but key is already held)
    pressKey('z');
    input.update();
    expect(input.isPressed('confirm')).toBe(false);
    expect(input.isHeld('confirm')).toBe(true);
  });
});
