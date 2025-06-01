import React from 'react';

interface LocationData {
  id: number;
  name: string;
  users: number;
  percentage: number;
  color: string;
}

interface LocationStatsPanelProps {
  locations?: LocationData[];
}

const LocationStatsPanel: React.FC<LocationStatsPanelProps> = ({ locations }) => {
  const defaultLocations: LocationData[] = [
    { id: 1, name: 'Location 1', users: 4504210, percentage: 55, color: 'bg-green-400' },
    { id: 2, name: 'Location 2', users: 2100950, percentage: 25, color: 'bg-red-400' },
    { id: 3, name: 'Location 3', users: 1980240, percentage: 15, color: 'bg-orange-400' },
    { id: 4, name: 'Location 4', users: 1504210, percentage: 15, color: 'bg-purple-400' },
  ];

  const locationData = locations || defaultLocations;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {locationData.map((location) => (
        <div key={location.id} className="flex items-center justify-between py-2">
          {/* Location info */}
          <div className="flex items-center space-x-3">
            {/* Color dot */}
            <div className={`w-3 h-3 rounded-full ${location.color} shadow-lg`}>
              <div className={`w-3 h-3 rounded-full ${location.color} blur-sm opacity-50`}></div>
            </div>
            
            {/* Location name */}
            <span className="text-slate-300 text-sm font-medium">
              {location.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4">
            {/* User count */}
            <span className="text-white font-semibold text-sm">
              {formatNumber(location.users)}
            </span>
            
            {/* Percentage */}
            <span className="text-slate-400 text-sm font-medium min-w-[3rem] text-right">
              {location.percentage}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationStatsPanel; 