//******************************************************************************

/**
 * Horizon Line.
 * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} spritePos Horizon position in sprite.
 * @constructor
 */
function HorizonLine(canvas, spritePos) {
  this.spritePos = spritePos;
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext("2d");
  this.sourceDimensions = {};
  this.dimensions = HorizonLine.dimensions;
  this.sourceXPos = [
    this.spritePos.x,
    this.spritePos.x + this.dimensions.WIDTH,
  ];
  this.xPos = [];
  this.yPos = 0;
  this.bumpThreshold = 0.5;

  this.setSourceDimensions();
  this.draw();
}

/**
 * Horizon line dimensions.
 * @enum {number}
 */
HorizonLine.dimensions = {
  WIDTH: 600,
  HEIGHT: 12,
  YPOS: 127,
};

export {HorizonLine}