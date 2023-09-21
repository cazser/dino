/**
 * Horizon background class.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} spritePos Sprite positioning.
 * @param {Object} dimensions Canvas dimensions.
 * @param {number} gapCoefficient
 * @constructor
 */
function Horizon(canvas, spritePos, dimensions, gapCoefficient) {
  this.canvas = canvas;
  this.canvasCtx = this.canvas.getContext("2d");
  this.config = Horizon.config;
  this.dimensions = dimensions;
  this.gapCoefficient = gapCoefficient;
  this.obstacles = [];
  this.obstacleHistory = [];
  this.horizonOffsets = [0, 0];
  this.cloudFrequency = this.config.CLOUD_FREQUENCY;
  this.spritePos = spritePos;
  this.nightMode = null;

  // Cloud
  this.clouds = [];
  this.cloudSpeed = this.config.BG_CLOUD_SPEED;

  // Horizon
  this.horizonLine = null;
  this.init();
}

/**
 * Horizon config.
 * @enum {number}
 */
Horizon.config = {
  BG_CLOUD_SPEED: 0.2,
  BUMPY_THRESHOLD: 0.3,
  CLOUD_FREQUENCY: 0.5,
  HORIZON_HEIGHT: 16,
  MAX_CLOUDS: 6,
};

export {Horizon}