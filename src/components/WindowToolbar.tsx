import React from 'react';

interface WindowToolbarProps {
  onGridLayout: () => void;
  onCascadeLayout: () => void;
  onCollapseAll: () => void;
}

const WindowToolbar: React.FC<WindowToolbarProps> = ({
  onGridLayout,
  onCascadeLayout,
  onCollapseAll
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-1 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg p-1">
      <button
        onClick={onGridLayout}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-200 group"
        title="Grid Layout"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      
      <button
        onClick={onCascadeLayout}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-200 group"
        title="Cascade Layout"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </button>
      
      <button
        onClick={onCollapseAll}
        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-md transition-all duration-200 group"
        title="Collapse All Windows"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
    </div>
  );
};

export default WindowToolbar; 