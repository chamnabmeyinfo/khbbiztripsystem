import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier, SupplierType, SupplierStatus, PaymentTerms, CurrencyCode } from '../../types';
import {
  Building2,
  Plane,
  Truck,
  User,
  UtensilsCrossed,
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  Ban,
  Activity,
  ShieldAlert
} from 'lucide-react';

const TYPE_ICONS: Record<SupplierType, React.ElementType> = {
  hotel: Building2,
  airline: Plane,
  transport: Truck,
  guide: User,
  restaurant: UtensilsCrossed,
  activity: Activity,
  insurance: ShieldAlert
};

const TYPE_COLORS: Record<SupplierType, string> = {
  hotel: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  airline: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  transport: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  guide: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  restaurant: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  activity: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  insurance: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const STATUS_COLORS: Record<SupplierStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  blacklisted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const STATUS_ICONS: Record<SupplierStatus, React.ElementType> = {
  active: CheckCircle,
  inactive: AlertCircle,
  blacklisted: Ban
};

export const SuppliersSection: React.FC = () => {
  const { suppliers = [], addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SupplierType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | 'all'>('all');
  
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  const defaultSupplierForm: Partial<Supplier> = {
    name: '',
    type: 'hotel',
    country: '',
    city: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    status: 'active',
    paymentTerms: 'net_30',
    defaultCurrency: 'USD',
    rating: 4,
    notes: ''
  };

  const [formData, setFormData] = useState<Partial<Supplier>>(defaultSupplierForm);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData(supplier);
    } else {
      setEditingSupplier(null);
      setFormData(defaultSupplierForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData(defaultSupplierForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactName) return;

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        ...formData
      } as Supplier);
    } else {
      addSupplier({
        name: formData.name || 'New Supplier',
        type: formData.type || 'hotel',
        country: formData.country || 'Global',
        city: formData.city || 'Global',
        contactName: formData.contactName || '',
        contactEmail: formData.contactEmail || '',
        contactPhone: formData.contactPhone || '',
        website: formData.website || '',
        paymentTerms: formData.paymentTerms || 'net_30',
        defaultCurrency: formData.defaultCurrency || 'USD',
        rating: formData.rating || 4,
        status: formData.status || 'active',
        notes: formData.notes || ''
      });
    }
    handleCloseModal();
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s: Supplier) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.contactName.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || s.type === typeFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [suppliers, search, typeFilter, statusFilter]);

  const totalSpend = useMemo(() => suppliers.reduce((sum: number, s: Supplier) => sum + (s.totalPOsUSD || 0), 0), [suppliers]);
  const activeCount = useMemo(() => suppliers.filter((s: Supplier) => s.status === 'active').length, [suppliers]);
  const avgRating = useMemo(() => suppliers.length ? (suppliers.reduce((sum: number, s: Supplier) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0.0', [suppliers]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Suppliers</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{suppliers.length}</p>
          </div>
          <Building2 className="w-8 h-8 text-blue-500 opacity-20" />
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Spend (USD)</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalSpend.toLocaleString()}</p>
          </div>
          <Activity className="w-8 h-8 text-indigo-500 opacity-20" />
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Avg Rating</p>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgRating}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search suppliers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="hotel">Hotel</option>
              <option value="airline">Airline</option>
              <option value="transport">Transport</option>
              <option value="guide">Guide</option>
              <option value="restaurant">Restaurant</option>
              <option value="activity">Activity</option>
              <option value="insurance">Insurance</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm whitespace-nowrap w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Terms</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Total Spend</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSuppliers.length > 0 ? filteredSuppliers.map((s: Supplier) => {
                const Icon = TYPE_ICONS[s.type] || Building2;
                const StatusIcon = STATUS_ICONS[s.status];
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[s.type]}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{s.type}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {s.city}, {s.country}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900 dark:text-white">{s.contactName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{s.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 uppercase text-xs">
                      {s.paymentTerms.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= s.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      ${(s.totalPOsUSD || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{s.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(s)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSupplier(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                          title="Move Supplier to Recycle Bin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No suppliers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name*</label>
                  <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type*</label>
                  <select required value={formData.type || 'hotel'} onChange={(e) => setFormData({...formData, type: e.target.value as SupplierType})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none">
                    <option value="hotel">Hotel</option>
                    <option value="airline">Airline</option>
                    <option value="transport">Transport</option>
                    <option value="guide">Guide</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="activity">Activity</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status*</label>
                  <select required value={formData.status || 'active'} onChange={(e) => setFormData({...formData, status: e.target.value as SupplierStatus})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blacklisted">Blacklisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country*</label>
                  <input type="text" required value={formData.country || ''} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City*</label>
                  <input type="text" required value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Name*</label>
                  <input type="text" required value={formData.contactName || ''} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email*</label>
                  <input type="email" required value={formData.contactEmail || ''} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Phone*</label>
                  <input type="text" required value={formData.contactPhone || ''} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                  <input type="url" value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Terms*</label>
                  <select required value={formData.paymentTerms || 'net_30'} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value as PaymentTerms})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none">
                    <option value="prepaid">Prepaid</option>
                    <option value="net_15">Net 15</option>
                    <option value="net_30">Net 30</option>
                    <option value="net_45">Net 45</option>
                    <option value="net_60">Net 60</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Currency*</label>
                  <select required value={formData.defaultCurrency || 'USD'} onChange={(e) => setFormData({...formData, defaultCurrency: e.target.value as CurrencyCode})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="AED">AED</option>
                    <option value="ILS">ILS</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating*</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setFormData({...formData, rating: star})} className="focus:outline-none">
                        <Star className={`w-6 h-6 ${star <= (formData.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                  <textarea rows={3} value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none resize-none"></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                  {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
