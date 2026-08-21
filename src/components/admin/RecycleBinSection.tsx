import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RecoverableEntityType, DeletedItemRecord } from '../../types';
import {
  RotateCcw,
  Trash2,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Building2,
  Plane,
  Briefcase,
  Calculator,
  ShoppingCart,
  CreditCard,
  Receipt,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArchiveRestore
} from 'lucide-react';

const ENTITY_CONFIGS: Record<
  RecoverableEntityType,
  { label: string; icon: React.ElementType; color: string; badge: string }
> = {
  supplier: {
    label: 'Supplier',
    icon: Building2,
    color: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  package: {
    label: 'Tour Package',
    icon: Plane,
    color: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800'
  },
  booking: {
    label: 'Booking',
    icon: Briefcase,
    color: 'text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
  },
  cost_template: {
    label: 'Cost Template',
    icon: Calculator,
    color: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  },
  purchase_order: {
    label: 'Purchase Order',
    icon: ShoppingCart,
    color: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  customer_payment: {
    label: 'Customer Payment',
    icon: CreditCard,
    color: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  supplier_payment: {
    label: 'Supplier Payment',
    icon: CreditCard,
    color: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800'
  },
  expense: {
    label: 'Expense',
    icon: Receipt,
    color: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  },
  invoice: {
    label: 'Tax Invoice',
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  }
};

export const RecycleBinSection: React.FC = () => {
  const { deletedItems, recoverItem, permanentDeleteItem, restoreAllDeleted, emptyRecycleBin } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<RecoverableEntityType | 'all'>('all');
  const [inspectRecord, setInspectRecord] = useState<DeletedItemRecord | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'restore_one' | 'purge_one' | 'restore_all' | 'empty_bin';
    item?: DeletedItemRecord;
  }>({ isOpen: false, action: 'restore_one' });

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return deletedItems.filter(item => {
      const matchesType = selectedType === 'all' || item.entityType === selectedType;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.deletedBy && item.deletedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.originalId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [deletedItems, selectedType, searchQuery]);

  // Counts by Type
  const countsByType = useMemo(() => {
    const counts: Record<string, number> = { all: deletedItems.length };
    deletedItems.forEach(item => {
      counts[item.entityType] = (counts[item.entityType] || 0) + 1;
    });
    return counts;
  }, [deletedItems]);

  const handleConfirmAction = () => {
    if (confirmModal.action === 'restore_one' && confirmModal.item) {
      recoverItem(confirmModal.item.id);
    } else if (confirmModal.action === 'purge_one' && confirmModal.item) {
      permanentDeleteItem(confirmModal.item.id);
    } else if (confirmModal.action === 'restore_all') {
      restoreAllDeleted(selectedType === 'all' ? undefined : selectedType);
    } else if (confirmModal.action === 'empty_bin') {
      emptyRecycleBin(selectedType === 'all' ? undefined : selectedType);
    }
    setConfirmModal({ isOpen: false, action: 'restore_one' });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Ribbon ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <ArchiveRestore className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Data Recovery Center & Recycle Bin</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  {deletedItems.length} Deleted Items
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every deleted record from all backend modules is safely archived with 100% loss-free instant recovery.
              </p>
            </div>
          </div>
        </div>

        {/* Global Batch Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {deletedItems.length > 0 && (
            <>
              <button
                onClick={() => setConfirmModal({ isOpen: true, action: 'restore_all' })}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore All {selectedType !== 'all' ? `(${selectedType})` : ''}</span>
              </button>

              <button
                onClick={() => setConfirmModal({ isOpen: true, action: 'empty_bin' })}
                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Entity Type Filter Tabs ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedType === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span>All Recoverable</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            selectedType === 'all' ? 'bg-white/20 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            {countsByType.all || 0}
          </span>
        </button>

        {(Object.keys(ENTITY_CONFIGS) as RecoverableEntityType[]).map(typeKey => {
          const cfg = ENTITY_CONFIGS[typeKey];
          const Icon = cfg.icon;
          const count = countsByType[typeKey] || 0;
          const isSelected = selectedType === typeKey;

          return (
            <button
              key={typeKey}
              onClick={() => setSelectedType(typeKey)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cfg.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Toolbar ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deleted records by title, code, supplier, or staff email..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block whitespace-nowrap">
          Showing {filteredRecords.length} records
        </div>
      </div>

      {/* ── Deleted Items List Table / Cards ──────────────────────────── */}
      {filteredRecords.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4">Staff Operator</th>
                  <th className="py-3 px-4 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredRecords.map(item => {
                  const cfg = ENTITY_CONFIGS[item.entityType] || ENTITY_CONFIGS.supplier;
                  const Icon = cfg.icon;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/30 transition-colors">
                      {/* Entity Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${cfg.badge}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      {/* Title & Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans line-clamp-1">
                            {item.subtitle}
                          </div>
                        )}
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                          ID: {item.originalId}
                        </div>
                      </td>

                      {/* Deletion Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(item.deletedAt).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Staff Operator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>{item.deletedBy || 'admin@khbevents.com'}</span>
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Snapshot */}
                          <button
                            onClick={() => setInspectRecord(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 cursor-pointer"
                            title="Inspect snapshot data"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Restore Button */}
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, action: 'restore_one', item })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="Restore this record back to active state"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>

                          {/* Purge Permanently */}
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, action: 'purge_one', item })}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {searchQuery || selectedType !== 'all' ? 'No Matching Deleted Records' : 'Recycle Bin is Completely Empty'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedType !== 'all'
              ? 'Try changing your category filter or search keyword.'
              : 'All active ERP records, tour packages, suppliers, and bookings are intact in your database.'}
          </p>
        </div>
      )}

      {/* ── Inspection / Snapshot Preview Modal ──────────────────────── */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Raw Snapshot Inspection
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {inspectRecord.entityType.toUpperCase()} • Deleted on {new Date(inspectRecord.deletedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{inspectRecord.title}</div>
                <div className="text-[11px] text-slate-500">{inspectRecord.subtitle}</div>
                <div className="text-[10px] font-mono text-slate-400">Original ID: {inspectRecord.originalId}</div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Archived JSON Payload (Ready for 100% Loss-Free Recovery)
                </label>
                <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
                  {JSON.stringify(inspectRecord.data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  recoverItem(inspectRecord.id);
                  setInspectRecord(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recover to Active Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ───────────────────────────────────────── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                confirmModal.action.includes('restore')
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
              }`}>
                {confirmModal.action.includes('restore') ? (
                  <RotateCcw className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmModal.action === 'restore_one' && 'Recover Record?'}
                  {confirmModal.action === 'purge_one' && 'Permanently Delete Record?'}
                  {confirmModal.action === 'restore_all' && 'Restore All Filtered Records?'}
                  {confirmModal.action === 'empty_bin' && 'Empty Entire Recycle Bin?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {confirmModal.action === 'restore_one' && `"${confirmModal.item?.title}" will be restored immediately.`}
                  {confirmModal.action === 'purge_one' && 'This action cannot be undone. The snapshot will be erased.'}
                  {confirmModal.action === 'restore_all' && `All ${filteredRecords.length} records will be restored to active tables.`}
                  {confirmModal.action === 'empty_bin' && 'All deleted items will be permanently erased.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: 'restore_one' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer text-white ${
                  confirmModal.action.includes('restore')
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                {confirmModal.action.includes('restore') ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Recovery</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Permanent Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
