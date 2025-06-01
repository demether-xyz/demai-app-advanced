import React from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, Cog6ToothIcon, Bars3Icon, UserIcon } from '@heroicons/react/24/outline';

const DemaiNavbar: React.FC = () => {
  return (
    <nav className="h-12 bg-black/90 backdrop-blur-sm border-b border-gray-600/30 px-6 flex items-center justify-between relative">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          {/* Logo */}
          <div className="relative w-36 h-12">
            <Image
              src="/images/logo.webp"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 max-w-sm mx-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-700/80 border border-gray-600/40 rounded-md pl-10 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-500/60 focus:bg-gray-600/80 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Section - Navigation Tabs and Controls */}
      <div className="flex items-center space-x-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1">
          <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200">
            Statistics
          </button>
          <button className="px-3 py-1.5 text-sm bg-gray-700/60 text-gray-200 rounded-md border border-gray-600/40">
            Overview
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200">
            Dashboard
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200">
            Analytics
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors duration-200">
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors duration-200">
            <Bars3Icon className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors duration-200">
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DemaiNavbar;