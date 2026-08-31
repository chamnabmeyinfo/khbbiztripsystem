import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  RefreshCw,
  CloudOff,
  AlertCircle,
  Database,
  HardDrive,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

interface AutoSaveStatusPillProps {
  variant?: 'full' | 'compact' | 'minimal' | 'sidebar';
  className?: string;
  showDetailsOnHover?: boolean;
}

export const AutoSaveStatusPill: React.FC<AutoSaveStatusPillProps> = ({
  variant = 'full',
  className = '',
  showDetailsOnHover = false
}) => {
  const { autoSyncState, forceSyncAll, isFirebaseConnected, offlineMode, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [manualSyncSuccess, setManualSyncSuccess] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isManualSyncing) return;
    setIsManualSyncing(true);
    setManualSyncSuccess(false);
    try {
      await forceSyncAll();
      setManualSyncSuccess(true);
      setTimeout(() => {
        setManualSyncSuccess(false);
      }, 2500);
    } catch (err) {
      console.warn('Manual sync trigger:', err);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  // Determine current effective visual state
  const isSaving = autoSyncState.status === 'saving' || isManualSyncing;
  const isOffline = offlineMode || autoSyncState.status === 'offline' || !navigator.onLine;
  const isError = autoSyncState.status === 'error';
  const isSynced = !isSaving && !isOffline && !isError;

  // Minimal / Dot variant
  if (variant === 'minimal') {
    return (
      <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={`Data Sync: ${autoSyncState.message || (isSaving ? 'Auto-saving...' : 'Saved')}`}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              isSaving
                ? 'bg-amber-500 animate-ping'
                : isOffline
                ? 'bg-slate-400'
                : isError
                ? 'bg-rose-500'
                : 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
            }`}
          />
        </button>
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={`relative ${className}`} ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-2.5 py-1.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
            isSaving
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
              : isOffline
              ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
            ) : isOffline ? (
              <CloudOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : isError ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            ) : (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <div className="truncate">
              <span className="text-[10px] font-bold block truncate">
                {isSaving
                  ? 'Auto-saving...'
                  : isOffline
                  ? 'Saved locally (Offline)'
                  : 'Auto-saved (Cloud & Local)'}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-3 h-3 transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Popover */}
        {isOpen && renderPopoverCard()}
      </div>
    );
  }

  // Full & Compact Pill variant (Standard in Admin Header)
  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      ref={popoverRef}
      onMouseEnter={() => showDetailsOnHover && setIsOpen(true)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View Data Synchronization Status"
        className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none shadow-xs group ${
          isSaving
            ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
            : isOffline
            ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            : isError
            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-200 hover:border-emerald-300 dark:hover:border-emerald-700'
        }`}
      >
        {/* Status Icon */}
        <div className="flex items-center justify-center shrink-0">
          {isSaving ? (
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          ) : isOffline ? (
            <CloudOff className="w-3.5 h-3.5 text-slate-500" />
          ) : isError ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>

        {/* Status Text */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-[11px] tracking-tight">
            {isSaving
              ? (language === 'km' ? 'កំពុងរក្សាទុក...' : 'Auto-saving...')
              : isOffline
              ? (language === 'km' ? 'បានរក្សាទុក (Offline)' : 'Saved locally (Offline)')
              : isError
              ? 'Local sync only'
              : (language === 'km' ? 'បានរក្សាទុករួចរាល់' : 'All changes saved')}
          </span>

          {variant === 'full' && (
            <span className="hidden lg:inline text-[10px] opacity-75 font-mono text-slate-500 dark:text-slate-400 border-l border-slate-300/60 dark:border-slate-700 pl-1.5">
              {formatTime(autoSyncState.lastSavedAt)}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Details */}
      {isOpen && renderPopoverCard()}
    </div>
  );

  function renderPopoverCard() {
    return (
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 text-left animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                {language === 'km' ? 'ស្ថានភាពផ្ទុកទិន្នន័យ (Data Sync)' : 'Data Sync & State Engine'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Dual-layer auto-persistence & conflict prevention
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            LIVE
          </span>
        </div>

        {/* Sync Details List */}
        <div className="space-y-2 text-xs">
          {/* Cloud Firestore Status */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">
                  Cloud Firestore
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  {isFirebaseConnected && !offlineMode ? 'Connected • Real-time stream' : 'Standby / Local cache'}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </div>

          {/* LocalStorage Persistence */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-amber-500" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">
                  Client LocalStorage
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  100% Persisted across page refresh
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              Synced
            </span>
          </div>

          {/* Zero-Data-Loss Reconciler */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-sky-500" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">
                  Conflict-Free Reconciler
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">
                  Timestamp & version tracking enabled
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              Protected
            </span>
          </div>
        </div>

        {/* Status Meta Info */}
        <div className="px-1 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
          <span>Last Synchronized:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {formatTime(autoSyncState.lastSavedAt)}
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              manualSyncSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
            }`}
          >
            {isManualSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synchronizing Cloud & Local...</span>
              </>
            ) : manualSyncSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Synchronized Successfully!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Check & Sync Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
};
