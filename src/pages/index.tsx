import React, { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DemaiTerminal from '@/components/DemaiTerminal';
import DemaiChat from '@/components/DemaiChat';
import DemaiPipelineMap from '@/components/DemaiPipelineMap';
import DemaiNavbar from '@/components/DemaiNavbar';
import DemaiConnectModal, { DEMAI_AUTH_MESSAGE } from '@/components/DemaiConnectModal';

const DemaiPage = () => {
  const { isConnected, address } = useAccount();
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [verticalSplit, setVerticalSplit] = useState(50); // Percentage
  const [horizontalSplit, setHorizontalSplit] = useState(66.67); // Percentage
  const [hasValidSignature, setHasValidSignature] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for existing signature on mount and when address changes
  useEffect(() => {
    if (!mounted || !address) {
      setHasValidSignature(false);
      return;
    }

    const storedSignature = localStorage.getItem('demai_auth_signature');
    const storedMessage = localStorage.getItem('demai_auth_message');
    
    // If we have both signature and message, and they match our expected message
    if (storedSignature && storedMessage === DEMAI_AUTH_MESSAGE) {
      setHasValidSignature(true);
    } else {
      setHasValidSignature(false);
    }
  }, [address, mounted]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingVertical) {
      const container = document.getElementById('demai-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setVerticalSplit(Math.min(Math.max(percentage, 20), 80));
      }
    } else if (isDraggingHorizontal) {
      const leftPanel = document.getElementById('left-panel');
      if (leftPanel) {
        const panelRect = leftPanel.getBoundingClientRect();
        const percentage = ((e.clientY - panelRect.top) / panelRect.height) * 100;
        setHorizontalSplit(Math.min(Math.max(percentage, 20), 80));
      }
    }
  }, [isDraggingVertical, isDraggingHorizontal]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingVertical(false);
    setIsDraggingHorizontal(false);
  }, []);

  useEffect(() => {
    if (isDraggingVertical || isDraggingHorizontal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingVertical, isDraggingHorizontal, handleMouseMove, handleMouseUp]);

  // Show modal if either not connected or no valid signature
  const shouldShowModal = !isConnected || !hasValidSignature;

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <>
      <DemaiConnectModal 
        isOpen={shouldShowModal} 
        onSignatureUpdate={(success) => {
          console.log('Signature update:', success); // Debug log
          setHasValidSignature(success);
        }} 
      />
      {!shouldShowModal && (
        <div className="flex flex-col h-screen w-full">
          <DemaiNavbar />
          <div id="demai-container" className="flex flex-1 w-full select-none">
            {/* Left Column: Visual Map (Top) and Chat (Bottom) */}
            <div
              id="left-panel"
              className="flex flex-col h-full"
              style={{ width: `${verticalSplit}%` }}
            >
              {/* Visual Map Section */}
              <div
                className="relative"
                style={{ height: `${horizontalSplit}%` }}
              >
                <div className="absolute inset-0 bg-black">
                  <DemaiPipelineMap />
                </div>
              </div>

              {/* Horizontal Resize Handle */}
              <div
                className="h-1 bg-neutral-800 hover:bg-amber-400 cursor-ns-resize"
                onMouseDown={() => setIsDraggingHorizontal(true)}
              />

              {/* Chat Interface Section */}
              <div
                className="relative"
                style={{ height: `${100 - horizontalSplit}%` }}
              >
                <div className="absolute inset-0 bg-black">
                  <DemaiChat />
                </div>
              </div>
            </div>

            {/* Vertical Resize Handle */}
            <div
              className="w-1 bg-neutral-800 hover:bg-amber-400 cursor-ew-resize"
              onMouseDown={() => setIsDraggingVertical(true)}
            />

            {/* Right Column: Terminal */}
            <div
              className="bg-black h-full relative"
              style={{ width: `${100 - verticalSplit}%` }}
            >
              <div className="absolute inset-0">
                <DemaiTerminal />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemaiPage; 