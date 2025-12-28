import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceChatProps {
  character?: string;
  className?: string;
}

export default function VoiceChat({ character = 'yukino', className = '' }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'character';
    text: string;
    timestamp: Date;
  }>>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = character === 'yukino' ? 'ja-JP' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          handleSendMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [character]);

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    
    if (!messageText) return;

    setIsProcessing(true);
    setInputText('');
    
    // Add user message to history
    const userMessage = {
      role: 'user' as const,
      text: messageText,
      timestamp: new Date(),
    };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageText,
          character: character,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add character response to history
        const characterMessage = {
          role: 'character' as const,
          text: data.text,
          timestamp: new Date(),
        };
        setConversationHistory(prev => [...prev, characterMessage]);

        // Play audio if available
        if (data.audioUrl && audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.play().catch(err => {
            console.error('Audio play error:', err);
          });
          setIsSpeaking(true);
        }
      } else {
        throw new Error(data.message || 'Chat failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Still add error message to history
      setConversationHistory(prev => [...prev, {
        role: 'character',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, character]);

  const handleMicClick = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        // Fallback to text input if mic fails
        inputRef.current?.focus();
      }
    } else if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle audio playback end
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
    }
  }, []);

  const hasSpeechRecognition = typeof window !== 'undefined' && 
    (window.SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className={`voice-chat-container ${className}`}>
      {/* Conversation History */}
      <div className="conversation-history">
        <AnimatePresence>
          {conversationHistory.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`message ${message.role === 'user' ? 'user-message' : 'character-message'}`}
            >
              <div className="message-text">{message.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="message character-message processing"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="voice-chat-input">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={character === 'yukino' ? '話しかけてください...' : 'Talk to me...'}
            disabled={isProcessing || isListening}
            className="chat-input"
          />
          
          {/* Microphone Button */}
          {hasSpeechRecognition && (
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              className={`mic-button ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
          
          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            className="send-button"
            title="Send message"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Speaking Indicator */}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="speaking-indicator"
          >
            <Volume2 className="w-4 h-4" />
            <span>Yukino is speaking...</span>
          </motion.div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
}

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  }
  
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }
  
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
}

