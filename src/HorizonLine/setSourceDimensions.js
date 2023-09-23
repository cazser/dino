import { HorizonLine } from ".";
import { IS_HIDPI } from "../shared_constant";
const HorizonLine_setSourceDimensions= function () {
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
  }

  export {HorizonLine_setSourceDimensions}