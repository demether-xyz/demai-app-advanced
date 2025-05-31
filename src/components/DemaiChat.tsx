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
          <span className="text-green-400">AI:</span> {msg.text}
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
        Welcome to demAI! Your wallet is connected and authenticated. Start chatting...
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
        <span className="text-green-400">AI:</span>{' '}
        <span className="inline-flex items-center">
          <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
          <span className="animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:0.2s] -ml-[2px]">.</span>
          <span className="animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:0.4s] -ml-[2px]">.</span>
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
            <span className="text-green-400">AI:</span> {response.data}
          </>
        ) : (
          <>
            <span className="text-red-500">Error:</span> {response.error}
            {(response.error?.includes('Unable to connect') || response.error?.includes('Network error')) && !isRetrying && (
              <>
                {'\n'}
                <span className="text-yellow-500 cursor-pointer" onClick={() => handleRetry(input)}>
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
    <div className="w-full h-full flex flex-col bg-gray-900" ref={terminalRef}>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .react-terminal-wrapper {
          height: 100% !important;
          min-height: 0 !important;
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0.5rem !important;
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .react-terminal {
          flex: 1 1 auto !important;
          overflow-y: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent !important;
        }
        .react-terminal::-webkit-scrollbar {
          width: 6px !important;
        }
        .react-terminal::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .react-terminal::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 3px !important;
        }
        .react-terminal-window-content {
          height: auto !important;
          min-height: 0 !important;
          padding: 0.5rem !important;
        }
        .react-terminal-line {
          padding: 0.25rem 0 !important;
          white-space: pre-wrap !important;
        }
        .react-terminal-window-header {
          display: none !important;
        }
        .react-terminal-input-line {
          padding: 0.25rem 0 !important;
        }
        .react-terminal-input-prompt {
          margin-right: 0.5rem !important;
          color: #ffffff !important;
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
            Welcome to demAI! Your wallet is connected and authenticated. Start chatting...
          </TerminalOutput>
        ) : (
          <>{chatLines}</>
        )}
      </Terminal>
    </div>
  );
};

export default DemaiChat; 