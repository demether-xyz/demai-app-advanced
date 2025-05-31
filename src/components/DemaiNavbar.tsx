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
    <nav className="h-14 bg-black border-b border-neutral-800 px-6 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="relative w-40 h-40">
            <Image
              src="/images_demai/logo.webp"
              alt="demAI Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link
            href="#"
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            DEPOSIT
          </Link>
          <Link
            href="#"
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            WITHDRAW
          </Link>
        </div>
      </div>

      {/* Connect Button */}
      <button
        onClick={handleConnection}
        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-medium rounded-lg transition-colors"
      >
        {isConnected ? formatAddress(address!) : 'Connect Wallet'}
      </button>
    </nav>
  );
};

export default DemaiNavbar; 