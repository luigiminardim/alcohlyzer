import { useTranslation } from 'react-i18next';
import { Button, Stack, Title, Text, Container } from '@mantine/core';
import { useBarfometer, UiState } from './presentation/hooks/useBarfometer';
import { Gauge } from './presentation/components/Gauge/Gauge';
import { ResultDisplay } from './presentation/components/ResultDisplay/ResultDisplay';
import { LanguageToggle } from './presentation/components/LanguageToggle/LanguageToggle';

function App() {
  const { t } = useTranslation();
  const {
    state,
    measuredZone,
    measuredIntensity,
    micError,
    presetZone,
    setZone,
    startTest,
    completeAnimation,
    reset,
  } = useBarfometer();

  const isTesting = state === UiState.LISTENING || state === UiState.ANIMATING;

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
            measuredZone={measuredZone}
            measuredIntensity={measuredIntensity}
            onZonePreset={setZone}
            onAnimationComplete={completeAnimation}
          />

          <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem', width: '100%' }}>
            {!isTesting && (
              <Button
                size="xl"
                color={presetZone ? 'blue' : 'dark'}
                onClick={startTest}
                disabled={!presetZone} // Can only start if a zone is preset
                fullWidth
                style={{ maxWidth: 300 }}
              >
                {t('action.start')}
              </Button>
            )}

            {state === UiState.LISTENING && (
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
        visible={state === UiState.RESULT}
        measuredZone={measuredZone}
        onReset={reset}
      />
    </>
  );
}

export default App;
