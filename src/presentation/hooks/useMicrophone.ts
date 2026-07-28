import { useEffect, useRef, useState } from 'react';
import type { MicrophonePort, SoundData } from '../../domain/ports/MicrophonePort';

interface UseMicrophoneResult {
  isListening: boolean;
  requestAccess: () => Promise<void>;
  startListening: (onSoundData: (data: SoundData) => void) => void;
  stopListening: () => void;
  error: string | null;
}

export function useMicrophone(micPort: MicrophonePort): UseMicrophoneResult {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of the port instance in case it changes, though usually it's static
  const portRef = useRef(micPort);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      if (portRef.current.isListening()) {
        portRef.current.stopListening();
      }
    };
  }, []);

  const requestAccess = async () => {
    setError(null);
    try {
      await micPort.requestAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const startListening = (onSoundData: (data: SoundData) => void) => {
    try {
      micPort.startListening(onSoundData);
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const stopListening = () => {
    micPort.stopListening();
    setIsListening(false);
  };

  return {
    isListening,
    requestAccess,
    startListening,
    stopListening,
    error,
  };
}
