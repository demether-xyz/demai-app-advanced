import React from 'react'
import Image from 'next/image'
import { MagnifyingGlassIcon, Cog6ToothIcon, Bars3Icon, UserIcon } from '@heroicons/react/24/outline'

const DemaiNavbar: React.FC = () => {
  return (
    <nav className="relative flex h-14 items-center justify-between border-b border-gray-800/50 bg-black/95 px-6 backdrop-blur-md">
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          {/* Logo */}
          <div className="relative h-12 w-36">
            <Image src="/images/logo.webp" alt="demAI Logo" fill className="object-contain" priority />
          </div>
        </div>
      </div>

      {/* Center Section - Search Bar */}
      <div className="mx-8 max-w-md flex-1">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search protocols, strategies, or assets..."
            className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 py-2.5 pr-4 pl-11 text-sm text-gray-100 placeholder-gray-500 transition-all duration-200 focus:border-blue-500/60 focus:bg-gray-700/80 focus:ring-1 focus:ring-blue-500/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Section - Navigation Tabs and Controls */}
      <div className="flex items-center space-x-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 rounded-lg bg-gray-800/40 p-1">
          <button className="rounded-md px-4 py-2 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-200">
            Statistics
          </button>
          <button className="rounded-md bg-blue-600/80 px-4 py-2 text-sm text-white shadow-sm">Overview</button>
          <button className="rounded-md px-4 py-2 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-200">
            Dashboard
          </button>
          <button className="rounded-md px-4 py-2 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-200">
            Analytics
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1">
          <button className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-gray-200">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-gray-200">
            <Bars3Icon className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-gray-200">
            <UserIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default DemaiNavbar
