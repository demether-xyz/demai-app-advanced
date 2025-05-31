// Technical Description: Chat interface component using a terminal-like display for user interaction with the AI agent.
// Allows user input and displays a simulated conversation flow.
// Implements proper scrolling behavior with flex layout and overflow handling.
// Includes wallet authentication verification for each message.
// Supports terminal-like clear command to reset chat history.

import React, { useState, useRef, useEffect } from 'react';
import Terminal, { ColorMode, TerminalOutput, TerminalInput } from 'react-terminal-ui';
import { sendMessageToDemai } from '../services/demaiApi';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai' | 'system';
  text: string;
}

const DemaiChat: React.FC = () => {
  const [chatLines, setChatLines] = useState<React.ReactNode[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Dummy conversation data
  const dummyConversation: ChatMessage[] = [
    { id: 1, sender: 'user', text: 'Hey agent, can you analyze my current portfolio yield?' },
    { id: 2, sender: 'ai', text: 'Analyzing your portfolio now. I am checking current allocations and potential yield farming opportunities on connected chains.' },
    { id: 3, sender: 'user', text: 'Should I rebalance to maximize APY on ETH-USDC?' },
    { id: 4, sender: 'ai', text: 'Based on current analysis, rebalancing ETH and USDC into the Curve pool on Polygon could increase your APY. I will propose the necessary steps.' },
  ];

  useEffect(() => {
    // Format dummy conversation into terminal lines
    const formattedLines = dummyConversation.map(msg => (
      msg.sender === 'user' ? (
        <TerminalInput key={msg.id} prompt='>' >{msg.text}</TerminalInput>
      ) : (
        <TerminalOutput key={msg.id}>
          <span className="text-cyan-400 font-medium glow-text">AI:</span> <span className="text-gray-100">{msg.text}</span>
        </TerminalOutput>
      )
    ));
    setChatLines(formattedLines);
  }, []);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      const terminal = terminalRef.current.querySelector('.react-terminal');
      if (terminal) {
        terminal.scrollTop = terminal.scrollHeight;
      }
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    // Initial scroll
    scrollToBottom();
    
    // Delayed scroll to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatLines]);

  const handleRetry = async (input: string) => {
    setIsRetrying(true);
    await handleInput(input);
    setIsRetrying(false);
  };

  const clearChat = () => {
    setChatLines([
      <TerminalOutput key="welcome">
        <span className="text-cyan-400 font-medium">Welcome to demAI!</span> <span className="text-gray-300">Your wallet is connected and authenticated. Start chatting...</span>
      </TerminalOutput>
    ]);
  };

  const handleInput = async (input: string) => {
    if (!input.trim()) return;

    // Handle clear command
    if (input.toLowerCase() === 'clear') {
      clearChat();
      return;
    }

    // If it's a retry, don't add the user message again
    if (!isRetrying) {
      const newUserMessage = <TerminalInput key={Date.now()} prompt='>'>{input}</TerminalInput>;
      setChatLines(prev => [...prev, newUserMessage]);
    }

    const thinkingMessageKey = `thinking-${Date.now()}`;
    const thinkingMessage = (
      <TerminalOutput key={thinkingMessageKey}>
        <span className="text-cyan-400 font-medium glow-text">AI:</span>{' '}
        <span className="inline-flex items-center">
          <span className="animate-[pulse_1.4s_ease-in-out_infinite] text-cyan-300">●</span>
          <span className="animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:0.2s] -ml-[2px] text-cyan-300">●</span>
          <span className="animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:0.4s] -ml-[2px] text-cyan-300">●</span>
        </span>
      </TerminalOutput>
    );

    // Add thinking indicator
    setChatLines(prev => [...prev, thinkingMessage]);

    const response = await sendMessageToDemai(input);

    // Remove thinking indicator and add response
    setChatLines(prev => prev.filter(line => (line as React.ReactElement).key !== thinkingMessageKey).concat(
      <TerminalOutput key={Date.now() + 1}>
        {response.success ? (
          <>
            <span className="text-cyan-400 font-medium glow-text">AI:</span> <span className="text-gray-100">{response.data}</span>
          </>
        ) : (
          <>
            <span className="text-red-400 font-medium glow-text-red">Error:</span> <span className="text-red-300">{response.error}</span>
            {(response.error?.includes('Unable to connect') || response.error?.includes('Network error')) && !isRetrying && (
              <>
                {'\n'}
                <span className="text-yellow-400 cursor-pointer hover:text-yellow-300 underline glow-text-yellow" onClick={() => handleRetry(input)}>
                  Click here to retry
                </span>
              </>
            )}
          </>
        )}
      </TerminalOutput>
    ));
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-black/90 to-gray-900/90 relative" ref={terminalRef}>
      {/* Futuristic background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
          `
        }} />
      </div>
      
      <style jsx global>{`
        .glow-text {
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        .glow-text-red {
          text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }
        .glow-text-yellow {
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .react-terminal-wrapper {
          height: 100% !important;
          min-height: 0 !important;
          background-color: transparent !important;
          margin: 0 !important;
          padding: 1rem !important;
          font-size: 0.875rem !important;
          line-height: 1.5rem !important;
          display: flex !important;
          flex-direction: column !important;
          border: 1px solid rgba(0, 255, 255, 0.2) !important;
          border-radius: 0.5rem !important;
          backdrop-filter: blur(10px) !important;
        }
        .react-terminal {
          flex: 1 1 auto !important;
          overflow-y: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(0, 255, 255, 0.3) transparent !important;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%) !important;
          border-radius: 0.375rem !important;
        }
        .react-terminal::-webkit-scrollbar {
          width: 8px !important;
        }
        .react-terminal::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3) !important;
          border-radius: 4px !important;
        }
        .react-terminal::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 255, 255, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%) !important;
          border-radius: 4px !important;
        }
        .react-terminal::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0, 255, 255, 0.5) 0%, rgba(147, 51, 234, 0.5) 100%) !important;
        }
        .react-terminal-window-content {
          height: auto !important;
          min-height: 0 !important;
          padding: 1rem !important;
          background: transparent !important;
        }
        .react-terminal-line {
          padding: 0.375rem 0 !important;
          white-space: pre-wrap !important;
          border-left: 2px solid transparent !important;
          padding-left: 0.75rem !important;
          transition: all 0.2s ease !important;
        }
        .react-terminal-line:hover {
          border-left-color: rgba(0, 255, 255, 0.3) !important;
          background: rgba(0, 255, 255, 0.05) !important;
        }
        .react-terminal-window-header {
          display: none !important;
        }
        .react-terminal-input-line {
          padding: 0.375rem 0 !important;
          border-left: 2px solid rgba(0, 255, 255, 0.5) !important;
          padding-left: 0.75rem !important;
          background: rgba(0, 255, 255, 0.05) !important;
          border-radius: 0.25rem !important;
          margin: 0.25rem 0 !important;
        }
        .react-terminal-input-prompt {
          margin-right: 0.75rem !important;
          color: #00ffff !important;
          font-weight: 600 !important;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
        }
        .react-terminal-input {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: #ffffff !important;
          font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
        }
        .react-terminal-input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }
      `}</style>
      <Terminal
        colorMode={ColorMode.Dark}
        onInput={handleInput}
        prompt=">"
        TopButtonsPanel={() => null}
      >
        {chatLines.length === 0 ? (
          <TerminalOutput>
            <span className="text-cyan-400 font-medium">Welcome to demAI!</span> <span className="text-gray-300">Your wallet is connected and authenticated. Start chatting...</span>
          </TerminalOutput>
        ) : (
          <>{chatLines}</>
        )}
      </Terminal>
    </div>
  );
};

export default DemaiChat; 