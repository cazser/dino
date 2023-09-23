import { getRandomNum } from "../utils";
import { IS_HIDPI } from "../shared_constant";
import { NightMode_draw } from "./draw";
import { NightMode_update } from "./update";
//******************************************************************************

/**
 * Nightmode shows a moon and stars on the horizon.
 */
function NightMode(canvas, spritePos, containerWidth) {
  this.spritePos = spritePos;
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext("2d");
  this.xPos = containerWidth - 50;
  this.yPos = 30;
  this.currentPhase = 0;
  this.opacity = 0;
  this.containerWidth = containerWidth;
  this.stars = [];
  this.drawStars = false;
  this.placeStars();
}

/**
 * @enum {number}
 */
NightMode.config = {
  FADE_SPEED: 0.035,
  HEIGHT: 40,
  MOON_SPEED: 0.25,
  NUM_STARS: 2,
  STAR_SIZE: 9,
  STAR_SPEED: 0.3,
  STAR_MAX_Y: 70,
  WIDTH: 20,
};

NightMode.phases = [140, 120, 100, 60, 40, 20, 0];


NightMode.prototype = {
  /**
   * Update moving moon, changing phases.
   * @param {boolean} activated Whether night mode is activated.
   * @param {number} delta
   */
  update:NightMode_update, 
  updateXPos: function (currentPos, speed) {
    if (currentPos < -NightMode.config.WIDTH) {
      currentPos = this.containerWidth;
    } else {
      currentPos -= speed;
    }
    return currentPos;
  },

  draw:NightMode_draw, 
  // Do star placement.
  placeStars: function () {
    var segmentSize = Math.round(
      this.containerWidth / NightMode.config.NUM_STARS
    );

    for (var i = 0; i < NightMode.config.NUM_STARS; i++) {
      this.stars[i] = {};
      this.stars[i].x = getRandomNum(segmentSize * i, segmentSize * (i + 1));
      this.stars[i].y = getRandomNum(0, NightMode.config.STAR_MAX_Y);

      if (IS_HIDPI) {
        this.stars[i].sourceY =
          Runner.spriteDefinition.HDPI.STAR.y +
          NightMode.config.STAR_SIZE * 2 * i;
      } else {
        this.stars[i].sourceY =
          Runner.spriteDefinition.LDPI.STAR.y + NightMode.config.STAR_SIZE * i;
      }
    }
  },

  reset: function () {
    this.currentPhase = 0;
    this.opacity = 0;
    this.update(false);
  },
};
export {NightMode}