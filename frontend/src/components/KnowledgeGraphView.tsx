import React, { useState, useEffect } from 'react';
import { Share2, Landmark, Utensils, Train, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export const KnowledgeGraphView: React.FC<{ onSelectPlaceId?: (id: number) => void }> = ({ onSelectPlaceId }) => {
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    api.getKnowledgeGraph().then(setGraphData).catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <Share2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">City Knowledge Graph & Cultural Links</h2>
          <p className="text-xs text-slate-500">Connecting historical epochs, cultural traditions, and urban transit nodes</p>
        </div>
      </div>

      {graphData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {graphData.nodes.map((node: any) => {
              const Icon = node.type === 'historical_era' ? Landmark : node.type === 'tradition' ? Utensils : Train;
              return (
                <div key={node.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">{node.type.replace('_', ' ')}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1">{node.name}</h3>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{node.description}</p>

                    <div className="space-y-1.5 mb-3">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Cultural Elements:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {node.cultural_insights.map((ins: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700">
                            {ins}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
                    Linked Places: <b>{node.linked_places.length} mapped locations</b>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            Attribution: {graphData.source}
          </div>
        </div>
      )}
    </div>
  );
};
