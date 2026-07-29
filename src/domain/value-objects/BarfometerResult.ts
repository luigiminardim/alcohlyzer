import { Intensity } from "./Intensity";
import { IntensityZone } from "./IntensityZone";

export class BarfometerResult {
  constructor(public readonly intensity: Intensity) {}

  get zone(): IntensityZone {
    return IntensityZone.fromIntensity(this.intensity);
  }
}
