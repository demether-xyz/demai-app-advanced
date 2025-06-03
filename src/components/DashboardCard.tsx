import React from 'react';

// Protocol Icons Component
const ProtocolIcon = ({ name, className = "w-4 h-4" }: { name: string; className?: string }): React.ReactElement => {
  const iconMap: { [key: string]: React.ReactElement } = {
    aave: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.884-17.596L16 4l3.884 10.404-3.884 1.544-3.884-1.544z" fill="#B6509E"/>
      </svg>
    ),
    compound: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#00D395"/>
        <path d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4zm5.6 8.8a1.6 1.6 0 0 1-1.6 1.6H12a1.6 1.6 0 0 1 0-3.2h8a1.6 1.6 0 0 1 1.6 1.6zm0 4a1.6 1.6 0 0 1-1.6 1.6H12a1.6 1.6 0 0 1 0-3.2h8a1.6 1.6 0 0 1 1.6 1.6z" fill="#fff"/>
      </svg>
    ),
    curve: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#40DBD0"/>
        <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="#fff"/>
      </svg>
    ),
    uniswap: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF007A"/>
        <path d="M16 4L8 20h16L16 4z" fill="#fff"/>
      </svg>
    ),
    yearn: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#0074D9"/>
        <path d="M16 8l8 8-8 8-8-8 8-8z" fill="#fff"/>
      </svg>
    ),
    balancer: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#1e1e1e"/>
        <path d="M12 8h8v16h-8V8z" fill="#fff"/>
      </svg>
    ),
    convex: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF6B35"/>
        <path d="M8 12h16v8H8v-8z" fill="#fff"/>
      </svg>
    ),
    sushiswap: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FA52A0"/>
        <path d="M16 6l6 10-6 10L10 16 16 6z" fill="#fff"/>
      </svg>
    ),
    makerdao: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#1AAB9B"/>
        <path d="M8 24V8l8 8 8-8v16l-8-8-8 8z" fill="#fff"/>
      </svg>
    ),
    rocketpool: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF6B4A"/>
        <path d="M16 6l8 12H8l8-12z" fill="#fff"/>
      </svg>
    ),
    frax: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#000"/>
        <path d="M10 10h12v12H10V10z" fill="#fff"/>
      </svg>
    ),
    lido: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#00A3FF"/>
        <path d="M16 4l8 16H8l8-16z" fill="#fff"/>
      </svg>
    ),
    gmx: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#4F46E5"/>
        <rect x="8" y="12" width="16" height="8" fill="#fff"/>
      </svg>
    ),
    pendle: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF6B6B"/>
        <circle cx="16" cy="16" r="8" fill="#fff"/>
      </svg>
    ),
    tokemak: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#00E5FF"/>
        <path d="M12 12h8v8h-8v-8z" fill="#fff"/>
      </svg>
    ),
    ethereum: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#627EEA"/>
        <path d="M16 4v10l8-4-8-6zm0 11v9l8-12-8 3z" fill="#fff"/>
      </svg>
    ),
  };
  
  return iconMap[name] || null;
};

interface DashboardCardProps {
  id: string;
  title: string;
  icon?: string;
  color: string;
  aiPriority: 'high' | 'medium' | 'low';
  category: 'yield' | 'risk' | 'opportunity' | 'alert' | 'overview';
  content: React.ReactNode;
  isExpanded: boolean;
  onExpand: (id: string) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  title,
  icon,
  color,
  aiPriority,
  category,
  content,
  isExpanded,
  onExpand
}) => {
  if (isExpanded) return null;

  return (
    <div
      onClick={() => onExpand(id)}
      className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl cursor-pointer hover:bg-slate-800/60 transition-all duration-200 group relative backdrop-blur-md"
    >
      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Protocol Icon - More Prominent */}
            {icon && (
              <div className="flex-shrink-0">
                <ProtocolIcon name={icon} className="w-5 h-5 text-slate-300" />
              </div>
            )}
            
            {/* Title - Cleaner */}
            <h3 className="text-slate-200 font-normal text-sm">
              {title}
            </h3>
          </div>
          
          {/* Simplified Category Badge */}
          {category !== 'overview' && (
            <div className={`px-2 py-1 rounded-md text-xs font-normal ${
              category === 'yield' ? 'bg-emerald-900/40 text-emerald-300' :
              category === 'risk' ? 'bg-red-900/40 text-red-300' :
              category === 'opportunity' ? 'bg-blue-900/40 text-blue-300' :
              category === 'alert' ? 'bg-amber-900/40 text-amber-300' :
              'bg-slate-700/40 text-slate-300'
            }`}>
              {category.toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Main Content - Simplified */}
        <div className="space-y-2">
          {content}
        </div>
        
        {/* Bottom Info - Minimal */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/30">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>AI: {aiPriority === 'high' ? '95%' : aiPriority === 'medium' ? '85%' : '75%'}</span>
          </div>
          <div className="text-xs text-slate-500">
            TVL: ${Math.floor(Math.random() * 1000)}M
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard; 