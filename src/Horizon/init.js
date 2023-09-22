import { HorizonLine } from "../HorizonLine/index";
import { NightMode } from "../NightMode/index";
const Horizon_init= function () {
    this.addCloud();
    this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON);
    this.nightMode = new NightMode(
      this.canvas,
      this.spritePos.MOON,
      this.dimensions.WIDTH
    );
  }

export {Horizon_init}