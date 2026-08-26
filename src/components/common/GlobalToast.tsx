import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Star, CheckCircle2, Info, X } from 'lucide-react';

export const GlobalToast: React.FC = () => {
  const { toastMessage, clearToast } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      id="global-system-toast"
      className="fixed bottom-6 right-6 z-[100] max-w-sm sm:max-w-md bg-slate-900/95 dark:bg-slate-900/98 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200 flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 ring-1 ring-amber-500/30">
        {toastMessage.icon === 'star' ? (
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
        ) : toastMessage.icon === 'check' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <Sparkles className="w-5 h-5 text-amber-400" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
          <span>{toastMessage.text}</span>
        </div>
        {toastMessage.subtext && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {toastMessage.subtext}
          </p>
        )}
      </div>

      <button
        onClick={clearToast}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
