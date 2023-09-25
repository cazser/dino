import { FPS,IS_IOS, IS_MOBILE, DEFAULT_WIDTH , IS_HIDPI} from "../shared_constant";
import { Runner_classes } from "./classes";
import { Runner_config } from "./config";
import { Runner_events } from "./events";
import { Runner_keycodes } from "./keycodes";
import { Runner_setDisableRunner } from "./setDisableRunner";
import { spriteDefinition } from "./spriteDefinition";
import { Runner_updateConfigSetting } from "./updateConfigSetting";
import { Horizon } from "../Horizon/index";
import { Runner_startGame } from "./startGame";
import { getTimeStamp,checkForCollision, vibrate, decodeBase64ToArrayBuffer , createCanvas} from "../utils";
import { DistanceMeter } from "../DistanceMeter/index";
import { Trex } from "../Trex/index";
import {Cloud} from "../Cloud/index";
import { Runner_updateCanvasScaling } from "./updateCanvasScaling";
import { Runner_adjustDemisions } from "./adjustDemisions";
import {Runner_handleEvent} from './handleEvent';
import {Runner_startListening} from './startListening';
import {Runner_stopListening} from './stopListening';
import {Runner_onKeyDown} from './onKeyDown';
import {GameOverPanel} from '../GameOverPanel';
import { Runner_playSound } from "./playSound";
import { Runner_onVisibilityChange } from "./onVisibilityChange";
import { Runner_play } from "./play";
import { Runner_stop } from "./stop";
import { Runner_invert } from "./invert";
import { Runner_loadImages } from "./loadImages";
import { Runner_gameover } from "../Obstacle/gameover";
import { Runner_loadSounds } from "./loadSounds";
import { Runner_setSpeed } from "./setSpeed";
import { Runner_onkeyup } from "./onKeyUp";
import { Runner_init } from "./init";
import { Runner_playIntro } from "./playIntro";
import { Runner_clearCanvas } from "./clearCanvas";


("use strict");
/**
 * T-Rex runner.
 * @param {string} outerContainerId Outer containing element id.
 * @param {Object} opt_config
 * @constructor
 * @export
 */

function Runner(outerContainerId, opt_config) {
  // 单例
  if (Runner.instance_) {
    return Runner.instance_;
  }
  Runner.instance_ = this;

  this.outerContainerEl = document.querySelector(outerContainerId);
  this.containerEl = null;
  this.snackbarEl = null;
  this.detailsButton = this.outerContainerEl.querySelector("#details-button");

  this.config = opt_config || Runner.config;

  this.dimensions = Runner.defaultDimensions;

  this.canvas = null;
  this.canvasCtx = null;

  this.tRex = null;

  this.distanceMeter = null;
  this.distanceRan = 0;

  this.highestScore = 0;

  this.time = 0;
  this.runningTime = 0;
  this.msPerFrame = 1000 / FPS;
  this.currentSpeed = this.config.SPEED;

  this.obstacles = [];

  this.activated = false; // Whether the easter egg has been activated.
  this.playing = false; // Whether the game is currently in play state.
  this.crashed = false;
  this.paused = false;
  this.inverted = false;
  this.invertTimer = 0;
  this.resizeTimerId_ = null;

  this.playCount = 0;

  // Sound FX.
  this.audioBuffer = null;
  this.soundFx = {};

  // Global web audio context for playing sounds.
  this.audioContext = null;

  // Images.
  this.images = {};
  this.imagesLoaded = 0;

  if (this.isDisabled()) {
    this.setupDisabledRunner();
  } else {
    this.loadImages();
  }
}


/**
 * Default game configuration.
 * @enum {number}
 */
Runner.config = Runner_config;

/**
 * Default dimensions.
 * @enum {string}
 */
Runner.defaultDimensions = {
  WIDTH: DEFAULT_WIDTH,
  HEIGHT: 150,
};

/**
 * CSS class names.
 * @enum {string}
 */
Runner.classes =Runner_classes;
 /**
 * Sprite definition layout of the spritesheet.
 * @enum {Object}
 */
Runner.spriteDefinition = spriteDefinition;


/**
 * Key code mapping.
 * @enum {Object}
 */
Runner.keycodes = Runner_keycodes;

/**
 * Runner event names.
 * @enum {string}
 */
Runner.events =Runner_events; 
/**
 * Sound FX. Reference to the ID of the audio tag on interstitial page.
 * @enum {string}
 */
Runner.sounds = {
  BUTTON_PRESS: "offline-sound-press",
  HIT: "offline-sound-hit",
  SCORE: "offline-sound-reached",
};


