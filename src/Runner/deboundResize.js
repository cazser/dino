const Runner_deboundResize = function () {
    if (!this.resizeTimerId_) {
      this.resizeTimerId_ = setInterval(this.adjustDimensions.bind(this), 250);
    }
  }

  export {Runner_deboundResize}