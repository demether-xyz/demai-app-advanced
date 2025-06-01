import React from 'react';
import StaticTerrain from './StaticTerrain';

interface OrionLayoutProps {
  children: React.ReactNode;
}

const OrionLayout: React.FC<OrionLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Lightweight Static Terrain Background */}
      <div className="absolute inset-0 z-0">
        <StaticTerrain />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default OrionLayout; 