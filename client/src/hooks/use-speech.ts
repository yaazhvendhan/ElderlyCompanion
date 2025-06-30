import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Please speak now. I'm listening!",
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      toast({
        title: "Speech Recognized",
        description: `I heard: "${transcript}"`,
      });
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      let errorMessage = "Speech recognition error";
      
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech was detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage = "No microphone was found.";
          break;
        case "not-allowed":
          errorMessage = "Microphone permission was denied.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      toast({
        title: "Speech Recognition Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
  };
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
