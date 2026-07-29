import { useEffect, useRef, useState } from 'react';
import type { MicrophonePort } from '../../domain/ports/MicrophonePort';

interface UseMicrophoneResult {
  isListening: boolean;
  requestAccess: () => Promise<void>;
  startListening: (onBlow: (isBlowing: boolean) => void) => void;
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
    const port = portRef.current;
    return () => {
      if (port.isListening()) {
        port.stopListening();
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

  const startListening = (onBlow: (isBlowing: boolean) => void) => {
    try {
      micPort.startListening(onBlow);
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
