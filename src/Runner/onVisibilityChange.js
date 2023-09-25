const Runner_onVisibilityChange =  function (e) {
    if (
      document.hidden ||
      document.webkitHidden ||
      e.type == "blur" ||
      document.visibilityState != "visible"
    ) {
      this.stop();
    } else if (!this.crashed) {
      this.tRex.reset();
      this.play();
    }
  }

export {Runner_onVisibilityChange}