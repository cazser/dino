const Obstacle_updateObstacles= function (deltaTime, currentSpeed) {
    // Obstacles, move to Horizon layer.
    var updatedObstacles = this.obstacles.slice(0);

    for (var i = 0; i < this.obstacles.length; i++) {
      var obstacle = this.obstacles[i];
      obstacle.update(deltaTime, currentSpeed);

      // Clean up existing obstacles.
      if (obstacle.remove) {
        updatedObstacles.shift();
      }
    }
    this.obstacles = updatedObstacles;

    if (this.obstacles.length > 0) {
      var lastObstacle = this.obstacles[this.obstacles.length - 1];

      if (
        lastObstacle &&
        !lastObstacle.followingObstacleCreated &&
        lastObstacle.isVisible() &&
        lastObstacle.xPos + lastObstacle.width + lastObstacle.gap <
          this.dimensions.WIDTH
      ) {
        this.addNewObstacle(currentSpeed);
        lastObstacle.followingObstacleCreated = true;
      }
    } else {
      // Create new obstacles.
      this.addNewObstacle(currentSpeed);
    }
  }

  export {Obstacle_updateObstacles}
