import { useTranslation } from 'react-i18next';
import { Button, Stack, Title, Text, Container } from '@mantine/core';
import { useBarfometer, UiState } from './presentation/hooks/useBarfometer';
import { Gauge } from './presentation/components/Gauge/Gauge';
import { LanguageToggle } from './presentation/components/LanguageToggle/LanguageToggle';

function App() {
  const { t } = useTranslation();
  const {
    state,
    measuredZone,
    currentIntensity,
    micError,
    presetZone,
    setZone,
    startTest,
    reset,
  } = useBarfometer();

  let buttonLabel = t('action.start');
  let buttonAction = startTest;
  let buttonColor = presetZone ? 'blue' : 'dark';
  let buttonDisabled = !presetZone && state === UiState.IDLE;
  let buttonVariant = 'filled';

  if (state === UiState.LISTENING) {
    buttonLabel = t('action.abort');
    buttonAction = reset;
    buttonColor = 'red';
    buttonVariant = 'outline';
  } else if (state === UiState.RESULT) {
    buttonLabel = t('action.testAgain');
    buttonAction = reset;
    buttonColor = 'dark';
  }

  return (
    <>
      <LanguageToggle />
      
      <Container size="sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Stack align="center" gap="xl" w="100%">
          
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Title order={1} c="white">{t('app.title')}</Title>
          </div>

          <Gauge
            state={state}
            measuredZone={measuredZone}
            currentIntensity={currentIntensity}
            onZonePreset={setZone}
          />

          <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem', width: '100%' }}>
            <Button
              size="xl"
              color={buttonColor}
              variant={buttonVariant}
              onClick={buttonAction}
              disabled={buttonDisabled}
              fullWidth
              style={{ maxWidth: 300 }}
            >
              {buttonLabel}
            </Button>
          </div>

          {micError && (
            <Text c="red" fw={500} size="sm" mt="md" ta="center">
              Microphone error: {micError}
            </Text>
          )}

        </Stack>
      </Container>

    </>
  );
}

export default App;
