//******************************************************************************
import { getRandomNum } from "../utils";
import { CollisionBox } from "../CollisionBox/index";
import { obstacle_draw } from "./draw";
import { FPS } from "../shared_constant";
import { types } from "./types";
import { getGap } from "./getGap";
import { IS_MOBILE } from "../shared_constant";
import { Obstacle_update } from "./update";
import { Obstacle_init } from "./init";
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
    init: Obstacle_init, 

    /**
     * Draw and crop based on size.
     */
    draw: obstacle_draw,

    /**
     * Obstacle frame update.
     * @param {number} deltaTime
     * @param {number} speed
     */
    update: Obstacle_update, 
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