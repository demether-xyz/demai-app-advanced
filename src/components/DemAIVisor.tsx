import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Background Effects (Subtler) ---
const FloatingParticles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(500 * 3); // Further reduced
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30; // Wider spread for perspective
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Deeper field
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.002;
      ref.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00aaff" size={0.01} sizeAttenuation depthWrite={false} opacity={0.15} />
    </Points>
  );
};

const VisorGrid: React.FC = () => {
  const gridLines = useMemo(() => {
    const lines = [];
    const size = 25; 
    const divisions = 25;
    for (let i = 0; i <= divisions; i++) {
      const position = (i / divisions - 0.5) * size;
      if (i % 4 === 0) { 
        const hGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-size / 2, position, -20), new THREE.Vector3(size / 2, position, -20)]);
        lines.push(hGeo);
        const vGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(position, -size / 2, -20), new THREE.Vector3(position, size / 2, -20)]);
        lines.push(vGeo);
      }
    }
    return lines;
  }, []);

  return (
    <group rotation={[0.2, 0, 0]} position={[0, -2, 0]}> {/* Slight tilt to match UI panel tilt */} 
      {gridLines.map((geometry, i) => (
        <line key={i}>
           <primitive object={geometry} />
           <lineBasicMaterial color="#0055aa" transparent opacity={0.04} />
        </line>
      ))}
    </group>
  );
};

// --- Card Components (LMTRIX Style) ---
interface ItemData {
  id: string;
  title: string;
  protocol: string; // Or category/type
  apy: string;      // Or primary stat
  status: 'active' | 'pending' | 'optimizing' | 'info'; // Added 'info' for tools
  tvl: string;      // Or secondary stat
  details?: Record<string, string | number>;
  type: 'strategy' | 'tool';
  lastSeen?: string; // For LMTRIX style
  risk?: 'low' | 'medium' | 'high'; // For LMTRIX style
}

interface ListItemCardProps {
  item: ItemData;
  isSelected: boolean;
  onClick: () => void;
}

const ListItemCard: React.FC<ListItemCardProps> = ({ item, isSelected, onClick }) => {
  const statusColors = {
    active: '#22c55e',    // green
    pending: '#eab308',   // yellow
    optimizing: '#06b6d4', // cyan
    info: '#5e87ff'       // blue for tools/info
  };
  const riskColors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#ef4444'
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-3 mb-2 rounded-md cursor-pointer transition-all duration-200 ease-out
        border border-transparent
        hover:bg-[rgba(0,100,150,0.1)] hover:border-cyan-600/50
        ${isSelected 
          ? 'bg-[rgba(0,120,180,0.2)] border-cyan-500 scale-[1.01] shadow-lg shadow-cyan-500/10' 
          : 'bg-[rgba(0,50,80,0.1)]'}
      `}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className={`text-sm font-medium ${isSelected ? 'text-cyan-300' : 'text-cyan-400'}`}>{item.title}</h3>
        {item.lastSeen && <span className="text-xs text-gray-500">{item.lastSeen}</span>}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className={`font-mono ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>{item.protocol}</span>
        {item.apy !== 'N/A' && <span className={`font-mono ${isSelected ? 'text-green-400' : 'text-green-500'}`}>{item.apy}</span>}
      </div>
      {item.risk && (
        <div className="mt-1 flex items-center">
          <span className="text-xs text-gray-500 mr-2">Risk:</span>
          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: riskColors[item.risk] }} />
          <span className={`ml-2 text-xs font-medium`} style={{ color: riskColors[item.risk] }}>
            {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)}
          </span>
        </div>
      )}
      {/* Minimal status dot if no risk */} 
      {!item.risk && (
         <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: statusColors[item.status] }} />
      )}
    </div>
  );
};

interface MainDisplayPanelProps {
  item: ItemData;
  // No onClose for integrated panel
}

