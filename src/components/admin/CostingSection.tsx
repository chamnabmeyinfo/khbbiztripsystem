import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CostTemplate, CostItem, CostCategory, CostType } from '../../types';
import {
  Building2,
  Plane,
  Truck,
  User,
  UtensilsCrossed,
  Ticket,
  Map,
  ShieldAlert,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CATEGORY_COLORS: Record<CostCategory, string> = {
  hotel: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  flight: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  transport: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  guide: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  meals: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  entrance_fee: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  permit: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  insurance: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  misc: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
};

const CATEGORY_ICONS: Record<CostCategory, React.ElementType> = {
  hotel: Building2,
  flight: Plane,
  transport: Truck,
  guide: User,
  meals: UtensilsCrossed,
  entrance_fee: Ticket,
  permit: Map,
  insurance: ShieldAlert,
  misc: FileText
};

export const CostingSection: React.FC = () => {
  const { packages, suppliers = [], costTemplates = [], saveCostTemplate, updateCostTemplate, deleteCostTemplate, getCostTemplateForPackage } = useApp() as any;
  
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  
  // Editor state
  const [template, setTemplate] = useState<Partial<CostTemplate> | null>(null);

  useEffect(() => {
    if (selectedPkgId) {
      const pkg = packages.find((p: any) => p.id === selectedPkgId);
      const existing = (getCostTemplateForPackage ? getCostTemplateForPackage(selectedPkgId) : costTemplates.find((t: any) => t.packageId === selectedPkgId));
      if (existing) {
        setTemplate({ ...existing });
      } else if (pkg) {
        // Init empty
        setTemplate({
          packageId: pkg.id,
          packageTitle: pkg.title,
          minGroupSize: 12,
          adultMarginPercent: 20,
          childDiscountPercent: 25,
          items: []
        });
      }
    } else {
      setTemplate(null);
    }
  }, [selectedPkgId, packages, costTemplates, getCostTemplateForPackage]);

  const handleUpdateItem = (index: number, field: keyof CostItem, value: any) => {
    if (!template || !template.items) return;
    const newItems = [...template.items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Auto compute total
    if (field === 'unitCostUSD' || field === 'quantity') {
      newItems[index].totalUSD = (Number(newItems[index].unitCostUSD) || 0) * (Number(newItems[index].quantity) || 0);
    }
    setTemplate({ ...template, items: newItems });
  };

  const handleAddItem = () => {
    if (!template) return;
    const newItem: CostItem = {
      id: `ci_${Date.now()}_${template.items?.length || 0}`,
      category: 'hotel',
      description: 'New Cost Item',
      costType: 'per_adult',
      unitCostUSD: 0,
      quantity: 1,
      totalUSD: 0
    };
    setTemplate({ ...template, items: [...(template.items || []), newItem] });
  };

  const handleDeleteItem = (index: number) => {
    if (!template || !template.items) return;
    const newItems = [...template.items];
    newItems.splice(index, 1);
    setTemplate({ ...template, items: newItems });
  };

  // Computations
  const totals = useMemo(() => {
    if (!template) return null;
    let totalPerAdult = 0;
    let totalPerChild = 0;
    let totalFixed = 0;
    
    (template.items || []).forEach(item => {
      if (item.costType === 'per_adult') totalPerAdult += item.totalUSD;
      if (item.costType === 'per_child') totalPerChild += item.totalUSD;
      if (item.costType === 'fixed') totalFixed += item.totalUSD;
    });

    const fixedPerPax = totalFixed / (template.minGroupSize || 1);
    
    const recAdultPrice = (totalPerAdult + fixedPerPax) * (1 + (template.adultMarginPercent || 0) / 100);
    const recChildPrice = recAdultPrice * (1 - (template.childDiscountPercent || 0) / 100);

    return {
      totalPerAdult,
      totalPerChild,
      totalFixed,
      fixedPerPax,
      recAdultPrice,
      recChildPrice
    };
  }, [template]);

  const selectedPkg = packages.find((p: any) => p.id === selectedPkgId);
  const currentPrice = selectedPkg?.priceUSD || 0;
  
  const marginPercent = totals && currentPrice ? ((currentPrice - (totals.totalPerAdult + totals.fixedPerPax)) / currentPrice) * 100 : 0;
  let marginColor = 'text-red-500';
  if (marginPercent >= 20) marginColor = 'text-green-500';
  else if (marginPercent >= 10) marginColor = 'text-yellow-500';

  const handleSave = () => {
    if (!template || !selectedPkg) return;
    const fullTemplate: CostTemplate = {
      ...template,
      id: template.id || `ct_${Date.now()}`,
      totalCostPerAdultUSD: totals!.totalPerAdult,
      totalCostPerChildUSD: totals!.totalPerChild,
      totalFixedCostUSD: totals!.totalFixed,
      fixedCostPerPaxUSD: totals!.fixedPerPax,
      recommendedPriceAdultUSD: totals!.recAdultPrice,
      recommendedPriceChildUSD: totals!.recChildPrice,
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as CostTemplate;
    
    if (template.id && updateCostTemplate) {
      updateCostTemplate(fullTemplate);
    } else if (saveCostTemplate) {
      saveCostTemplate(fullTemplate);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Panel - Packages */}
      <div className="w-full lg:w-1/3 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Packages</h3>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[800px]">
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {packages.map((pkg: any) => {
              const hasTemplate = (costTemplates || []).some((t: any) => t.packageId === pkg.id);
              const isSelected = selectedPkgId === pkg.id;
              
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent'} border`}
                >
                  <div className={`mt-1 rounded-full p-0.5 ${hasTemplate ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                    {hasTemplate ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>{pkg.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Current Price: ${pkg.priceUSD.toLocaleString()}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className="w-full lg:w-2/3">
        {!template ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[800px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <CalculatorIcon className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a package to edit its cost template</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{template.packageTitle}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Cost Template & Pricing</p>
              </div>
              <div className="flex items-center gap-2">
                {template.id && (
                  <button
                    onClick={() => {
                      deleteCostTemplate(template.id!);
                      setSelectedPkgId(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors font-medium text-xs border border-rose-200 dark:border-rose-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Template</span>
                  </button>
                )}
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm cursor-pointer">
                  <Save className="w-4 h-4" />
                  Save Template
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Group Size</label>
                <input type="number" min="1" value={template.minGroupSize || 1} onChange={(e) => setTemplate({...template, minGroupSize: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  <span>Adult Margin %</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{template.adultMarginPercent}%</span>
                </label>
                <input type="range" min="0" max="60" value={template.adultMarginPercent || 0} onChange={(e) => setTemplate({...template, adultMarginPercent: parseInt(e.target.value) || 0})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2" />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  <span>Child Discount %</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{template.childDiscountPercent}%</span>
                </label>
                <input type="range" min="0" max="50" value={template.childDiscountPercent || 0} onChange={(e) => setTemplate({...template, childDiscountPercent: parseInt(e.target.value) || 0})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-2" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium min-w-[120px]">Category</th>
                      <th className="px-4 py-3 font-medium min-w-[200px]">Description</th>
                      <th className="px-4 py-3 font-medium min-w-[130px]">Type</th>
                      <th className="px-4 py-3 font-medium min-w-[150px]">Supplier</th>
                      <th className="px-4 py-3 font-medium w-24">Unit $</th>
                      <th className="px-4 py-3 font-medium w-20">Qty</th>
                      <th className="px-4 py-3 font-medium w-24">Total $</th>
                      <th className="px-4 py-3 font-medium w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {(template.items || []).map((item, index) => {
                      const CatIcon = CATEGORY_ICONS[item.category] || FileText;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                          <td className="px-3 py-2">
                            <select value={item.category} onChange={(e) => handleUpdateItem(index, 'category', e.target.value as CostCategory)} className="w-full bg-transparent border-0 focus:ring-0 p-1 text-sm dark:text-white font-medium">
                              <option value="hotel">Hotel</option>
                              <option value="flight">Flight</option>
                              <option value="transport">Transport</option>
                              <option value="guide">Guide</option>
                              <option value="meals">Meals</option>
                              <option value="entrance_fee">Entrance</option>
                              <option value="permit">Permit</option>
                              <option value="insurance">Insurance</option>
                              <option value="misc">Misc</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input type="text" value={item.description} onChange={(e) => handleUpdateItem(index, 'description', e.target.value)} placeholder="Description" className="w-full bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded p-1 text-sm dark:text-white outline-none" />
                          </td>
                          <td className="px-3 py-2">
                            <select value={item.costType} onChange={(e) => handleUpdateItem(index, 'costType', e.target.value as CostType)} className="w-full bg-transparent border-0 focus:ring-0 p-1 text-sm dark:text-white">
                              <option value="per_adult">Per Adult</option>
                              <option value="per_child">Per Child</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select value={item.supplierId || ''} onChange={(e) => {
                              const supp = suppliers.find((s: any) => s.id === e.target.value);
                              handleUpdateItem(index, 'supplierId', e.target.value);
                              if (supp) handleUpdateItem(index, 'supplierName', supp.name);
                            }} className="w-full bg-transparent border-0 focus:ring-0 p-1 text-sm dark:text-white truncate max-w-[140px]">
                              <option value="">No supplier</option>
                              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="0" step="0.01" value={item.unitCostUSD} onChange={(e) => handleUpdateItem(index, 'unitCostUSD', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded p-1 text-sm dark:text-white outline-none" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="1" step="1" value={item.quantity} onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 1)} className="w-full bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded p-1 text-sm dark:text-white outline-none" />
                          </td>
                          <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-white">
                            ${item.totalUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button onClick={() => handleDeleteItem(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                <button onClick={handleAddItem} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>

            {totals && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Base Per-Adult Cost:</span>
                    <span>${totals.totalPerAdult.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Base Per-Child Cost:</span>
                    <span>${totals.totalPerChild.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Total Fixed Costs:</span>
                    <span>${totals.totalFixed.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span>Fixed per Pax (÷ {template.minGroupSize}):</span>
                    <span>${totals.fixedPerPax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1">
                    <span>Total Effective Adult Cost:</span>
                    <span>${(totals.totalPerAdult + totals.fixedPerPax).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Rec. Adult Price</span>
                      <span className="text-xl font-bold text-green-700 dark:text-green-400">${totals.recAdultPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Rec. Child Price</span>
                      <span className="text-lg font-bold text-green-700 dark:text-green-400">${totals.recChildPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Listed Price</span>
                    <span className="font-mono text-slate-900 dark:text-white font-medium">${currentPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Proj. Margin (Adult)</span>
                    <span className={`font-bold ${marginColor}`}>{marginPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CalculatorIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);
