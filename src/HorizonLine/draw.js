import { Runner } from "../Runner/index";
const HorizonLine_draw = function () {
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
  }

  export {HorizonLine_draw}
