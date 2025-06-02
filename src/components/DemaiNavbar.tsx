import React from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, Cog6ToothIcon, Bars3Icon, UserIcon } from '@heroicons/react/24/outline';

const DemaiNavbar: React.FC = () => {
  return (
    <nav className="h-14 bg-black/95 backdrop-blur-md border-b border-gray-800/50 px-6 flex items-center justify-between relative">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          {/* Logo */}
          <div className="relative w-36 h-12">
            <Image
              src="/images/logo.webp"
              alt="demAI Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search protocols, strategies, or assets..."
            className="w-full bg-gray-800/80 border border-gray-600/60 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:bg-gray-700/80 focus:ring-1 focus:ring-blue-500/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Section - Navigation Tabs and Controls */}
      <div className="flex items-center space-x-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 bg-gray-800/40 rounded-lg p-1">
          <button className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-md transition-colors duration-200">
            Statistics
          </button>
          <button className="px-4 py-2 text-sm bg-blue-600/80 text-white rounded-md shadow-sm">
            Overview
          </button>
          <button className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-md transition-colors duration-200">
            Dashboard
          </button>
          <button className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-md transition-colors duration-200">
            Analytics
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200">
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200">
            <Bars3Icon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200">
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DemaiNavbar;