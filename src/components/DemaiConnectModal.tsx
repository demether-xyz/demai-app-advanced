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

  const handleConnect = useCallback(async () => {
    setError(null);
    try {
      const connector = connectors[0];
      if (!connector) {
        setError('No wallet found. Please install MetaMask or another Web3 wallet.');
        return;
      }
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
  }, [connect, connectors, onSignatureUpdate]);

  // Don't render anything on server or before mounting
  if (!mounted || !isOpen) return null;

  const hasValidSignature = address ? hasValidSignatureForAddress(address) : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo with background */}
          <div className="relative w-32 h-32 mb-6 rounded-full bg-black p-4 border border-neutral-800">
            <Image
              src="/images_demai/logo.webp"
              alt="demAI Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
          
          <div className="text-2xl font-bold mb-4">
            <span className="text-white">Welcome to </span>
            <span className="text-amber-400">demAI</span>
          </div>
          
          {error && (
            <p className="text-red-400 mb-4 text-sm">{error}</p>
          )}
          
          <p className="text-neutral-200 mb-8 leading-relaxed">
            {isConnected && !hasValidSignature
              ? "Please sign the message to access the demAI platform."
              : "Connect your wallet to start using the demAI platform. Your wallet is your key to accessing all features and functionalities."
            }
          </p>

          {isConnected && !hasValidSignature ? (
            <button
              onClick={handleSignMessage}
              disabled={isSigningMessage}
              className="w-full px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningMessage ? 'Waiting for Signature...' : 'Sign Message to Continue'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connectStatus === 'pending'}
              className="w-full px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connectStatus === 'pending' ? 'Connecting...' : 'Connect Wallet to Continue'}
            </button>
          )}
          
          <p className="mt-4 text-sm text-neutral-400">
            {isConnected && !hasValidSignature
              ? "This signature will not trigger any blockchain transactions."
              : "Make sure you have MetaMask or another Web3 wallet installed"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemaiConnectModal; 