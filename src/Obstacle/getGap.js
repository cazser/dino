import { Obstacle } from ".";
import { getRandomNum } from "../utils";
const getGap= function (gapCoefficient, speed) {
      var minGap = Math.round(
        this.width * speed + this.typeConfig.minGap * gapCoefficient
      );
      var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
      return getRandomNum(minGap, maxGap);
    }

export {getGap}