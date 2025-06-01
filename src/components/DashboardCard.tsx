import React from 'react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  comparison?: string;
  children?: React.ReactNode;
  className?: string;
  chartElement?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  value,
  comparison,
  children,
  className = '',
  chartElement
}) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Subtle gradient border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-orange-500/20 p-[1px] opacity-60 group-hover:opacity-80 transition-opacity duration-300">
        <div className="h-full w-full rounded-3xl bg-gray-900/80 backdrop-blur-2xl" />
      </div>
      
      {/* Card content */}
      <div className="relative rounded-3xl bg-gray-900/80 backdrop-blur-2xl border border-white/10 p-8 h-full flex flex-col">
        {/* Header section */}
        <div className="flex-1">
          <h3 className="text-white/90 text-2xl font-light mb-2">{title}</h3>
          {subtitle && (
            <p className="text-white/60 text-base mb-6">{subtitle}</p>
          )}
          
          {/* Value display */}
          {value && (
            <div className="mb-4">
              <div className="text-white text-4xl font-light mb-2">{value}</div>
              {comparison && (
                <div className="text-white/60 text-sm">{comparison}</div>
              )}
            </div>
          )}
          
          {/* Custom children content */}
          {children}
        </div>
        
        {/* Chart/visual element */}
        {chartElement && (
          <div className="mt-6 flex-shrink-0">
            {chartElement}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard; 