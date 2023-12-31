import { Horizon_init } from "./init";
import { getRandomNum } from "../utils";
import { Obstacle } from "../Obstacle/index";
import { Cloud } from "../Cloud/index";
import { FPS } from "../shared_constant";
import { Horizon_addNewObstacle } from "./addNewObstacle";
import { Obstacle_updateObstacles } from "./updateObstacles";
import { Horizon_updateClouds } from "./updateClouds";
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


Horizon.prototype = {
  /**
   * Initialise the horizon. Just add the line and a cloud. No obstacles.
   */
  init:Horizon_init,

  /**
   * @param {number} deltaTime
   * @param {number} currentSpeed
   * @param {boolean} updateObstacles Used as an override to prevent
   *     the obstacles from being updated / added. This happens in the
   *     ease in section.
   * @param {boolean} showNightMode Night mode activated.
   */
  update: function (deltaTime, currentSpeed, updateObstacles, showNightMode) {
    this.runningTime += deltaTime;
    this.horizonLine.update(deltaTime, currentSpeed);
    this.nightMode.update(showNightMode);
    this.updateClouds(deltaTime, currentSpeed);

    if (updateObstacles) {
      this.updateObstacles(deltaTime, currentSpeed);
    }
  },

  /**
   * Update the cloud positions.
   * @param {number} deltaTime
   * @param {number} currentSpeed
   */
  updateClouds:Horizon_updateClouds, 
  /**
   * Update the obstacle positions.
   * @param {number} deltaTime
   * @param {number} currentSpeed
   */
  updateObstacles: Obstacle_updateObstacles, 
  removeFirstObstacle: function () {
    this.obstacles.shift();
  },

  /**
   * Add a new obstacle.
   * @param {number} currentSpeed
   */
  addNewObstacle:Horizon_addNewObstacle, 
  /**
   * Returns whether the previous two obstacles are the same as the next one.
   * Maximum duplication is set in config value MAX_OBSTACLE_DUPLICATION.
   * @return {boolean}
   */
  duplicateObstacleCheck: function (nextObstacleType) {
    var duplicateCount = 0;

    for (var i = 0; i < this.obstacleHistory.length; i++) {
      duplicateCount =
        this.obstacleHistory[i] == nextObstacleType ? duplicateCount + 1 : 0;
    }
    return duplicateCount >= Runner.config.MAX_OBSTACLE_DUPLICATION;
  },

  /**
   * Reset the horizon layer.
   * Remove existing obstacles and reposition the horizon line.
   */
  reset: function () {
    this.obstacles = [];
    this.horizonLine.reset();
    this.nightMode.reset();
  },

  /**
   * Update the canvas width and scaling.
   * @param {number} width Canvas width.
   * @param {number} height Canvas height.
   */
  resize: function (width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  },

  /**
   * Add a new cloud to the horizon.
   */
  addCloud: function () {
    this.clouds.push(
      new Cloud(this.canvas, this.spritePos.CLOUD, this.dimensions.WIDTH)
    );
  },
};


export {Horizon}