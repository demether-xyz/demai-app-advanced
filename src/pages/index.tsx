import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DemaiConnectModal, { DEMAI_AUTH_MESSAGE } from '@/components/DemaiConnectModal';
import DemaiNavbar from '@/components/DemaiNavbar';
import DemaiChatInterface from '@/components/DemaiChatInterface';
import DashboardCard from '@/components/DashboardCard';
import FlowingChart from '@/components/FlowingChart';
import CircularProgress from '@/components/CircularProgress';
import WireframeOverlay from '@/components/WireframeOverlay';
import AutomationIndicator from '@/components/AutomationIndicator';

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
          
          {/* Navbar - Fixed at top */}
          <div className="relative z-10">
            <DemaiNavbar />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 relative z-10 overflow-hidden">
            {/* Dashboard Content as background */}
            <div className="absolute inset-0 p-8 overflow-y-auto">
              {/* Portfolio Summary - Upper Left */}
              <div className="absolute top-8 left-12">
                <h1 className="text-white text-4xl font-bold mb-6">demAI</h1>
                
                {/* Portfolio Value */}
                <div className="mb-4">
                  <div className="text-white text-5xl font-bold mb-2">$24,847.32</div>
                  <div className="text-white/70 text-lg font-medium mb-1">Across 3 strategies</div>
                  <div className="flex items-center text-green-400 text-sm font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +$1,234 (5.2%) today
                  </div>
                </div>
                
                {/* AI Suggestions */}
                <div className="space-y-3 mt-6">
                  <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md">
                    <div className="bg-blue-500 rounded-full p-1.5 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">demAI suggests:</div>
                      <div className="text-white/90 text-sm">Review your Aave position</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md">
                    <div className="bg-amber-500 rounded-full p-1.5 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white/90 text-sm italic">"Your ETH position could benefit from rebalancing"</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Action Cards - Lower Left */}
              <div className="absolute bottom-8 left-12 flex space-x-4">
                <div className="bg-purple-600 rounded-xl p-5 w-28 h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                  <svg className="w-7 h-7 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-white text-xs font-medium text-center">Analyze Portfolio</span>
                </div>
                
                <div className="bg-cyan-500 rounded-xl p-5 w-28 h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-600 transition-colors">
                  <svg className="w-7 h-7 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-white text-xs font-medium text-center">Find Best Yields</span>
                </div>
                
                <div className="bg-blue-600 rounded-xl p-5 w-28 h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <svg className="w-7 h-7 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-white text-xs font-medium text-center">Learn DeFi</span>
                </div>
              </div>
              
              {/* Running Automation Indicators - Scattered like target design */}
              <AutomationIndicator
                position="top-32 left-1/3"
                title="Aave USDC"
                value="$12,450"
                iconColor="bg-blue-500"
                icon={
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                  </svg>
                }
              />
              
              <AutomationIndicator
                position="top-48 right-1/4"
                title="Compound ETH"
                value="$8,750"
                iconColor="bg-green-500"
                icon={
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                }
              />
              
              <AutomationIndicator
                position="bottom-1/3 left-1/2"
                title="Curve 3Pool"
                value="$15,200"
                iconColor="bg-purple-500"
                icon={
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
              />
              
              <AutomationIndicator
                position="top-1/2 left-2/3"
                title="Yearn Vault"
                value="$6,890"
                iconColor="bg-orange-500"
                icon={
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                }
              />
              
              <AutomationIndicator
                position="bottom-1/4 right-1/3"
                title="Uniswap V3"
                value="$4,320"
                iconColor="bg-cyan-500"
                icon={
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                }
              />
            </div>
            
            {/* Wireframe Overlay within content area */}
            <div className="absolute inset-0">
              <WireframeOverlay />
            </div>
          </div>
          
          {/* Floating Chat Interface - Superimposed */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            <div className="pointer-events-auto">
              <DemaiChatInterface />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemaiPage; 