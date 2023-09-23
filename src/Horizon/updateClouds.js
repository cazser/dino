const Horizon_updateClouds = function (deltaTime, speed) {
    var cloudSpeed = (this.cloudSpeed / 1000) * deltaTime * speed;
    var numClouds = this.clouds.length;

    if (numClouds) {
      for (var i = numClouds - 1; i >= 0; i--) {
        this.clouds[i].update(cloudSpeed);
      }

      var lastCloud = this.clouds[numClouds - 1];

      // Check for adding a new cloud.
      if (
        numClouds < this.config.MAX_CLOUDS &&
        this.dimensions.WIDTH - lastCloud.xPos > lastCloud.cloudGap &&
        this.cloudFrequency > Math.random()
      ) {
        this.addCloud();
      }

      // Remove expired clouds.
      this.clouds = this.clouds.filter(function (obj) {
        return !obj.remove;
      });
    } else {
      this.addCloud();
    }
  }

  export {Horizon_updateClouds}
