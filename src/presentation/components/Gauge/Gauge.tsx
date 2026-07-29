import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { IntensityZone, ZoneStatus } from '../../../domain/value-objects/IntensityZone';
import { UiState } from '../../hooks/useBarfometer';
import type { Intensity } from '../../../domain/value-objects/Intensity';
import { useGaugeAnimation } from '../../hooks/useGaugeAnimation';
import { GaugeNeedle } from './GaugeNeedle';
import { GaugeZone } from './GaugeZone';
import classes from './Gauge.module.css';

interface GaugeProps {
  state: UiState;
  measuredZone: IntensityZone | null;
  measuredIntensity: Intensity | null;
  onZonePreset: (zone: IntensityZone) => void;
  onAnimationComplete: () => void;
}

export function Gauge({ state, measuredZone, measuredIntensity, onZonePreset, onAnimationComplete }: GaugeProps) {
  const { t } = useTranslation();
  const { needleAngle, snapToZone, animateWobble } = useGaugeAnimation();

  const handleZoneDoubleTap = (zone: IntensityZone) => {
    if (state === UiState.IDLE) {
      onZonePreset(zone);
      const color = zone.status === ZoneStatus.LOW ? 'green' : zone.status === ZoneStatus.MID ? 'yellow' : 'red';
      const label = t(`gauge.${zone.status.toLowerCase()}`);
      notifications.show({
        message: t('toast.zoneSet', { zone: label }),
        color,
      });
    }
  };

  useEffect(() => {
    if (state === UiState.IDLE) {
      snapToZone(null);
    } else if (state === UiState.ANIMATING && measuredZone && measuredIntensity) {
      animateWobble(measuredZone, measuredIntensity, onAnimationComplete);
    }
  }, [state, measuredZone, measuredIntensity, snapToZone, animateWobble, onAnimationComplete]);

  const pathGreen = "M 30,100 A 70,70 0 0,1 65,39.39";
  const pathYellow = "M 65,39.39 A 70,70 0 0,1 135,39.39";
  const pathRed = "M 135,39.39 A 70,70 0 0,1 170,100";

  return (
    <div className={classes.gaugeContainer}>
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className={classes.gaugeSvg}>
        <GaugeZone zone={IntensityZone.LOW_ZONE} pathData={pathGreen} onDoubleTap={handleZoneDoubleTap} />
        <GaugeZone zone={IntensityZone.MID_ZONE} pathData={pathYellow} onDoubleTap={handleZoneDoubleTap} />
        <GaugeZone zone={IntensityZone.HIGH_ZONE} pathData={pathRed} onDoubleTap={handleZoneDoubleTap} />
        
        <GaugeNeedle angle={needleAngle} />
        
        <line x1="20" y1="100" x2="180" y2="100" stroke="#495057" strokeWidth="2" />
      </svg>
    </div>
  );
}
