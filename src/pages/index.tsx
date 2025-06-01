import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DemaiConnectModal, { DEMAI_AUTH_MESSAGE } from '@/components/DemaiConnectModal';
import DemaiNavbar from '@/components/DemaiNavbar';
import DemaiChatInterface from '@/components/DemaiChatInterface';
import DashboardCard from '@/components/DashboardCard';
import FlowingChart from '@/components/FlowingChart';
import CircularProgress from '@/components/CircularProgress';

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
            
            {/* Dashboard Content - Hidden for now */}
            {/* 
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-white text-4xl font-light mb-2">Welcome to demAI</h1>
                  <p className="text-white/70 text-lg">Your intelligent DeFi assistant</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <DashboardCard
                    title="Trend"
                    subtitle="Compared to 12% last year"
                    value="92,980"
                    className="lg:col-span-1"
                    chartElement={<FlowingChart height={100} />}
                  />
                  
                  <DashboardCard
                    title="Total coverage"
                    value="53,430,001"
                    comparison="Compared to 121,490"
                    className="lg:col-span-1"
                  >
                    <div className="flex items-center justify-center mt-4">
                      <CircularProgress percentage={23} size={100} />
                    </div>
                  </DashboardCard>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DashboardCard
                    title="Portfolio Value"
                    value="$124,567"
                    comparison="+12.5% this month"
                    className="h-48"
                  />
                  
                  <DashboardCard
                    title="Active Strategies"
                    value="8"
                    comparison="3 new this week"
                    className="h-48"
                  />
                  
                  <DashboardCard
                    title="Yield Generated"
                    value="$2,847"
                    comparison="Last 30 days"
                    className="h-48"
                  />
                </div>
              </div>
            </div>
            */}
          </div>
          
          {/* Floating Chat Interface */}
          <DemaiChatInterface />
        </div>
      )}
    </>
  );
};

export default DemaiPage; 