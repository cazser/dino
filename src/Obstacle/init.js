import { IS_MOBILE } from "../shared_constant";
const Obstacle_init = function (speed) {
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
    }

    export {Obstacle_init}