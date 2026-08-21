import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import {
  CustomerPayment,
  SupplierPayment,
  CustomerPaymentStatus,
  SupplierPaymentStatus,
  CustomerPaymentMethod
} from '../../types';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  XCircle,
  FileText,
  X
} from 'lucide-react';

export const PaymentsSection: React.FC = () => {
  const {
    customerPayments,
    supplierPayments,
    bookings,
    purchaseOrders,
    suppliers,
    addCustomerPayment,
    updateCustomerPayment,
    addSupplierPayment,
    updateSupplierPayment,
    markSupplierPaymentPaid,
    deleteCustomerPayment,
    deleteSupplierPayment
  } = useApp();

  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Forms
  const [custFormData, setCustFormData] = useState<{
    bookingId: string;
    amountUSD: number;
    paymentMethod: CustomerPaymentMethod;
    transactionId: string;
    dueDate: string;
    status: CustomerPaymentStatus;
    notes: string;
  }>({
    bookingId: bookings[0]?.id || '',
    amountUSD: 299,
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
    dueDate: new Date().toISOString().split('T')[0],
    status: 'paid',
    notes: 'Direct B2B KHQR transfer verified.'
  });

  const [supFormData, setSupFormData] = useState<{
    purchaseOrderId: string;
    amountUSD: number;
    dueDate: string;
    notes: string;
  }>({
    purchaseOrderId: purchaseOrders[0]?.id || '',
    amountUSD: 500,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: 'Wire transfer schedule for coach deposit.'
  });

  // Customer Payments Stats
  const totalReceivedUSD = customerPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountUSD, 0);
  const totalPendingUSD = customerPayments
    .filter(p => p.status === 'pending' || p.status === 'partial')
    .reduce((sum, p) => sum + p.amountUSD, 0);
  const totalRefundedUSD = customerPayments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amountUSD, 0);

  const totalExpectedUSD = totalReceivedUSD + totalPendingUSD;
  const collectionRate = totalExpectedUSD > 0 ? (totalReceivedUSD / totalExpectedUSD) * 100 : 0;

  // Supplier Payments Stats
  const totalPaidSupplierUSD = supplierPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountUSD, 0);
  const totalScheduledSupplierUSD = supplierPayments
    .filter(p => p.status === 'scheduled' || p.status === 'pending')
    .reduce((sum, p) => sum + p.amountUSD, 0);
  const totalOverdueSupplierUSD = supplierPayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amountUSD, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getCustomerStatusColor = (status: CustomerPaymentStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getSupplierStatusColor = (status: SupplierPaymentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleSaveCustomerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const bk = bookings.find(b => b.id === custFormData.bookingId) || bookings[0];
    addCustomerPayment({
      bookingId: bk?.id || 'bk_1',
      bookingCode: bk?.bookingCode || 'TRP-84920',
      customerId: bk?.userId || 'usr_1',
      customerName: bk?.userName || 'Traveler',
      customerEmail: bk?.userEmail || 'traveler@example.com',
      amountUSD: custFormData.amountUSD,
      currency: 'USD',
      amountInCurrency: custFormData.amountUSD,
      exchangeRate: 1,
      paymentMethod: custFormData.paymentMethod,
      transactionId: custFormData.transactionId,
      installmentNumber: 1,
      totalInstallments: 1,
      dueDate: custFormData.dueDate,
      receivedDate: custFormData.status === 'paid' ? custFormData.dueDate : undefined,
      status: custFormData.status,
      notes: custFormData.notes
    });
    setIsCustomerModalOpen(false);
  };

  const handleSaveSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find(p => p.id === supFormData.purchaseOrderId) || purchaseOrders[0];
    addSupplierPayment({
      purchaseOrderId: po?.id || 'po_1',
      poNumber: po?.poNumber || 'PO-2026-0001',
      supplierId: po?.supplierId || 'sup_1',
      supplierName: po?.supplierName || 'Vendor',
      bookingId: po?.bookingId,
      bookingCode: po?.bookingCode,
      amountUSD: supFormData.amountUSD,
      currency: 'USD',
      amountInCurrency: supFormData.amountUSD,
      exchangeRate: 1,
      dueDate: supFormData.dueDate,
      status: 'scheduled',
      notes: supFormData.notes
    });
    setIsSupplierModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('customer')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'customer'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Customer Inbound Payments
        </button>
        <button
          onClick={() => setActiveTab('supplier')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'supplier'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Supplier Outbound Payments
        </button>
      </div>

      {activeTab === 'customer' ? (
        <div className="space-y-6">
          {/* Customer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Total Received</h3>
              <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                ${totalReceivedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Pending Receivable</h3>
              <p className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400 font-mono">
                ${totalPendingUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Refunded</h3>
              <p className="text-2xl font-black mt-1 text-purple-600 dark:text-purple-400 font-mono">
                ${totalRefundedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Collection Rate</h3>
              <p className="text-2xl font-black mt-1 text-indigo-600 dark:text-indigo-400 font-mono">
                {collectionRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Record Customer Payment</span>
            </button>
          </div>

          {/* Customer Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Booking Code</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Amount USD</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {customerPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {payment.bookingCode}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {payment.customerName}
                        <div className="text-[10px] text-gray-400 font-normal">{payment.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-gray-900 dark:text-white">
                        ${payment.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-600 dark:text-gray-300">
                        {payment.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {payment.transactionId}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {payment.status === 'paid' && payment.receivedDate ? payment.receivedDate : `Due: ${payment.dueDate}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${getCustomerStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteCustomerPayment(payment.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Move to Recycle Bin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Supplier Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Total Paid to Vendors</h3>
              <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                ${totalPaidSupplierUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Total Scheduled</h3>
              <p className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400 font-mono">
                ${totalScheduledSupplierUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Total Overdue</h3>
              <p className="text-2xl font-black mt-1 text-red-600 dark:text-red-400 font-mono">
                ${totalOverdueSupplierUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Vendor Payment</span>
            </button>
          </div>

          {/* Supplier Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Linked Booking</th>
                    <th className="py-3 px-4">Amount USD</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {supplierPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {payment.poNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {payment.supplierName}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {payment.bookingCode || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-gray-900 dark:text-white">
                        ${payment.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {payment.dueDate}
                        {payment.paidDate && (
                          <div className="text-[10px] text-emerald-600 font-normal">Paid on {payment.paidDate}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${getSupplierStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {payment.status !== 'paid' && (
                          <button
                            onClick={() => {
                              const ref = prompt('Enter Bank Reference Number:', 'REF-' + Date.now());
                              if (ref) {
                                markSupplierPaymentPaid(payment.id, new Date().toISOString().split('T')[0], ref);
                              }
                            }}
                            className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] hover:bg-emerald-200 cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => deleteSupplierPayment(payment.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Move to Recycle Bin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Customer Payment Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">Record Customer Payment</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveCustomerPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Booking *</label>
                <select
                  value={custFormData.bookingId}
                  onChange={(e) => setCustFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  required
                >
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>{b.bookingCode} - {b.userName} (${b.totalPriceUSD})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Amount USD *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custFormData.amountUSD}
                    onChange={(e) => setCustFormData(prev => ({ ...prev, amountUSD: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Payment Method</label>
                  <select
                    value={custFormData.paymentMethod}
                    onChange={(e) => setCustFormData(prev => ({ ...prev, paymentMethod: e.target.value as CustomerPaymentMethod }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs capitalize"
                  >
                    {['bank_transfer', 'card', 'cash', 'apple_pay', 'google_pay', 'biometric_wallet'].map(m => (
                      <option key={m} value={m}>{m.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={custFormData.transactionId}
                    onChange={(e) => setCustFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={custFormData.status}
                    onChange={(e) => setCustFormData(prev => ({ ...prev, status: e.target.value as CustomerPaymentStatus }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs capitalize"
                  >
                    {['paid', 'pending', 'partial', 'refunded'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Supplier Payment Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">Schedule Vendor Payment</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveSupplierPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Purchase Order *</label>
                <select
                  value={supFormData.purchaseOrderId}
                  onChange={(e) => setSupFormData(prev => ({ ...prev, purchaseOrderId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  required
                >
                  {purchaseOrders.map(p => (
                    <option key={p.id} value={p.id}>{p.poNumber} - {p.supplierName} (${p.totalUSD})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Amount USD *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={supFormData.amountUSD}
                    onChange={(e) => setSupFormData(prev => ({ ...prev, amountUSD: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={supFormData.dueDate}
                    onChange={(e) => setSupFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Schedule Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
