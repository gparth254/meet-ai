import { useRef, useEffect } from "react";

export function useVoiceAgent(
  agentInstructions: string,
  onAgentSpeak: (text: string) => void,
  onStateChange?: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void
) {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices when they become available
      const loadVoices = () => {
        if (synthRef.current) {
          synthRef.current.getVoices();
        }
      };
      
      // Chrome loads voices asynchronously
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
      
      // Initial load
      loadVoices();
    }
  }, []);

  const startListening = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (onStateChange) onStateChange('listening');

    recognition.onresult = async (event: any) => {
      const userText = event.results[0][0].transcript;
      console.log("User said:", userText);
      
      if (onStateChange) onStateChange('thinking');
      
      try {
        // Call your API route to get agent's reply
        const res = await fetch("/api/agent-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instructions: agentInstructions, userText }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API error response:", errorText);
          throw new Error(`API error: ${res.status} - ${errorText}`);
        }
        
        const { agentReply } = await res.json();
        console.log("Agent reply:", agentReply);
        
        if (onStateChange) onStateChange('speaking');
        
        // Speak agent reply
        if (synthRef.current && 'SpeechSynthesisUtterance' in window) {
          const utter = new window.SpeechSynthesisUtterance(agentReply);
          utter.rate = 0.9; // Slightly slower for clarity
          utter.pitch = 1.0;
          utter.volume = 1.0;
          
          // Try to get a good voice
          const voices = synthRef.current.getVoices();
          console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
          
          const englishVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google')) || 
                             voices.find(v => v.lang.startsWith('en-')) ||
                             voices[0];
          
          if (englishVoice) {
            utter.voice = englishVoice;
            console.log("Using voice:", englishVoice.name);
          } else {
            console.warn("No suitable English voice found");
          }
          
          utter.onend = () => {
            console.log("Finished speaking");
            if (onStateChange) onStateChange('idle');
          };
          
          utter.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            if (onStateChange) onStateChange('idle');
          };
          
          // Cancel any ongoing speech
          synthRef.current.cancel();
          
          // Speak the new text
          synthRef.current.speak(utter);
          onAgentSpeak(agentReply);
        } else {
          console.error("Speech synthesis not available");
          onAgentSpeak(agentReply);
          if (onStateChange) onStateChange('idle');
        }
        
      } catch (error) {
        console.error("Error getting agent reply:", error);
        const errorMessage = "Sorry, I couldn't respond right now. Please try again.";
        onAgentSpeak(errorMessage);
        if (onStateChange) onStateChange('idle');
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e.error);
      if (e.error === "no-speech") {
        alert("No speech detected. Please try again and speak clearly into your microphone.");
      } else if (e.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        alert("Speech recognition error: " + e.error);
      }
      if (onStateChange) onStateChange('idle');
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      if (onStateChange) onStateChange('idle');
    };

    recognition.start();
    console.log("Started listening...");
  };

  return { startListening };
} 