/**
 * Random encounter system for dungeon exploration.
 * Tracks steps and triggers encounters based on a configurable threshold.
 */

export class EncounterSystem {
  /**
   * @param {object} options
   * @param {Array<{ enemies: string[], weight: number }>} options.encounterTable
   * @param {number} [options.minSteps=15]
   * @param {number} [options.maxSteps=25]
   * @param {import('../engine/utils.js').SeededRNG} options.rng
   */
  constructor({ encounterTable, minSteps = 15, maxSteps = 25, rng }) {
    this.encounterTable = encounterTable;
    this.minSteps = minSteps;
    this.maxSteps = maxSteps;
    this.rng = rng;
    this.stepCount = 0;
    this.threshold = this._rollThreshold();
  }

  /**
   * Roll a new step threshold between minSteps and maxSteps.
   * @returns {number}
   */
  _rollThreshold() {
    return this.rng.randInt(this.minSteps, this.maxSteps);
  }

  /**
   * Increment step counter. Returns true if an encounter is triggered.
   * @returns {boolean}
   */
  step() {
    this.stepCount++;
    if (this.stepCount >= this.threshold) {
      return true;
    }
    return false;
  }

  /**
   * Pick a formation from the encounter table using weighted random selection.
   * @returns {string[]} Array of enemy IDs
   */
  rollEncounter() {
    const entry = this.rng.weightedPick(this.encounterTable);
    return entry ? entry.enemies : [];
  }

  /**
   * Reset step counter and roll a new threshold.
   */
  reset() {
    this.stepCount = 0;
    this.threshold = this._rollThreshold();
  }

  /**
   * Get the current step count since last encounter.
   * @returns {number}
   */
  getStepCount() {
    return this.stepCount;
  }

  /**
   * Change the encounter table (e.g. for different dungeon floors).
   * @param {Array<{ enemies: string[], weight: number }>} table
   */
  setEncounterTable(table) {
    this.encounterTable = table;
  }
}
