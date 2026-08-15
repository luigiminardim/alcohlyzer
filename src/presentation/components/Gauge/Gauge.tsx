import { useEffect } from 'react';
import { Notifications, notifications } from '@mantine/notifications';
import { IntensityZone, ZoneStatus } from '../../../domain/value-objects/IntensityZone';
import { UiState } from '../../hooks/useAlcohlyzer';
import { useGaugeAnimation } from '../../hooks/useGaugeAnimation';
import { GaugeNeedle } from './GaugeNeedle';
import { GaugeZone } from './GaugeZone';
import { ZoneVisor } from '../ZoneVisor/ZoneVisor';
import { getZoneColor } from '../../zoneColors';
import classes from './Gauge.module.css';

interface GaugeProps {
  state: UiState;
  measuredZone: IntensityZone | null;
  currentIntensity: number;
  onZonePreset: (zone: IntensityZone) => void;
}

export function Gauge({ state, measuredZone, currentIntensity, onZonePreset }: GaugeProps) {
  const { needleAngle, snapToZone, setAngleFromIntensity } = useGaugeAnimation();

  const handleZoneDoubleTap = (zone: IntensityZone) => {
    if (state === UiState.IDLE) {
      onZonePreset(zone);
      notifications.show({
        id: 'zone-preset',
        message: '',
        color: getZoneColor(zone.status),
        autoClose: 500,
        withCloseButton: false,
        styles: {
          root: {
            minWidth: 'unset',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            padding: 0,
            opacity: 0.85,
          },
          body: { display: 'none' },
        },
      });
    }
  };

  useEffect(() => {
    if (state === UiState.IDLE) {
      snapToZone(null);
    } else if (state === UiState.LISTENING || state === UiState.RESULT) {
      setAngleFromIntensity(currentIntensity);
    }
  }, [state, currentIntensity, snapToZone, setAngleFromIntensity]);

  const pathGreen = 'M 30,100 A 70,70 0 0,1 65,39.39';
  const pathYellow = 'M 65,39.39 A 70,70 0 0,1 135,39.39';
  const pathRed = 'M 135,39.39 A 70,70 0 0,1 170,100';

  return (
    <div className={classes.gaugeContainer}>
      <Notifications position="bottom-center" zIndex={1000} limit={1} />
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className={classes.gaugeSvg}>
        <GaugeZone
          zone={IntensityZone.LOW_ZONE}
          pathData={pathGreen}
          isResult={state === UiState.RESULT && measuredZone?.status === ZoneStatus.LOW}
          onDoubleTap={handleZoneDoubleTap}
        />
        <GaugeZone
          zone={IntensityZone.MID_ZONE}
          pathData={pathYellow}
          isResult={state === UiState.RESULT && measuredZone?.status === ZoneStatus.MID}
          onDoubleTap={handleZoneDoubleTap}
        />
        <GaugeZone
          zone={IntensityZone.HIGH_ZONE}
          pathData={pathRed}
          isResult={state === UiState.RESULT && measuredZone?.status === ZoneStatus.HIGH}
          onDoubleTap={handleZoneDoubleTap}
        />

        <line
          x1="15"
          y1="100"
          x2="188"
          y2="100"
          stroke="var(--mantine-color-default-border)"
          strokeWidth="2"
        />

        <GaugeNeedle angle={needleAngle} />
      </svg>
      <div className={classes.visorWrapper}>
        <ZoneVisor state={state} measuredZone={measuredZone} />
      </div>
    </div>
  );
}
