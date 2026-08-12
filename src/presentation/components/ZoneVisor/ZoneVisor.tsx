import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IntensityZone, getZoneColor } from '../../../domain/value-objects/IntensityZone';
import { UiState } from '../../hooks/useBarfometer';
import classes from './ZoneVisor.module.css';

interface ZoneVisorProps {
  state: UiState;
  measuredZone: IntensityZone | null;
}

// Helper to convert hex to rgb string for CSS vars
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result && result[1] && result[2] && result[3]) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '255, 255, 255';
}

function pickRandom(phrases: string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)] ?? phrases[0] ?? '';
}

export function ZoneVisor({ state, measuredZone }: ZoneVisorProps) {
  const { t, i18n } = useTranslation();

  // Randomize a phrase once per result+language combination
  const resultPhrase = useMemo(() => {
    if (state !== UiState.RESULT || !measuredZone) return '';
    const key = `result.${measuredZone.status.toLowerCase()}`;
    const phrases = t(key, { returnObjects: true });
    return Array.isArray(phrases) ? pickRandom(phrases) : (phrases as string);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measuredZone, state, i18n.language]);

  let content = '';
  let className = classes.visor;
  let colorRgb = '255, 255, 255'; // default

  if (state === UiState.LISTENING) {
    content = t('visor.listening');
    className = `${classes.visor} ${classes.visorListening}`;
  } else if (state === UiState.RESULT && measuredZone) {
    content = resultPhrase;
    className = `${classes.visor} ${classes.visorResult}`;
    colorRgb = hexToRgb(getZoneColor(measuredZone));
  }

  return (
    <div className={classes.visorContainer}>
      {content && (
        <div
          className={className}
          style={{
            '--zone-color-rgb': colorRgb
          } as React.CSSProperties}
        >
          {content}
        </div>
      )}
    </div>
  );
}
