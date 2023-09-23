import { IS_HIDPI } from "../shared_constant";
import { NightMode } from ".";
import { Runner } from "../Runner/index";
const NightMode_draw= function () {
    var moonSourceWidth =
      this.currentPhase == 3
        ? NightMode.config.WIDTH * 2
        : NightMode.config.WIDTH;
    var moonSourceHeight = NightMode.config.HEIGHT;
    var moonSourceX = this.spritePos.x + NightMode.phases[this.currentPhase];
    var moonOutputWidth = moonSourceWidth;
    var starSize = NightMode.config.STAR_SIZE;
    var starSourceX = Runner.spriteDefinition.LDPI.STAR.x;

    if (IS_HIDPI) {
      moonSourceWidth *= 2;
      moonSourceHeight *= 2;
      moonSourceX = this.spritePos.x + NightMode.phases[this.currentPhase] * 2;
      starSize *= 2;
      starSourceX = Runner.spriteDefinition.HDPI.STAR.x;
    }

    this.canvasCtx.save();
    this.canvasCtx.globalAlpha = this.opacity;

    // Stars.
    if (this.drawStars) {
      for (var i = 0; i < NightMode.config.NUM_STARS; i++) {
        this.canvasCtx.drawImage(
          Runner.imageSprite,
          starSourceX,
          this.stars[i].sourceY,
          starSize,
          starSize,
          Math.round(this.stars[i].x),
          this.stars[i].y,
          NightMode.config.STAR_SIZE,
          NightMode.config.STAR_SIZE
        );
      }
    }

    // Moon.
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      moonSourceX,
      this.spritePos.y,
      moonSourceWidth,
      moonSourceHeight,
      Math.round(this.xPos),
      this.yPos,
      moonOutputWidth,
      NightMode.config.HEIGHT
    );

    this.canvasCtx.globalAlpha = 1;
    this.canvasCtx.restore();
  }

  export {NightMode_draw}
