/**
 * Title screen scene: game logo, subtitle, and New Game / Continue menu.
 */

import { BASE_WIDTH, BASE_HEIGHT } from '../engine/renderer.js';
import { SaveSystem } from '../systems/save.js';

export class TitleScene {
  /**
   * @param {object} config
   * @param {object} config.sceneManager - SceneManager instance
   * @param {Function} config.onNewGame - Called when "New Game" is selected
   * @param {Function} config.onContinue - Called when "Continue" is selected (with saves available)
   */
  constructor({ sceneManager, assets, onNewGame, onContinue }) {
    this.sceneManager = sceneManager;
    this.assets = assets || null;
    this.onNewGame = onNewGame;
    this.onContinue = onContinue;

    this.menuOptions = ['New Game', 'Continue'];
    this.selectedIndex = 0;

    this._hasSaves = this._checkForSaves();
    this._blinkTimer = 0;
  }

  onEnter() {
    this._hasSaves = this._checkForSaves();
  }

  onExit() {}
  onPause() {}

  onResume() {
    this._hasSaves = this._checkForSaves();
  }

  /**
   * @param {number} dt
   * @param {object} input - InputManager
   */
  update(dt, input) {
    this._blinkTimer += dt;

    if (input.isPressed('up')) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    }
    if (input.isPressed('down')) {
      this.selectedIndex = Math.min(this.menuOptions.length - 1, this.selectedIndex + 1);
    }

    if (input.isPressed('confirm')) {
      if (this.selectedIndex === 0) {
        // New Game
        if (this.onNewGame) this.onNewGame();
      } else if (this.selectedIndex === 1 && this._hasSaves) {
        // Continue
        if (this.onContinue) this.onContinue();
      }
    }
  }

  /**
   * @param {object} renderer - Renderer
   */
  render(renderer) {
    renderer.clear('#0a0a12');

    // Title
    renderer.drawText('GEARBREAKERS', BASE_WIDTH / 2, 40, {
      color: '#ffcc00', size: 16, align: 'center'
    });

    // Subtitle
    renderer.drawText('A world of rust and ruin', BASE_WIDTH / 2, 70, {
      color: '#888', size: 8, align: 'center'
    });

    // Menu options
    const menuY = BASE_HEIGHT / 2 + 10;
    for (let i = 0; i < this.menuOptions.length; i++) {
      const isSelected = i === this.selectedIndex;
      const isContinue = i === 1;
      const disabled = isContinue && !this._hasSaves;

      let color;
      if (disabled) {
        color = '#444';
      } else if (isSelected) {
        color = '#fff';
      } else {
        color = '#aaa';
      }

      const cursor = isSelected && !disabled ? '> ' : '  ';
      renderer.drawText(
        `${cursor}${this.menuOptions[i]}`,
        BASE_WIDTH / 2, menuY + i * 18,
        { color, size: 10, align: 'center' }
      );
    }

    // Blinking prompt at bottom
    const show = Math.floor(this._blinkTimer * 2) % 2 === 0;
    if (show) {
      renderer.drawText('Press Z or Enter', BASE_WIDTH / 2, BASE_HEIGHT - 24, {
        color: '#555', size: 7, align: 'center'
      });
    }
  }

  /**
   * @returns {boolean} Whether any save slot has data
   * @private
   */
  _checkForSaves() {
    for (let i = 0; i < SaveSystem.MAX_SLOTS; i++) {
      if (SaveSystem.hasSave(i)) return true;
    }
    return false;
  }
}