const MainDisplayPanel: React.FC<MainDisplayPanelProps> = ({ item }) => {
  const statusColors = {
    active: '#22c55e',
    pending: '#eab308',
    optimizing: '#06b6d4',
    info: '#5e87ff'
  };
  const riskColors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#ef4444'
  };
  const baseAccent = item.type === 'strategy' ? 'cyan' : 'blue'; // Use blue for tools if they are info-centric

  return (
    <div 
      className={`
        p-6 rounded-lg h-full 
        bg-[rgba(0,30,50,0.5)] backdrop-blur-lg border border-cyan-600/30
        shadow-xl shadow-black/30
        flex flex-col justify-between  /* Ensure content spreads and button is at bottom */
      `}
    >
      <div> {/* Content wrapper */}
        <div className="flex items-center mb-3">
          <div className={`w-3 h-3 rounded-full mr-2.5`} style={{ backgroundColor: statusColors[item.status], boxShadow: `0 0 8px ${statusColors[item.status]}` }}/>
          <h2 className={`text-xl font-semibold text-${baseAccent}-300`}>{item.title}</h2>
        </div>
        
        <div className={`mb-4 px-2.5 py-1 inline-block rounded-md text-xs font-medium text-${statusColors[item.status]}`}
             style={{ backgroundColor: statusColors[item.status] + '15', border: `1px solid ${statusColors[item.status]}70`}}>
          {item.status.toUpperCase()}
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 my-4 text-sm font-mono">
          <div><span className="text-gray-400">{item.type === 'strategy' ? 'Protocol' : 'Category'}:</span> <span className={`font-medium text-${baseAccent}-400`}>{item.protocol}</span></div>
          {item.apy !== 'N/A' && <div><span className="text-gray-400">{item.type === 'strategy' ? 'APY' : 'Metric'}:</span> <span className={`text-lg font-bold text-green-400`}>{item.apy}</span></div>}
          <div><span className="text-gray-400">{item.type === 'strategy' ? 'TVL' : 'Status'}:</span> <span className="font-medium text-gray-200">{item.tvl}</span></div>
          {item.lastSeen && <div><span className="text-gray-400">Last Seen:</span> <span className="font-medium text-gray-300">{item.lastSeen}</span></div>}
          {item.risk && 
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Risk Level:</span> 
              <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: riskColors[item.risk] }}/>
              <span className={`ml-2 font-medium`} style={{ color: riskColors[item.risk] }}>
                {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)}
              </span>
            </div>
          }
          {/* Dynamic details from item.details */}
          {item.details && Object.entries(item.details).map(([key, value]) => (
            <div key={key} className="col-span-2"><span className="text-gray-400">{key}:</span> <span className="font-medium text-gray-200">{String(value)}</span></div>
          ))}
        </div>
        
        {item.type === 'strategy' && 
          <p className="text-xs text-gray-500 mt-2 mb-4">
            Automated strategy. Performance data is updated periodically. High APY may involve higher risk.
          </p>
        }
        {item.type === 'tool' && 
          <p className="text-xs text-gray-500 mt-2 mb-4">
            DemAI analysis tool. Provides insights based on current market data and internal models.
          </p>
        }
      </div>

      {/* Action Buttons at the bottom */}
      <div className="mt-auto pt-4 border-t border-cyan-700/20">
        <div className="flex space-x-3">
          <button className={`flex-1 py-2 px-4 rounded-md bg-${baseAccent}-600/70 hover:bg-${baseAccent}-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-${baseAccent}-600/30 text-sm`}>
            Engage / Execute
          </button>
          <button className={`flex-1 py-2 px-4 rounded-md bg-gray-600/40 hover:bg-gray-600/60 text-gray-300 font-medium transition-all duration-200 text-sm`}>
            Further Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Visor Component (LMTRIX Style) ---
