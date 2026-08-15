import { ZoneStatus } from '../domain/value-objects/IntensityZone';

export type ZoneColor = '#7FA653' | '#EBC97F' | '#D45F58';

const zoneColors: Record<ZoneStatus, ZoneColor> = {
  [ZoneStatus.LOW]: '#7FA653',
  [ZoneStatus.MID]: '#EBC97F',
  [ZoneStatus.HIGH]: '#D45F58',
};

export function getZoneColor(status: ZoneStatus): ZoneColor {
  return zoneColors[status];
}
