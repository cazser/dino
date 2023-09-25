import { Runner } from ".";
const Runner_isLeftClickOnCanvas = function (e) {
    return (
      e.button != null &&
      e.button < 2 &&
      e.type == Runner.events.MOUSEUP &&
      e.target == this.canvas
    );
  }

  export {Runner_isLeftClickOnCanvas}