import { FPS,IS_IOS, IS_MOBILE, DEFAULT_WIDTH , IS_HIDPI} from "../shared_constant";
import { Runner_classes } from "./classes";
import { Runner_config } from "./config";
import { Runner_events } from "./events";
import { Runner_keycodes } from "./keycodes";
import { Runner_setDisableRunner } from "./setDisableRunner";
import { spriteDefinition } from "./spriteDefinition";
import { Runner_updateConfigSetting } from "./updateConfigSetting";
import { Runner_startGame } from "./startGame";
import { getTimeStamp,checkForCollision, vibrate, decodeBase64ToArrayBuffer , createCanvas} from "../utils";
import { Runner_updateCanvasScaling } from "./updateCanvasScaling";
import { Runner_adjustDemisions } from "./adjustDemisions";
import {Runner_handleEvent} from './handleEvent';
import {Runner_startListening} from './startListening';
import {Runner_stopListening} from './stopListening';
import {Runner_onKeyDown} from './onKeyDown';
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
import { Runner_createTouchController } from "./createTouchConroller";
import { Runner_isLeftClickOnCanvas } from "./isLeftClickOnCanvas";
import { Runner_update } from "./update";
import { Runner_deboundResize } from "./deboundResize";
import { Runner_scheduleNextUpdate } from "./scheduleNextUpdate";
import { Runner_restart } from "./restart";


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
  createTouchController: Runner_createTouchController,

  /**
   * Debounce the resize event.
   */
  debounceResize: Runner_deboundResize,

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
  update: Runner_update, 
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
  isLeftClickOnCanvas: Runner_isLeftClickOnCanvas, 

  /**
   * RequestAnimationFrame wrapper.
   */
  scheduleNextUpdate: Runner_scheduleNextUpdate ,

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
  restart: Runner_restart, 
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