import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import { 
  Search, Filter, Plus, Check, X, Eye, Trash2, Calendar, 
  FileText, Briefcase, Tag, DollarSign, AlertCircle, XCircle 
} from 'lucide-react';
import { ExpenseCategory, ExpenseStatus, Expense } from '../../types';

export const ExpensesSection: React.FC = () => {
  const { expenses, bookings, currency, currentUser, approveExpense, rejectExpense, deleteExpense } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  
  const [showLogModal, setShowLogModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, action: 'approve' | 'reject' | 'delete', expenseId: string | null}>({ isOpen: false, action: 'approve', expenseId: null });

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(exp => {
      const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           exp.submittedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (exp.bookingCode && exp.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      const matchesBooking = bookingFilter === 'all' || exp.bookingId === bookingFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesBooking;
    });
  }, [expenses, searchTerm, categoryFilter, statusFilter, bookingFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!expenses) return { totalApproved: 0, pendingAmount: 0, pendingCount: 0, rejectedCount: 0, reimbursedAmount: 0 };
    return expenses.reduce((acc, exp) => {
      if (exp.status === 'approved') acc.totalApproved += exp.amountUSD;
      if (exp.status === 'pending_approval') {
        acc.pendingAmount += exp.amountUSD;
        acc.pendingCount++;
      }
      if (exp.status === 'rejected') acc.rejectedCount++;
      if (exp.status === 'reimbursed') acc.reimbursedAmount += exp.amountUSD;
      return acc;
    }, { totalApproved: 0, pendingAmount: 0, pendingCount: 0, rejectedCount: 0, reimbursedAmount: 0 });
  }, [expenses]);

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: Record<ExpenseCategory, string> = {
      accommodation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      transport: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      meals: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      guide: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      entrance_fee: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      permit: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
      insurance: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      staff: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      misc: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case 'pending_approval': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'reimbursed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.expenseId) return;
    if (confirmDialog.action === 'approve') {
      approveExpense(confirmDialog.expenseId, currentUser?.id || 'usr_admin_1', currentUser?.name || 'Marcus Vance');
    } else if (confirmDialog.action === 'reject') {
      rejectExpense(confirmDialog.expenseId);
    } else if (confirmDialog.action === 'delete') {
      deleteExpense(confirmDialog.expenseId);
    }
    setConfirmDialog({ isOpen: false, action: 'approve', expenseId: null });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Approved</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatMoney(stats.totalApproved, currency)}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mr-4">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatMoney(stats.pendingAmount, currency)}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.pendingCount} request(s)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-4">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.rejectedCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-4">
            <Check size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Reimbursed</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatMoney(stats.reimbursedAmount, currency)}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-1 w-full gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="accommodation">Accommodation</option>
              <option value="transport">Transport</option>
              <option value="meals">Meals</option>
              <option value="guide">Guide</option>
              <option value="misc">Misc</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_approval">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="reimbursed">Reimbursed</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Log Expense
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredExpenses?.length ? filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {new Date(exp.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {exp.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(exp.category)}`}>
                      {exp.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {exp.bookingCode ? <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{exp.bookingCode}</span> : 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    ${exp.amountUSD.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {exp.submittedByName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(exp.status)}`}>
                      {exp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {exp.status === 'pending_approval' && (
                        <>
                          <button 
                            onClick={() => setConfirmDialog({ isOpen: true, action: 'approve', expenseId: exp.id })}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => setConfirmDialog({ isOpen: true, action: 'reject', expenseId: exp.id })}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ isOpen: true, action: 'delete', expenseId: exp.id })}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Move to Recycle Bin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No expenses found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal (Placeholder structure) */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={20} className="text-blue-600" /> Log New Expense
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="accommodation">Accommodation</option>
                    <option value="transport">Transport</option>
                    <option value="meals">Meals</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (USD) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="number" className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Dinner with clients..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Booking</label>
                  <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="">General (No Booking)</option>
                    {bookings?.map(b => <option key={b.id} value={b.id}>{b.bookingCode}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expense Date *</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submitted By *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Name" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                  <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="reimbursed">Reimbursed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Receipt URL</label>
                <input type="url" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="https://" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowLogModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">Save Expense</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm shadow-2xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              confirmDialog.action === 'approve' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {confirmDialog.action === 'approve' ? <Check size={32} /> : <X size={32} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {confirmDialog.action === 'approve' ? 'Approve Expense?' : 'Reject Expense?'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to {confirmDialog.action} this expense request? This action will notify the submitter.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, action: 'approve', expenseId: null })} 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction} 
                className={`px-4 py-2 text-white font-medium rounded-lg shadow-sm transition-colors flex-1 ${
                  confirmDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Yes, {confirmDialog.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
