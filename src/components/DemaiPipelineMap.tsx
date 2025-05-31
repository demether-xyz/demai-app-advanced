// Technical Description: Interactive visualization of AI agent's thinking process using a neural network flow.
// Displays decision nodes and connections with animated particles to show data flow.
// Uses React Flow for the graph visualization with custom styled nodes and edges.

import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  NodeTypes,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component with enhanced futuristic styling
const CustomNode: React.FC<any> = ({ data }) => {
  const baseClasses = "px-6 py-4 rounded-xl border-2 backdrop-blur-md min-w-[220px] relative overflow-hidden transition-all duration-300 hover:scale-105";
  let typeClasses = "";
  let glowClass = "";
  let pulseColor = "bg-gray-400";
  let borderGlow = "";

  switch (data.type) {
    case 'analysis':
      typeClasses = 'border-fuchsia-400 bg-gradient-to-br from-fuchsia-500/30 to-purple-600/20 text-fuchsia-100';
      glowClass = 'shadow-[0_0_25px_5px_theme(colors.fuchsia.500/50)]';
      borderGlow = 'shadow-[inset_0_0_20px_theme(colors.fuchsia.400/30)]';
      pulseColor = 'bg-fuchsia-400';
      break;
    case 'action':
      typeClasses = 'border-lime-400 bg-gradient-to-br from-lime-400/30 to-green-600/20 text-lime-100';
      glowClass = 'shadow-[0_0_25px_5px_theme(colors.lime.400/50)]';
      borderGlow = 'shadow-[inset_0_0_20px_theme(colors.lime.400/30)]';
      pulseColor = 'bg-lime-400';
      break;
    case 'opportunity':
      typeClasses = 'border-cyan-400 bg-gradient-to-br from-cyan-400/30 to-blue-600/20 text-cyan-100';
      glowClass = 'shadow-[0_0_25px_5px_theme(colors.cyan.400/50)]';
      borderGlow = 'shadow-[inset_0_0_20px_theme(colors.cyan.400/30)]';
      pulseColor = 'bg-cyan-400';
      break;
    default:
      typeClasses = 'border-neutral-500 bg-gradient-to-br from-neutral-600/30 to-gray-800/20 text-neutral-100';
      glowClass = 'shadow-[0_0_25px_5px_theme(colors.neutral.500/50)]';
      borderGlow = 'shadow-[inset_0_0_20px_theme(colors.neutral.500/30)]';
  }

  return (
    <div className={`${baseClasses} ${typeClasses} ${glowClass} ${borderGlow} group`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `
        }} />
      </div>
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-gradient-to-r !from-cyan-400 !to-blue-400 !h-3 !w-3 !border-2 !border-white/50 !shadow-[0_0_10px_theme(colors.cyan.400)]" 
      />
      
      <div className="flex items-center relative z-10">
        <div className={`w-4 h-4 rounded-full mr-3 animate-pulse ${pulseColor} shadow-[0_0_10px_currentColor]`} />
        <div className="text-sm font-bold tracking-wide drop-shadow-lg">{data.label}</div>
      </div>
      
      {/* Scanning line effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-gradient-to-r !from-cyan-400 !to-blue-400 !h-3 !w-3 !border-2 !border-white/50 !shadow-[0_0_10px_theme(colors.cyan.400)]" 
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const DemaiPipelineMap: React.FC = () => {
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 0 },
      data: { label: 'Portfolio Analysis', type: 'analysis' },
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 50, y: 140 },
      data: { label: 'Market Conditions', type: 'analysis' },
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 450, y: 140 },
      data: { label: 'Risk Assessment', type: 'analysis' },
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 250, y: 280 },
      data: { label: 'Yield Comparison', type: 'opportunity' },
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 100, y: 420 },
      data: { label: 'Gas Optimization', type: 'action' },
    },
    {
      id: '6',
      type: 'custom',
      position: { x: 400, y: 420 },
      data: { label: 'Strategy Execution', type: 'action' },
    },
  ];

  const initialEdges: Edge[] = [
    { 
      id: 'e1-2', 
      source: '1', 
      target: '2', 
      animated: true, 
      style: { 
        stroke: 'url(#gradient1)', 
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 5px #d946ef)'
      }
    },
    { 
      id: 'e1-3', 
      source: '1', 
      target: '3', 
      animated: true, 
      style: { 
        stroke: 'url(#gradient1)', 
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 5px #d946ef)'
      }
    },
    { 
      id: 'e2-4', 
      source: '2', 
      target: '4', 
      animated: true, 
      style: { 
        stroke: 'url(#gradient2)', 
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 5px #22d3ee)'
      }
    },
    { 
      id: 'e3-4', 
      source: '3', 
      target: '4', 
      animated: true, 
      style: { 
        stroke: 'url(#gradient2)', 
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 5px #22d3ee)'
      }
    },
    { 
      id: 'e4-5', 
      source: '4', 
      target: '5', 
      animated: true, 
      style: { 
        stroke: 'url(#gradient3)', 
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 5px #a3e635)'
      }
    },
    { 
      id: 'e4-6', 
      source: '4', 
      target: '6', 
      animated: true, 
      style: { 
        stroke: 'url(#gradient3)', 
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 5px #a3e635)'
      }
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      
      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} />
      </div>
      
      {/* SVG Gradients for edges */}
      <svg className="absolute inset-0 pointer-events-none" style={{ width: 0, height: 0 }}>
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.8 }}
        className="bg-transparent"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          color="#00ffff" 
          gap={40} 
          size={2} 
          className="opacity-30"
        />
        <Controls className="!bg-black/80 !border-cyan-500/30 !backdrop-blur-md !rounded-xl [&>button]:!bg-cyan-500/20 [&>button]:!border-cyan-400/30 [&>button]:!backdrop-blur-sm [&>button_svg]:!fill-cyan-300 hover:[&>button]:!bg-cyan-400/30 [&>button]:!shadow-[0_0_10px_theme(colors.cyan.400/30)]" />
      </ReactFlow>
    </div>
  );
};

export default DemaiPipelineMap; 