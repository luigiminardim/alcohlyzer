import { Intensity } from "./Intensity";
import { IntensityZone } from "./IntensityZone";

export class AlcohlyzerResult {
  constructor(public readonly intensity: Intensity) {}

  get zone(): IntensityZone {
    return IntensityZone.fromIntensity(this.intensity);
  }
}
