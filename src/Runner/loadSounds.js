
import { IS_IOS } from "../shared_constant";
import { Runner } from ".";
import { decodeBase64ToArrayBuffer } from "../utils";
const Runner_loadSounds = function () {
    if (!IS_IOS) {
      this.audioContext = new AudioContext();

      var resourceTemplate = document.getElementById(
        this.config.RESOURCE_TEMPLATE_ID
      ).content;

      for (var sound in Runner.sounds) {
        var soundSrc = resourceTemplate.getElementById(
          Runner.sounds[sound]
        ).src;
        soundSrc = soundSrc.substr(soundSrc.indexOf(",") + 1);
        var buffer = decodeBase64ToArrayBuffer(soundSrc);

        // Async, so no guarantee of order in array.
        this.audioContext.decodeAudioData(
          buffer,
          function (index, audioData) {
            this.soundFx[index] = audioData;
          }.bind(this, sound)
        );
      }
    }
  }

  export {Runner_loadSounds}