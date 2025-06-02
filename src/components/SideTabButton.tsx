import React from 'react';

interface SideTabButtonProps {
  isOpen: boolean;
  onClick: () => void;
  side: 'left' | 'right';
  position: 'top-1/3' | 'top-1/2' | 'top-2/3';
  openLabel: string;
  closedLabel: string;
  openColor: string;
  hoverColor: string;
}

const SideTabButton: React.FC<SideTabButtonProps> = ({
  isOpen,
  onClick,
  side,
  position,
  openLabel,
  closedLabel,
  openColor,
  hoverColor
}) => {
  const positionClass = side === 'left' ? 'left-0' : 'right-0';
  const roundedClass = side === 'left' ? 'rounded-r-lg' : 'rounded-l-lg';
  const roundedSmallClass = side === 'left' ? 'rounded-r-md' : 'rounded-l-md';
  const rotationDegrees = side === 'left' ? -90 : 90;
  
  // Longer dimensions to fit full text without truncation
  const baseClasses = `fixed ${positionClass} ${position} transform -translate-y-1/2 transition-all duration-300 z-50 flex items-center justify-center`;
  const openClasses = `${openColor} text-white w-12 h-48 ${roundedClass} shadow-lg`;
  const closedClasses = `bg-gray-800/60 ${hoverColor} text-gray-300 hover:text-white w-10 h-32 ${roundedSmallClass}`;
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isOpen ? openClasses : closedClasses}`}
    >
      <div 
        className="text-xs font-medium tracking-wider whitespace-nowrap"
        style={{ transform: `rotate(${rotationDegrees}deg)` }}
      >
        {isOpen ? openLabel : closedLabel}
      </div>
    </button>
  );
};

export default SideTabButton; 