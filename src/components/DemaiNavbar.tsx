import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const DemaiNavbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: connectors[0] });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="h-16 bg-gradient-to-r from-black via-gray-900/95 to-black border-b border-cyan-500/20 px-6 flex items-center justify-between relative backdrop-blur-sm">
      {/* Glowing top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      
      {/* Logo Section */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="relative w-40 h-40 group">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl group-hover:bg-cyan-400/30 transition-all duration-300" />
            <Image
              src="/images/logo.webp"
              alt="demAI Logo"
              fill
              className="object-contain relative z-10 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]"
              priority
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link
            href="#"
            className="relative text-cyan-300 hover:text-cyan-100 font-medium tracking-wide transition-all duration-300 group"
          >
            <span className="relative z-10">DEPOSIT</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link
            href="#"
            className="relative text-cyan-300 hover:text-cyan-100 font-medium tracking-wide transition-all duration-300 group"
          >
            <span className="relative z-10">WITHDRAW</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </div>

      {/* Connect Button */}
      <button
        onClick={handleConnection}
        className="relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-medium rounded-lg transition-all duration-300 group overflow-hidden"
      >
        {/* Button glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
        
        {/* Button content */}
        <span className="relative z-10 tracking-wide">
          {isConnected ? formatAddress(address!) : 'CONNECT WALLET'}
        </span>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
             style={{ padding: '1px' }}>
          <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg" />
        </div>
      </button>
      
      {/* Status indicator for connected wallet */}
      {isConnected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
      )}
    </nav>
  );
};

export default DemaiNavbar; 