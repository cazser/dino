import { GameOverPanel } from "./GameOverPanel";
import { spriteDefinition } from "./Runner/spriteDefinition";
import { Runner_config } from "./Runner/config";
import { getRandomNum, createCanvas } from "./utils";
import { Horizon } from "./Horizon/index";
import { HorizonLine } from "./HorizonLine/index";
import { Cloud } from "./Cloud/index";
import { CollisionBox } from "./CollisionBox/index";
import { NightMode } from "./NightMode/index";
import { DEFAULT_WIDTH, FPS, IS_HIDPI, IS_IOS, IS_MOBILE, IS_TOUCH_ENABLED } from "./shared_constant";
import { Runner_startGame } from "./Runner/startGame";
import { DistanceMeter } from "./DistanceMeter/index";
import { Runner_classes } from "./Runner/classes";
import { Runner_updateConfigSetting } from "./Runner/updateConfigSetting";
import { Horizon_init } from "./Horizon/init";
import { Runner_events } from "./Runner/events";
import { Runner_keycodes } from "./Runner/keycodes";
import { Runner_updateCanvasScaling } from "./Runner/updateCanvasScaling";
import { Runner_handleEvent } from "./Runner/handleEvent";
import { Obstacle } from "./Obstacle/index";
import { obstacle_draw } from "./Obstacle/draw";
import { Runner } from "./Runner/index";
import { Runner_adjustDemisions } from "./Runner/adjustDemisions";
import { Runner_setDisableRunner } from "./Runner/setDisableRunner";
import { Runner_startListening } from "./Runner/startListening";
import { Runner_onKeyDown } from "./Runner/onKeyDown";
// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

window["Runner"] = Runner;

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
 * Sound FX. Reference to the ID of the audio tag on interstitial page.
 * @enum {string}
 */
