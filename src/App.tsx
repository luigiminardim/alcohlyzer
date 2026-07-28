import { useTranslation } from 'react-i18next';
import { Button, Stack, Title, Text, Container } from '@mantine/core';
import { useBarfometer } from './presentation/hooks/useBarfometer';
import { SessionState } from './domain/entities/BarfometerSession';
import { Gauge } from './presentation/components/Gauge/Gauge';
import { ResultDisplay } from './presentation/components/ResultDisplay/ResultDisplay';
import { LanguageToggle } from './presentation/components/LanguageToggle/LanguageToggle';

function App() {
  const { t } = useTranslation();
  const {
    state,
    result,
    micError,
    setZone,
    startTest,
    completeAnimation,
    reset,
  } = useBarfometer();

  const isTesting = state === SessionState.LISTENING || state === SessionState.ANIMATING;
  const isIdle = state === SessionState.IDLE;

  return (
    <>
      <LanguageToggle />
      
      <Container size="sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Stack align="center" gap="xl" w="100%">
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title order={1} c="white">Barfometer</Title>
            <Text c="dimmed" size="lg" mt="xs">The Ultimate Truth Teller</Text>
          </div>

          <Gauge
            state={state}
            result={result}
            onZonePreset={setZone}
            onAnimationComplete={completeAnimation}
          />

          <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem', width: '100%' }}>
            {!isTesting && (
              <Button
                size="xl"
                color={state === SessionState.ZONE_SET ? 'blue' : 'dark'}
                onClick={startTest}
                disabled={isIdle}
                fullWidth
                style={{ maxWidth: 300 }}
              >
                {t('action.start')}
              </Button>
            )}

            {state === SessionState.LISTENING && (
              <Text size="xl" fw={700} c="blue" className="pulse-text">
                {t('action.blow')}
              </Text>
            )}
          </div>

          {micError && (
            <Text c="red" fw={500} size="sm" mt="md" ta="center">
              Microphone error: {micError}
            </Text>
          )}

        </Stack>
      </Container>

      <ResultDisplay
        visible={state === SessionState.RESULT}
        result={result}
        onReset={reset}
      />
    </>
  );
}

export default App;
