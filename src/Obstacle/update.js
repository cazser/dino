import { FPS } from "../shared_constant";
const Obstacle_update = function (deltaTime, speed) {
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
    }

    export {Obstacle_update}
