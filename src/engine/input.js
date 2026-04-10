/**
 * Keyboard input manager. Tracks key state per frame with press/release detection.
 */

const KEY_MAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  z: 'confirm',
  Enter: 'confirm',
  x: 'cancel',
  Escape: 'cancel',
  c: 'menu',
  Tab: 'menu',
  Shift: 'run'
};

export class InputManager {
  constructor() {
    this._held = new Set();
    this._justPressed = new Set();
    this._justReleased = new Set();
    this._framePressed = new Set();
    this._frameReleased = new Set();
    this._bound = false;
  }

  bind(target = window) {
    if (this._bound) return;
    this._bound = true;

    this._onKeyDown = (e) => {
      const action = KEY_MAP[e.key];
      if (!action) return;
      e.preventDefault();
      if (!this._held.has(action)) {
        this._framePressed.add(action);
      }
      this._held.add(action);
    };

    this._onKeyUp = (e) => {
      const action = KEY_MAP[e.key];
      if (!action) return;
      e.preventDefault();
      this._held.delete(action);
      this._frameReleased.add(action);
    };

    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('keyup', this._onKeyUp);
    this._target = target;
  }

  unbind() {
    if (!this._bound) return;
    this._target.removeEventListener('keydown', this._onKeyDown);
    this._target.removeEventListener('keyup', this._onKeyUp);
    this._bound = false;
  }

  /** Call at the start of each frame to snapshot input state. */
  update() {
    this._justPressed = new Set(this._framePressed);
    this._justReleased = new Set(this._frameReleased);
    this._framePressed.clear();
    this._frameReleased.clear();
  }

  /** True if the action is currently held down. */
  isHeld(action) {
    return this._held.has(action);
  }

  /** True only on the first frame the action was pressed. */
  isPressed(action) {
    return this._justPressed.has(action);
  }

  /** True only on the frame the action was released. */
  isReleased(action) {
    return this._justReleased.has(action);
  }

  /** Reset all state. */
  reset() {
    this._held.clear();
    this._justPressed.clear();
    this._justReleased.clear();
    this._framePressed.clear();
    this._frameReleased.clear();
  }
}
