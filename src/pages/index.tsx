import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DemaiConnectModal, { DEMAI_AUTH_MESSAGE } from '@/components/DemaiConnectModal';
import DemaiNavbar from '@/components/DemaiNavbar';

const DemaiPage = () => {
  const { isConnected, address } = useAccount();
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

  // TODO: Re-enable authentication system
  // Show modal if either not connected or no valid signature
  // const shouldShowModal = !isConnected || !hasValidSignature;
  const shouldShowModal = false; // Temporarily disabled for UI development

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
        <div className="flex flex-col h-screen w-full relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/background.jpg)',
            }}
          />
          
          {/* Dark overlay for better readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Main content area */}
          <div className="relative z-10 flex flex-col h-full">
            <DemaiNavbar />
            {/* Dashboard content will go here */}
          </div>
        </div>
      )}
    </>
  );
};

export default DemaiPage; 