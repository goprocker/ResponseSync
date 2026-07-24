import React from 'react';
import { Zap, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

export interface InfrastructureNode {
  id: string;
  name: string;
  category: 'power' | 'subway' | 'water' | 'hospital';
  status: 'operational' | 'warning' | 'failed';
  impactScore: number;
  dependentNodes: string[];
}

interface CascadingMatrixGridProps {
  nodes: InfrastructureNode[];
  onSelectNode: (node: InfrastructureNode) => void;
  selectedNodeId?: string;
}

export const CascadingMatrixGrid: React.FC<CascadingMatrixGridProps> = ({
  nodes,
  onSelectNode,
  selectedNodeId
}) => {
  const getStatusBadge = (status: InfrastructureNode['status']) => {
    switch (status) {
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        return (
          <div
            key={node.id}
            onClick={() => onSelectNode(node)}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              isSelected
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                : 'bg-[#0e1017] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">{node.category}</span>
              <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded border ${getStatusBadge(node.status)}`}>
                {node.status}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white mb-2 font-sans">{node.name}</h4>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 border-t border-white/5 pt-2">
              <span>Failure Impact:</span>
              <span className="text-cyan-400 font-bold">{node.impactScore}/100</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