Runner.sounds = {
  BUTTON_PRESS: "offline-sound-press",
  HIT: "offline-sound-hit",
  SCORE: "offline-sound-reached",
};

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
  updateConfigSetting: Runner_updateConfigSetting,

  /**
   * Cache the appropriate image sprite from the page and get the sprite sheet
   * definition.
   */
  loadImages: function () {
    if (IS_HIDPI) {
      Runner.imageSprite = document.getElementById("offline-resources-2x");
      this.spriteDef = Runner.spriteDefinition.HDPI;
    } else {
      Runner.imageSprite = document.getElementById("offline-resources-1x");
      this.spriteDef = Runner.spriteDefinition.LDPI;
    }

    if (Runner.imageSprite.complete) {
      this.init();
    } else {
      // If the images are not yet loaded, add a listener.
      Runner.imageSprite.addEventListener(
        Runner.events.LOAD,
        this.init.bind(this)
      );
    }
  },

  /**
   * Load and decode base 64 encoded sounds.
   */
  loadSounds: function () {
    if (!IS_IOS) {
      this.audioContext = new AudioContext();

      var resourceTemplate = document.getElementById(
        this.config.RESOURCE_TEMPLATE_ID
      ).content;

      for (var sound in Runner.sounds) {
        var soundSrc = resourceTemplate.getElementById(
          Runner.sounds[sound]
        ).src;
        soundSrc = soundSrc.substr(soundSrc.indexOf(",") + 1);
        var buffer = decodeBase64ToArrayBuffer(soundSrc);

        // Async, so no guarantee of order in array.
        this.audioContext.decodeAudioData(
          buffer,
          function (index, audioData) {
            this.soundFx[index] = audioData;
          }.bind(this, sound)
        );
      }
    }
  },

  /**
   * Sets the game speed. Adjust the speed accordingly if on a smaller screen.
   * @param {number} opt_speed
   */
  setSpeed: function (opt_speed) {
    var speed = opt_speed || this.currentSpeed;

    // Reduce the speed on smaller mobile screens.
    if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
      var mobileSpeed =
        ((speed * this.dimensions.WIDTH) / DEFAULT_WIDTH) *
        this.config.MOBILE_SPEED_COEFFICIENT;
      this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
    } else if (opt_speed) {
      this.currentSpeed = opt_speed;
    }
  },

  /**
   * Game initialiser.
   */
  init: function () {
    // Hide the static icon.
    document.querySelector("." + Runner.classes.ICON).style.visibility =
      "hidden";

    this.adjustDimensions();
    this.setSpeed();

    this.containerEl = document.createElement("div");
    this.containerEl.className = Runner.classes.CONTAINER;

    // Player canvas container.
    this.canvas = createCanvas(
      this.containerEl,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT,
      Runner.classes.PLAYER
    );

    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.fillStyle = "#f7f7f7";
    this.canvasCtx.fill();
    Runner.updateCanvasScaling(this.canvas);

    // Horizon contains clouds, obstacles and the ground.
    this.horizon = new Horizon(
      this.canvas,
      this.spriteDef,
      this.dimensions,
      this.config.GAP_COEFFICIENT
    );

    // Distance meter
    this.distanceMeter = new DistanceMeter(
      this.canvas,
      this.spriteDef.TEXT_SPRITE,
      this.dimensions.WIDTH
    );

    // Draw t-rex
    this.tRex = new Trex(this.canvas, this.spriteDef.TREX);

    this.outerContainerEl.appendChild(this.containerEl);

    if (IS_MOBILE) {
      this.createTouchController();
    }

    this.startListening();
    this.update();

    window.addEventListener(
      Runner.events.RESIZE,
      this.debounceResize.bind(this)
    );
  },

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
  playIntro: function () {
    if (!this.activated && !this.crashed) {
      this.playingIntro = true;
      this.tRex.playingIntro = true;

      // CSS animation definition.
      var keyframes =
        "@-webkit-keyframes intro { " +
        "from { width:" +
        Trex.config.WIDTH +
        "px }" +
        "to { width: " +
        this.dimensions.WIDTH +
        "px }" +
        "}";

      // create a style sheet to put the keyframe rule in
      // and then place the style sheet in the html head
      var sheet = document.createElement("style");
      sheet.innerHTML = keyframes;
      document.head.appendChild(sheet);

      this.containerEl.addEventListener(
        Runner.events.ANIM_END,
        this.startGame.bind(this)
      );

      this.containerEl.style.webkitAnimation = "intro .4s ease-out 1 both";
      this.containerEl.style.width = this.dimensions.WIDTH + "px";

      // if (this.touchController) {
      //     this.outerContainerEl.appendChild(this.touchController);
      // }
      this.playing = true;
      this.activated = true;
    } else if (this.crashed) {
      this.restart();
    }
  },

  /**
   * Update the game status to started.
   */
  startGame: Runner_startGame,

  clearCanvas: function () {
    this.canvasCtx.clearRect(
      0,
      0,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    );
  },

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
  stopListening: function () {
    document.removeEventListener(Runner.events.KEYDOWN, this);
    document.removeEventListener(Runner.events.KEYUP, this);

    if (IS_MOBILE) {
      this.touchController.removeEventListener(Runner.events.TOUCHSTART, this);
      this.touchController.removeEventListener(Runner.events.TOUCHEND, this);
      this.containerEl.removeEventListener(Runner.events.TOUCHSTART, this);
    } else {
      document.removeEventListener(Runner.events.MOUSEDOWN, this);
      document.removeEventListener(Runner.events.MOUSEUP, this);
    }
  },

  /**
   * Process keydown.
   * @param {Event} e
   */
  onKeyDown: Runner_onKeyDown,

  /**
   * Process key up.
   * @param {Event} e
   */
  onKeyUp: function (e) {
    var keyCode = String(e.keyCode);
    var isjumpKey =
      Runner.keycodes.JUMP[keyCode] ||
      e.type == Runner.events.TOUCHEND ||
      e.type == Runner.events.MOUSEDOWN;

    if (this.isRunning() && isjumpKey) {
      this.tRex.endJump();
    } else if (Runner.keycodes.DUCK[keyCode]) {
      this.tRex.speedDrop = false;
      this.tRex.setDuck(false);
    } else if (this.crashed) {
      // Check that enough time has elapsed before allowing jump key to restart.
      var deltaTime = getTimeStamp() - this.time;

      if (
        Runner.keycodes.RESTART[keyCode] ||
        this.isLeftClickOnCanvas(e) ||
        (deltaTime >= this.config.GAMEOVER_CLEAR_TIME &&
          Runner.keycodes.JUMP[keyCode])
      ) {
        this.restart();
      }
    } else if (this.paused && isjumpKey) {
      // Reset the jump state
      this.tRex.reset();
      this.play();
    }
  },

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
  gameOver: function () {
    this.playSound(this.soundFx.HIT);
    vibrate(200);

    this.stop();
    this.crashed = true;
    this.distanceMeter.acheivement = false;

    this.tRex.update(100, Trex.status.CRASHED);

    // Game over panel.
    if (!this.gameOverPanel) {
      this.gameOverPanel = new GameOverPanel(
        this.canvas,
        this.spriteDef.TEXT_SPRITE,
        this.spriteDef.RESTART,
        this.dimensions
      );
    } else {
      this.gameOverPanel.draw();
    }

    // Update the high score.
    if (this.distanceRan > this.highestScore) {
      this.highestScore = Math.ceil(this.distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    }

    // Reset the time clock.
    this.time = getTimeStamp();
  },

  stop: function () {
    this.playing = false;
    this.paused = true;
    cancelAnimationFrame(this.raqId);
    this.raqId = 0;
  },

  play: function () {
    if (!this.crashed) {
      this.playing = true;
      this.paused = false;
      this.tRex.update(0, Trex.status.RUNNING);
      this.time = getTimeStamp();
      this.update();
    }
  },

  restart: function () {
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
  onVisibilityChange: function (e) {
    if (
      document.hidden ||
      document.webkitHidden ||
      e.type == "blur" ||
      document.visibilityState != "visible"
    ) {
      this.stop();
    } else if (!this.crashed) {
      this.tRex.reset();
      this.play();
    }
  },

  /**
   * Play a sound.
   * @param {SoundBuffer} soundBuffer
   */
  playSound: function (soundBuffer) {
    if (soundBuffer) {
      var sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = soundBuffer;
      sourceNode.connect(this.audioContext.destination);
      sourceNode.start(0);
    }
  },

  /**
   * Inverts the current page / canvas colors.
   * @param {boolean} Whether to reset colors.
   */
  invert: function (reset) {
    if (reset) {
      document.body.classList.toggle(Runner.classes.INVERTED, false);
      this.invertTimer = 0;
      this.inverted = false;
    } else {
      this.inverted = document.body.classList.toggle(
        Runner.classes.INVERTED,
        this.invertTrigger
      );
    }
  },
};

Runner.updateCanvasScaling= Runner_updateCanvasScaling; 
/**
 * Vibrate on mobile devices.
 * @param {number} duration Duration of the vibration in milliseconds.
 */
function vibrate(duration) {
  if (IS_MOBILE && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
}



/**
 * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
 * @param {string} base64String
 */
function decodeBase64ToArrayBuffer(base64String) {
  var len = (base64String.length / 4) * 3;
  var str = atob(base64String);
  var arrayBuffer = new ArrayBuffer(len);
  var bytes = new Uint8Array(arrayBuffer);

  for (var i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Return the current timestamp.
 * @return {number}
 */
function getTimeStamp() {
  return IS_IOS ? new Date().getTime() : performance.now();
}



//******************************************************************************

/**
 * Check for a collision.
 * @param {!Obstacle} obstacle
 * @param {!Trex} tRex T-rex object.
 * @param {HTMLCanvasContext} opt_canvasCtx Optional canvas context for drawing
 *    collision boxes.
 * @return {Array<CollisionBox>}
 */
function checkForCollision(obstacle, tRex, opt_canvasCtx) {
  var obstacleBoxXPos = Runner.defaultDimensions.WIDTH + obstacle.xPos;

  // Adjustments are made to the bounding box as there is a 1 pixel white
  // border around the t-rex and obstacles.
  var tRexBox = new CollisionBox(
    tRex.xPos + 1,
    tRex.yPos + 1,
    tRex.config.WIDTH - 2,
    tRex.config.HEIGHT - 2
  );

  var obstacleBox = new CollisionBox(
    obstacle.xPos + 1,
    obstacle.yPos + 1,
    obstacle.typeConfig.width * obstacle.size - 2,
    obstacle.typeConfig.height - 2
  );

  // Debug outer box
  if (opt_canvasCtx) {
    drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
  }

  // Simple outer bounds check.
  if (boxCompare(tRexBox, obstacleBox)) {
    var collisionBoxes = obstacle.collisionBoxes;
    var tRexCollisionBoxes = tRex.ducking
      ? Trex.collisionBoxes.DUCKING
      : Trex.collisionBoxes.RUNNING;

    // Detailed axis aligned box check.
    for (var t = 0; t < tRexCollisionBoxes.length; t++) {
      for (var i = 0; i < collisionBoxes.length; i++) {
        // Adjust the box to actual positions.
        var adjTrexBox = createAdjustedCollisionBox(
          tRexCollisionBoxes[t],
          tRexBox
        );
        var adjObstacleBox = createAdjustedCollisionBox(
          collisionBoxes[i],
          obstacleBox
        );
        var crashed = boxCompare(adjTrexBox, adjObstacleBox);

        // Draw boxes for debug.
        if (opt_canvasCtx) {
          drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
        }

        if (crashed) {
          return [adjTrexBox, adjObstacleBox];
        }
      }
    }
  }
  return false;
}

/**
 * Adjust the collision box.
 * @param {!CollisionBox} box The original box.
 * @param {!CollisionBox} adjustment Adjustment box.
 * @return {CollisionBox} The adjusted collision box object.
 */
function createAdjustedCollisionBox(box, adjustment) {
  return new CollisionBox(
    box.x + adjustment.x,
    box.y + adjustment.y,
    box.width,
    box.height
  );
}

/**
 * Draw the collision boxes for debug.
 */
function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
  canvasCtx.save();
  canvasCtx.strokeStyle = "#f00";
  canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);

  canvasCtx.strokeStyle = "#0f0";
  canvasCtx.strokeRect(
    obstacleBox.x,
    obstacleBox.y,
    obstacleBox.width,
    obstacleBox.height
  );
  canvasCtx.restore();
}

/**
 * Compare two collision boxes for a collision.
 * @param {CollisionBox} tRexBox
 * @param {CollisionBox} obstacleBox
 * @return {boolean} Whether the boxes intersected.
 */
function boxCompare(tRexBox, obstacleBox) {
  var crashed = false;
  var tRexBoxX = tRexBox.x;
  var tRexBoxY = tRexBox.y;

  var obstacleBoxX = obstacleBox.x;
  var obstacleBoxY = obstacleBox.y;

  // Axis-Aligned Bounding Box method.
  if (
    tRexBox.x < obstacleBoxX + obstacleBox.width &&
    tRexBox.x + tRexBox.width > obstacleBoxX &&
    tRexBox.y < obstacleBox.y + obstacleBox.height &&
    tRexBox.height + tRexBox.y > obstacleBox.y
  ) {
    crashed = true;
  }

  return crashed;
}


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
    getGap: function (gapCoefficient, speed) {
      var minGap = Math.round(
        this.width * speed + this.typeConfig.minGap * gapCoefficient
      );
      var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
      return getRandomNum(minGap, maxGap);
    },

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


//******************************************************************************
/**
 * T-rex game character.
 * @param {HTMLCanvas} canvas
 * @param {Object} spritePos Positioning within image sprite.
 * @constructor
 */
function Trex(canvas, spritePos) {
  this.canvas = canvas;
  this.canvasCtx = canvas.getContext("2d");
  this.spritePos = spritePos;
  this.xPos = 0;
  this.yPos = 0;
  // Position when on the ground.
  this.groundYPos = 0;
  this.currentFrame = 0;
  this.currentAnimFrames = [];
  this.blinkDelay = 0;
  this.blinkCount = 0;
  this.animStartTime = 0;
  this.timer = 0;
  this.msPerFrame = 1000 / FPS;
  this.config = Trex.config;
  // Current status.
  this.status = Trex.status.WAITING;

  this.jumping = false;
  this.ducking = false;
  this.jumpVelocity = 0;
  this.reachedMinHeight = false;
  this.speedDrop = false;
  this.jumpCount = 0;
  this.jumpspotX = 0;

  this.init();
}

/**
 * T-rex player config.
 * @enum {number}
 */
Trex.config = {
  DROP_VELOCITY: -5,
  GRAVITY: 0.6,
  HEIGHT: 47,
  HEIGHT_DUCK: 25,
  INIITAL_JUMP_VELOCITY: -10,
  INTRO_DURATION: 1500,
  MAX_JUMP_HEIGHT: 30,
  MIN_JUMP_HEIGHT: 30,
  SPEED_DROP_COEFFICIENT: 3,
  SPRITE_WIDTH: 262,
  START_X_POS: 50,
  WIDTH: 44,
  WIDTH_DUCK: 59,
};

/**
 * Used in collision detection.
 * @type {Array<CollisionBox>}
 */
Trex.collisionBoxes = {
  DUCKING: [new CollisionBox(1, 18, 55, 25)],
  RUNNING: [
    new CollisionBox(22, 0, 17, 16),
    new CollisionBox(1, 18, 30, 9),
    new CollisionBox(10, 35, 14, 8),
    new CollisionBox(1, 24, 29, 5),
    new CollisionBox(5, 30, 21, 4),
    new CollisionBox(9, 34, 15, 4),
  ],
};

/**
 * Animation states.
 * @enum {string}
 */
Trex.status = {
  CRASHED: "CRASHED",
  DUCKING: "DUCKING",
  JUMPING: "JUMPING",
  RUNNING: "RUNNING",
  WAITING: "WAITING",
};

/**
 * Blinking coefficient.
 * @const
 */
Trex.BLINK_TIMING = 7000;

/**
 * Animation config for different states.
 * @enum {Object}
 */
Trex.animFrames = {
  WAITING: {
    frames: [44, 0],
    msPerFrame: 1000 / 3,
  },
  RUNNING: {
    frames: [88, 132],
    msPerFrame: 1000 / 12,
  },
  CRASHED: {
    frames: [220],
    msPerFrame: 1000 / 60,
  },
  JUMPING: {
    frames: [0],
    msPerFrame: 1000 / 60,
  },
  DUCKING: {
    frames: [264, 323],
    msPerFrame: 1000 / 8,
  },
};

Trex.prototype = {
  /**
   * T-rex player initaliser.
   * Sets the t-rex to blink at random intervals.
   */
  init: function () {
    this.groundYPos =
      Runner.defaultDimensions.HEIGHT -
      this.config.HEIGHT -
      Runner.config.BOTTOM_PAD;
    this.yPos = this.groundYPos;
    this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;

    this.draw(0, 0);
    this.update(0, Trex.status.WAITING);
  },

  /**
   * Setter for the jump velocity.
   * The approriate drop velocity is also set.
   */
  setJumpVelocity: function (setting) {
    this.config.INIITAL_JUMP_VELOCITY = -setting;
    this.config.DROP_VELOCITY = -setting / 2;
  },

  /**
   * Set the animation status.
   * @param {!number} deltaTime
   * @param {Trex.status} status Optional status to switch to.
   */
  update: function (deltaTime, opt_status) {
    this.timer += deltaTime;

    // Update the status.
    if (opt_status) {
      this.status = opt_status;
      this.currentFrame = 0;
      this.msPerFrame = Trex.animFrames[opt_status].msPerFrame;
      this.currentAnimFrames = Trex.animFrames[opt_status].frames;

      if (opt_status == Trex.status.WAITING) {
        this.animStartTime = getTimeStamp();
        this.setBlinkDelay();
      }
    }

    // Game intro animation, T-rex moves in from the left.
    if (this.playingIntro && this.xPos < this.config.START_X_POS) {
      this.xPos += Math.round(
        (this.config.START_X_POS / this.config.INTRO_DURATION) * deltaTime
      );
    }

    if (this.status == Trex.status.WAITING) {
      this.blink(getTimeStamp());
    } else {
      this.draw(this.currentAnimFrames[this.currentFrame], 0);
    }

    // Update the frame position.
    if (this.timer >= this.msPerFrame) {
      this.currentFrame =
        this.currentFrame == this.currentAnimFrames.length - 1
          ? 0
          : this.currentFrame + 1;
      this.timer = 0;
    }

    // Speed drop becomes duck if the down key is still being pressed.
    if (this.speedDrop && this.yPos == this.groundYPos) {
      this.speedDrop = false;
      this.setDuck(true);
    }
  },

  /**
   * Draw the t-rex to a particular position.
   * @param {number} x
   * @param {number} y
   */
  draw: function (x, y) {
    var sourceX = x;
    var sourceY = y;
    var sourceWidth =
      this.ducking && this.status != Trex.status.CRASHED
        ? this.config.WIDTH_DUCK
        : this.config.WIDTH;
    var sourceHeight = this.config.HEIGHT;

    if (IS_HIDPI) {
      sourceX *= 2;
      sourceY *= 2;
      sourceWidth *= 2;
      sourceHeight *= 2;
    }

    // Adjustments for sprite sheet position.
    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;

    // Ducking.
    if (this.ducking && this.status != Trex.status.CRASHED) {
      this.canvasCtx.drawImage(
        Runner.imageSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH_DUCK,
        this.config.HEIGHT
      );
    } else {
      // Crashed whilst ducking. Trex is standing up so needs adjustment.
      if (this.ducking && this.status == Trex.status.CRASHED) {
        this.xPos++;
      }
      // Standing / running
      this.canvasCtx.drawImage(
        Runner.imageSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH,
        this.config.HEIGHT
      );
    }
  },

  /**
   * Sets a random time for the blink to happen.
   */
  setBlinkDelay: function () {
    this.blinkDelay = Math.ceil(Math.random() * Trex.BLINK_TIMING);
  },

  /**
   * Make t-rex blink at random intervals.
   * @param {number} time Current time in milliseconds.
   */
  blink: function (time) {
    var deltaTime = time - this.animStartTime;

    if (deltaTime >= this.blinkDelay) {
      this.draw(this.currentAnimFrames[this.currentFrame], 0);

      if (this.currentFrame == 1) {
        // Set new random delay to blink.
        this.setBlinkDelay();
        this.animStartTime = time;
        this.blinkCount++;
      }
    }
  },

  /**
   * Initialise a jump.
   * @param {number} speed
   */
  startJump: function (speed) {
    if (!this.jumping) {
      this.update(0, Trex.status.JUMPING);
      // Tweak the jump velocity based on the speed.
      this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - speed / 10;
      this.jumping = true;
      this.reachedMinHeight = false;
      this.speedDrop = false;
    }
  },

  /**
   * Jump is complete, falling down.
   */
  endJump: function () {
    if (
      this.reachedMinHeight &&
      this.jumpVelocity < this.config.DROP_VELOCITY
    ) {
      this.jumpVelocity = this.config.DROP_VELOCITY;
    }
  },

  /**
   * Update frame for a jump.
   * @param {number} deltaTime
   * @param {number} speed
   */
  updateJump: function (deltaTime, speed) {
    var msPerFrame = Trex.animFrames[this.status].msPerFrame;
    var framesElapsed = deltaTime / msPerFrame;

    // Speed drop makes Trex fall faster.
    if (this.speedDrop) {
      this.yPos += Math.round(
        this.jumpVelocity * this.config.SPEED_DROP_COEFFICIENT * framesElapsed
      );
    } else {
      this.yPos += Math.round(this.jumpVelocity * framesElapsed);
    }

    this.jumpVelocity += this.config.GRAVITY * framesElapsed;

    // Minimum height has been reached.
    if (this.yPos < this.minJumpHeight || this.speedDrop) {
      this.reachedMinHeight = true;
    }

    // Reached max height
    if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
      this.endJump();
    }

    // Back down at ground level. Jump completed.
    if (this.yPos > this.groundYPos) {
      this.reset();
      this.jumpCount++;
    }

    this.update(deltaTime);
  },

  /**
   * Set the speed drop. Immediately cancels the current jump.
   */
  setSpeedDrop: function () {
    this.speedDrop = true;
    this.jumpVelocity = 1;
  },

  /**
   * @param {boolean} isDucking.
   */
  setDuck: function (isDucking) {
    if (isDucking && this.status != Trex.status.DUCKING) {
      this.update(0, Trex.status.DUCKING);
      this.ducking = true;
    } else if (this.status == Trex.status.DUCKING) {
      this.update(0, Trex.status.RUNNING);
      this.ducking = false;
    }
  },

  /**
   * Reset the t-rex to running at start of game.
   */
  reset: function () {
    this.yPos = this.groundYPos;
    this.jumpVelocity = 0;
    this.jumping = false;
    this.ducking = false;
    this.update(0, Trex.status.RUNNING);
    this.midair = false;
    this.speedDrop = false;
    this.jumpCount = 0;
  },
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
  draw: function (digitPos, value, opt_highScore) {
    var sourceWidth = DistanceMeter.dimensions.WIDTH;
    var sourceHeight = DistanceMeter.dimensions.HEIGHT;
    var sourceX = DistanceMeter.dimensions.WIDTH * value;
    var sourceY = 0;

    var targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
    var targetY = this.y;
    var targetWidth = DistanceMeter.dimensions.WIDTH;
    var targetHeight = DistanceMeter.dimensions.HEIGHT;

    // For high DPI we 2x source values.
    if (IS_HIDPI) {
      sourceWidth *= 2;
      sourceHeight *= 2;
      sourceX *= 2;
    }

    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;

    this.canvasCtx.save();

    if (opt_highScore) {
      // Left of the current score.
      var highScoreX =
        this.x - this.maxScoreUnits * 2 * DistanceMeter.dimensions.WIDTH;
      this.canvasCtx.translate(highScoreX, this.y);
    } else {
      this.canvasCtx.translate(this.x, this.y);
    }

    this.canvasCtx.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight
    );

    this.canvasCtx.restore();
  },

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
  update: function (deltaTime, distance) {
    var paint = true;
    var playSound = false;

    if (!this.acheivement) {
      distance = this.getActualDistance(distance);
      // Score has gone beyond the initial digit count.
      if (
        distance > this.maxScore &&
        this.maxScoreUnits == this.config.MAX_DISTANCE_UNITS
      ) {
        this.maxScoreUnits++;
        this.maxScore = parseInt(this.maxScore + "9");
      } else {
        this.distance = 0;
      }

      if (distance > 0) {
        // Acheivement unlocked
        if (distance % this.config.ACHIEVEMENT_DISTANCE == 0) {
          // Flash score and play sound.
          this.acheivement = true;
          this.flashTimer = 0;
          playSound = true;
        }

        // Create a string representation of the distance with leading 0.
        var distanceStr = (this.defaultString + distance).substr(
          -this.maxScoreUnits
        );
        this.digits = distanceStr.split("");
      } else {
        this.digits = this.defaultString.split("");
      }
    } else {
      // Control flashing of the score on reaching acheivement.
      if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
        this.flashTimer += deltaTime;

        if (this.flashTimer < this.config.FLASH_DURATION) {
          paint = false;
        } else if (this.flashTimer > this.config.FLASH_DURATION * 2) {
          this.flashTimer = 0;
          this.flashIterations++;
        }
      } else {
        this.acheivement = false;
        this.flashIterations = 0;
        this.flashTimer = 0;
      }
    }

    // Draw the digits if not flashing.
    if (paint) {
      for (var i = this.digits.length - 1; i >= 0; i--) {
        this.draw(i, parseInt(this.digits[i]));
      }
    }

    this.drawHighScore();
    return playSound;
  },

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