const DemAIVisor: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

  // Sample Data (adapted for LMTRIX style)
  const strategies: ItemData[] = [
    { id: 's1', title: "Convex Autocompound", protocol: "Convex (ETH)", apy: "14.2%", status: "active", tvl: "$2.4M", type: 'strategy', lastSeen: "2m ago", risk: 'medium' },
    { id: 's2', title: "Curve LP Farming", protocol: "Curve (USDC/DAI)", apy: "11.8%", status: "active", tvl: "$1.8M", type: 'strategy', lastSeen: "5m ago", risk: 'low' },
    { id: 's3', title: "Uniswap V3 Optimize", protocol: "Uniswap (WBTC/ETH)", apy: "9.5%", status: "optimizing", tvl: "$950K", type: 'strategy', lastSeen: "10m ago", risk: 'medium' },
    { id: 's4', title: "Lido Staking (ETH)", protocol: "Lido Finance", apy: "5.2%", status: "pending", tvl: "$3.1M", type: 'strategy', lastSeen: "1h ago", risk: 'low' },
    { id: 's5', title: "1inch Arbitrage", protocol: "1inch Network", apy: "8.7%", status: "active", tvl: "$1.2M", type: 'strategy', lastSeen: "30s ago", risk: 'high' },
  ];

  const tools: ItemData[] = [
    { id: 't1', title: "Portfolio Health", protocol: "demAI Analytics", apy: "N/A", status: "info", tvl: "Optimal", type: 'tool', lastSeen: "Now", risk: 'low' },
    { id: 't2', title: "Smart Contract Audit", protocol: "demAI Security", apy: "N/A", status: "info", tvl: "3 Issues Found", type: 'tool', lastSeen: "1d ago", risk: 'medium' },
    { id: 't3', title: "Gas Forecast", protocol: "demAI GasNet", apy: "N/A", status: "info", tvl: "~30 Gwei", type: 'tool', lastSeen: "Now", risk: 'low' },
    { id: 't4', title: "Alpha Yield Aggregator", protocol: "demAI Discovery", apy: "N/A", status: "info", tvl: "18 new", type: 'tool', lastSeen: "5m ago" },
  ];
  
  useEffect(() => {
    // Pre-select the first strategy by default if no item is selected
    if (!selectedItem && strategies.length > 0) {
      setSelectedItem(strategies[0]);
    }
  }, []); // Run once on mount

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black text-gray-300 font-sans" // Using system font for LMTRIX style
      style={{ transformStyle: 'preserve-3d' }} // Needed for child perspective
    >
      {/* 3D Background - Subtler to not overpower UI panels */}
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }} className="absolute inset-0 z-0">
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 10, -5]} intensity={0.3} color="#00aaff" />
        <pointLight position={[0, -10, -5]} intensity={0.2} color="#5500ff" />
        <FloatingParticles />
        <VisorGrid />
      </Canvas>

      {/* Main UI Container with 3D Perspective Tilt */}
      <div 
        className="absolute inset-0 z-10 flex p-6 md:p-8 space-x-4 md:space-x-6"
        style={{
          perspective: '2000px',
          transform: 'rotateX(10deg) scale(0.9)', // Overall tilt and slight scale down
          transformOrigin: 'center 80%' // Tilt around a point lower on the screen
        }}
      >
        {/* Left Column - Strategies (LMTRIX Style) */}
        <div className="w-1/3 lg:w-1/4 h-full flex flex-col bg-[rgba(0,20,35,0.4)] backdrop-blur-md border border-cyan-700/30 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-cyan-700/30">
            <h2 className="text-sm font-semibold text-cyan-400 tracking-wider uppercase">Active Strategies</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-cyan-600/40 scrollbar-track-transparent">
            {strategies.map(strat => (
              <ListItemCard 
                key={strat.id} 
                item={strat} 
                isSelected={selectedItem?.id === strat.id} 
                onClick={() => setSelectedItem(strat)} 
              />
            ))}
          </div>
        </div>

        {/* Center Display Area (LMTRIX Style) */}
        <div className="flex-1 h-full bg-[rgba(0,15,25,0.4)] backdrop-blur-md border border-cyan-700/30 rounded-lg shadow-2xl overflow-hidden">
          {selectedItem ? (
            <MainDisplayPanel item={selectedItem} />
          ) : (
            <div className="p-6 h-full flex items-center justify-center text-gray-500">
              Select an item from the side panels to view details.
            </div>
          )}
        </div>

        {/* Right Column - Tools (LMTRIX Style) */}
        <div className="w-1/3 lg:w-1/4 h-full flex flex-col bg-[rgba(0,20,35,0.4)] backdrop-blur-md border border-cyan-700/30 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-cyan-700/30">
            <h2 className="text-sm font-semibold text-cyan-400 tracking-wider uppercase">Analysis Tools</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-cyan-600/40 scrollbar-track-transparent">
            {tools.map(tool => (
              <ListItemCard 
                key={tool.id} 
                item={tool} 
                isSelected={selectedItem?.id === tool.id} 
                onClick={() => setSelectedItem(tool)} 
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* HUD Overlay - Kept very minimal, consider if needed with new design */}
      {/* 
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-cyan-500/50 opacity-70" />
        <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50 opacity-70" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-cyan-500/50 opacity-70" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-cyan-500/50 opacity-70" />
      </div>
      */}
    </div>
  );
};

export default DemAIVisor; 