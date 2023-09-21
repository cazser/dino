const Runner_startGame =function () {
    this.runningTime = 0;
    this.playingIntro = false;
    this.tRex.playingIntro = false;
    this.containerEl.style.webkitAnimation = "";
    this.playCount++;

    // Handle tabbing off the page. Pause the current game.
    document.addEventListener(
      Runner.events.VISIBILITY,
      this.onVisibilityChange.bind(this)
    );

    window.addEventListener(
      Runner.events.BLUR,
      this.onVisibilityChange.bind(this)
    );

    window.addEventListener(
      Runner.events.FOCUS,
      this.onVisibilityChange.bind(this)
    );
  }

  export {Runner_startGame}