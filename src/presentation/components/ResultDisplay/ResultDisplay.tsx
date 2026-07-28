import { useTranslation } from 'react-i18next';
import { Overlay, Transition, Title, Button, Stack } from '@mantine/core';
import type { BlowResult } from '../../../domain/value-objects/BlowResult';
import { getZoneColor } from '../../../domain/value-objects/Zone';
import classes from './ResultDisplay.module.css';

interface ResultDisplayProps {
  visible: boolean;
  result: BlowResult | null;
  onReset: () => void;
}

export function ResultDisplay({ visible, result, onReset }: ResultDisplayProps) {
  const { t } = useTranslation();

  const color = result ? getZoneColor(result.zone) : '#000';
  const labelKey = result ? `result.${result.zone.toLowerCase()}` : '';

  return (
    <Transition mounted={visible} transition="pop" duration={400} timingFunction="ease">
      {(styles) => (
        <div style={styles} className={classes.container}>
          <Overlay color="#000" backgroundOpacity={0.85} zIndex={100} />
          <div className={classes.content} style={{ zIndex: 101 }}>
            <Stack align="center" gap="xl">
              <Title
                order={1}
                className={classes.resultText}
                style={{
                  color,
                  textShadow: `0 0 20px ${color}`,
                }}
              >
                {t(labelKey)}
              </Title>

              <Button
                size="xl"
                radius="xl"
                color="dark"
                variant="white"
                onClick={onReset}
                className={classes.resetButton}
              >
                {t('action.reset')}
              </Button>
            </Stack>
          </div>
        </div>
      )}
    </Transition>
  );
}
