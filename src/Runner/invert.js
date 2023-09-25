import { Runner } from ".";
import { Runner_classes } from "./classes";
Runner.classes = Runner_classes
const Runner_invert =  function (reset) {
    if (reset) {
      document.body.classList.toggle(Runner.classes.INVERTED, false);
      this.invertTimer = 0;
      this.inverted = false;
    } else {
      this.inverted = document.body.classList.toggle(
        Runner.classes.INVERTED,
        this.invertTrigger
      );
    }
  }

  export {Runner_invert}
