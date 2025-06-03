import React from 'react';

interface AutomationIndicatorProps {
  position: string; // Tailwind positioning classes like "top-32 left-1/3"
  title: string;
  value: string;
  iconColor: string; // Tailwind color class like "bg-blue-500"
  icon: React.ReactNode;
}

const AutomationIndicator: React.FC<AutomationIndicatorProps> = ({
  position,
  title,
  value,
  iconColor,
  icon
}) => {
  return (
    <div className={`absolute ${position} bg-black/80 rounded-lg px-3 py-2 flex items-center space-x-2 shadow-lg border border-gray-700/50`}>
      <div className={`w-6 h-6 ${iconColor} rounded flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-gray-300 text-xs">{title}</div>
        <div className="text-white text-sm font-medium">{value}</div>
      </div>
    </div>
  );
};

export default AutomationIndicator; 