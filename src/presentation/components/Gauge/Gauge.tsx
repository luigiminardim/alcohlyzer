import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { Zone } from '../../../domain/value-objects/Zone';
import { SessionState } from '../../../domain/entities/BarfometerSession';
import type { BlowResult } from '../../../domain/value-objects/BlowResult';
import { useGaugeAnimation } from '../../hooks/useGaugeAnimation';
import { GaugeNeedle } from './GaugeNeedle';
import { GaugeZone } from './GaugeZone';
import classes from './Gauge.module.css';

interface GaugeProps {
  state: SessionState;
  result: BlowResult | null;
  onZonePreset: (zone: Zone) => void;
  onAnimationComplete: () => void;
}

export function Gauge({ state, result, onZonePreset, onAnimationComplete }: GaugeProps) {
  const { t } = useTranslation();
  const { needleAngle, snapToZone, animateWobble } = useGaugeAnimation();

  // Handle double-tap preset
  const handleZoneDoubleTap = (zone: Zone) => {
    if (state === SessionState.IDLE || state === SessionState.ZONE_SET) {
      onZonePreset(zone);
      notifications.show({
        message: t('toast.zoneSet', { zone: t(`gauge.${zone.toLowerCase()}`) }),
        color: zone === Zone.GREEN ? 'green' : zone === Zone.YELLOW ? 'yellow' : 'red',
      });
    }
  };

  // Sync animation with state
  useEffect(() => {
    if (state === SessionState.IDLE) {
      snapToZone(null);
    } else if (state === SessionState.ANIMATING && result) {
      animateWobble(result.zone, result.animationDurationMs, onAnimationComplete);
    }
  }, [state, result, snapToZone, animateWobble, onAnimationComplete]);

  // SVG Paths for the three zones (semi-circle divided by 3)
  // R=70, Center=100,100
  const pathGreen = "M 30,100 A 70,70 0 0,1 65,39.39"; // 180 to 120 deg
  const pathYellow = "M 65,39.39 A 70,70 0 0,1 135,39.39"; // 120 to 60 deg
  const pathRed = "M 135,39.39 A 70,70 0 0,1 170,100"; // 60 to 0 deg

  return (
    <div className={classes.gaugeContainer}>
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid meet"
        className={classes.gaugeSvg}
      >
        <GaugeZone zone={Zone.GREEN} pathData={pathGreen} onDoubleTap={handleZoneDoubleTap} />
        <GaugeZone zone={Zone.YELLOW} pathData={pathYellow} onDoubleTap={handleZoneDoubleTap} />
        <GaugeZone zone={Zone.RED} pathData={pathRed} onDoubleTap={handleZoneDoubleTap} />
        
        <GaugeNeedle angle={needleAngle} />
        
        {/* Baseline */}
        <line x1="20" y1="100" x2="180" y2="100" stroke="#495057" strokeWidth="2" />
      </svg>
    </div>
  );
}
