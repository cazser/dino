import { NightMode } from ".";
import { Runner } from "../Runner/index";
import { getRandomNum } from "../utils";
import { IS_HIDPI } from "../shared_constant";
const NightMode_placeStars =  function () {
    var segmentSize = Math.round(
      this.containerWidth / NightMode.config.NUM_STARS
    );

    for (var i = 0; i < NightMode.config.NUM_STARS; i++) {
      this.stars[i] = {};
      this.stars[i].x = getRandomNum(segmentSize * i, segmentSize * (i + 1));
      this.stars[i].y = getRandomNum(0, NightMode.config.STAR_MAX_Y);

      if (IS_HIDPI) {
        this.stars[i].sourceY =
          Runner.spriteDefinition.HDPI.STAR.y +
          NightMode.config.STAR_SIZE * 2 * i;
      } else {
        this.stars[i].sourceY =
          Runner.spriteDefinition.LDPI.STAR.y + NightMode.config.STAR_SIZE * i;
      }
    }
  }


export {NightMode_placeStars}