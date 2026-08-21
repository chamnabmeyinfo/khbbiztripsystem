import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import { PurchaseOrder, POStatus, POLineItem, CostCategory } from '../../types';
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

export const PurchaseOrdersSection: React.FC = () => {
  const {
    purchaseOrders,
    suppliers,
    bookings,
    currency,
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePOStatus,
    deletePurchaseOrder
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);

  // Form state for Create / Edit PO
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState<{
    supplierId: string;
    bookingId?: string;
    bookingCode?: string;
    packageTitle?: string;
    issuedDate: string;
    dueDate: string;
    currency: string;
    taxPercent: number;
    notes: string;
    items: POLineItem[];
  }>({
    supplierId: '',
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: 'USD',
    taxPercent: 7,
    notes: '',
    items: [
      {
        id: 'poi_1',
        description: 'Hotel Accommodation (3 Nights)',
        category: 'hotel',
        quantity: 10,
        unitCostUSD: 85,
        totalUSD: 850
      }
    ]
  });

  // Stats
  const totalPOs = purchaseOrders.length;
  const totalValueUSD = purchaseOrders.reduce((sum, po) => sum + po.totalUSD, 0);
  const outstandingUSD = purchaseOrders
    .filter((po) => !['paid', 'cancelled'].includes(po.status))
    .reduce((sum, po) => sum + po.totalUSD, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueCount = purchaseOrders.filter((po) => {
    return new Date(po.dueDate) < today && !['paid', 'cancelled'].includes(po.status);
  }).length;

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      const matchesSupplier = supplierFilter === 'all' || po.supplierId === supplierFilter;
      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [purchaseOrders, searchQuery, statusFilter, supplierFilter]);

  const getStatusColor = (status: POStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'amended': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const isOverdue = (dueDate: string, status: POStatus) => {
    return new Date(dueDate) < today && !['paid', 'cancelled'].includes(status);
  };

  const handleOpenCreateModal = () => {
    setEditingPO(null);
    setFormData({
      supplierId: suppliers[0]?.id || '',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currency: 'USD',
      taxPercent: 7,
      notes: 'Payment upon receipt of final rooming list.',
      items: [
        {
          id: 'poi_' + Date.now(),
          description: 'Coach Fleet Transfer Service',
          category: 'transport',
          quantity: 1,
          unitCostUSD: 1200,
          totalUSD: 1200
        }
      ]
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (po: PurchaseOrder) => {
    setEditingPO(po);
    setFormData({
      supplierId: po.supplierId,
      bookingId: po.bookingId,
      bookingCode: po.bookingCode,
      packageTitle: po.packageTitle,
      issuedDate: po.issuedDate,
      dueDate: po.dueDate,
      currency: po.currency,
      taxPercent: po.taxPercent,
      notes: po.notes || '',
      items: [...po.items]
    });
    setIsEditModalOpen(true);
  };

  const handleAddLineItem = () => {
    const newItem: POLineItem = {
      id: 'poi_' + Date.now() + '_' + formData.items.length,
      description: 'New Procurement Item',
      category: 'hotel',
      quantity: 1,
      unitCostUSD: 100,
      totalUSD: 100
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleUpdateLineItem = (index: number, field: keyof POLineItem, value: any) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitCostUSD') {
      updated[index].totalUSD = (Number(updated[index].quantity) || 0) * (Number(updated[index].unitCostUSD) || 0);
    }
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleRemoveLineItem = (index: number) => {
    const updated = [...formData.items];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === formData.supplierId) || suppliers[0];
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalUSD, 0);
    const tax = Math.round(subtotal * (formData.taxPercent / 100) * 100) / 100;
    const total = subtotal + tax;

    if (editingPO) {
      updatePurchaseOrder({
        ...editingPO,
        supplierId: sup?.id || 'sup_1',
        supplierName: sup?.name || 'Vendor',
        supplierType: sup?.type || 'hotel',
        bookingId: formData.bookingId,
        bookingCode: formData.bookingCode,
        packageTitle: formData.packageTitle,
        issuedDate: formData.issuedDate,
        dueDate: formData.dueDate,
        taxPercent: formData.taxPercent,
        items: formData.items,
        subtotalUSD: subtotal,
        taxUSD: tax,
        totalUSD: total,
        notes: formData.notes
      });
    } else {
      createPurchaseOrder({
        supplierId: sup?.id || 'sup_1',
        supplierName: sup?.name || 'Vendor',
        supplierType: sup?.type || 'hotel',
        bookingId: formData.bookingId,
        bookingCode: formData.bookingCode,
        packageTitle: formData.packageTitle || 'Vietnam B2B Trade Mission 2026',
        issuedDate: formData.issuedDate,
        dueDate: formData.dueDate,
        status: 'draft',
        currency: 'USD',
        taxPercent: formData.taxPercent,
        items: formData.items,
        subtotalUSD: subtotal,
        taxUSD: tax,
        totalUSD: total,
        notes: formData.notes
      });
    }

    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total POs</h3>
          <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{totalPOs}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
          <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
            ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</h3>
          <p className="text-2xl font-semibold mt-2 text-amber-600 dark:text-amber-400">
            ${outstandingUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</h3>
          <p className="text-2xl font-semibold mt-2 text-red-600 dark:text-red-400">{overdueCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-1 gap-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search PO# or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 appearance-none dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="all">All Suppliers</option>
            {suppliers?.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New PO
        </button>
      </div>

      {/* PO Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Number</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issued Date</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total USD</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPOs.length > 0 ? (
                filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => { setSelectedPO(po); setIsDetailModalOpen(true); }}
                        className="text-blue-600 dark:text-blue-400 font-mono text-sm hover:underline cursor-pointer"
                      >
                        {po.poNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{po.supplierName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{po.supplierType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {po.bookingCode || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(po.issuedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={isOverdue(po.dueDate, po.status) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                        {new Date(po.dueDate).toLocaleDateString()}
                        {isOverdue(po.dueDate, po.status) && (
                          <span className="ml-2 text-xs uppercase bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded">Overdue</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${po.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => { setSelectedPO(po); setIsDetailModalOpen(true); }}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        title="View"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(po)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => setPoToDelete(po)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        title="Move to Recycle Bin"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No purchase orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Detail Modal */}
      {isDetailModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                  {selectedPO.poNumber}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedPO.status)}`}>
                    {selectedPO.status}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Created on {new Date(selectedPO.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    Supplier Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500 dark:text-gray-400">Name:</span> <span className="font-medium dark:text-white">{selectedPO.supplierName}</span></p>
                    <p><span className="text-gray-500 dark:text-gray-400">Type:</span> <span className="capitalize dark:text-white">{selectedPO.supplierType}</span></p>
                  </div>
                </div>

                {/* Booking Info */}
                {selectedPO.bookingCode && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Linked Booking
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500 dark:text-gray-400">Code:</span> <span className="font-medium dark:text-white font-mono">{selectedPO.bookingCode}</span></p>
                      <p><span className="text-gray-500 dark:text-gray-400">Package:</span> <span className="dark:text-white">{selectedPO.packageTitle}</span></p>
                    </div>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Line Items</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                        <th className="py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                        <th className="py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Qty</th>
                        <th className="py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Unit Cost</th>
                        <th className="py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedPO.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-4 text-sm text-gray-900 dark:text-white">{item.description}</td>
                          <td className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category.replace('_', ' ')}</td>
                          <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right">${item.unitCostUSD.toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm text-gray-900 dark:text-white text-right font-medium">${item.totalUSD.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${selectedPO.subtotalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Tax ({selectedPO.taxPercent}%)</span>
                    <span>${selectedPO.taxUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span>Total USD</span>
                    <span>${selectedPO.totalUSD.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPO.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedPO.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 rounded-b-2xl flex flex-wrap gap-3 justify-end sticky bottom-0 z-10">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
              {selectedPO.status === 'draft' && (
                <button
                  onClick={() => {
                    updatePOStatus(selectedPO.id, 'sent');
                    setIsDetailModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Send to Supplier
                </button>
              )}
              {selectedPO.status === 'sent' && (
                <button
                  onClick={() => {
                    updatePOStatus(selectedPO.id, 'confirmed');
                    setIsDetailModalOpen(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Confirm PO
                </button>
              )}
              {selectedPO.status === 'confirmed' && (
                <button
                  onClick={() => {
                    updatePOStatus(selectedPO.id, 'paid', new Date().toISOString().split('T')[0]);
                    setIsDetailModalOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit PO Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingPO ? `Edit Purchase Order (${editingPO.poNumber})` : 'Create New Purchase Order'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold"
                    required
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Linked Delegation Booking
                  </label>
                  <select
                    value={formData.bookingId || ''}
                    onChange={(e) => {
                      const bk = bookings.find(b => b.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        bookingId: bk?.id,
                        bookingCode: bk?.bookingCode,
                        packageTitle: bk?.packageTitle
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold"
                  >
                    <option value="">-- General / Non-Booking PO --</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>{b.bookingCode} - {b.userName} ({b.packageTitle})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Issued Date *
                  </label>
                  <input
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-gray-500">Line Items & Services</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(idx, 'description', e.target.value)}
                          placeholder="Item description..."
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateLineItem(idx, 'category', e.target.value as CostCategory)}
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs capitalize"
                        >
                          {['hotel', 'transport', 'guide', 'meals', 'entrance_fee', 'permit', 'flight', 'misc'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                          className="w-full px-1.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-center"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCostUSD}
                          onChange={(e) => handleUpdateLineItem(idx, 'unitCostUSD', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-right"
                          required
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          disabled={formData.items.length <= 1}
                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Procurement Notes / Terms
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  {editingPO ? 'Update Purchase Order' : 'Save Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {poToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Move Purchase Order to Recycle Bin?
                </h3>
                <p className="text-xs text-slate-500">
                  {poToDelete.poNumber} (${poToDelete.totalUSD.toFixed(2)} USD) will be moved to the Data Recovery Center. You can restore it anytime.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPoToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePurchaseOrder(poToDelete.id);
                  setPoToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move to Recycle Bin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
