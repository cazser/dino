import { IS_MOBILE } from "../shared_constant";
const Runner_stopListening = function () {
    document.removeEventListener(Runner.events.KEYDOWN, this);
    document.removeEventListener(Runner.events.KEYUP, this);

    if (IS_MOBILE) {
      this.touchController.removeEventListener(Runner.events.TOUCHSTART, this);
      this.touchController.removeEventListener(Runner.events.TOUCHEND, this);
      this.containerEl.removeEventListener(Runner.events.TOUCHSTART, this);
    } else {
      document.removeEventListener(Runner.events.MOUSEDOWN, this);
      document.removeEventListener(Runner.events.MOUSEUP, this);
    }
  }

  export {Runner_stopListening}