Cloud.prototype = {
  /**
   * Initialise the cloud. Sets the Cloud height.
   */
  init: function () {
    this.yPos = getRandomNum(
      Cloud.config.MAX_SKY_LEVEL,
      Cloud.config.MIN_SKY_LEVEL
    );
    this.draw();
  },

  /**
   * Draw the cloud.
   */
  draw: function () {
    this.canvasCtx.save();
    var sourceWidth = Cloud.config.WIDTH;
    var sourceHeight = Cloud.config.HEIGHT;

    if (IS_HIDPI) {
      sourceWidth = sourceWidth * 2;
      sourceHeight = sourceHeight * 2;
    }

    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.spritePos.x,
      this.spritePos.y,
      sourceWidth,
      sourceHeight,
      this.xPos,
      this.yPos,
      Cloud.config.WIDTH,
      Cloud.config.HEIGHT
    );

    this.canvasCtx.restore();
  },

  /**
   * Update the cloud position.
   * @param {number} speed
   */
  update: function (speed) {
    if (!this.remove) {
      this.xPos -= Math.ceil(speed);
      this.draw();

      // Mark as removeable if no longer in the canvas.
      if (!this.isVisible()) {
        this.remove = true;
      }
    }
  },

  /**
   * Check if the cloud is visible on the stage.
   * @return {boolean}
   */
  isVisible: function () {
    return this.xPos + Cloud.config.WIDTH > 0;
  },
};




