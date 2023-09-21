import { IS_HIDPI } from "../shared_constant";
const obstacle_draw= function () {
      var sourceWidth = this.typeConfig.width;
      var sourceHeight = this.typeConfig.height;

      if (IS_HIDPI) {
        sourceWidth = sourceWidth * 2;
        sourceHeight = sourceHeight * 2;
      }

      // X position in sprite.
      var sourceX =
        sourceWidth * this.size * (0.5 * (this.size - 1)) + this.spritePos.x;

      // Animation frames.
      if (this.currentFrame > 0) {
        sourceX += sourceWidth * this.currentFrame;
      }

      this.canvasCtx.drawImage(
        Runner.imageSprite,
        sourceX,
        this.spritePos.y,
        sourceWidth * this.size,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.typeConfig.width * this.size,
        this.typeConfig.height
      );
    }

export {obstacle_draw}