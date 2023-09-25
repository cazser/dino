import { IS_HIDPI } from "../shared_constant";
import { Runner } from ".";
const Runner_loadImages = function () {
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
  }

  export {Runner_loadImages}
