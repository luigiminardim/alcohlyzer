import { memo } from 'react';
import { IntensityZone } from '../../../domain/value-objects/IntensityZone';
import { getZoneColor } from '../../zoneColors';
import classes from './Gauge.module.css';

interface GaugeZoneProps {
  zone: IntensityZone;
  pathData: string;
  isResult?: boolean;
  onDoubleTap: (zone: IntensityZone) => void;
}

export const GaugeZone = memo(function GaugeZone({
  zone,
  pathData,
  isResult,
  onDoubleTap,
}: GaugeZoneProps) {
  const color = getZoneColor(zone.status);

  return (
    <path
      d={pathData}
      fill="none"
      stroke={color}
      strokeWidth="30"
      className={`${classes.zonePath} ${isResult ? classes.zoneResult : ''}`}
      style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
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
