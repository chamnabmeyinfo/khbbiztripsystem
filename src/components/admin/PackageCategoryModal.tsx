import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PackageCategory } from '../../types';
import {
  X,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Tag,
  AlertTriangle,
  Package,
  CheckCircle2,
  XCircle,
  Hash,
  Globe
} from 'lucide-react';

interface PackageCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

const PRESET_ICONS = [
  '🇨🇳', '🏢', '🛍️', '☕', '🏭', '👑', '⚡', '🌿',
  '✈️', '🏥', '🌾', '🚀', '🎯', '💎', '🌐', '🏛️',
  '🚢', '🤖', '🍷', '🔋', '🏗️', '💼', '🏆', '⭐'
];

const PRESET_COLORS: { id: string; label: string; bg: string; text: string; ring: string }[] = [
  { id: 'indigo', label: 'Indigo / Navy', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', ring: 'ring-indigo-500' },
  { id: 'rose', label: 'Crimson / Rose', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-500' },
  { id: 'amber', label: 'Amber / Gold', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-500' },
  { id: 'emerald', label: 'Emerald / Green', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500' },
  { id: 'sky', label: 'Sky / Ocean', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', ring: 'ring-sky-500' },
  { id: 'purple', label: 'Royal / Purple', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', ring: 'ring-purple-500' },
  { id: 'teal', label: 'Teal / Cyan', bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', ring: 'ring-teal-500' },
  { id: 'orange', label: 'Orange / Warm', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', ring: 'ring-orange-500' },
  { id: 'slate', label: 'Slate / Dark', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', ring: 'ring-slate-500' }
];

export function getCategoryBadgeClasses(color?: string) {
  switch (color) {
    case 'rose':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50';
    case 'amber':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50';
    case 'emerald':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
    case 'sky':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50';
    case 'purple':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
    case 'teal':
      return 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/50';
    case 'orange':
      return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/50';
    case 'slate':
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    case 'indigo':
    default:
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50';
  }
}

export const PackageCategoryModal: React.FC<PackageCategoryModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  const {
    packageCategories,
    packages,
    addPackageCategory,
    updatePackageCategory,
    deletePackageCategory,
    togglePackageCategoryStatus,
    resetPackageCategories
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formNameKm, setFormNameKm] = useState('');
  const [formNameZh, setFormNameZh] = useState('');
  const [formIcon, setFormIcon] = useState('🏷️');
  const [formColor, setFormColor] = useState('indigo');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Package count by category ID
  const packageCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    packages.forEach(p => {
      if (p.category) {
        map[p.category] = (map[p.category] || 0) + 1;
      }
    });
    return map;
  }, [packages]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return packageCategories.filter(cat => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.nameKm && cat.nameKm.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cat.nameZh && cat.nameZh.toLowerCase().includes(searchTerm.toLowerCase())) ||
        cat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && cat.isActive) ||
        (filterStatus === 'inactive' && !cat.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [packageCategories, searchTerm, filterStatus]);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormId('');
    setFormName('');
    setFormNameKm('');
    setFormNameZh('');
    setFormIcon('🏢');
    setFormColor('indigo');
    setFormDescription('');
    setFormIsActive(true);
    setFormOrder(packageCategories.length + 1);
    setFormError('');
  };

  const handleOpenEdit = (cat: PackageCategory) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setFormId(cat.id);
    setFormName(cat.name || '');
    setFormNameKm(cat.nameKm || '');
    setFormNameZh(cat.nameZh || '');
    setFormIcon(cat.icon || '🏷️');
    setFormColor(cat.color || 'indigo');
    setFormDescription(cat.description || '');
    setFormIsActive(cat.isActive ?? true);
    setFormOrder(cat.order || 1);
    setFormError('');
  };

  const handleAutoDeriveSlug = (nameVal: string) => {
    setFormName(nameVal);
    if (!editingId) {
      const derived = nameVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setFormId(derived);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    const finalId = formId.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    if (!finalId) {
      setFormError('A valid slug ID could not be generated. Please provide a Category ID.');
      return;
    }

    // Check duplicate ID if new
    if (!editingId && packageCategories.some(c => c.id === finalId)) {
      setFormError(`A category with ID "${finalId}" already exists. Please choose a unique ID.`);
      return;
    }

    const categoryData: PackageCategory = {
      id: finalId,
      name: formName.trim(),
      nameEn: formName.trim(),
      nameKm: formNameKm.trim() || undefined,
      nameZh: formNameZh.trim() || undefined,
      icon: formIcon.trim() || '🏷️',
      color: formColor,
      description: formDescription.trim() || undefined,
      isActive: formIsActive,
      order: formOrder || (packageCategories.length + 1),
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      updatePackageCategory(categoryData);
    } else {
      addPackageCategory({
        ...categoryData,
        createdAt: new Date().toISOString()
      });
    }

    if (onSelectCategory) {
      onSelectCategory(categoryData.id);
    }

    setIsEditing(false);
    setEditingId(null);
    setFormError('');
  };

  const handleDelete = (categoryId: string) => {
    deletePackageCategory(categoryId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-inner">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Tour Package Categories
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                  {packageCategories.length} Categories
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage expedition types, trade expo classifications, and client filter tags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={handleOpenCreate}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Create / Edit Form Drawer */}
          {isEditing && (
            <form
              onSubmit={handleSaveForm}
              className="p-5 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-5 animate-slideDown"
            >
              <div className="flex items-center justify-between border-b border-indigo-100/60 dark:border-indigo-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {editingId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingId ? `Edit Category: ${formName || editingId}` : 'Create New Tour Category'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Live UI Preview Badge
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${getCategoryBadgeClasses(formColor)}`}>
                      <span>{formIcon || '🏷️'}</span>
                      <span>{formName || 'Category Name'}</span>
                    </span>
                    {formNameKm && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-khmer">
                        ({formNameKm})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Slug ID</span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formId || 'auto_slug'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Name English */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Name (English / Primary) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleAutoDeriveSlug(e.target.value)}
                    placeholder="e.g. B2B Trade Mission, Canton Fair"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Slug ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>Slug Identifier *</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingId}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ''))}
                    placeholder="e.g. trade_mission"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono disabled:opacity-60"
                  />
                </div>

                {/* Category Name Khmer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 font-khmer">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>ឈ្មោះជាភាសាខ្មែរ (Khmer)</span>
                  </label>
                  <input
                    type="text"
                    value={formNameKm}
                    onChange={(e) => setFormNameKm(e.target.value)}
                    placeholder="ឧ. ពិព័រណ៍ពាណិជ្ជកម្ម B2B"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-khmer"
                  />
                </div>

                {/* Category Name Chinese */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chinese Name (中文)
                  </label>
                  <input
                    type="text"
                    value={formNameZh}
                    onChange={(e) => setFormNameZh(e.target.value)}
                    placeholder="例如: 商务考察与贸易对接"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formOrder}
                    onChange={(e) => setFormOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Icon / Emoji Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Icon / Visual Symbol
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border-2 border-indigo-500 bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                    {formIcon || '🏷️'}
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto p-1 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormIcon(icon)}
                        className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                          formIcon === icon ? 'bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="Custom"
                    maxLength={4}
                    className="w-20 px-2 py-2 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Badge Color Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setFormColor(col.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        formColor === col.id
                          ? `${col.bg} ${col.text} ring-2 ${col.ring} font-bold shadow-sm`
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${col.bg} border border-current`} />
                      <span className="text-[10px] capitalize truncate w-full">{col.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the trade focus, target attendees, and key industry profile for this category..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Active Toggle & Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-indigo-100/60 dark:border-indigo-900/40">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Active (Available for Tour Packages & Visitor Filters)
                  </span>
                </label>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingId ? 'Save Changes' : 'Create Category'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories by name, Khmer, Chinese, or slug ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                    filterStatus === status
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Categories List */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <Tag className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No categories match your search or filter.
              </p>
              <button
                onClick={handleOpenCreate}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Create a new Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCategories.map((cat) => {
                const assignedPackagesCount = packageCountMap[cat.id] || 0;
                const isCantonSpecial = cat.id === 'canton_fair';

                return (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      cat.isActive
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${getCategoryBadgeClasses(cat.color)}`}>
                          <span>{cat.icon || '🏷️'}</span>
                          <span>{cat.name}</span>
                        </span>
                        {isCantonSpecial && (
                          <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold">
                            Core Canton
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePackageCategoryStatus(cat.id)}
                          title={cat.isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            cat.isActive
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {cat.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(cat.id)}
                          title="Delete Category"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Multilingual Labels */}
                    <div className="space-y-1 mb-2.5">
                      {cat.nameKm && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-khmer">
                          {cat.nameKm}
                        </div>
                      )}
                      {cat.nameZh && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {cat.nameZh}
                        </div>
                      )}
                    </div>

                    {cat.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {cat.description}
                      </p>
                    )}

                    {/* Footer Info */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3" />
                        <span>{cat.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-indigo-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {assignedPackagesCount} {assignedPackagesCount === 1 ? 'Package' : 'Packages'}
                        </span>
                      </div>
                    </div>

                    {/* Delete Confirmation Inlay */}
                    {deleteConfirmId === cat.id && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 space-y-2 animate-fadeIn">
                        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Delete "{cat.name}"?</span>
                        </div>
                        {assignedPackagesCount > 0 && (
                          <p className="text-[11px] text-rose-700 dark:text-rose-300">
                            Warning: <strong>{assignedPackagesCount} tour packages</strong> are currently tagged with this category.
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id)}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Factory Presets</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-fadeIn">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                  Reset to default categories?
                </span>
                <button
                  onClick={() => {
                    resetPackageCategories();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
