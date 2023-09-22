const Runner_updateConfigSetting=function (setting, value) {
    if (setting in this.config && value != undefined) {
      this.config[setting] = value;

      switch (setting) {
        case "GRAVITY":
        case "MIN_JUMP_HEIGHT":
        case "SPEED_DROP_COEFFICIENT":
          this.tRex.config[setting] = value;
          break;
        case "INITIAL_JUMP_VELOCITY":
          this.tRex.setJumpVelocity(value);
          break;
        case "SPEED":
          this.setSpeed(value);
          break;
      }
    }
  }

  export {Runner_updateConfigSetting}