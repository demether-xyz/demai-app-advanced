import React, { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
// import DemaiTerminal from '@/components/DemaiTerminal'; // Hidden for now
import DemaiChat from '@/components/DemaiChat';
import DemAIVisor from '@/components/DemAIVisor';
import DemaiNavbar from '@/components/DemaiNavbar';
import DemaiConnectModal, { DEMAI_AUTH_MESSAGE } from '@/components/DemaiConnectModal';

const DemaiPage = () => {
  const { isConnected, address } = useAccount();
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [horizontalSplit, setHorizontalSplit] = useState(60); // Adjusted for better proportions
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
    if (isDraggingHorizontal) {
      const container = document.getElementById('demai-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const percentage = ((e.clientY - containerRect.top) / containerRect.height) * 100;
        setHorizontalSplit(Math.min(Math.max(percentage, 30), 80));
      }
    }
  }, [isDraggingHorizontal]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingHorizontal(false);
  }, []);

  useEffect(() => {
    if (isDraggingHorizontal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingHorizontal, handleMouseMove, handleMouseUp]);

  // Show modal if either not connected or no valid signature
  // const shouldShowModal = !isConnected || !hasValidSignature;
  const shouldShowModal = false; // Temporarily disabled for UI iteration

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
        <div className="flex flex-col h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Futuristic background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          
          <DemaiNavbar />
          
          <div id="demai-container" className="flex flex-col flex-1 w-full select-none relative">
            {/* demAI Visor Interface Section - Now full height */}
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-sm">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 blur-sm" />
                <div className="absolute inset-1 bg-black/90 rounded-lg">
                  <DemAIVisor />
                </div>
              </div>
              
              {/* Section label */}
              <div className="absolute top-4 left-4 z-10">
                <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full backdrop-blur-sm">
                  <span className="text-cyan-300 text-sm font-medium tracking-wide">demAI INTERFACE</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated grid overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>
        </div>
      )}
    </>
  );
};

export default DemaiPage; 