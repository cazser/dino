import { Trex } from "../Trex/index";
const Runner_playIntro = function () {
    if (!this.activated && !this.crashed) {
      this.playingIntro = true;
      this.tRex.playingIntro = true;

      // CSS animation definition.
      var keyframes =
        "@-webkit-keyframes intro { " +
        "from { width:" +
        Trex.config.WIDTH +
        "px }" +
        "to { width: " +
        this.dimensions.WIDTH +
        "px }" +
        "}";

      // create a style sheet to put the keyframe rule in
      // and then place the style sheet in the html head
      var sheet = document.createElement("style");
      sheet.innerHTML = keyframes;
      document.head.appendChild(sheet);

      this.containerEl.addEventListener(
        Runner.events.ANIM_END,
        this.startGame.bind(this)
      );

      this.containerEl.style.webkitAnimation = "intro .4s ease-out 1 both";
      this.containerEl.style.width = this.dimensions.WIDTH + "px";

      // if (this.touchController) {
      //     this.outerContainerEl.appendChild(this.touchController);
      // }
      this.playing = true;
      this.activated = true;
    } else if (this.crashed) {
      this.restart();
    }
  }

  export{Runner_playIntro}

