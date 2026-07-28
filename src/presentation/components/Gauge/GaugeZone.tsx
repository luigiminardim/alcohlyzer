import { memo } from 'react';
import { Zone, getZoneColor } from '../../../domain/value-objects/Zone';
import classes from './Gauge.module.css';

interface GaugeZoneProps {
  zone: Zone;
  pathData: string;
  onDoubleTap: (zone: Zone) => void;
}

export const GaugeZone = memo(function GaugeZone({ zone, pathData, onDoubleTap }: GaugeZoneProps) {
  const color = getZoneColor(zone);

  return (
    <path
      d={pathData}
      fill="none"
      stroke={color}
      strokeWidth="30"
      className={classes.zonePath}
      onDoubleClick={() => onDoubleTap(zone)}
      onTouchStart={(e) => {
        // Fast double-tap for mobile
        if (e.detail === 2) {
          onDoubleTap(zone);
        }
      }}
    />
  );
});
