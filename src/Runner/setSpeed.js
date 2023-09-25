import { DEFAULT_WIDTH } from "../shared_constant";
const Runner_setSpeed = function (opt_speed) {
    var speed = opt_speed || this.currentSpeed;

    // Reduce the speed on smaller mobile screens.
    if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
      var mobileSpeed =
        ((speed * this.dimensions.WIDTH) / DEFAULT_WIDTH) *
        this.config.MOBILE_SPEED_COEFFICIENT;
      this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
    } else if (opt_speed) {
      this.currentSpeed = opt_speed;
    }
  }

  export {Runner_setSpeed}
