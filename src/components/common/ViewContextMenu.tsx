import React, { useEffect, useRef } from 'react';
import { Star, RotateCcw, Check, Sparkles, Layout, ExternalLink, X } from 'lucide-react';
import { ActiveView } from '../../types';

export interface ViewContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetView: ActiveView;
  targetTab?: string;
  title: string;
  subtitle?: string;
  isCurrentDefaultView: boolean;
  isCurrentDefaultTab?: boolean;
}

interface ViewContextMenuProps {
  menu: ViewContextMenuState | null;
  onClose: () => void;
  onSetDefaultView: (view: ActiveView, tab?: string) => void;
  onSetDefaultTab?: (tab: string) => void;
  onResetDefault: () => void;
  onOpenView?: (view: ActiveView, tab?: string) => void;
}

export const ViewContextMenu: React.FC<ViewContextMenuProps> = ({
  menu,
  onClose,
  onSetDefaultView,
  onSetDefaultTab,
  onResetDefault,
  onOpenView
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu?.isOpen) return;

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener('pointerdown', handlePointerDown, { capture: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menu?.isOpen, onClose]);

  if (!menu || !menu.isOpen) return null;

  // Screen bounds safety adjustment
  const menuWidth = 260;
  const menuHeight = 220;
  const adjustedX = Math.max(12, Math.min(menu.x, window.innerWidth - menuWidth - 16));
  const adjustedY = Math.max(12, Math.min(menu.y, window.innerHeight - menuHeight - 16));

  return (
    <div
      ref={menuRef}
      id="view-context-menu"
      style={{
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
        zIndex: 9999
      }}
      className="fixed w-[260px] bg-white/98 dark:bg-slate-900/98 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 p-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Info */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <div className="text-[11px] font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{menu.title}</span>
          </div>
          {menu.subtitle && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {menu.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action List */}
      <div className="py-1 space-y-0.5 text-xs">
        {/* Set as Default Startup View */}
        <button
          onClick={() => {
            onSetDefaultView(menu.targetView, menu.targetTab);
            onClose();
          }}
          className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left font-bold transition-colors cursor-pointer ${
            menu.isCurrentDefaultView
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Star
            className={`w-4 h-4 shrink-0 ${
              menu.isCurrentDefaultView
                ? 'fill-amber-400 text-amber-500'
                : 'text-amber-500'
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate">
              {menu.isCurrentDefaultView ? 'Default Startup View' : 'Set as Default View'}
            </div>
            <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 truncate">
              {menu.isCurrentDefaultView ? 'Currently active default' : 'Opens on app launch'}
            </div>
          </div>
          {menu.isCurrentDefaultView && (
            <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
        </button>

        {/* Set as Default Tab (if targetTab is provided) */}
        {menu.targetTab && onSetDefaultTab && (
          <button
            onClick={() => {
              onSetDefaultTab(menu.targetTab!);
              onClose();
            }}
            className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left font-bold transition-colors cursor-pointer ${
              menu.isCurrentDefaultTab
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {menu.isCurrentDefaultTab ? 'Default Admin Tab' : 'Set as Default Tab'}
              </div>
              <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 truncate">
                Opens first in Back-Office
              </div>
            </div>
            {menu.isCurrentDefaultTab && (
              <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            )}
          </button>
        )}

        {/* Open View */}
        {onOpenView && (
          <button
            onClick={() => {
              onOpenView(menu.targetView, menu.targetTab);
              onClose();
            }}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="truncate font-semibold">Switch to View Now</span>
            </div>
          </button>
        )}

        {/* Reset to Standard Defaults */}
        {menu.isCurrentDefaultView && (
          <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onResetDefault();
                onClose();
              }}
              className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="truncate font-semibold">Reset to Default (Explore)</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
