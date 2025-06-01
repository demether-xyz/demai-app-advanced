import React from 'react';

interface GeneralStatsHeaderProps {
  totalUsers?: number;
  allUsers?: number;
}

const GeneralStatsHeader: React.FC<GeneralStatsHeaderProps> = ({
  totalUsers = 7541390,
  allUsers = 1430205
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="mb-8">
      {/* Main Title */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">General statistics</h1>
      </div>

      {/* Total Users Section */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-4">
          <span className="text-6xl font-bold text-white tracking-tight">
            {formatNumber(totalUsers)}
          </span>
        </div>
      </div>

      {/* All Users Section */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-lg text-slate-300">All users</span>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center space-x-1">
              <span className="text-sm font-medium">DETAIL</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatNumber(allUsers)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralStatsHeader; 