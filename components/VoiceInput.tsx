
import React, { useEffect } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import Button from './ui/Button';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  currentTranscript: string; // To sync with parent's text state
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptChange, currentTranscript }) => {
  const { isListening, transcript, error, startListening, stopListening, setTranscript } = useVoiceRecognition(onTranscriptChange);

  useEffect(() => {
    // If parent transcript changes (e.g. user types), update internal transcript
    if (currentTranscript !== transcript) {
        setTranscript(currentTranscript);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTranscript]); // Only listen to parent changes

  useEffect(() => {
    // If internal transcript changes (voice input), update parent
    if (transcript !== currentTranscript) {
        onTranscriptChange(transcript);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]); // Only listen to internal changes
  
  return (
    <div className="flex flex-col items-start space-y-2">
      <Button
        type="button"
        onClick={isListening ? stopListening : startListening}
        variant={isListening ? 'danger' : 'secondary'}
        // The icon prop has been removed as MicrophoneIcon component is deleted
      >
        {isListening ? 'Stop Listening' : 'Start Voice Input'}
      </Button>
      {error && <p className="text-sm text-red-500">Error: {error}</p>}
    </div>
  );
};

export default VoiceInput;