import React, { useCallback, useEffect, useState } from 'react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import Image from 'next/image';

export const DEMAI_AUTH_MESSAGE = `Welcome to demAI!

This signature will be used to authenticate your interactions with the demAI platform.

This signature will not trigger any blockchain transactions or grant any token approvals.`;

interface StoredAuthData {
  signature: string;
  message: string;
  address: string;
}

interface DemaiConnectModalProps {
  isOpen: boolean;
  onSignatureUpdate: (success: boolean) => void;
}

const DemaiConnectModal: React.FC<DemaiConnectModalProps> = ({ isOpen, onSignatureUpdate }) => {
  const { isConnected, address, connector: activeConnector } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningMessage, setIsSigningMessage] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear error when connection status changes
  useEffect(() => {
    if (isConnected) {
      setError(null);
    }
  }, [isConnected]);

  const formatAddress = useCallback((addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const getStoredAuthData = useCallback((): StoredAuthData | null => {
    const storedData = localStorage.getItem('demai_auth_data');
    if (!storedData) return null;
    
    try {
      return JSON.parse(storedData);
    } catch {
      return null;
    }
  }, []);

  const hasValidSignatureForAddress = useCallback((currentAddress: string): boolean => {
    const authData = getStoredAuthData();
    return !!(
      authData &&
      authData.signature &&
      authData.message === DEMAI_AUTH_MESSAGE &&
      authData.address.toLowerCase() === currentAddress.toLowerCase()
    );
  }, [getStoredAuthData]);

  // Check for existing signature when component mounts or address changes
  useEffect(() => {
    if (!mounted) return;
    
    const checkSignature = async () => {
      if (address && activeConnector) {
        const isValid = hasValidSignatureForAddress(address);
        onSignatureUpdate(isValid);
      } else {
        onSignatureUpdate(false);
      }
    };

    checkSignature();
  }, [address, activeConnector, mounted, onSignatureUpdate, hasValidSignatureForAddress]);

  const handleSignMessage = useCallback(async () => {
    if (!address || !activeConnector) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }
    
    setError(null);
    setIsSigningMessage(true);
    
    try {
      const signature = await signMessageAsync({
        message: DEMAI_AUTH_MESSAGE,
      });
      
      // Store auth data with address
      const authData: StoredAuthData = {
        signature,
        message: DEMAI_AUTH_MESSAGE,
        address,
      };
      localStorage.setItem('demai_auth_data', JSON.stringify(authData));
      onSignatureUpdate(true);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          setError('You need to sign the message to access demAI. Please try again.');
        } else {
          setError('Failed to sign message. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      onSignatureUpdate(false);
    } finally {
      setIsSigningMessage(false);
    }
  }, [address, activeConnector, signMessageAsync, onSignatureUpdate]);

  const handleConnect = useCallback(async (connector: any) => {
    setError(null);
    try {
      await connect({ connector });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          setError('You need to connect your wallet to use demAI. Please try again.');
        } else {
          setError('Failed to connect wallet. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      onSignatureUpdate(false);
    }
  }, [connect, onSignatureUpdate]);

  // Don't render anything on server or before mounting
  if (!mounted || !isOpen) return null;

  const hasValidSignature = address ? hasValidSignatureForAddress(address) : false;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4 backdrop-blur-xl shadow-2xl">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-cyan-400/20 rounded-2xl blur-sm -z-10" />
        
        <div className="flex flex-col items-center text-center relative">
          {/* Logo with enhanced glow */}
          <div className="relative w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-black to-gray-900 p-4 border border-cyan-500/30 group">
            {/* Multiple glow layers */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl group-hover:bg-cyan-400/30 transition-all duration-500" />
            <div className="absolute inset-2 bg-cyan-400/10 rounded-full blur-lg group-hover:bg-cyan-400/20 transition-all duration-500" />
            <Image
              src="/images/logo.webp"
              alt="demAI Logo"
              fill
              className="object-contain p-2 relative z-10 drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
              priority
            />
          </div>
          
          <div className="text-3xl font-bold mb-6">
            <span className="text-white">Welcome to </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">demAI</span>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <p className="text-gray-300 mb-8 leading-relaxed text-lg">
            {isConnected && !hasValidSignature
              ? "Please sign the message to access the demAI platform."
              : "Connect your wallet to start using the demAI platform. Your wallet is your key to accessing all features and functionalities."
            }
          </p>
          
          {!isConnected ? (
            <div className="space-y-4 w-full">
              <h3 className="text-cyan-300 font-semibold mb-4 text-lg">Choose your wallet:</h3>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={connectStatus === 'pending'}
                  className="w-full p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  
                  <span className="relative z-10 text-white font-medium tracking-wide">
                    {connectStatus === 'pending' ? 'Connecting...' : `Connect with ${connector.name}`}
                  </span>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                       style={{ padding: '1px' }}>
                    <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6 w-full">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                <p className="text-green-400 font-medium">✓ Wallet Connected</p>
                <p className="text-gray-300 text-sm mt-1">{formatAddress(address!)}</p>
              </div>
              
              {!hasValidSignature && (
                <button
                  onClick={handleSignMessage}
                  disabled={isSigningMessage}
                  className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 rounded-xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  
                  <span className="relative z-10 text-white font-medium tracking-wide">
                    {isSigningMessage ? 'Signing...' : 'Sign Message to Continue'}
                  </span>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                       style={{ padding: '1px' }}>
                    <div className="w-full h-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemaiConnectModal; 