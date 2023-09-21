import { Runner } from ".";
const Runner_setDisableRunner =  function () {
    this.containerEl = document.createElement("div");
    this.containerEl.className = Runner.classes.SNACKBAR;
    this.containerEl.textContent = loadTimeData.getValue("disabledEasterEgg");
    this.outerContainerEl.appendChild(this.containerEl);

    // Show notification when the activation key is pressed.
    document.addEventListener(
      Runner.events.KEYDOWN,
      function (e) {
        if (Runner.keycodes.JUMP[e.keyCode]) {
          this.containerEl.classList.add(Runner.classes.SNACKBAR_SHOW);
          document.querySelector(".icon").classList.add("icon-disabled");
        }
      }.bind(this)
    );
  }

  export {Runner_setDisableRunner}