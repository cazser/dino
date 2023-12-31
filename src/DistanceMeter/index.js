//******************************************************************************

import { DistanceMeter_draw } from "./draw";
import { DistanceMeter_update } from "./update";

/**
 * Handles displaying the distance meter.
 * @param {!HTMLCanvasElement} canvas
 * @param {Object} spritePos Image position in sprite.
 * @param {number} canvasWidth
 * @constructor
 */
function DistanceMeter(canvas, spritePos, canvasWidth) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext("2d");
  this.image = Runner.imageSprite;
  this.spritePos = spritePos;
  this.x = 0;
  this.y = 5;

  this.currentDistance = 0;
  this.maxScore = 0;
  this.highScore = 0;
  this.container = null;

  this.digits = [];
  this.acheivement = false;
  this.defaultString = "";
  this.flashTimer = 0;
  this.flashIterations = 0;
  this.invertTrigger = false;

  this.config = DistanceMeter.config;
  this.maxScoreUnits = this.config.MAX_DISTANCE_UNITS;
  this.init(canvasWidth);
}

/**
 * @enum {number}
 */
DistanceMeter.dimensions = {
  WIDTH: 10,
  HEIGHT: 13,
  DEST_WIDTH: 11,
};

/**
 * Y positioning of the digits in the sprite sheet.
 * X position is always 0.
 * @type {Array<number>}
 */
DistanceMeter.yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];

/**
 * Distance meter config.
 * @enum {number}
 */
DistanceMeter.config = {
  // Number of digits.
  MAX_DISTANCE_UNITS: 5,

  // Distance that causes achievement animation.
  ACHIEVEMENT_DISTANCE: 100,

  // Used for conversion from pixel distance to a scaled unit.
  COEFFICIENT: 0.025,

  // Flash duration in milliseconds.
  FLASH_DURATION: 1000 / 4,

  // Flash iterations for achievement animation.
  FLASH_ITERATIONS: 3,
};

DistanceMeter.prototype = {
  /**
   * Initialise the distance meter to '00000'.
   * @param {number} width Canvas width in px.
   */
  init: function (width) {
    var maxDistanceStr = "";

    this.calcXPos(width);
    this.maxScore = this.maxScoreUnits;
    for (var i = 0; i < this.maxScoreUnits; i++) {
      this.draw(i, 0);
      this.defaultString += "0";
      maxDistanceStr += "9";
    }

    this.maxScore = parseInt(maxDistanceStr);
  },

  /**
   * Calculate the xPos in the canvas.
   * @param {number} canvasWidth
   */
  calcXPos: function (canvasWidth) {
    this.x =
      canvasWidth -
      DistanceMeter.dimensions.DEST_WIDTH * (this.maxScoreUnits + 1);
  },

  /**
   * Draw a digit to canvas.
   * @param {number} digitPos Position of the digit.
   * @param {number} value Digit value 0-9.
   * @param {boolean} opt_highScore Whether drawing the high score.
   */
  draw: DistanceMeter_draw,

  /**
   * Covert pixel distance to a 'real' distance.
   * @param {number} distance Pixel distance ran.
   * @return {number} The 'real' distance ran.
   */
  getActualDistance: function (distance) {
    return distance ? Math.round(distance * this.config.COEFFICIENT) : 0;
  },

  /**
   * Update the distance meter.
   * @param {number} distance
   * @param {number} deltaTime
   * @return {boolean} Whether the acheivement sound fx should be played.
   */
  update:DistanceMeter_update, 
  /**
   * Draw the high score.
   */
  drawHighScore: function () {
    this.canvasCtx.save();
    this.canvasCtx.globalAlpha = 0.8;
    for (var i = this.highScore.length - 1; i >= 0; i--) {
      this.draw(i, parseInt(this.highScore[i], 10), true);
    }
    this.canvasCtx.restore();
  },

  /**
   * Set the highscore as a array string.
   * Position of char in the sprite: H - 10, I - 11.
   * @param {number} distance Distance ran in pixels.
   */
  setHighScore: function (distance) {
    distance = this.getActualDistance(distance);
    var highScoreStr = (this.defaultString + distance).substr(
      -this.maxScoreUnits
    );

    this.highScore = ["10", "11", ""].concat(highScoreStr.split(""));
  },

  /**
   * Reset the distance meter back to '00000'.
   */
  reset: function () {
    this.update(0);
    this.acheivement = false;
  },
};


export {DistanceMeter}