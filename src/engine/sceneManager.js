/**
 * Stack-based scene manager. Scenes are pushed/popped.
 * The top scene receives update/render calls.
 * Scenes below can optionally render (for transparent overlays).
 */

export class SceneManager {
  constructor() {
    this._stack = [];
  }

  /** Push a scene onto the stack. Calls scene.onEnter() if defined. */
  push(scene) {
    const current = this.current;
    if (current && current.onPause) current.onPause();
    this._stack.push(scene);
    if (scene.onEnter) scene.onEnter();
  }

  /** Pop the top scene. Calls scene.onExit() if defined. Returns the popped scene. */
  pop() {
    const scene = this._stack.pop();
    if (scene && scene.onExit) scene.onExit();
    const next = this.current;
    if (next && next.onResume) next.onResume();
    return scene;
  }

  /** Replace the top scene without triggering resume on the one below. */
  replace(scene) {
    const old = this._stack.pop();
    if (old && old.onExit) old.onExit();
    this._stack.push(scene);
    if (scene.onEnter) scene.onEnter();
  }

  /** Clear all scenes. */
  clear() {
    while (this._stack.length > 0) {
      this.pop();
    }
  }

  /** The currently active (top) scene. */
  get current() {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
  }

  /** Number of scenes on the stack. */
  get size() {
    return this._stack.length;
  }

  /** Update the top scene. */
  update(dt, input) {
    const scene = this.current;
    if (scene && scene.update) scene.update(dt, input);
  }

  /**
   * Render scenes. Renders from bottom of stack up if scenes have `transparent` flag.
   * @param {Renderer} renderer
   */
  render(renderer) {
    // Find the lowest scene that needs rendering
    let startIdx = this._stack.length - 1;
    for (let i = this._stack.length - 1; i > 0; i--) {
      if (this._stack[i].transparent) {
        startIdx = i - 1;
      } else {
        break;
      }
    }

    for (let i = startIdx; i < this._stack.length; i++) {
      if (this._stack[i].render) this._stack[i].render(renderer);
    }
  }
}
