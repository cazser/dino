const Runner_clearCanvas = function () {
    this.canvasCtx.clearRect(
      0,
      0,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    );
  }

export {Runner_clearCanvas}