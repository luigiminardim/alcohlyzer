import { useMemo, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { IntensityZone } from '../../../domain/value-objects/IntensityZone';
import { UiState } from '../../hooks/useAlcohlyzer';
import { getZoneColor } from '../../zoneColors';
import classes from './ZoneVisor.module.css';

interface ZoneVisorProps {
  state: UiState;
  measuredZone: IntensityZone | null;
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
    return Array.isArray(phrases)
      ? pickRandom(phrases as string[])
      : (phrases as unknown as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measuredZone, state, i18n.language]);

  let content = '';
  let className = classes.visor;
  let colorStyle: CSSProperties | undefined;

  if (state === UiState.LISTENING) {
    content = t('visor.listening');
    className = `${classes.visor} ${classes.visorListening}`;
  } else if (state === UiState.RESULT && measuredZone) {
    content = resultPhrase;
    className = `${classes.visor} ${classes.visorResult}`;
    colorStyle = {
      '--zone-color': getZoneColor(measuredZone.status),
    } as CSSProperties;
  }

  return (
    <div className={classes.visorContainer}>
      {content && (
        <div className={className} style={colorStyle}>
          {content}
        </div>
      )}
    </div>
  );
}
