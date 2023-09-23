import { CollisionBox } from "../CollisionBox/index";
const types=  [
  {
    type: "CACTUS_SMALL",
    width: 17,
    height: 35,
    yPos: 105,
    multipleSpeed: 4,
    minGap: 120,
    minSpeed: 0,
    collisionBoxes: [
      new CollisionBox(0, 7, 5, 27),
      new CollisionBox(4, 0, 6, 34),
      new CollisionBox(10, 4, 7, 14),
    ],
  },
  {
    type: "CACTUS_LARGE",
    width: 25,
    height: 50,
    yPos: 90,
    multipleSpeed: 7,
    minGap: 120,
    minSpeed: 0,
    collisionBoxes: [
      new CollisionBox(0, 12, 7, 38),
      new CollisionBox(8, 0, 7, 49),
      new CollisionBox(13, 10, 10, 38),
    ],
  },
  {
    type: "PTERODACTYL",
    width: 46,
    height: 40,
    yPos: [100, 75, 50], // Variable height.
    yPosMobile: [100, 50], // Variable height mobile.
    multipleSpeed: 999,
    minSpeed: 8.5,
    minGap: 150,
    collisionBoxes: [
      new CollisionBox(15, 15, 16, 5),
      new CollisionBox(18, 21, 24, 6),
      new CollisionBox(2, 14, 4, 3),
      new CollisionBox(6, 10, 4, 7),
      new CollisionBox(10, 8, 6, 9),
    ],
    numFrames: 2,
    frameRate: 1000 / 6,
    speedOffset: 0.8,
  },
];

export {types}