import React from 'react';

interface OrionNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const OrionNavbar: React.FC<OrionNavbarProps> = ({ 
  activeTab = 'Overview', 
  onTabChange 
}) => {
  const navigationTabs = [
    'Statistics',
    'Overview', 
    'Dashboard',
    'Analytics'
  ];

  return (
    <nav className="w-full bg-slate-900/95 border-b border-slate-700/30 backdrop-blur-sm">
      <div className="max-w-full mx-auto px-8 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Search */}
          <div className="flex items-center space-x-6">
            {/* ORION Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* Logo icon - circular with gradient */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/90"></div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-6 h-6 rounded-full bg-cyan-400/20 blur-sm"></div>
              </div>
              <span className="text-white text-base font-bold tracking-wide">ORION</span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="w-72 h-8 bg-black/80 border border-slate-600/40 rounded-md flex items-center px-3">
                <svg className="w-3.5 h-3.5 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="" 
                  className="bg-transparent text-slate-300 placeholder-slate-600 outline-none flex-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Center - Navigation Tabs */}
          <div className="flex items-center space-x-0">
            {navigationTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={`px-5 py-1.5 text-sm font-medium transition-all duration-200 relative ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                )}
              </button>
            ))}
          </div>

          {/* Right side - User Controls */}
          <div className="flex items-center space-x-2">
            {/* Plus Icon */}
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Help/Question Icon */}
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Settings/Gear Icon */}
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Menu/Hamburger Icon */}
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* User Profile */}
            <button className="flex items-center space-x-2 p-1 text-slate-400 hover:text-white transition-colors duration-200">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OrionNavbar; 