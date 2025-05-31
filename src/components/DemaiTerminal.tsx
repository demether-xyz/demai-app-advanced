// Technical Description: Displays simulated AI agent logs in a terminal-like interface.
// Uses dummy data to show agent thinking, analysis, and simulated DeFi actions.
// Provides a scrollable view with formatted log entries and consistent styling.
// Includes auto-scrolling to the latest entries with improved scroll behavior.

import React, { useEffect, useRef, useState } from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

interface DummyLog {
  timestamp: string;
  type: 'INFO' | 'ACTION' | 'ANALYSIS' | 'RESULT' | 'ERROR' | 'WARNING';
  message: string;
}

// Helper function to format a timestamp (simplified for dummy data)
const formatDummyTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour12: false }) + ':' + date.getMilliseconds().toString().padStart(3, '0');
};

// Helper function to get color based on log type
const getLogTypeColor = (type: DummyLog['type']): string => {
  switch (type) {
    case 'ERROR':
      return 'text-red-500';
    case 'WARNING':
      return 'text-yellow-500';
    case 'RESULT':
    case 'ACTION':
      return 'text-green-500';
    case 'ANALYSIS':
      return 'text-cyan-500';
    default:
      return 'text-blue-500';
  }
};

// Dummy Data simulating AI activity - Using fixed timestamps to avoid hydration errors
const dummyLogs: DummyLog[] = [
  { timestamp: '2023-10-27T10:00:00.100Z', type: 'INFO', message: 'Agent initialized. Loading configuration for portfolio P-101.' },
  { timestamp: '2023-10-27T10:00:02.500Z', type: 'ANALYSIS', message: 'Analyzing current portfolio allocation: 60% ETH, 30% USDC, 10% DAI.' },
  { timestamp: '2023-10-27T10:00:05.800Z', type: 'ANALYSIS', message: 'Checking current market conditions and yield opportunities across Polygon, Arbitrum, and Optimism.' },
  { timestamp: '2023-10-27T10:00:10.300Z', type: 'ANALYSIS', message: 'Evaluating APYs for ETH-USDC pools on Curve (Polygon) and Uniswap (Arbitrum).' },
  { timestamp: '2023-10-27T10:00:15.700Z', type: 'RESULT', message: 'Identified higher potential yield on Curve (Polygon) ETH-USDC pool (8.5% APY) compared to Uniswap (Arbitrum) (6.2% APY).' },
  { timestamp: '2023-10-27T10:00:20.900Z', type: 'ANALYSIS', message: 'Considering gas costs and bridging fees for potential rebalance to Polygon.' },
  { timestamp: '2023-10-27T10:00:25.150Z', type: 'RESULT', message: 'Calculated potential net gain outweighs transaction costs for rebalance.' },
  { timestamp: '2023-10-27T10:00:30.400Z', type: 'ACTION', message: 'Proposing action: Bridge 2 ETH and 1000 USDC from Arbitrum to Polygon.' },
  { timestamp: '2023-10-27T10:00:35.600Z', type: 'ACTION', message: 'Proposing action: Deposit 2 ETH and 1000 USDC into Curve (Polygon) ETH-USDC pool.' },
  { timestamp: '2023-10-27T10:00:40.850Z', type: 'INFO', message: 'Awaiting user approval for proposed actions.' },
  { timestamp: '2023-10-27T10:00:45.000Z', type: 'INFO', message: 'User approved actions. Executing...' },
  { timestamp: '2023-10-27T10:00:48.300Z', type: 'ACTION', message: 'Executing bridge operation: Arbitrum -> Polygon.' },
  { timestamp: '2023-10-27T10:00:50.750Z', type: 'RESULT', message: 'Bridge successful. Assets now on Polygon.' },
  { timestamp: '2023-10-27T10:00:55.000Z', type: 'ACTION', message: 'Executing deposit into Curve (Polygon) ETH-USDC pool.' },
];

const DemaiTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Format dummy logs for the terminal
  const terminalLines = dummyLogs.map((log, index) => ({
    content: (
      <TerminalOutput key={index}>
        <span className="text-gray-400">{formatDummyTimestamp(log.timestamp)}</span>{' '}
        <span className={getLogTypeColor(log.type)}>[{log.type}]</span>{' '}
        {log.message}
      </TerminalOutput>
    )
  }));

  const scrollToBottom = () => {
    if (terminalRef.current) {
      const terminal = terminalRef.current.querySelector('.react-terminal');
      if (terminal) {
        terminal.scrollTop = terminal.scrollHeight;
      }
    }
  };

  // Initial scroll and setup scroll on content changes
  useEffect(() => {
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [terminalLines]);

  return (
    <div className="w-full h-full flex flex-col bg-[#111111]" ref={terminalRef}>
      <style jsx global>{`
        .react-terminal-wrapper {
          height: 100% !important;
          min-height: 0 !important;
          background-color: #111111 !important;
          margin: 0 !important;
          line-height: 1.25rem !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
        }
        .react-terminal-ui {
          background-color: #111111 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .react-terminal {
          flex: 1 1 auto !important;
          overflow-y: auto !important;
          overflow-x: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent !important;
          background-color: #111111 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          min-height: 0 !important;
          & > * {
            background-color: #111111 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        .react-terminal::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
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
          background-color: #111111 !important;
          padding: 0 !important;
        }
        .react-terminal-window-content > * {
          background-color: #111111 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .react-terminal-line {
          white-space: nowrap !important;
          overflow-x: visible !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: #111111 !important;
        }
        .react-terminal-window-header {
          display: none !important;
        }
      `}</style>
      <Terminal
        colorMode={ColorMode.Dark}
        onInput={() => {}}
        TopButtonsPanel={() => null}
      >
        {terminalLines.length === 0 ? (
          <TerminalOutput>Initializing logs...</TerminalOutput>
        ) : (
          <>{terminalLines.map(line => line.content)}</>
        )}
      </Terminal>
    </div>
  );
};

export default DemaiTerminal; 