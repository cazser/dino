//******************************************************************************
import { getRandomNum } from "../utils";
import { CollisionBox } from "../CollisionBox/index";
import { obstacle_draw } from "./draw";
import { FPS } from "../shared_constant";
import { types } from "./types";
import { getGap } from "./getGap";
/**
 * Obstacle.
 * @param {HTMLCanvasCtx} canvasCtx
 * @param {Obstacle.type} type
 * @param {Object} spritePos Obstacle position in sprite.
 * @param {Object} dimensions
 * @param {number} gapCoefficient Mutipler in determining the gap.
 * @param {number} speed
 * @param {number} opt_xOffset
 */
function Obstacle(
  canvasCtx,
  type,
  spriteImgPos,
  dimensions,
  gapCoefficient,
  speed,
  opt_xOffset
) {
  this.canvasCtx = canvasCtx;
  this.spritePos = spriteImgPos;
  this.typeConfig = type;
  this.gapCoefficient = gapCoefficient;
  this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
  this.dimensions = dimensions;
  this.remove = false;
  this.xPos = dimensions.WIDTH + (opt_xOffset || 0);
  this.yPos = 0;
  this.width = 0;
  this.collisionBoxes = [];
  this.gap = 0;
  this.speedOffset = 0;

  // For animated obstacles.
  this.currentFrame = 0;
  this.timer = 0;

  this.init(speed);
}

/**
 * Coefficient for calculating the maximum gap.
 * @const
 */
Obstacle.MAX_GAP_COEFFICIENT = 1.5;


/**
 * Obstacle definitions.
 * minGap: minimum pixel space betweeen obstacles.
 * multipleSpeed: Speed at which multiples are allowed.
 * speedOffset: speed faster / slower than the horizon.
 * minSpeed: Minimum speed which the obstacle can make an appearance.
 */
Obstacle.types = types;


/**
 * Maximum obstacle grouping count.
 * @const
 */
(Obstacle.MAX_OBSTACLE_LENGTH = 3),
  (Obstacle.prototype = {
    /**
     * Initialise the DOM for the obstacle.
     * @param {number} speed
     */
    init: function (speed) {
      this.cloneCollisionBoxes();

      // Only allow sizing if we're at the right speed.
      if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
        this.size = 1;
      }

      this.width = this.typeConfig.width * this.size;

      // Check if obstacle can be positioned at various heights.
      if (Array.isArray(this.typeConfig.yPos)) {
        var yPosConfig = IS_MOBILE
          ? this.typeConfig.yPosMobile
          : this.typeConfig.yPos;
        this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)];
      } else {
        this.yPos = this.typeConfig.yPos;
      }

      this.draw();

      // Make collision box adjustments,
      // Central box is adjusted to the size as one box.
      //      ____        ______        ________
      //    _|   |-|    _|     |-|    _|       |-|
      //   | |<->| |   | |<--->| |   | |<----->| |
      //   | | 1 | |   | |  2  | |   | |   3   | |
      //   |_|___|_|   |_|_____|_|   |_|_______|_|
      //
      if (this.size > 1) {
        this.collisionBoxes[1].width =
          this.width -
          this.collisionBoxes[0].width -
          this.collisionBoxes[2].width;
        this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
      }

      // For obstacles that go at a different speed from the horizon.
      if (this.typeConfig.speedOffset) {
        this.speedOffset =
          Math.random() > 0.5
            ? this.typeConfig.speedOffset
            : -this.typeConfig.speedOffset;
      }

      this.gap = this.getGap(this.gapCoefficient, speed);
    },

    /**
     * Draw and crop based on size.
     */
    draw: obstacle_draw,

    /**
     * Obstacle frame update.
     * @param {number} deltaTime
     * @param {number} speed
     */
    update: function (deltaTime, speed) {
      if (!this.remove) {
        if (this.typeConfig.speedOffset) {
          speed += this.speedOffset;
        }
        this.xPos -= Math.floor(((speed * FPS) / 1000) * deltaTime);

        // Update frame
        if (this.typeConfig.numFrames) {
          this.timer += deltaTime;
          if (this.timer >= this.typeConfig.frameRate) {
            this.currentFrame =
              this.currentFrame == this.typeConfig.numFrames - 1
                ? 0
                : this.currentFrame + 1;
            this.timer = 0;
          }
        }
        this.draw();

        if (!this.isVisible()) {
          this.remove = true;
        }
      }
    },

    /**
     * Calculate a random gap size.
     * - Minimum gap gets wider as speed increses
     * @param {number} gapCoefficient
     * @param {number} speed
     * @return {number} The gap size.
     */
    getGap: getGap,
    /**
     * Check if obstacle is visible.
     * @return {boolean} Whether the obstacle is in the game area.
     */
    isVisible: function () {
      return this.xPos + this.width > 0;
    },

    /**
     * Make a copy of the collision boxes, since these will change based on
     * obstacle type and size.
     */
    cloneCollisionBoxes: function () {
      var collisionBoxes = this.typeConfig.collisionBoxes;

      for (var i = collisionBoxes.length - 1; i >= 0; i--) {
        this.collisionBoxes[i] = new CollisionBox(
          collisionBoxes[i].x,
          collisionBoxes[i].y,
          collisionBoxes[i].width,
          collisionBoxes[i].height
        );
      }
    },
  });


export {Obstacle}