HorizonLine.prototype = {
  /**
   * Set the source dimensions of the horizon line.
   */
  setSourceDimensions: function () {
    for (var dimension in HorizonLine.dimensions) {
      if (IS_HIDPI) {
        if (dimension != "YPOS") {
          this.sourceDimensions[dimension] =
            HorizonLine.dimensions[dimension] * 2;
        }
      } else {
        this.sourceDimensions[dimension] = HorizonLine.dimensions[dimension];
      }
      this.dimensions[dimension] = HorizonLine.dimensions[dimension];
    }

    this.xPos = [0, HorizonLine.dimensions.WIDTH];
    this.yPos = HorizonLine.dimensions.YPOS;
  },

  /**
   * Return the crop x position of a type.
   */
  getRandomType: function () {
    return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
  },

  /**
   * Draw the horizon line.
   */
  draw: function () {
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.sourceXPos[0],
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[0],
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    );

    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.sourceXPos[1],
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[1],
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    );
  },

  /**
   * Update the x position of an indivdual piece of the line.
   * @param {number} pos Line position.
   * @param {number} increment
   */
  updateXPos: function (pos, increment) {
    var line1 = pos;
    var line2 = pos == 0 ? 1 : 0;

    this.xPos[line1] -= increment;
    this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;

    if (this.xPos[line1] <= -this.dimensions.WIDTH) {
      this.xPos[line1] += this.dimensions.WIDTH * 2;
      this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
      this.sourceXPos[line1] = this.getRandomType() + this.spritePos.x;
    }
  },

  /**
   * Update the horizon line.
   * @param {number} deltaTime
   * @param {number} speed
   */
  update: function (deltaTime, speed) {
    var increment = Math.floor(speed * (FPS / 1000) * deltaTime);

    if (this.xPos[0] <= 0) {
      this.updateXPos(0, increment);
    } else {
      this.updateXPos(1, increment);
    }
    this.draw();
  },

  /**
   * Reset horizon to the starting position.
   */
  reset: function () {
    this.xPos[0] = 0;
    this.xPos[1] = HorizonLine.dimensions.WIDTH;
  },
};

