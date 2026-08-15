import { Intensity } from './Intensity';

export enum ZoneStatus {
  LOW = 'LOW',
  MID = 'MID',
  HIGH = 'HIGH',
}

export class IntensityZone {
  constructor(public readonly status: ZoneStatus) {}

  static fromIntensity(intensity: Intensity): IntensityZone {
    if (intensity.percent < 33) return IntensityZone.LOW_ZONE;
    if (intensity.percent < 66) return IntensityZone.MID_ZONE;
    return IntensityZone.HIGH_ZONE;
  }

  intensityBoundary(): [number, number] {
    switch (this.status) {
      case ZoneStatus.LOW:
        return [0, 33];
      case ZoneStatus.MID:
        return [33, 66];
      case ZoneStatus.HIGH:
        return [66, 100];
    }
  }

  isEquals(other: IntensityZone): boolean {
    return this.status === other.status;
  }

  static readonly LOW_ZONE = new IntensityZone(ZoneStatus.LOW);
  static readonly MID_ZONE = new IntensityZone(ZoneStatus.MID);
  static readonly HIGH_ZONE = new IntensityZone(ZoneStatus.HIGH);
}

export const INTENSITY_ZONES = [
  IntensityZone.LOW_ZONE,
  IntensityZone.MID_ZONE,
  IntensityZone.HIGH_ZONE,
];

export function getZoneColor(zone: IntensityZone): string {
  switch (zone.status) {
    case ZoneStatus.LOW:
      return '#40c057'; // Green
    case ZoneStatus.MID:
      return '#fab005'; // Yellow
    case ZoneStatus.HIGH:
      return '#fa5252'; // Red
  }
}
