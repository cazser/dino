import { IS_MOBILE } from "../shared_constant";
const Runner_onKeyDown= function (e) {
    // Prevent native page scrolling whilst tapping on mobile.
    if (IS_MOBILE && this.playing) {
      e.preventDefault();
    }

    if (e.target != this.detailsButton) {
      if (
        !this.crashed &&
        (Runner.keycodes.JUMP[e.keyCode] || e.type == Runner.events.TOUCHSTART)
      ) {
        if (!this.playing) {
          this.loadSounds();
          this.playing = true;
          this.update();
          if (window.errorPageController) {
            errorPageController.trackEasterEgg();
          }
        }
        //  Play sound effect and jump on starting the game for the first time.
        if (!this.tRex.jumping && !this.tRex.ducking) {
          this.playSound(this.soundFx.BUTTON_PRESS);
          this.tRex.startJump(this.currentSpeed);
        }
      }

      if (
        this.crashed &&
        e.type == Runner.events.TOUCHSTART &&
        e.currentTarget == this.containerEl
      ) {
        this.restart();
      }
    }

    if (this.playing && !this.crashed && Runner.keycodes.DUCK[e.keyCode]) {
      e.preventDefault();
      if (this.tRex.jumping) {
        // Speed drop, activated only when jump key is not pressed.
        this.tRex.setSpeedDrop();
      } else if (!this.tRex.jumping && !this.tRex.ducking) {
        // Duck.
        this.tRex.setDuck(true);
      }
    }
  }

export {Runner_onKeyDown}