Runner.prototype = {
  /**
   * Whether the easter egg has been disabled. CrOS enterprise enrolled devices.
   * @return {boolean}
   */
  isDisabled: function () {
    // return loadTimeData && loadTimeData.valueExists('disabledEasterEgg');
    return false;
  },

  /**
   * For disabled instances, set up a snackbar with the disabled message.
   */
  setupDisabledRunner: Runner_setDisableRunner,

  /**
   * Setting individual settings for debugging.
   * @param {string} setting
   * @param {*} value
   */
  updateConfigSetting: Runner_updateConfigSetting ,

  /**
   * Cache the appropriate image sprite from the page and get the sprite sheet
   * definition.
   */
  loadImages: Runner_loadImages, 
  /**
   * Load and decode base 64 encoded sounds.
   */
  loadSounds: Runner_loadSounds,

  /**
   * Sets the game speed. Adjust the speed accordingly if on a smaller screen.
   * @param {number} opt_speed
   */
  setSpeed: Runner_setSpeed, 
  /**
   * Game initialiser.
   */
  init: Runner_init,

  /**
   * Create the touch controller. A div that covers whole screen.
   */
  createTouchController: function () {
    this.touchController = document.createElement("div");
    this.touchController.className = Runner.classes.TOUCH_CONTROLLER;
    this.outerContainerEl.appendChild(this.touchController);
  },

  /**
   * Debounce the resize event.
   */
  debounceResize: function () {
    if (!this.resizeTimerId_) {
      this.resizeTimerId_ = setInterval(this.adjustDimensions.bind(this), 250);
    }
  },

  /**
   * Adjust game space dimensions on resize.
   */
  adjustDimensions: Runner_adjustDemisions,

  /**
   * Play the game intro.
   * Canvas container width expands out to the full width.
   */
  playIntro:  Runner_playIntro,
    /**
   * Update the game status to started.
   */
  startGame: Runner_startGame,

  clearCanvas: Runner_clearCanvas,

  /**
   * Update the game frame and schedules the next one.
   */
  update: function () {
    this.updatePending = false;

    var now = getTimeStamp();
    var deltaTime = now - (this.time || now);
    this.time = now;

    if (this.playing) {
      this.clearCanvas();

      if (this.tRex.jumping) {
        this.tRex.updateJump(deltaTime);
      }

      this.runningTime += deltaTime;
      var hasObstacles = this.runningTime > this.config.CLEAR_TIME;

      // First jump triggers the intro.
      if (this.tRex.jumpCount == 1 && !this.playingIntro) {
        this.playIntro();
      }

      // The horizon doesn't move until the intro is over.
      if (this.playingIntro) {
        this.horizon.update(0, this.currentSpeed, hasObstacles);
      } else {
        deltaTime = !this.activated ? 0 : deltaTime;
        this.horizon.update(
          deltaTime,
          this.currentSpeed,
          hasObstacles,
          this.inverted
        );
      }

      // Check for collisions.
      var collision =
        hasObstacles && checkForCollision(this.horizon.obstacles[0], this.tRex);

      if (!collision) {
        this.distanceRan += (this.currentSpeed * deltaTime) / this.msPerFrame;

        if (this.currentSpeed < this.config.MAX_SPEED) {
          this.currentSpeed += this.config.ACCELERATION;
        }
      } else {
        this.gameOver();
      }

      var playAchievementSound = this.distanceMeter.update(
        deltaTime,
        Math.ceil(this.distanceRan)
      );

      if (playAchievementSound) {
        this.playSound(this.soundFx.SCORE);
      }

      // Night mode.
      if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
        this.invertTimer = 0;
        this.invertTrigger = false;
        this.invert();
      } else if (this.invertTimer) {
        this.invertTimer += deltaTime;
      } else {
        var actualDistance = this.distanceMeter.getActualDistance(
          Math.ceil(this.distanceRan)
        );

        if (actualDistance > 0) {
          this.invertTrigger = !(actualDistance % this.config.INVERT_DISTANCE);

          if (this.invertTrigger && this.invertTimer === 0) {
            this.invertTimer += deltaTime;
            this.invert();
          }
        }
      }
    }

    if (
      this.playing ||
      (!this.activated && this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)
    ) {
      this.tRex.update(deltaTime);
      this.scheduleNextUpdate();
    }
  },

  /**
   * Event handler.
   */
  handleEvent: Runner_handleEvent,

  /**
   * Bind relevant key / mouse / touch listeners.
   */
  startListening: Runner_startListening,

  /**
   * Remove all listeners.
   */
  stopListening: Runner_stopListening,

  /**
   * Process keydown.
   * @param {Event} e
   */
  onKeyDown: Runner_onKeyDown,

  /**
   * Process key up.
   * @param {Event} e
   */
  onKeyUp: Runner_onkeyup, 
  /**
   * Returns whether the event was a left click on canvas.
   * On Windows right click is registered as a click.
   * @param {Event} e
   * @return {boolean}
   */
  isLeftClickOnCanvas: function (e) {
    return (
      e.button != null &&
      e.button < 2 &&
      e.type == Runner.events.MOUSEUP &&
      e.target == this.canvas
    );
  },

  /**
   * RequestAnimationFrame wrapper.
   */
  scheduleNextUpdate: function () {
    if (!this.updatePending) {
      this.updatePending = true;
      this.raqId = requestAnimationFrame(this.update.bind(this));
    }
  },

  /**
   * Whether the game is running.
   * @return {boolean}
   */
  isRunning: function () {
    return !!this.raqId;
  },

  /**
   * Game over state.
   */
  gameOver:Runner_gameover, 

  stop: Runner_stop,

  play: Runner_play, 
  restart:  function () {
    if (!this.raqId) {
      this.playCount++;
      this.runningTime = 0;
      this.playing = true;
      this.crashed = false;
      this.distanceRan = 0;
      this.setSpeed(this.config.SPEED);
      this.time = getTimeStamp();
      this.containerEl.classList.remove(Runner.classes.CRASHED);
      this.clearCanvas();
      this.distanceMeter.reset(this.highestScore);
      this.horizon.reset();
      this.tRex.reset();
      this.playSound(this.soundFx.BUTTON_PRESS);
      this.invert(true);
      this.update();
    }
  },
  /**
   * Pause the game if the tab is not in focus.
   */
  onVisibilityChange: Runner_onVisibilityChange,

  /**
   * Play a sound.
   * @param {SoundBuffer} soundBuffer
   */
  playSound: Runner_playSound, 
  /**
   * Inverts the current page / canvas colors.
   * @param {boolean} Whether to reset colors.
   */
  invert: Runner_invert,
};

Runner.updateCanvasScaling=Runner_updateCanvasScaling; 
export {Runner}