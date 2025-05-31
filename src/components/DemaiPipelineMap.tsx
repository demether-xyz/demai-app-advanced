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

// Custom node component with "degen" styling (icons removed)
const CustomNode: React.FC<any> = ({ data }) => {
  const baseClasses = "px-5 py-3 rounded-lg border-2 backdrop-blur-sm min-w-[200px]";
  let typeClasses = "";
  let glowClass = "";
  let pulseColor = "bg-gray-400";

  switch (data.type) {
    case 'analysis':
      typeClasses = 'border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-100';
      glowClass = 'shadow-[0_0_15px_2px_theme(colors.fuchsia.500)]';
      pulseColor = 'bg-fuchsia-400';
      break;
    case 'action':
      typeClasses = 'border-lime-400 bg-lime-400/20 text-lime-100';
      glowClass = 'shadow-[0_0_15px_2px_theme(colors.lime.400)]';
      pulseColor = 'bg-lime-300';
      break;
    case 'opportunity':
      typeClasses = 'border-cyan-400 bg-cyan-400/20 text-cyan-100';
      glowClass = 'shadow-[0_0_15px_2px_theme(colors.cyan.400)]';
      pulseColor = 'bg-cyan-300';
      break;
    default:
      typeClasses = 'border-neutral-600 bg-neutral-700/20 text-neutral-100';
      glowClass = 'shadow-[0_0_15px_2px_theme(colors.neutral.500)]';
  }

  return (
    <div className={`${baseClasses} ${typeClasses} ${glowClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-neutral-500 !h-2.5 !w-2.5 !border-0" />
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2.5 animate-pulse ${pulseColor}`} />
        <div className="text-sm font-semibold">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-neutral-500 !h-2.5 !w-2.5 !border-0" />
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
      position: { x: 50, y: 120 },
      data: { label: 'Market Conditions', type: 'analysis' },
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 450, y: 120 },
      data: { label: 'Risk Assessment', type: 'analysis' },
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 250, y: 240 },
      data: { label: 'Yield Comparison', type: 'opportunity' },
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 100, y: 360 },
      data: { label: 'Gas Optimization', type: 'action' },
    },
    {
      id: '6',
      type: 'custom',
      position: { x: 400, y: 360 },
      data: { label: 'Strategy Execution', type: 'action' },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#d946ef', strokeWidth: 2.5 } }, // To Analysis (Fuchsia)
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#d946ef', strokeWidth: 2.5 } }, // To Analysis (Fuchsia)
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2.5 } }, // To Opportunity (Cyan)
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2.5 } }, // To Opportunity (Cyan)
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#a3e635', strokeWidth: 2.5 } }, // To Action (Lime)
    { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: '#a3e635', strokeWidth: 2.5 } }, // To Action (Lime)
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-r from-neutral-950 via-purple-900 to-neutral-950">
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
        <Background variant={BackgroundVariant.Lines} color="#581c87" gap={25} size={2} />
        <Controls className="!bg-neutral-800/80 !border-purple-700 [&>button]:!bg-purple-600/50 [&>button]:!border-purple-500 [&>button_svg]:!fill-neutral-100 hover:[&>button]:!bg-purple-500/70" />
      </ReactFlow>
    </div>
  );
};

export default DemaiPipelineMap; 