//******************************************************************************


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
  updateClouds: function (deltaTime, speed) {
    var cloudSpeed = (this.cloudSpeed / 1000) * deltaTime * speed;
    var numClouds = this.clouds.length;

    if (numClouds) {
      for (var i = numClouds - 1; i >= 0; i--) {
        this.clouds[i].update(cloudSpeed);
      }

      var lastCloud = this.clouds[numClouds - 1];

      // Check for adding a new cloud.
      if (
        numClouds < this.config.MAX_CLOUDS &&
        this.dimensions.WIDTH - lastCloud.xPos > lastCloud.cloudGap &&
        this.cloudFrequency > Math.random()
      ) {
        this.addCloud();
      }

      // Remove expired clouds.
      this.clouds = this.clouds.filter(function (obj) {
        return !obj.remove;
      });
    } else {
      this.addCloud();
    }
  },

  /**
   * Update the obstacle positions.
   * @param {number} deltaTime
   * @param {number} currentSpeed
   */
  updateObstacles: function (deltaTime, currentSpeed) {
    // Obstacles, move to Horizon layer.
    var updatedObstacles = this.obstacles.slice(0);

    for (var i = 0; i < this.obstacles.length; i++) {
      var obstacle = this.obstacles[i];
      obstacle.update(deltaTime, currentSpeed);

      // Clean up existing obstacles.
      if (obstacle.remove) {
        updatedObstacles.shift();
      }
    }
    this.obstacles = updatedObstacles;

    if (this.obstacles.length > 0) {
      var lastObstacle = this.obstacles[this.obstacles.length - 1];

      if (
        lastObstacle &&
        !lastObstacle.followingObstacleCreated &&
        lastObstacle.isVisible() &&
        lastObstacle.xPos + lastObstacle.width + lastObstacle.gap <
          this.dimensions.WIDTH
      ) {
        this.addNewObstacle(currentSpeed);
        lastObstacle.followingObstacleCreated = true;
      }
    } else {
      // Create new obstacles.
      this.addNewObstacle(currentSpeed);
    }
  },

  removeFirstObstacle: function () {
    this.obstacles.shift();
  },

  /**
   * Add a new obstacle.
   * @param {number} currentSpeed
   */
  addNewObstacle: function (currentSpeed) {
    var obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
    var obstacleType = Obstacle.types[obstacleTypeIndex];

    // Check for multiples of the same type of obstacle.
    // Also check obstacle is available at current speed.
    if (
      this.duplicateObstacleCheck(obstacleType.type) ||
      currentSpeed < obstacleType.minSpeed
    ) {
      this.addNewObstacle(currentSpeed);
    } else {
      var obstacleSpritePos = this.spritePos[obstacleType.type];

      this.obstacles.push(
        new Obstacle(
          this.canvasCtx,
          obstacleType,
          obstacleSpritePos,
          this.dimensions,
          this.gapCoefficient,
          currentSpeed,
          obstacleType.width
        )
      );

      this.obstacleHistory.unshift(obstacleType.type);

      if (this.obstacleHistory.length > 1) {
        this.obstacleHistory.splice(Runner.config.MAX_OBSTACLE_DUPLICATION);
      }
    }
  },

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

