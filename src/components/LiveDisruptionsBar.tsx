import React, { useState } from 'react';
import { AlertTriangle, Info, ThumbsUp, X, ChevronRight, MessageSquarePlus } from 'lucide-react';
import { LiveDisruption } from '../types';
import { upvoteDisruptionInFirestore } from '../firebase';

interface LiveDisruptionsBarProps {
  disruptions: LiveDisruption[];
  onReportClick: () => void;
}

export const LiveDisruptionsBar: React.FC<LiveDisruptionsBarProps> = ({
  disruptions,
  onReportClick,
}) => {
  const [closed, setClosed] = useState<boolean>(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  if (closed || disruptions.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span>Geen actieve verstoringen gemeld op het busnetwerk in Venlo & regio.</span>
        </div>
        <button
          onClick={onReportClick}
          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 text-[11px] transition-colors"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Vertraging melden</span>
        </button>
      </div>
    );
  }

  const latest = disruptions[0];

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedIds[id]) return;
    setUpvotedIds((prev) => ({ ...prev, [id]: true }));
    try {
      await upvoteDisruptionInFirestore(id);
    } catch (err) {
      console.warn('Upvote failed:', err);
    }
  };

  return (
    <div className="bg-amber-500/10 border-l-2 border-amber-500 border-y border-r border-slate-800/80 p-3.5 rounded-r-xl flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-tighter mb-0.5 flex items-center gap-2">
            <span>LIJN {latest.line}: {latest.title}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed truncate">
            {latest.description} — <span className="text-slate-500 text-[11px]">Gemeld door {latest.reportedBy}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={(e) => handleUpvote(latest.id, e)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
            upvotedIds[latest.id]
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Bevestig deze storing"
        >
          <ThumbsUp className="w-3 h-3" />
          <span>{latest.upvotes + (upvotedIds[latest.id] ? 1 : 0)}</span>
        </button>

        <button
          onClick={onReportClick}
          className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 transition-colors"
        >
          <MessageSquarePlus className="w-3 h-3 text-blue-400" />
          <span>Melden</span>
        </button>

        <button
          onClick={() => setClosed(true)}
          className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded"
          title="Verberg melding"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
