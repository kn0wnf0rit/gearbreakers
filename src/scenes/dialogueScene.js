/**
 * Dialogue scene: transparent overlay for NPC conversations and story beats.
 * Pushed on top of exploration so the world renders behind the text box.
 */

import { BASE_WIDTH } from '../engine/renderer.js';

export class DialogueScene {
  /**
   * @param {object} config
   * @param {Array} config.dialogueNodes - Array of { speaker, portrait, text }
   * @param {Function} config.onComplete - Called when all nodes are exhausted
   * @param {object} config.renderer - Renderer reference (unused currently, kept for parity)
   */
  constructor({ dialogueNodes, onComplete, renderer, assets }) {
    this.dialogueNodes = dialogueNodes;
    this.onComplete = onComplete;
    this.renderer = renderer;
    this.assets = assets || null;

    this.transparent = true;
    this.currentNode = 0;
    this.displayedText = '';
    this.textSpeed = 1; // characters per frame
    this.isTextComplete = false;
    this._charIndex = 0;
    this._blinkTimer = 0;
  }

  /** Start the first dialogue node. */
  onEnter() {
    this._startNode(0);
  }

  onExit() {}
  onPause() {}
  onResume() {}

  /**
   * @param {number} dt - Delta time (unused for char-per-frame approach)
   * @param {object} input - InputManager instance
   */
  update(dt, input) {
    if (!this.isTextComplete) {
      // Typewriter: advance characters each frame
      const fullText = this.dialogueNodes[this.currentNode].text;
      this._charIndex = Math.min(this._charIndex + this.textSpeed, fullText.length);
      this.displayedText = fullText.substring(0, this._charIndex);

      if (this._charIndex >= fullText.length) {
        this.isTextComplete = true;
      }

      // Confirm pressed while typing: show all text immediately
      if (input.isPressed('confirm')) {
        this.displayedText = fullText;
        this._charIndex = fullText.length;
        this.isTextComplete = true;
      }
    } else {
      // Text fully shown -- blink the indicator
      this._blinkTimer += dt;

      // Confirm pressed: advance or complete
      if (input.isPressed('confirm')) {
        if (this.currentNode < this.dialogueNodes.length - 1) {
          this._startNode(this.currentNode + 1);
        } else {
          if (this.onComplete) this.onComplete();
        }
      }
    }
  }

  /**
   * @param {object} renderer - Renderer instance
   */
  render(renderer) {
    const barY = 168;
    const barH = 56; // 224 - 168
    const barW = BASE_WIDTH;

    // Semi-transparent black bar at bottom
    renderer.drawRect(0, barY, barW, barH, 'rgba(0, 0, 0, 0.85)');
    renderer.drawRectOutline(0, barY, barW, barH, '#555');

    const node = this.dialogueNodes[this.currentNode];

    // Portrait
    const portraitKey = 'portrait_' + node.speaker.toLowerCase();
    const portrait = this.assets && this.assets.get(portraitKey);
    const textX = portrait ? 42 : 6;

    if (portrait) {
      renderer.ctx.drawImage(portrait, 0, 0, 32, 32,
        6 * 3, (barY + 4) * 3, 32 * 3, 32 * 3);
    }

    // Speaker name
    renderer.drawText(node.speaker, textX, barY + 4, { color: '#ffcc00', size: 8 });

    // Dialogue text (typewriter)
    const maxChars = portrait ? 22 : 30;
    const lines = this._wrapText(this.displayedText, maxChars);
    for (let i = 0; i < lines.length; i++) {
      renderer.drawText(lines[i], textX, barY + 16 + i * 10, { color: '#ffffff', size: 8 });
    }

    // Blinking "down" indicator when text is complete
    if (this.isTextComplete) {
      const show = Math.floor(this._blinkTimer * 3) % 2 === 0;
      if (show) {
        renderer.drawText('\u25bc', barW - 14, barY + barH - 14, { color: '#ffffff', size: 8 });
      }
    }
  }

  /**
   * Begin displaying a node.
   * @param {number} index
   * @private
   */
  _startNode(index) {
    this.currentNode = index;
    this.displayedText = '';
    this._charIndex = 0;
    this.isTextComplete = false;
    this._blinkTimer = 0;
  }

  /**
   * Simple word-wrap for the dialogue box.
   * @param {string} text
   * @param {number} maxChars - Max characters per line
   * @returns {string[]}
   * @private
   */
  _wrapText(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      if (current.length + word.length + 1 > maxChars && current.length > 0) {
        lines.push(current);
        current = word;
      } else {
        current = current.length > 0 ? current + ' ' + word : word;
      }
    }
    if (current.length > 0) lines.push(current);
    return lines;
  }
}
