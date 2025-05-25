
import { useState, useEffect, useCallback } from 'react';

// FIX: Renamed original SpeechRecognition interface to SpeechRecognitionInstance to avoid naming conflicts
// and to clearly indicate it's an instance type.
// However, the problem was mainly in the `declare global` part. Let's define the instance and constructor types carefully.

// This interface describes the instance of a speech recognition object.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// FIX: Define the type for the SpeechRecognition constructor.
interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    // FIX: Use the SpeechRecognitionConstructor type for window.SpeechRecognition and window.webkitSpeechRecognition.
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
  }
}

const getSpeechRecognition = (): SpeechRecognition | null => {
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognitionAPI) {
    // FIX: The 'as SpeechRecognition' cast is no longer needed due to correct typing of SpeechRecognitionAPI.
    return new SpeechRecognitionAPI();
  }
  return null;
};


export const useVoiceRecognition = (onStop?: (finalTranscript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    recognition.continuous = true; // Keep listening until explicitly stopped
    recognition.interimResults = true; // Get results as they come
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript + interimTranscript); // Append interim results for live feedback
       if (finalTranscript && onStop) { // If a final result segment is received.
         // this might be too aggressive for continuous = true.
         // onStop(finalTranscript);
       }
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      // This event fires when recognition stops, either manually or due to an error/timeout.
      // If it was stopped manually, isListening would already be false.
      // If it stopped due to an error/timeout, we ensure isListening is set to false.
      if (isListening) { // if it stopped unexpectedly
        setIsListening(false);
        if (onStop && transcript.trim()) { // Pass the full transcript if stopped unexpectedly
          onStop(transcript);
        }
      }
    };

    setRecognitionInstance(recognition);

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Should only run once on mount


  const startListening = useCallback(() => {
    if (recognitionInstance && !isListening) {
      setTranscript(''); // Reset transcript before starting
      setError(null);
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (e: any) {
        setError(`Could not start recognition: ${e.message}`);
        setIsListening(false);
      }
    }
  }, [recognitionInstance, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionInstance && isListening) {
      recognitionInstance.stop();
      setIsListening(false);
      if (onStop && transcript.trim()) {
        onStop(transcript); // Pass final transcript on manual stop
      }
    }
  }, [recognitionInstance, isListening, transcript, onStop]);

  return { isListening, transcript, error, startListening, stopListening, setTranscript };
};
